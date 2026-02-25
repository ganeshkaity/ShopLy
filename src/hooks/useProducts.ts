"use client";

import { useState, useEffect, useCallback } from "react";
import { getProducts } from "@/services/product.service";
import { Product } from "@/types";

interface UseProductsProps {
    category?: string;
    sortBy?: 'newest' | 'priceLowToHigh' | 'priceHighToLow' | 'popular';
    searchQuery?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
}

export function useProducts({ category, sortBy, searchQuery, minPrice, maxPrice, limit = 12 }: UseProductsProps = {}) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchProducts = useCallback(async (isLoadMore = false) => {
        setLoading(true);
        try {
            const result = await getProducts({
                category,
                sortBy,
                searchQuery,
                minPrice,
                maxPrice,
                pageLimit: limit,
                lastDoc: isLoadMore ? lastDoc : null,
            });

            if (isLoadMore) {
                setProducts((prev) => [...prev, ...result.products]);
            } else {
                setProducts(result.products);
            }

            setLastDoc(result.lastDoc);
            setHasMore(result.products.length === limit);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to fetch products");
        } finally {
            setLoading(false);
        }
    }, [category, sortBy, searchQuery, limit, lastDoc]);

    useEffect(() => {
        fetchProducts();
    }, [category, sortBy, searchQuery]); // Re-fetch when filters change (reset lastDoc)

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchProducts(true);
        }
    };

    return { products, loading, error, hasMore, loadMore };
}
