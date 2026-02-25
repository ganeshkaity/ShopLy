"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HomeBanner } from "@/types";
import { cn } from "@/lib/utils";

interface BannerSliderProps {
    banners: HomeBanner[];
}

export function BannerSlider({ banners }: BannerSliderProps) {
    // Clone first and last for infinite loop
    const slides = [banners[banners.length - 1], ...banners, banners[0]];
    const [currentIndex, setCurrentIndex] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Auto-scroll logic
    useEffect(() => {
        if (banners.length <= 1 || isPaused || isDragging) return;

        const interval = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(interval);
    }, [banners.length, isPaused, isDragging]);

    // Handle jump for infinite loop
    const handleTransitionEnd = () => {
        if (currentIndex === 0) {
            setIsTransitioning(false);
            setCurrentIndex(banners.length);
        } else if (currentIndex === slides.length - 1) {
            setIsTransitioning(false);
            setCurrentIndex(1);
        }
    };

    // Reset transitioning after jump
    useEffect(() => {
        if (!isTransitioning) {
            // Force a reflow to make the jump instant, then re-enable transitions
            const timeout = setTimeout(() => setIsTransitioning(true), 50);
            return () => clearTimeout(timeout);
        }
    }, [isTransitioning]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index + 1);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => prev + 1);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => prev - 1);
    };

    // Dragging logic (simplified for infinite)
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setIsPaused(true);
        setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
        setScrollLeft(sliderRef.current?.scrollLeft || 0);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsPaused(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !sliderRef.current) return;
        // Basic drag could be complex with infinite loop clones, 
        // keeping it simple for now as the user primarily asked for infinite auto/nav scroll
    };

    if (!banners || banners.length === 0) return null;

    // Map currentIndex to dot index (1 -> 0, 2 -> 1, ..., N -> N-1)
    const activeDotIndex = ((currentIndex - 1) % banners.length + banners.length) % banners.length;

    return (
        <section className={cn(
            "px-0 py-0 group/slider relative overflow-hidden",
        )}>
            <div
                ref={sliderRef}
                className={cn(
                    "relative aspect-[1440/370] w-full rounded-none overflow-hidden shadow-2xl bg-gray-100",
                    isDragging ? "cursor-grabbing" : "cursor-pointer"
                )}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseUp}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsPaused(true)}
            >
                {/* Slides Container */}
                <div
                    className={cn(
                        "flex h-full",
                        isTransitioning ? "transition-transform duration-700 ease-out" : "transition-none"
                    )}
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    onTransitionEnd={handleTransitionEnd}
                >
                    {slides.map((banner, idx) => (
                        <Link
                            key={`${banner.id}-${idx}`}
                            href={banner.link || "#"}
                            className="w-full h-full shrink-0 relative block"
                            draggable={false}
                        >
                            <img
                                src={banner.imageUrl}
                                alt="Store Banner"
                                className="w-full h-full object-cover pointer-events-none"
                                draggable={false}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </Link>
                    ))}
                </div>

                {/* Navigation Arrows */}
                {banners.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.preventDefault(); prevSlide(); }}
                            className="absolute left-6 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-white hover:text-black shadow-xl scale-90 hover:scale-100 hidden md:flex"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); nextSlide(); }}
                            className="absolute right-6 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-white hover:text-black shadow-xl scale-90 hover:scale-100 hidden md:flex"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </button>
                    </>
                )}

                {/* Progress Indicators */}
                {banners.length > 1 && (
                    <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-3 z-10">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToSlide(idx)}
                                className={cn(
                                    "h-1 md:h-1.5 transition-all duration-300 rounded-full shadow-sm",
                                    activeDotIndex === idx
                                        ? "w-6 md:w-10 bg-white"
                                        : "w-1 md:w-1.5 bg-white/40 hover:bg-white/60"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Glossy Overlay for Premium Look */}
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none blur-3xl opacity-50" />
        </section>
    );
}
