import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'success' | 'destructive' | 'warning' | 'info';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    const variants = {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "text-foreground border border-border",
        success: "bg-green-100 text-green-800 border-none",
        destructive: "bg-red-100 text-red-800 border-none",
        warning: "bg-yellow-100 text-yellow-800 border-none",
        info: "bg-blue-100 text-blue-800 border-none",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        />
    );
}
