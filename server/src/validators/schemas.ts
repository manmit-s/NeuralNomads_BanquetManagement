import { z } from "zod";

// ── Auth ─────────────────────────────────────────────────────

export const signUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(2),
    phone: z.string().optional(),
    role: z.enum(["OWNER", "BRANCH_MANAGER", "SALES", "OPERATIONS"]).optional(),
    branchId: z.string().optional(),
});

export const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

// ── Branch ───────────────────────────────────────────────────

export const createBranchSchema = z.object({
    name: z.string().min(2),
    address: z.string().min(5),
    city: z.string().min(2),
    phone: z.string().min(10),
    email: z.string().email(),
});

export const updateBranchSchema = createBranchSchema.partial();

// ── Hall ─────────────────────────────────────────────────────

export const createHallSchema = z.object({
    name: z.string().min(2),
    capacity: z.number().int().positive(),
    pricePerEvent: z.number().positive(),
    amenities: z.array(z.string()).default([]),
    branchId: z.string(),
});

export const updateHallSchema = createHallSchema.partial();

// ── Lead ─────────────────────────────────────────────────────

export const createLeadSchema = z.object({
    customerName: z.string().min(2),
    customerPhone: z.string().min(10),
    customerEmail: z.string().email().optional(),
    eventType: z.string().min(2),
    eventDate: z.string().datetime().optional(),
    guestCount: z.number().int().positive().optional(),
    source: z.string().optional(),
    notes: z.string().optional(),
    branchId: z.string(),
    assignedToId: z.string().optional(),
});

export const updateLeadSchema = z.object({
    customerName: z.string().min(2).optional(),
    customerPhone: z.string().min(10).optional(),
    customerEmail: z.string().email().optional(),
    eventType: z.string().min(2).optional(),
    eventDate: z.string().datetime().optional(),
    guestCount: z.number().int().positive().optional(),
    status: z.enum([
        "CALL", "VISIT", "TASTING", "ADVANCE",
        "MENU_FINALIZATION", "DECORATION", "FULL_PAYMENT",
        "SETTLEMENT", "FEEDBACK", "LOST",
    ]).optional(),
    source: z.string().optional(),
    notes: z.string().optional(),
    lostReason: z.string().optional(),
    assignedToId: z.string().optional(),
});

// ── Booking ──────────────────────────────────────────────────

export const createBookingSchema = z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    guestCount: z.number().int().positive(),
    hallId: z.string(),
    leadId: z.string(),
    branchId: z.string(),
    totalAmount: z.number().positive(),
    advanceAmount: z.number().nonnegative().default(0),
    notes: z.string().optional(),
});

export const updateBookingSchema = z.object({
    guestCount: z.number().int().positive().optional(),
    status: z.enum(["TENTATIVE", "CONFIRMED", "COMPLETED", "CANCELLED"]).optional(),
    totalAmount: z.number().positive().optional(),
    notes: z.string().optional(),
});

// ── Event ────────────────────────────────────────────────────

export const createEventSchema = z.object({
    bookingId: z.string(),
    eventDate: z.string().datetime(),
    guestCount: z.number().int().positive(),
    branchId: z.string(),
    notes: z.string().optional(),
});

export const addMenuToEventSchema = z.object({
    items: z.array(z.object({
        menuItemId: z.string(),
        quantity: z.number().int().positive(),
    })).min(1),
});

export const addVendorToEventSchema = z.object({
    vendorId: z.string(),
    service: z.string().min(2),
    cost: z.number().nonnegative(),
    notes: z.string().optional(),
});

export const addChecklistItemSchema = z.object({
    task: z.string().min(2),
    dueDate: z.string().datetime().optional(),
});

export const updateChecklistItemSchema = z.object({
    status: z.enum(["PENDING", "IN_PROGRESS", "DONE"]),
});

// ── Invoice ──────────────────────────────────────────────────

export const createInvoiceSchema = z.object({
    bookingId: z.string(),
    branchId: z.string(),
    subtotal: z.number().positive(),
    taxRate: z.number().nonnegative().default(18),
    dueDate: z.string().datetime(),
    notes: z.string().optional(),
});

// ── Payment ──────────────────────────────────────────────────

export const createPaymentSchema = z.object({
    invoiceId: z.string(),
    amount: z.number().positive(),
    method: z.enum(["CASH", "CARD", "UPI", "BANK_TRANSFER", "CHEQUE"]),
    type: z.enum(["ADVANCE", "PARTIAL", "FULL", "REFUND"]),
    referenceNo: z.string().optional(),
    notes: z.string().optional(),
});

// ── Inventory ────────────────────────────────────────────────

export const createInventoryItemSchema = z.object({
    name: z.string().min(2),
    category: z.string().min(2),
    unit: z.string().min(1),
    currentStock: z.number().nonnegative().default(0),
    minStockLevel: z.number().nonnegative().default(0),
    costPerUnit: z.number().nonnegative().default(0),
    branchId: z.string(),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial();

export const stockAdjustmentSchema = z.object({
    type: z.enum(["PURCHASE", "ADJUSTMENT", "RETURN"]),
    quantity: z.number().positive(),
    notes: z.string().optional(),
});

// ── Menu Item ────────────────────────────────────────────────

export const createMenuItemSchema = z.object({
    name: z.string().min(2),
    category: z.string().min(2),
    pricePerPlate: z.number().positive(),
    isVeg: z.boolean().default(true),
    branchId: z.string(),
    ingredients: z.array(z.object({
        inventoryItemId: z.string(),
        quantityPerServing: z.number().positive(),
        unit: z.string(),
    })).optional(),
});

// ── Vendor ───────────────────────────────────────────────────

export const createVendorSchema = z.object({
    name: z.string().min(2),
    service: z.string().min(2),
    phone: z.string().min(10),
    email: z.string().email().optional(),
    address: z.string().optional(),
    branchId: z.string(),
});

// ── Purchase Order ───────────────────────────────────────────

export const createPurchaseOrderSchema = z.object({
    vendorId: z.string(),
    branchId: z.string(),
    notes: z.string().optional(),
    items: z.array(z.object({
        inventoryItemId: z.string(),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
    })).min(1),
});
