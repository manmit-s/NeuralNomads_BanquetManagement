import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-16 px-4", className)}>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 mb-4">
                <Icon className="h-8 w-8 text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-muted text-center max-w-sm mb-4">{description}</p>
            )}
            {action}
        </div>
    );
}
