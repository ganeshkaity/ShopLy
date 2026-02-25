"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";

interface ProductRowProps {
    title: string;
    products: Product[];
    viewAllLink?: string;
    className?: string;
}

export function ProductRow({ title, products, viewAllLink, className }: ProductRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftArrow(scrollLeft > 10);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        const currentRef = scrollRef.current;
        if (currentRef) {
            currentRef.addEventListener("scroll", checkScroll);
            // Initial check
            checkScroll();
            // Check again after a short delay for image rendering/layout
            setTimeout(checkScroll, 100);
        }
        return () => currentRef?.removeEventListener("scroll", checkScroll);
    }, [products]);

    if (products.length === 0) return null;

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = direction === "left" ? -440 : 440; // Scroll roughly 2 cards
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
        setScrollLeft(scrollRef.current?.scrollLeft || 0);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
        const walk = (x - startX) * 2; // Scroll speed
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    return (
        <section className={cn("flex flex-col gap-5", className)}>
            <div className="flex items-end justify-between">
                <h3 className="font-serif text-xl md:text-2xl font-bold">{title}</h3>
                {viewAllLink && (
                    <Link
                        href={viewAllLink}
                        className="flex items-center text-xs md:text-sm font-semibold text-primary hover:underline"
                    >
                        View All <ChevronRightIcon className="ml-1 h-3.5 w-3.5 md:h-4 md:w-4" />
                    </Link>
                )}
            </div>

            <div className="relative group/row">
                {/* Scroll Buttons */}
                <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                        "absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md border-border/50 transition-all opacity-0 group-hover/row:opacity-100 hidden md:flex",
                        !showLeftArrow && "pointer-events-none !opacity-0"
                    )}
                    onClick={() => scroll("left")}
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                <div
                    ref={scrollRef}
                    className={cn(
                        "flex items-stretch overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth",
                        isDragging ? "cursor-grabbing select-none" : "cursor-grab"
                    )}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    style={{ scrollSnapType: isDragging ? 'none' : 'x mandatory' }}
                >
                    {products.map((product, idx) => (
                        <div key={product.id} className="flex shrink-0 px-2 first:pl-4 last:pr-4 sm:px-3 sm:first:pl-0 sm:last:pr-0">
                            <div className="w-[190px] md:w-[210px] scroll-snap-align-start h-[320px] md:h-[360px] pb-2">
                                <ProductCard product={product} className="w-full h-full shadow-none border border-gray-200 bg-white hover:bg-gray-50/50 transition-all rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md border-border/50 transition-all opacity-0 group-hover/row:opacity-100 hidden md:flex",
                        !showRightArrow && "pointer-events-none !opacity-0"
                    )}
                    onClick={() => scroll("right")}
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </section>
    );
}

// Add CSS to tailwind or globals.css if scrollbar-hide is not available
// .scrollbar-hide::-webkit-scrollbar { display: none; }
// .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
// .scroll-snap-align-start { scroll-snap-align: start; }
