"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";

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

    if (products.length === 0) return null;

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
        <section className={cn("flex flex-col gap-6", className)}>
            <div className="flex items-end justify-between">
                <h3 className="font-serif text-2xl font-bold">{title}</h3>
                {viewAllLink && (
                    <Link
                        href={viewAllLink}
                        className="flex items-center text-sm font-semibold text-primary hover:underline"
                    >
                        View All <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                )}
            </div>

            <div
                ref={scrollRef}
                className={cn(
                    "flex items-stretch gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth",
                    isDragging ? "cursor-grabbing select-none" : "cursor-grab"
                )}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{ scrollSnapType: isDragging ? 'none' : 'x mandatory' }}
            >
                {products.map((product) => (
                    <div key={product.id} className="w-[280px] shrink-0 scroll-snap-align-start h-full flex">
                        <ProductCard product={product} className="w-full h-full" />
                    </div>
                ))}
            </div>
        </section>
    );
}

// Add CSS to tailwind or globals.css if scrollbar-hide is not available
// .scrollbar-hide::-webkit-scrollbar { display: none; }
// .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
// .scroll-snap-align-start { scroll-snap-align: start; }
