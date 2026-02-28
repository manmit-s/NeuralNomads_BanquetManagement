import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
    fullScreen?: boolean;
}

export default function LoadingSpinner({ size = "md", className, fullScreen }: LoadingSpinnerProps) {
    const sizeMap = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };

    const spinner = (
        <div
            className={cn(
                "animate-spin rounded-full border-2 border-gold-500/20 border-t-gold-500",
                sizeMap[size],
                className
            )}
        />
    );

    if (fullScreen) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                {spinner}
            </div>
        );
    }

    return spinner;
}
