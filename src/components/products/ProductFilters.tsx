"use client";

import { useState, useEffect } from "react";
import { getCategories } from "@/services/category.service";
import { Category } from "@/types";
import { cn } from "@/lib/utils";
import { Search, X, Filter, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";

interface ProductFiltersProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
    minPrice?: number;
    maxPrice?: number;
    onPriceChange: (min: number | undefined, max: number | undefined) => void;
    sortBy: string;
    onSortChange: (sort: any) => void;
    freeShipping?: boolean;
    onFreeShippingChange?: (val: boolean) => void;
    returnAvailable?: boolean;
    onReturnAvailableChange?: (val: boolean) => void;
    codAvailable?: boolean;
    onCodAvailableChange?: (val: boolean) => void;
    className?: string;
}

export function ProductFilters({
    activeCategory,
    onCategoryChange,
    minPrice,
    maxPrice,
    onPriceChange,
    sortBy,
    onSortChange,
    freeShipping = false,
    onFreeShippingChange,
    returnAvailable = false,
    onReturnAvailableChange,
    codAvailable = false,
    onCodAvailableChange,
    className
}: ProductFiltersProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAllCategories, setShowAllCategories] = useState(false);

    const priceRanges = [
        { label: "All Prices", min: undefined, max: undefined },
        { label: "Under ₹500", min: 0, max: 500 },
        { label: "₹500 - ₹1,000", min: 500, max: 1000 },
        { label: "₹1,000 - ₹2,000", min: 1000, max: 2000 },
        { label: "Over ₹2,000", min: 2000, max: undefined },
    ];

    useEffect(() => {
        async function loadCategories() {
            try {
                const data = await getCategories(true);
                data.sort((a, b) => a.name.localeCompare(b.name));
                setCategories(data);
            } catch (error) {
                console.error("Failed to load categories:", error);
            } finally {
                setLoading(false);
            }
        }
        loadCategories();
    }, []);

    const displayedCategories = showAllCategories ? categories : categories.slice(0, 5);

    return (
        <div className={cn("flex flex-col gap-8", className)}>
            {/* Sorting */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5" /> Sort By
                </h4>
                <select
                    className="w-full rounded-xl border border-border bg-gray-50/50 p-3 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                >
                    <option value="newest">Newest First</option>
                    <option value="priceLowToHigh">Price: Low to High</option>
                    <option value="priceHighToLow">Price: High to Low</option>
                    <option value="popular">Popularity</option>
                </select>
            </div>

            {/* Categories */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Collections</h4>
                <div className="flex flex-col gap-1.5">
                    <button
                        onClick={() => onCategoryChange('All')}
                        className={cn(
                            "text-left text-sm py-2 px-4 rounded-xl transition-all duration-200",
                            activeCategory === 'All'
                                ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                                : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
                        )}
                    >
                        All Collections
                    </button>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full rounded-xl" />
                        ))
                    ) : (
                        <>
                            {displayedCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => onCategoryChange(cat.name)}
                                    className={cn(
                                        "text-left text-sm py-2 px-4 rounded-xl transition-all duration-200",
                                        activeCategory === cat.name
                                            ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                                            : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
                                    )}
                                >
                                    {cat.name}
                                </button>
                            ))}
                            {categories.length > 5 && (
                                <button
                                    onClick={() => setShowAllCategories(!showAllCategories)}
                                    className="flex items-center gap-2 text-sm py-2 px-4 text-primary font-medium hover:bg-primary/5 rounded-xl transition-colors mt-2"
                                >
                                    {showAllCategories ? (
                                        <><ChevronUp className="h-4 w-4" /> Show Less</>
                                    ) : (
                                        <><ChevronDown className="h-4 w-4" /> View {categories.length - 5} More</>
                                    )}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Price Range</h4>
                <div className="flex flex-col gap-1.5">
                    {priceRanges.map((range, idx) => {
                        const isSelected = minPrice === range.min && maxPrice === range.max;
                        return (
                            <button
                                key={idx}
                                onClick={() => onPriceChange(range.min, range.max)}
                                className={cn(
                                    "text-left text-sm py-2 px-4 rounded-xl transition-all duration-200",
                                    isSelected
                                        ? "bg-primary/10 text-primary font-bold"
                                        : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
                                )}
                            >
                                {range.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Features (Boolean filters) */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Features</h4>
                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={freeShipping}
                            onChange={(e) => onFreeShippingChange?.(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-foreground transition-colors">Free Shipping</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={returnAvailable}
                            onChange={(e) => onReturnAvailableChange?.(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-foreground transition-colors">Return Available</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={codAvailable}
                            onChange={(e) => onCodAvailableChange?.(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-foreground transition-colors">COD Available</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
