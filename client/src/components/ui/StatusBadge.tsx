import { cn, getStatusColor } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
    label?: string;
    size?: "sm" | "md";
    className?: string;
}

export default function StatusBadge({ status, label, size = "md", className }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-lg font-medium border",
                size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
                getStatusColor(status),
                className
            )}
        >
            {label || status.replace(/_/g, " ")}
        </span>
    );
}
