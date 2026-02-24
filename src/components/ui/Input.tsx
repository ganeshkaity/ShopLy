import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, helperText, ...props }, ref) => {
        const id = React.useId();

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label
                        htmlFor={id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        {label}
                    </label>
                )}
                <input
                    id={id}
                    type={type}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-red-500 focus-visible:ring-red-500",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error ? (
                    <p className="text-[0.8rem] font-medium text-red-500">{error}</p>
                ) : helperText ? (
                    <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>
                ) : null}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };
