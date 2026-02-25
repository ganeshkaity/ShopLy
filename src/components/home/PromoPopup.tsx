"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowRight } from "lucide-react";
import { PromoPopup } from "@/types";
import { getPopups } from "@/services/popup.service";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PromoPopupComponent() {
    const [popup, setPopup] = useState<PromoPopup | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const fetchAndShowPopup = async () => {
            // Check if popup was already shown in this session
            const isShown = sessionStorage.getItem("promo_popup_shown");
            if (isShown) return;

            try {
                const popups = await getPopups();
                const activePopup = popups.find(p => p.isActive);

                if (activePopup) {
                    setPopup(activePopup);

                    // Set delay for showing the popup
                    const timer = setTimeout(() => {
                        setShouldRender(true);
                        // Small extra delay for animation entry
                        setTimeout(() => setIsVisible(true), 50);
                    }, (activePopup.showDelay || 3) * 1000);

                    return () => clearTimeout(timer);
                }
            } catch (error) {
                console.error("Failed to fetch promo popup:", error);
            }
        };

        fetchAndShowPopup();
    }, []);

    const closePopup = () => {
        setIsVisible(false);
        // Mark as shown in session
        sessionStorage.setItem("promo_popup_shown", "true");
        // Remove from DOM after animation
        setTimeout(() => setShouldRender(false), 500);
    };

    if (!shouldRender || !popup) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500",
            isVisible ? "bg-black/40 backdrop-blur-sm opacity-100" : "bg-black/0 backdrop-blur-none opacity-0 pointer-events-none"
        )}>
            <div className={cn(
                "relative w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-700 transform scrollbar-hide",
                popup.type === 'HTML' ? "max-w-3xl rounded-2xl" : "max-w-lg rounded-3xl",
                isVisible ? "translate-y-0 scale-100 rotate-0" : "translate-y-20 scale-90 rotate-2"
            )}>
                {/* Close Button */}
                <button
                    onClick={closePopup}
                    className={cn(
                        "absolute top-4 right-4 z-50 h-9 w-9 rounded-full flex items-center justify-center transition-all shadow-xl group",
                        popup.type === 'HTML'
                            ? "bg-black/50 hover:bg-black text-white"
                            : "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-primary"
                    )}
                >
                    <X className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                </button>

                {popup.type === 'HTML' ? (
                    <div
                        className="bg-white min-h-[300px]"
                        dangerouslySetInnerHTML={{ __html: popup.htmlContent || '' }}
                        onClick={(e) => {
                            // Close if clicking a link/button within HTML for better UX
                            if ((e.target as HTMLElement).closest('a, button')) {
                                closePopup();
                            }
                        }}
                    />
                ) : popup.type === 'IMAGE_ONLY' ? (
                    <div className="relative bg-white flex items-center justify-center min-h-[300px]">
                        {popup.link ? (
                            <Link href={popup.link} onClick={closePopup} className="w-full flex items-center justify-center">
                                <img
                                    src={popup.imageUrl}
                                    alt="Promotion"
                                    className="max-w-full max-h-[80vh] object-contain"
                                />
                            </Link>
                        ) : (
                            <img
                                src={popup.imageUrl}
                                alt="Promotion"
                                className="max-w-full max-h-[80vh] object-contain"
                            />
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row h-full bg-white">
                        {/* Image Section - Default */}
                        <div className="relative w-full md:w-[240px] bg-gray-50 flex-shrink-0 flex items-center justify-center p-4">
                            <img
                                src={popup.imageUrl}
                                alt={popup.title || "Promotion"}
                                className="w-full h-full max-h-[300px] object-contain"
                            />
                        </div>

                        {/* Content Section - Default */}
                        <div className="flex-grow p-8 flex flex-col justify-center text-center md:text-left bg-white">
                            <Badge variant="secondary" className="w-fit mb-4 bg-primary/10 text-primary border-none mx-auto md:mx-0">
                                Special Offer
                            </Badge>
                            <h2 className="font-serif text-2xl font-bold text-gray-900 leading-tight mb-3">
                                {popup.title}
                            </h2>
                            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                                {popup.description}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link href={popup.link || "#"} className="flex-grow" onClick={closePopup}>
                                    <Button className="w-full rounded-full h-11 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 group text-sm">
                                        {popup.buttonText} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Button variant="ghost" className="rounded-full h-11 text-sm" onClick={closePopup}>
                                    Maybe Later
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Decorative Elements */}
                {popup.type !== 'HTML' && (
                    <>
                        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                    </>
                )}
            </div>
        </div>
    );
}
