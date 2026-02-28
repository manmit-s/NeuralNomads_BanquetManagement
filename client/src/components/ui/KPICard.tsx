import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    icon: LucideIcon;
    iconColor?: string;
}

export default function KPICard({
    title,
    value,
    change,
    changeType = "neutral",
    icon: Icon,
    iconColor = "text-gold-400",
}: KPICardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group glass-card p-6 hover:shadow-card-hover hover:border-gold-500/20 transition-all duration-300"
        >
            <div className="flex items-start justify-between">
                <div className="space-y-3">
                    <p className="text-sm text-muted font-medium">{title}</p>
                    <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
                    {change && (
                        <div className="flex items-center gap-1.5">
                            <span
                                className={cn(
                                    "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full",
                                    changeType === "positive" && "bg-success-muted text-success",
                                    changeType === "negative" && "bg-danger-muted text-danger",
                                    changeType === "neutral" && "bg-white/5 text-muted"
                                )}
                            >
                                {change}
                            </span>
                            <span className="text-xs text-muted">vs last month</span>
                        </div>
                    )}
                </div>
                <div
                    className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 group-hover:bg-gold-500/10 transition-colors",
                        iconColor
                    )}
                >
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </motion.div>
    );
}
