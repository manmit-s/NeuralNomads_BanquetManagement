import { cn } from "../../lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    className?: string;
}

export default function StatCard({ title, value, icon, trend, trendUp, className }: StatCardProps) {
    return (
        <div className={cn("stat-card", className)}>
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
                    {icon}
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
                <p className={cn("text-xs font-medium", trendUp ? "text-green-600" : "text-red-600")}>
                    {trend}
                </p>
            )}
        </div>
    );
}
