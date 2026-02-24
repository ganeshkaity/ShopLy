"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductFilters } from "@/components/products/ProductFilters";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/Button";
import { ChevronDown, Filter } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export default function ProductsPage() {
    const [category, setCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const { products, loading, hasMore, loadMore } = useProducts({
        category: category === 'All' ? undefined : category,
        searchQuery,
        sortBy: sortBy as any,
    });

    return (
        <div className="container-custom py-8 md:py-12">
            <div className="flex flex-col gap-8">
                {/* Page Title */}
                <div className="flex flex-col gap-2">
                    <h1 className="font-serif text-4xl font-bold">Our Collection</h1>
                    <p className="text-muted-foreground">Explore unique stationery and curated gift items.</p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
                    {/* Desktop Filters */}
                    <aside className="hidden lg:block">
                        <ProductFilters
                            activeCategory={category}
                            onCategoryChange={setCategory}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                        />
                    </aside>

                    {/* Mobile Filter Toggle */}
                    <div className="flex items-center justify-between gap-4 lg:hidden">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full rounded-full border border-border bg-gray-50 py-2 px-10 text-sm outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
                        </div>
                        <Button variant="outline" size="icon" onClick={() => setIsFilterModalOpen(true)}>
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Product Listing */}
                    <div className="flex flex-col gap-8">
                        <ProductGrid products={products} loading={loading} />

                        {hasMore && (
                            <div className="flex justify-center pt-4">
                                <Button
                                    variant="outline"
                                    onClick={loadMore}
                                    isLoading={loading}
                                    className="rounded-full px-8"
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
                title="Filters"
            >
                <ProductFilters
                    activeCategory={category}
                    onCategoryChange={(cat) => { setCategory(cat); setIsFilterModalOpen(false); }}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                />
            </Modal>
        </div>
    );
}
