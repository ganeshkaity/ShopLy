import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-primary/10 border border-primary/5 relative overflow-hidden", className)}
            {...props}
        >
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full" style={{ backgroundSize: '200% 100%' }} />
        </div>
    );
}
