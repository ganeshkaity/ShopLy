import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Spinner({ size = 'md', className, ...props }: SpinnerProps) {
    const sizes = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-3',
        xl: 'h-16 w-16 border-4',
    };

    return (
        <div
            className={cn(
                "animate-spin rounded-full border-t-primary border-r-transparent border-b-primary border-l-transparent",
                sizes[size],
                className
            )}
            {...props}
        />
    );
}
