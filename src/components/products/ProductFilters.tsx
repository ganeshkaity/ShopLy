"use client";

import { PRODUCT_CATEGORIES } from "@/constants";
import { cn } from "@/lib/utils";
import { Search, X, Filter } from "lucide-react";
import { Button } from "../ui/Button";

interface ProductFiltersProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    sortBy: string;
    onSortChange: (sort: any) => void;
    className?: string;
}

export function ProductFilters({
    activeCategory,
    onCategoryChange,
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    className
}: ProductFiltersProps) {
    return (
        <div className={cn("flex flex-col gap-6", className)}>
            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full rounded-full border border-border bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Sorting */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Filter className="h-3 w-3" /> Sort By
                </h4>
                <select
                    className="w-full rounded-lg border border-border bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-primary/10"
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
            <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categories</h4>
                <div className="flex flex-col gap-1">
                    <button
                        onClick={() => onCategoryChange('All')}
                        className={cn(
                            "text-left text-sm py-1.5 px-3 rounded-md transition-colors",
                            activeCategory === 'All' ? "bg-primary text-white font-medium" : "text-foreground hover:bg-accent"
                        )}
                    >
                        All Collections
                    </button>
                    {PRODUCT_CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => onCategoryChange(cat)}
                            className={cn(
                                "text-left text-sm py-1.5 px-3 rounded-md transition-colors",
                                activeCategory === cat ? "bg-primary text-white font-medium" : "text-foreground hover:bg-accent"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
