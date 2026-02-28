# Multi-Branch Banquet Management System — Architecture Document

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                  │
│   Browser (React SPA)  │  Mobile (Future)  │  Admin Panel       │
└──────────────┬──────────────────────────────────────────────────┘
               │ HTTPS (JWT Bearer Token)
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Express)                         │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌────────────────┐   │
│  │ Auth     │ │ Branch   │ │ Rate       │ │ Request        │   │
│  │ Middleware│ │ Isolation│ │ Limiter    │ │ Validator      │   │
│  └──────────┘ └──────────┘ └────────────┘ └────────────────┘   │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                          │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐ ┌─────────┐ │
│  │ Auth     │ │ Lead     │ │Booking │ │ Event   │ │Inventory│ │
│  │ Service  │ │ Service  │ │Service │ │ Service │ │ Service │ │
│  └──────────┘ └──────────┘ └────────┘ └─────────┘ └─────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐             │
│  │ Billing  │ │ Report   │ │Calendar│ │ Branch  │             │
│  │ Service  │ │ Service  │ │Service │ │ Service │             │
│  └──────────┘ └──────────┘ └────────┘ └─────────┘             │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                             │
│              Prisma ORM (Type-safe queries)                     │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│              Supabase PostgreSQL + Supabase Auth                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Branch Isolation Strategy

Every tenant-aware table includes a `branchId` column. A Prisma middleware
automatically injects the caller's `branchId` into every query so that:

- **Owners** can query across all branches (middleware skips filter).
- **Branch Managers / Staff** always have their `branchId` injected.
- Row-Level Security (RLS) on Supabase provides a second defence layer.

## 3. Booking Conflict Prevention

Uses **SELECT … FOR UPDATE** inside a Prisma `$transaction` to:
1. Lock rows for the requested hall + date range.
2. Check for overlapping bookings.
3. Insert the new booking only if no conflict exists.
4. Rollback if conflict detected → returns 409 Conflict.

## 4. Inventory Auto-Deduction

When a menu is finalised for an event:
1. Retrieve all `MenuItemIngredient` records for the selected items.
2. Multiply `quantityPerServing × guestCount`.
3. Inside a `$transaction`:
   a. Lock the relevant `InventoryItem` rows.
   b. Check stock sufficiency.
   c. Deduct quantities and create `StockMovement` audit records.
   d. Trigger low-stock alerts if threshold breached.

## 5. Role-Permission Matrix

| Resource             | Owner | Branch Manager | Sales | Operations |
|----------------------|-------|----------------|-------|------------|
| Manage Branches      | ✅    | ❌             | ❌    | ❌         |
| Manage Users         | ✅    | ✅ (own branch)| ❌    | ❌         |
| View All Branches    | ✅    | ❌             | ❌    | ❌         |
| Leads (CRUD)         | ✅    | ✅             | ✅    | ❌         |
| Bookings (CRUD)      | ✅    | ✅             | ✅    | 🔍 View   |
| Events (CRUD)        | ✅    | ✅             | ❌    | ✅         |
| Billing              | ✅    | ✅             | 🔍    | ❌         |
| Inventory            | ✅    | ✅             | ❌    | ✅         |
| Reports              | ✅    | ✅ (own branch)| ❌    | ❌         |
| Calendar             | ✅    | ✅             | ✅    | ✅         |

## 6. Indexing Strategy

| Table          | Index                                   | Purpose                          |
|----------------|-----------------------------------------|----------------------------------|
| Booking        | (branchId, hallId, startDate, endDate)  | Conflict check & calendar queries|
| Lead           | (branchId, status)                      | Pipeline filtering               |
| Lead           | (branchId, assignedToId)                | Sales agent lookup               |
| Invoice        | (branchId, status)                      | Outstanding queries              |
| InventoryItem  | (branchId, currentStock)                | Low-stock alerts                 |
| Event          | (branchId, eventDate)                   | Calendar & scheduling            |
| Payment        | (invoiceId)                             | Payment history                  |
| StockMovement  | (inventoryItemId, createdAt)            | Audit trail                      |

## 7. Future Scalability

1. **Read replicas** for reporting queries (Supabase supports this).
2. **Redis caching** for calendar availability and dashboard stats.
3. **WebSocket / SSE** for real-time calendar updates.
4. **Queue system** (BullMQ + Redis) for async tasks: PDF generation, email reminders.
5. **Multi-tenancy migration**: Move from branch isolation to full tenant isolation if reselling as SaaS to multiple banquet companies.
6. **Mobile app** via React Native sharing TypeScript types.
7. **Audit log table** for compliance and traceability.
8. **File storage** via Supabase Storage for contracts, photos.
