/**
 * Derive booking status dynamically based on business rules.
 *
 * Rules (in priority order):
 * 1. CANCELLED stays CANCELLED (manual only)
 * 2. eventClosed === true AND today > eventDate → COMPLETED
 * 3. today is within eventDate range (startDate..endDate) → LIVE
 * 4. paidAmount >= 30% totalAmount → CONFIRMED
 * 5. Otherwise → TENTATIVE
 */
export function deriveBookingStatus(booking: {
    status: string;
    totalAmount: number;
    advanceAmount: number;
    startDate: Date | string;
    endDate: Date | string;
    eventClosed: boolean;
    invoice?: { paidAmount: number } | null;
}): "TENTATIVE" | "CONFIRMED" | "LIVE" | "COMPLETED" | "CANCELLED" {
    // Cancelled is manual-only — never override
    if (booking.status === "CANCELLED") return "CANCELLED";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(booking.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(booking.endDate);
    endDate.setHours(0, 0, 0, 0);

    // Completed: event is closed and today is past the event
    if (booking.eventClosed && today > endDate) return "COMPLETED";

    // Live: today falls within the event date range
    if (today >= startDate && today <= endDate) return "LIVE";

    // Confirmed: paid >= 30% of total
    const paid = booking.invoice?.paidAmount ?? booking.advanceAmount ?? 0;
    const total = booking.totalAmount || 1;
    if (paid >= total * 0.3) return "CONFIRMED";

    return "TENTATIVE";
}
