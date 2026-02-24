"use client";

import React, { useState, useEffect } from "react";
import { Cookie, X, Check, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        // Check if consent has already been given
        const consent = localStorage.getItem("shoply_cookies_consent");
        if (!consent) {
            // Delay showing the panel for better UX
            const timer = setTimeout(() => {
                setShouldRender(true);
                // Trigger animation after render
                setTimeout(() => setIsVisible(true), 100);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = (type: "all" | "essential") => {
        localStorage.setItem("shoply_cookies_consent", type);
        setIsVisible(false);
        // Remove from DOM after animation
        setTimeout(() => setShouldRender(false), 500);
    };

    if (!shouldRender) return null;

    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-[200] p-4 md:p-6 transition-all duration-700 ease-in-out transform",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            )}
        >
            <div className="container-custom mx-auto">
                <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-6 shadow-2xl backdrop-blur-2xl md:p-8">
                    {/* Background Decorative Element */}
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />

                    <div className="relative flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-12">
                        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <Cookie className="h-7 w-7 animate-bounce" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Cookie Settings</h3>
                                <p className="mt-1 text-sm leading-relaxed text-gray-600 max-w-2xl">
                                    We use cookies to enhance your shopping experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                                </p>
                            </div>
                        </div>

                        <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row sm:w-auto">
                            <Button
                                variant="outline"
                                onClick={() => handleAccept("essential")}
                                className="h-12 flex-1 rounded-xl border-gray-200 bg-white/50 hover:bg-gray-50 sm:flex-none sm:px-6"
                            >
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Essential Only
                            </Button>
                            <Button
                                onClick={() => handleAccept("all")}
                                className="h-12 flex-1 rounded-xl bg-primary px-8 text-white shadow-lg shadow-primary/25 hover:bg-primary/90 sm:flex-none"
                            >
                                <Check className="mr-2 h-4 w-4" />
                                Accept All
                            </Button>
                        </div>
                    </div>

                    {/* Close Button (Optional/Decline) */}
                    <button
                        onClick={() => handleAccept("essential")}
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
