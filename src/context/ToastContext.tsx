"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

interface ToastContextType {
    toast: (message: string, type?: Toast['type'], duration?: number) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const addToast = React.useCallback((message: string, type: Toast['type'] = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);

        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, []);

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    const icons = {
        success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        error: <AlertCircle className="h-5 w-5 text-red-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    };

    const bgColors = {
        success: "border-green-100 bg-green-50",
        error: "border-red-100 bg-red-50",
        info: "border-blue-100 bg-blue-50",
        warning: "border-yellow-100 bg-yellow-50",
    };

    return (
        <div
            className={cn(
                "pointer-events-auto flex items-center justify-between rounded-lg border p-4 shadow-lg animate-in slide-in-from-right duration-300",
                bgColors[toast.type]
            )}
        >
            <div className="flex items-center gap-3">
                {icons[toast.type]}
                <p className="text-sm font-medium text-foreground">{toast.message}</p>
            </div>
            <button
                onClick={onRemove}
                className="ml-4 text-muted-foreground hover:text-foreground"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
