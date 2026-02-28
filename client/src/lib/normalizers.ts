/**
 * ═══════════════════════════════════════════════════════════════
 *  EVENTORA — API-to-Frontend Data Normalizers
 * ─────────────────────────────────────────────────────────────
 *  Flatten nested API responses to match the frontend types.
 *  Demo data already has these fields at the top level.
 * ═══════════════════════════════════════════════════════════════
 */

import type { Booking } from "@/types";

/**
 * Flatten a single API booking: copies lead fields (customerName,
 * customerPhone, customerEmail, eventType, eventDate) to the
 * booking's top level when they aren't already there.
 */
export function normalizeBooking(raw: any): Booking {
    const lead = raw.lead || {};
    return {
        ...raw,
        customerName: raw.customerName || lead.customerName || "Unknown",
        customerPhone: raw.customerPhone || lead.customerPhone || "",
        customerEmail: raw.customerEmail || lead.customerEmail || undefined,
        eventType: raw.eventType || lead.eventType || "Event",
        eventDate: raw.eventDate || (lead.eventDate ? lead.eventDate : raw.startDate),
        paidAmount: raw.paidAmount ?? (raw.totalAmount != null && raw.balanceAmount != null
            ? raw.totalAmount - raw.balanceAmount
            : 0),
    };
}

/**
 * Normalize an array of API bookings.
 */
export function normalizeBookings(raw: any[]): Booking[] {
    return (raw || []).map(normalizeBooking);
}

/**
 * Normalize a single API inventory item:
 * API returns `minStockLevel` but frontend uses `minimumStock`.
 */
export function normalizeInventoryItem(raw: any): any {
    return {
        ...raw,
        minimumStock: raw.minimumStock ?? raw.minStockLevel ?? 0,
    };
}

/**
 * Normalize an array of API inventory items.
 */
export function normalizeInventory(raw: any[]): any[] {
    return (raw || []).map(normalizeInventoryItem);
}
