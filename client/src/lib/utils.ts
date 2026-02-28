import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(date: string | Date): string {
    return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: string | Date): string {
    return format(new Date(date), "dd MMM yyyy, hh:mm a");
}

export function formatRelative(date: string | Date): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export const LEAD_STATUS_LABELS: Record<string, string> = {
    CALL: "New Inquiry",
    VISIT: "Visit Done",
    TASTING: "Tasting",
    ADVANCE: "Advance Paid",
    MENU_FINALIZATION: "Menu Finalization",
    DECORATION: "Decoration",
    FULL_PAYMENT: "Full Payment",
    SETTLEMENT: "Settlement",
    FEEDBACK: "Feedback",
    LOST: "Lost",
};

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        CALL: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        VISIT: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        TASTING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        ADVANCE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        MENU_FINALIZATION: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
        DECORATION: "bg-pink-500/20 text-pink-400 border-pink-500/30",
        FULL_PAYMENT: "bg-green-500/20 text-green-400 border-green-500/30",
        SETTLEMENT: "bg-teal-500/20 text-teal-400 border-teal-500/30",
        FEEDBACK: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
        LOST: "bg-red-500/20 text-red-400 border-red-500/30",
        TENTATIVE: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        CONFIRMED: "bg-green-500/20 text-green-400 border-green-500/30",
        COMPLETED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
        UPCOMING: "bg-gold-500/20 text-gold-400 border-gold-500/30",
        IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        DRAFT: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        SENT: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        PARTIALLY_PAID: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        PAID: "bg-green-500/20 text-green-400 border-green-500/30",
        OVERDUE: "bg-red-500/20 text-red-400 border-red-500/30",
        PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        DONE: "bg-green-500/20 text-green-400 border-green-500/30",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

export const EVENT_TYPE_COLORS: Record<string, string> = {
    Wedding: "bg-pink-500/20 text-pink-400",
    Corporate: "bg-blue-500/20 text-blue-400",
    Birthday: "bg-purple-500/20 text-purple-400",
    Reception: "bg-gold-500/20 text-gold-400",
    Anniversary: "bg-rose-500/20 text-rose-400",
    Conference: "bg-cyan-500/20 text-cyan-400",
    Other: "bg-gray-500/20 text-gray-400",
};
