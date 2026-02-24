"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getWishlist, toggleWishlistService } from "@/services/wishlist.service";
import { WishlistItem, Product } from "@/types";

interface WishlistContextType {
    items: WishlistItem[];
    toggleItem: (product: Product) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const loadWishlist = async () => {
            if (user) {
                setLoading(true);
                const wishlistItems = await getWishlist(user.uid);
                setItems(wishlistItems);
                setLoading(false);
            } else {
                setItems([]);
                setLoading(false);
            }
        };
        loadWishlist();
    }, [user]);

    const toggleItem = async (product: Product) => {
        if (!user) return;
        const newItems = await toggleWishlistService(user.uid, product);
        setItems(newItems);
    };

    const isInWishlist = (productId: string) => items.some(item => item.productId === productId);

    return (
        <WishlistContext.Provider value={{ items, toggleItem, isInWishlist, loading }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlistContext() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error("useWishlistContext must be used within a WishlistProvider");
    }
    return context;
}
