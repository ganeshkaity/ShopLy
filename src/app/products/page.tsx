"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductFilters } from "@/components/products/ProductFilters";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/Button";
import { ChevronDown, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useSearchParams, useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/PageLoader";

function ProductsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialCategory = searchParams.get('category') || 'All';
    const searchQuery = searchParams.get('search') || undefined;

    const [category, setCategory] = useState(initialCategory);
    const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
    const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
    const [sortBy, setSortBy] = useState('newest');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // Sync category state with URL if it changes from outside
    useEffect(() => {
        const catParam = searchParams.get('category');
        if (catParam && catParam !== category) {
            setCategory(catParam);
        }
    }, [searchParams]);

    const { products, loading, hasMore, loadMore } = useProducts({
        category: category === 'All' ? undefined : category,
        minPrice,
        maxPrice,
        sortBy: sortBy as any,
        searchQuery,
    });

    const handlePriceChange = (min: number | undefined, max: number | undefined) => {
        setMinPrice(min);
        setMaxPrice(max);
    };

    const handleCategoryChange = (newCategory: string) => {
        setCategory(newCategory);
        // Also update URL to remove search query if changing category directly
        if (searchQuery) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete('search');
            if (newCategory !== 'All') {
                params.set('category', newCategory);
            } else {
                params.delete('category');
            }
            router.push(`/products?${params.toString()}`);
        }
    };

    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [observerTarget, hasMore, loading, loadMore]);

    return (
        <div className="container-custom py-8 md:py-12">
            <div className="flex flex-col gap-8">
                {/* Page Title & Mobile Toggle */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-serif text-4xl font-bold">
                            {searchQuery ? `Search Results for "${searchQuery}"` : "Our Collection"}
                        </h1>
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
                                onCategoryChange={handleCategoryChange}
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
                        {/* Active Filters Summary */}
                        <div className="flex flex-wrap items-center gap-2">
                            {category !== 'All' && (
                                <Badge variant="secondary" className="rounded-full px-3 py-1 cursor-pointer hover:bg-primary/10" onClick={() => handleCategoryChange('All')}>
                                    {category} <X className="ml-1 h-3 w-3" />
                                </Badge>
                            )}
                            {searchQuery && (
                                <Badge variant="secondary" className="rounded-full px-3 py-1 cursor-pointer hover:bg-primary/10" onClick={() => {
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.delete('search');
                                    router.push(`/products?${params.toString()}`);
                                }}>
                                    Search: {searchQuery} <X className="ml-1 h-3 w-3" />
                                </Badge>
                            )}
                            {minPrice !== undefined && (
                                <Badge variant="secondary" className="rounded-full px-3 py-1 cursor-pointer hover:bg-primary/10" onClick={() => handlePriceChange(undefined, undefined)}>
                                    {maxPrice ? `₹${minPrice}-₹${maxPrice}` : `Over ₹${minPrice}`} <X className="ml-1 h-3 w-3" />
                                </Badge>
                            )}
                        </div>

                        <ProductGrid products={products} loading={loading && products.length === 0} />

                        {hasMore && (
                            <div className="flex justify-center pt-8 flex-col items-center gap-4">
                                <div ref={observerTarget} className="h-4 w-full" />
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
                        onCategoryChange={(cat) => { handleCategoryChange(cat); setIsFilterModalOpen(false); }}
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

export default function ProductsPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <ProductsContent />
        </Suspense>
    );
}
