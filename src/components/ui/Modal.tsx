"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    className,
}: ModalProps) {
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleEsc);
        }
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={cn(
                    "relative w-full max-w-lg scale-100 rounded-2xl bg-white p-6 shadow-2xl transition-all animate-in fade-in zoom-in duration-200",
                    className
                )}
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        {title && <h2 className="text-xl font-semibold text-foreground">{title}</h2>}
                        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto">
                    {children}
                </div>

                {footer && (
                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
