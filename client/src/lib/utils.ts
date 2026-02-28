import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

/**
 * Format currency in INR.
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format a date string to readable format.
 */
export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

/**
 * Lead status display label.
 */
export const LEAD_STATUS_LABELS: Record<string, string> = {
    CALL: "Call",
    VISIT: "Visit",
    TASTING: "Tasting",
    ADVANCE: "Advance",
    MENU_FINALIZATION: "Menu Finalization",
    DECORATION: "Decoration",
    FULL_PAYMENT: "Full Payment",
    SETTLEMENT: "Settlement",
    FEEDBACK: "Feedback",
    LOST: "Lost",
};

/**
 * Status badge colour mapping.
 */
export function getStatusColor(status: string): string {
    const map: Record<string, string> = {
        CALL: "bg-gray-100 text-gray-700",
        VISIT: "bg-blue-100 text-blue-700",
        TASTING: "bg-indigo-100 text-indigo-700",
        ADVANCE: "bg-yellow-100 text-yellow-700",
        MENU_FINALIZATION: "bg-orange-100 text-orange-700",
        DECORATION: "bg-pink-100 text-pink-700",
        FULL_PAYMENT: "bg-green-100 text-green-700",
        SETTLEMENT: "bg-teal-100 text-teal-700",
        FEEDBACK: "bg-cyan-100 text-cyan-700",
        LOST: "bg-red-100 text-red-700",
        TENTATIVE: "bg-yellow-100 text-yellow-700",
        CONFIRMED: "bg-green-100 text-green-700",
        COMPLETED: "bg-teal-100 text-teal-700",
        CANCELLED: "bg-red-100 text-red-700",
        UPCOMING: "bg-blue-100 text-blue-700",
        IN_PROGRESS: "bg-amber-100 text-amber-700",
        DRAFT: "bg-gray-100 text-gray-700",
        SENT: "bg-blue-100 text-blue-700",
        PARTIALLY_PAID: "bg-yellow-100 text-yellow-700",
        PAID: "bg-green-100 text-green-700",
        OVERDUE: "bg-red-100 text-red-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
}
