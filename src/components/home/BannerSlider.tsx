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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Auto-scroll logic
    useEffect(() => {
        if (banners.length <= 1 || isPaused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [banners.length, isPaused]);

    // Handle manual navigation
    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    // Dragging logic
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setIsPaused(true);
        setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
        setScrollLeft(sliderRef.current?.scrollLeft || 0);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsPaused(false);

        // Snap logic
        if (sliderRef.current) {
            const width = sliderRef.current.offsetWidth;
            const newIndex = Math.round(sliderRef.current.scrollLeft / width);
            setCurrentIndex(newIndex % banners.length);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !sliderRef.current) return;
        e.preventDefault();
        const x = e.pageX - sliderRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        sliderRef.current.scrollLeft = scrollLeft - walk;
    };

    if (!banners || banners.length === 0) return null;

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
                    className="flex transition-transform duration-700 ease-out h-full"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {banners.map((banner) => (
                        <Link
                            key={banner.id}
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
                            className="absolute left-6 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-white hover:text-black shadow-xl scale-90 hover:scale-100"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); nextSlide(); }}
                            className="absolute right-6 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-white hover:text-black shadow-xl scale-90 hover:scale-100"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </button>
                    </>
                )}

                {/* Progress Indicators */}
                {banners.length > 1 && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToSlide(idx)}
                                className={cn(
                                    "h-1.5 transition-all duration-300 rounded-full shadow-sm",
                                    currentIndex === idx ? "w-10 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
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
