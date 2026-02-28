import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, icon: Icon, action }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10">
                        <Icon className="h-5 w-5 text-gold-400" />
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-display font-bold text-white">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-muted mt-0.5">{subtitle}</p>
                    )}
                </div>
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}
