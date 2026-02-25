"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface ImageGalleryProps {
    images: string[];
    name: string;
}

export function ProductImageGallery({ images, name }: ImageGalleryProps) {
    const [activeImage, setActiveImage] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);

    // Sync scroll position when activeImage changes (from thumbnails)
    useEffect(() => {
        if (scrollContainerRef.current && !isScrollingRef.current) {
            const container = scrollContainerRef.current;
            const targetScroll = activeImage * container.offsetWidth;
            container.scrollTo({ left: targetScroll, behavior: "smooth" });
        }
    }, [activeImage]);

    // Handle scroll to update activeImage index
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const index = Math.round(container.scrollLeft / container.offsetWidth);
        if (index !== activeImage) {
            isScrollingRef.current = true;
            setActiveImage(index);
            // Reset the flag after a short delay to allow the useEffect to know it was a manual scroll
            setTimeout(() => { isScrollingRef.current = false; }, 100);
        }
    };

    if (!images || images.length === 0) {
        return (
            <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-gray-50 text-primary/10">
                <Star className="h-32 w-32" fill="currentColor" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
            {/* Thumbnails - Left on desktop, bottom on mobile */}
            {images.length > 1 && (
                <div className="order-2 md:order-1 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto scrollbar-hide shrink-0 md:w-12 lg:w-14 h-auto md:h-0 md:min-h-full">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveImage(idx)}
                            onMouseEnter={() => setActiveImage(idx)}
                            className={cn(
                                "relative h-10 w-10 md:h-12 md:w-full shrink-0 overflow-hidden rounded-md border-2 transition-all",
                                activeImage === idx ? "border-primary scale-105 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                            )}
                        >
                            <Image src={img} alt={`${name} ${idx + 1}`} fill className="object-contain p-0.5" unoptimized />
                        </button>
                    ))}
                </div>
            )}

            {/* Main Image Container */}
            <div className="order-1 md:order-2 flex-grow relative group">
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto md:overflow-hidden snap-x snap-mandatory scrollbar-hide rounded-lg bg-white border border-border/50 aspect-square"
                >
                    {images.map((img, idx) => (
                        <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                            <Image
                                src={img}
                                alt={`${name} ${idx + 1}`}
                                fill
                                className="object-contain object-center p-0"
                                priority={idx === 0}
                                sizes="(max-width: 768px) 100vw, 50vw"
                                unoptimized
                            />
                        </div>
                    ))}
                </div>

                {/* Mobile Scroll Indicator Dots */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden pointer-events-none">
                        {images.map((_, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "h-1.5 transition-all duration-300 rounded-full",
                                    activeImage === idx ? "w-4 bg-primary shadow-sm" : "w-1.5 bg-black/20"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
