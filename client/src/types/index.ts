// ── Shared TypeScript types (mirrors backend schema) ─────────

export type Role = "OWNER" | "BRANCH_MANAGER" | "SALES" | "OPERATIONS";

export type LeadStatus =
    | "CALL" | "VISIT" | "TASTING" | "ADVANCE"
    | "MENU_FINALIZATION" | "DECORATION" | "FULL_PAYMENT"
    | "SETTLEMENT" | "FEEDBACK" | "LOST";

export type BookingStatus = "TENTATIVE" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type EventStatus = "UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type InvoiceStatus = "DRAFT" | "SENT" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
export type PaymentMethod = "CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "CHEQUE";
export type PaymentType = "ADVANCE" | "PARTIAL" | "FULL" | "REFUND";

// ── Entities ─────────────────────────────────────────────────

export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: Role;
    branchId?: string;
    branch?: Branch;
    isActive: boolean;
}

export interface Branch {
    id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    isActive: boolean;
}

export interface Hall {
    id: string;
    name: string;
    capacity: number;
    pricePerEvent: number;
    amenities: string[];
    branchId: string;
}

export interface Lead {
    id: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    eventType: string;
    eventDate?: string;
    guestCount?: number;
    status: LeadStatus;
    source?: string;
    notes?: string;
    branchId: string;
    branch?: { id: string; name: string };
    assignedTo?: { id: string; name: string; email: string };
    activities?: LeadActivity[];
    booking?: Booking;
    createdAt: string;
}

export interface LeadActivity {
    id: string;
    action: string;
    details?: string;
    createdAt: string;
}

export interface Booking {
    id: string;
    bookingNumber: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    guestCount: number;
    status: BookingStatus;
    totalAmount: number;
    advanceAmount: number;
    balanceAmount: number;
    hallId: string;
    hall?: Hall;
    leadId: string;
    lead?: Partial<Lead>;
    event?: Event;
    invoice?: Invoice;
    createdAt: string;
}

export interface Event {
    id: string;
    eventDate: string;
    guestCount: number;
    status: EventStatus;
    booking?: Booking;
    menuSelections?: EventMenuItem[];
    vendorBookings?: EventVendor[];
    checklist?: EventChecklist[];
}

export interface EventMenuItem {
    id: string;
    quantity: number;
    menuItemId: string;
    menuItem?: MenuItem;
}

export interface EventVendor {
    id: string;
    service: string;
    cost: number;
    vendor?: Vendor;
}

export interface EventChecklist {
    id: string;
    task: string;
    status: "PENDING" | "IN_PROGRESS" | "DONE";
    dueDate?: string;
    completedAt?: string;
}

export interface MenuItem {
    id: string;
    name: string;
    category: string;
    pricePerPlate: number;
    isVeg: boolean;
}

export interface Vendor {
    id: string;
    name: string;
    service: string;
    phone: string;
    email?: string;
}

export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    unit: string;
    currentStock: number;
    minStockLevel: number;
    costPerUnit: number;
    branchId: string;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    dueDate: string;
    status: InvoiceStatus;
    booking?: Booking;
    payments?: Payment[];
}

export interface Payment {
    id: string;
    amount: number;
    method: PaymentMethod;
    type: PaymentType;
    referenceNo?: string;
    paidAt: string;
}

// ── API response shapes ─────────────────────────────────────

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface DashboardSummary {
    totalLeadsThisMonth: number;
    activeBookings: number;
    upcomingEvents: number;
    monthlyRevenue: number;
    totalOutstanding: number;
}

export interface PipelineItem {
    status: LeadStatus;
    count: number;
}
