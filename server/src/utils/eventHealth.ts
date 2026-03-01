/**
 * Smart Event Health Score — deterministic calculation.
 * Computed dynamically per booking (never stored in DB).
 */

interface HealthBreakdown {
    payment: number;
    vendor: number;
    menu: number;
    guest: number;
    stock: number;
    followUps: number;
}

interface HealthResult {
    score: number;
    label: "Healthy" | "Needs Attention" | "High Risk";
    breakdown: HealthBreakdown;
}

/**
 * Booking shape expected by the calculator.
 * Uses loose typing so it works with any Prisma include shape.
 */
interface BookingForHealth {
    guestCount: number;
    totalAmount: number;
    advanceAmount: number;
    event?: {
        menuSelections?: unknown[];
        vendorBookings?: { id: string }[];
    } | null;
    invoice?: {
        paidAmount: number;
    } | null;
    lead?: {
        activities?: { action: string }[];
    } | null;
    bookingResources?: {
        calculatedQty: number;
        manualQty: number | null;
        isManuallyEdited: boolean;
    }[];
}

export function calculateEventHealth(booking: BookingForHealth): HealthResult {
    const breakdown: HealthBreakdown = {
        payment: 0,
        vendor: 0,
        menu: 0,
        guest: 0,
        stock: 0,
        followUps: 0,
    };

    // ── Payment (25) ──
    const paid = booking.invoice?.paidAmount ?? booking.advanceAmount ?? 0;
    const total = booking.totalAmount || 1;
    if (paid >= total) breakdown.payment = 25;
    else if (paid >= total * 0.5) breakdown.payment = 15;
    else if (paid > 0) breakdown.payment = 8;

    // ── Vendor (15) ──
    const vendors = booking.event?.vendorBookings ?? [];
    breakdown.vendor = vendors.length > 0 ? 15 : 0;

    // ── Menu (15) ──
    const menuItems = booking.event?.menuSelections ?? [];
    breakdown.menu = menuItems.length > 0 ? 15 : 0;

    // ── Guest count (10) ──
    breakdown.guest = booking.guestCount > 0 ? 10 : 0;

    // ── Stock / Resource availability (20) ──
    const resources = booking.bookingResources ?? [];
    if (resources.length === 0) {
        breakdown.stock = 0;
    } else {
        const hasShortage = resources.some((r) => {
            const effective = r.isManuallyEdited && r.manualQty !== null ? r.manualQty : r.calculatedQty;
            return effective <= 0;
        });
        breakdown.stock = hasShortage ? 5 : 20;
    }

    // ── Follow-ups (15) ──
    const activities = booking.lead?.activities ?? [];
    const hasPendingFollowUp = activities.some((a) =>
        a.action.toLowerCase().includes("follow") && !a.action.toLowerCase().includes("done")
    );
    breakdown.followUps = hasPendingFollowUp ? 5 : 15;

    const score = breakdown.payment + breakdown.vendor + breakdown.menu + breakdown.guest + breakdown.stock + breakdown.followUps;

    let label: HealthResult["label"];
    if (score >= 80) label = "Healthy";
    else if (score >= 60) label = "Needs Attention";
    else label = "High Risk";

    return { score, label, breakdown };
}
