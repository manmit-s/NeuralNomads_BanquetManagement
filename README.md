# Multi-Branch Banquet Management System (SaaS)

> **HackX4.0 — PS-03**
> A production-ready, multi-branch banquet management platform with strict branch isolation, role-based access, lead-to-event lifecycle tracking, real-time calendar, billing, and automated inventory management.

---

## Tech Stack

| Layer       | Technology                                          |
| ----------- | --------------------------------------------------- |
| Frontend    | React 19 · Vite · TypeScript · TailwindCSS · Axios  |
| Backend     | Node.js · Express · TypeScript · Prisma ORM · Zod   |
| Auth        | Supabase Auth (JWT-based)                            |
| Database    | Supabase PostgreSQL                                  |
| Deployment  | Vercel (frontend) · Railway/Render (backend)         |

---

## Project Structure

```
banquet_management/
├── ARCHITECTURE.md            # System design document
├── README.md                  # ← You are here
│
├── server/                    # Backend API
│   ├── prisma/
│   │   ├── schema.prisma      # Complete database schema (20+ models)
│   │   └── seed.ts            # Demo data seeder
│   ├── src/
│   │   ├── config/            # Environment & app config
│   │   ├── controllers/       # Request handlers
│   │   ├── lib/               # Prisma client, Supabase client
│   │   ├── middleware/        # Auth, RBAC, branch isolation, validation
│   │   ├── routes/            # Express route definitions
│   │   ├── services/          # Business logic (booking conflicts, inventory)
│   │   ├── types/             # TypeScript interfaces
│   │   ├── utils/             # Helpers, custom errors
│   │   ├── validators/        # Zod schemas
│   │   ├── app.ts             # Express app setup
│   │   └── server.ts          # Entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── client/                    # Frontend SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Sidebar, TopBar, DashboardLayout
│   │   │   └── ui/            # StatCard, StatusBadge, PageHeader, etc.
│   │   ├── contexts/          # AuthContext (global auth state)
│   │   ├── lib/               # Axios instance, Supabase client, utils
│   │   ├── pages/             # Route-level page components
│   │   │   ├── auth/          # LoginPage
│   │   │   ├── dashboard/     # DashboardPage
│   │   │   ├── leads/         # LeadsPage
│   │   │   ├── bookings/      # BookingsPage
│   │   │   ├── events/        # EventsPage
│   │   │   ├── calendar/      # CalendarPage
│   │   │   ├── inventory/     # InventoryPage
│   │   │   ├── billing/       # BillingPage
│   │   │   ├── branches/      # BranchesPage
│   │   │   └── reports/       # ReportsPage
│   │   ├── types/             # Shared TypeScript types
│   │   ├── App.tsx            # Router & auth guards
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Tailwind + custom component classes
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd banquet_management

# Backend
cd server
cp .env.example .env       # Fill in your Supabase credentials
npm install

# Frontend
cd ../client
cp .env.example .env       # Fill in your Supabase credentials
npm install
```

### 2. Database Setup

```bash
cd server
npx prisma generate        # Generate Prisma client
npx prisma db push          # Push schema to Supabase
npx prisma db seed          # Seed demo data
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd server && npm run dev    # → http://localhost:5000

# Terminal 2 — Frontend
cd client && npm run dev    # → http://localhost:5173
```

---

## REST API Reference

Base URL: `/api/v1`

### Auth
| Method | Endpoint         | Description        | Auth |
| ------ | ---------------- | ------------------ | ---- |
| POST   | /auth/signup     | Register user      | No   |
| POST   | /auth/signin     | Login              | No   |
| GET    | /auth/profile    | Get current user   | Yes  |

### Branches
| Method | Endpoint          | Description           | Roles          |
| ------ | ----------------- | --------------------- | -------------- |
| GET    | /branches         | List all branches     | All            |
| GET    | /branches/:id     | Branch details        | All            |
| POST   | /branches         | Create branch         | Owner          |
| PATCH  | /branches/:id     | Update branch         | Owner          |
| DELETE | /branches/:id     | Deactivate branch     | Owner          |

### Leads
| Method | Endpoint           | Description           | Roles                    |
| ------ | ------------------ | --------------------- | ------------------------ |
| GET    | /leads             | List leads (filtered) | Owner, Manager, Sales    |
| GET    | /leads/pipeline    | Pipeline summary      | Owner, Manager, Sales    |
| GET    | /leads/:id         | Lead details          | Owner, Manager, Sales    |
| POST   | /leads             | Create lead           | Owner, Manager, Sales    |
| PATCH  | /leads/:id         | Update lead/status    | Owner, Manager, Sales    |

### Bookings
| Method | Endpoint                | Description           | Roles                         |
| ------ | ----------------------- | --------------------- | ----------------------------- |
| GET    | /bookings               | List bookings         | All roles                     |
| GET    | /bookings/availability  | Check hall slots      | All roles                     |
| GET    | /bookings/:id           | Booking details       | All roles                     |
| POST   | /bookings               | Create (conflict-safe)| Owner, Manager, Sales         |
| PATCH  | /bookings/:id           | Update booking        | Owner, Manager, Sales         |

### Events
| Method | Endpoint                      | Description            | Roles                    |
| ------ | ----------------------------- | ---------------------- | ------------------------ |
| GET    | /events                       | List events            | Owner, Manager, Ops      |
| GET    | /events/:id                   | Event details          | Owner, Manager, Ops      |
| POST   | /events                       | Create event           | Owner, Manager           |
| POST   | /events/:id/menu              | Add menu items         | Owner, Manager, Ops      |
| POST   | /events/:id/menu/finalize     | Finalize + auto-deduct | Owner, Manager           |
| POST   | /events/:id/vendors           | Add vendor             | Owner, Manager, Ops      |
| POST   | /events/:id/checklist         | Add checklist item     | Owner, Manager, Ops      |
| PATCH  | /events/checklist/:id         | Update checklist       | Owner, Manager, Ops      |

### Inventory
| Method | Endpoint               | Description             | Roles                    |
| ------ | ---------------------- | ----------------------- | ------------------------ |
| GET    | /inventory             | List items              | Owner, Manager, Ops      |
| GET    | /inventory/low-stock   | Low stock alerts        | Owner, Manager, Ops      |
| GET    | /inventory/:id         | Item details + history  | Owner, Manager, Ops      |
| POST   | /inventory             | Add item                | Owner, Manager           |
| PATCH  | /inventory/:id         | Update item             | Owner, Manager           |
| POST   | /inventory/:id/adjust  | Stock adjustment        | Owner, Manager, Ops      |

### Billing
| Method | Endpoint                       | Description            | Roles              |
| ------ | ------------------------------ | ---------------------- | ------------------ |
| GET    | /billing/invoices              | List invoices          | Owner, Manager, Sales |
| GET    | /billing/invoices/outstanding  | Outstanding reminders  | Owner, Manager     |
| GET    | /billing/invoices/:id          | Invoice details        | Owner, Manager, Sales |
| POST   | /billing/invoices              | Create invoice         | Owner, Manager     |
| POST   | /billing/payments              | Record payment         | Owner, Manager     |

### Reports
| Method | Endpoint               | Description               | Roles              |
| ------ | ---------------------- | ------------------------- | ------------------ |
| GET    | /reports/dashboard     | Dashboard summary         | Owner, Manager     |
| GET    | /reports/revenue       | Branch-wise revenue       | Owner, Manager     |
| GET    | /reports/conversion    | Lead conversion rate      | Owner, Manager     |
| GET    | /reports/occupancy     | Hall occupancy rate       | Owner, Manager     |
| GET    | /reports/outstanding   | Outstanding summary       | Owner, Manager     |

---

## Key Technical Decisions

### 1. Booking Conflict Prevention

```
SELECT id FROM bookings
WHERE hall_id = ? AND status != 'CANCELLED'
  AND start_date <= ?end AND end_date >= ?start
FOR UPDATE;  -- Row-level lock
```

Uses `Prisma.$transaction()` with `Serializable` isolation level. If any overlapping row is found, the transaction rolls back and returns **409 Conflict**.

### 2. Inventory Auto-Deduction (Transactional)

When `POST /events/:id/menu/finalize` is called:

1. **Calculate** — For each selected menu item × guest count, sum up required raw materials via `MenuItemIngredient` join.
2. **Lock** — `SELECT ... FOR UPDATE` on all affected `InventoryItem` rows.
3. **Validate** — If ANY ingredient is insufficient, entire transaction rolls back (atomic).
4. **Deduct** — Update stock levels and create `StockMovement` audit records.
5. **Alert** — Return warnings for items that drop below `minStockLevel`.

### 3. Branch Isolation

- Every tenant-aware table has a `branchId` foreign key.
- `branchIsolation` middleware injects `req.branchScope` from the JWT user.
- **Owners** (`branchScope = undefined`) → no filter → see all branches.
- **Staff** (`branchScope = their branchId`) → filter injected on every query.
- Services use `branchScope` in their `WHERE` clauses.

### 4. Role-Permission Matrix

| Resource             | Owner | Branch Manager | Sales | Operations |
|----------------------|-------|----------------|-------|------------|
| Manage Branches      | ✅    | ❌             | ❌    | ❌         |
| Manage Users         | ✅    | ✅ (own branch)| ❌    | ❌         |
| Leads (CRUD)         | ✅    | ✅             | ✅    | ❌         |
| Bookings (CRUD)      | ✅    | ✅             | ✅    | View only  |
| Events (CRUD)        | ✅    | ✅             | ❌    | ✅         |
| Billing              | ✅    | ✅             | View  | ❌         |
| Inventory            | ✅    | ✅             | ❌    | ✅         |
| Reports              | ✅    | ✅ (own branch)| ❌    | ❌         |

### 5. Database Indexing Strategy

| Table          | Index Columns                             | Purpose                           |
|----------------|-------------------------------------------|-----------------------------------|
| Booking        | (branchId, hallId, startDate, endDate)    | Conflict detection & calendar     |
| Lead           | (branchId, status)                        | Pipeline filtering                |
| Lead           | (branchId, assignedToId)                  | Sales agent lookup                |
| Invoice        | (branchId, status)                        | Outstanding queries               |
| InventoryItem  | (branchId, currentStock)                  | Low-stock alert queries           |
| Event          | (branchId, eventDate)                     | Calendar & scheduling             |
| Payment        | (invoiceId)                               | Payment history lookup            |
| StockMovement  | (inventoryItemId, createdAt)              | Audit trail queries               |

---

## Database Schema (ER Summary)

```
Branch ──< Hall
Branch ──< User
Branch ──< Lead ──< LeadActivity
Branch ──< Booking ──1 Lead
Branch ──< Event ──1 Booking
Event ──< EventMenuItem ──1 MenuItem
Event ──< EventVendor ──1 Vendor
Event ──< EventChecklist
MenuItem ──< MenuItemIngredient ──1 InventoryItem
InventoryItem ──< StockMovement
Booking ──1 Invoice ──< Payment
Branch ──< PurchaseOrder ──1 Vendor
PurchaseOrder ──< PurchaseOrderItem ──1 InventoryItem
```

20+ models with full referential integrity, cascade deletes where appropriate, and composite unique constraints.

---

## Future Scalability Roadmap

1. **Redis caching** — Calendar availability, dashboard stats
2. **WebSocket / SSE** — Real-time calendar updates across users
3. **BullMQ job queue** — PDF invoice generation, email reminders, SMS notifications
4. **Read replicas** — Offload reporting queries
5. **Multi-tenancy** — Support multiple banquet companies (SaaS marketplace)
6. **Mobile app** — React Native sharing TypeScript types
7. **Audit log** — Full compliance trail for all mutations
8. **Supabase Storage** — Contract uploads, event photos
9. **Webhook integrations** — Payment gateways (Razorpay), CRM sync

---

## Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy dist/ to Vercel
# Set env vars: VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

### Backend (Railway / Render)
```bash
cd server
npm run build
# Deploy with start command: npm start
# Set env vars from .env.example
```

### Database (Supabase)
- Create project at supabase.com
- Copy connection string → `DATABASE_URL`
- Copy API keys → `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Copy JWT secret → `JWT_SECRET`

---

## License

MIT