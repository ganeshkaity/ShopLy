"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductFilters } from "@/components/products/ProductFilters";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/Button";
import { ChevronDown, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function ProductsPage() {
    const [category, setCategory] = useState('All');
    const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
    const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
    const [sortBy, setSortBy] = useState('newest');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const { products, loading, hasMore, loadMore } = useProducts({
        category: category === 'All' ? undefined : category,
        minPrice,
        maxPrice,
        sortBy: sortBy as any,
    });

    const handlePriceChange = (min: number | undefined, max: number | undefined) => {
        setMinPrice(min);
        setMaxPrice(max);
    };

    return (
        <div className="container-custom py-8 md:py-12">
            <div className="flex flex-col gap-8">
                {/* Page Title & Mobile Toggle */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-serif text-4xl font-bold">Our Collection</h1>
                        <p className="text-muted-foreground text-sm md:text-base">Explore unique stationery and curated gift items.</p>
                    </div>

                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden">
                        <Button
                            variant="outline"
                            className="rounded-full gap-2 border-primary/20 text-primary hover:bg-primary/5"
                            onClick={() => setIsFilterModalOpen(true)}
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filters & Sort</span>
                            {(category !== 'All' || minPrice !== undefined || sortBy !== 'newest') && (
                                <span className="flex h-2 w-2 rounded-full bg-primary" />
                            )}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[260px_1fr]">
                    {/* Desktop Filters */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-24">
                            <ProductFilters
                                activeCategory={category}
                                onCategoryChange={setCategory}
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                onPriceChange={handlePriceChange}
                                sortBy={sortBy}
                                onSortChange={setSortBy}
                            />
                        </div>
                    </aside>

                    {/* Product Listing */}
                    <div className="flex flex-col gap-8">
                        {/* Active Filters Summary (Optional, but helpful since search is gone) */}
                        <div className="flex flex-wrap items-center gap-2">
                            {category !== 'All' && (
                                <Badge variant="secondary" className="rounded-full px-3 py-1 cursor-pointer hover:bg-primary/10" onClick={() => setCategory('All')}>
                                    {category} <X className="ml-1 h-3 w-3" />
                                </Badge>
                            )}
                            {minPrice !== undefined && (
                                <Badge variant="secondary" className="rounded-full px-3 py-1 cursor-pointer hover:bg-primary/10" onClick={() => handlePriceChange(undefined, undefined)}>
                                    {maxPrice ? `₹${minPrice}-₹${maxPrice}` : `Over ₹${minPrice}`} <X className="ml-1 h-3 w-3" />
                                </Badge>
                            )}
                        </div>

                        <ProductGrid products={products} loading={loading} />

                        {hasMore && (
                            <div className="flex justify-center pt-8">
                                <Button
                                    variant="outline"
                                    onClick={loadMore}
                                    isLoading={loading}
                                    className="rounded-full px-12 h-12 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all"
                                >
                                    Load More <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Modal */}
            <Modal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                title="Filters & Sort"
            >
                <div className="py-4">
                    <ProductFilters
                        activeCategory={category}
                        onCategoryChange={(cat) => { setCategory(cat); setIsFilterModalOpen(false); }}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        onPriceChange={(min, max) => { handlePriceChange(min, max); setIsFilterModalOpen(false); }}
                        sortBy={sortBy}
                        onSortChange={(sort) => { setSortBy(sort); setIsFilterModalOpen(false); }}
                    />
                </div>
            </Modal>
        </div>
    );
}
