import { cn } from "@/lib/utils";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    padding?: boolean;
}

export default function GlassCard({ children, className, hover = false, padding = true }: GlassCardProps) {
    return (
        <div
            className={cn(
                "glass-card",
                padding && "p-6",
                hover && "hover:border-gold-500/20 hover:shadow-card-hover transition-all duration-300",
                className
            )}
        >
            {children}
        </div>
    );
}
