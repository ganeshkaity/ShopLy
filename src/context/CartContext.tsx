"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    getCart,
    saveCart,
    addToCartService,
    updateCartQuantityService,
    removeFromCartService
} from "@/services/cart.service";
import { CartItem, Product } from "@/types";
import { SHIPPING_CHARGES } from "@/constants";
import { getProductById } from "@/services/product.service";

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    totalAmount: number;
    shippingCharge: number;
    grandTotal: number;
    subtotal: number;
    mrpTotal: number;
    discount: number;
    addItem: (product: Product, quantity: number, selectedVariants?: Record<string, string>, price?: number) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    loading: boolean;
    buyNowItem: CartItem | null;
    setBuyNowItem: (item: CartItem | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Load cart on auth change and enrich with compareAtPrice if missing
    useEffect(() => {
        const loadCartAndEnrich = async () => {
            if (user) {
                setLoading(true);
                const cartItems = await getCart(user.uid);

                // Enrich items with missing compareAtPrice by fetching from products
                const enrichedItems = await Promise.all(cartItems.map(async (item) => {
                    if (item.compareAtPrice === undefined || item.compareAtPrice === null) {
                        try {
                            const product = await getProductById(item.productId);
                            if (product) {
                                return {
                                    ...item,
                                    compareAtPrice: product.compareAtPrice || item.price,
                                    price: product.price || item.price // Sync current price
                                };
                            }
                        } catch (e) {
                            console.error("Failed to enrich cart item:", e);
                        }
                    }
                    return item;
                }));

                setItems(enrichedItems);
                setLoading(false);
            } else {
                setItems([]);
                setLoading(false);
            }
        };
        loadCartAndEnrich();
    }, [user]);

    const subtotal = useMemo(() => {
        if (buyNowItem) return buyNowItem.price * buyNowItem.quantity;
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [items, buyNowItem]);

    const mrpTotal = useMemo(() => {
        const checkItems = buyNowItem ? [buyNowItem] : items;
        if (checkItems.length === 0) return 0;
        return checkItems.reduce((sum, item) => {
            const priceToUse = item.compareAtPrice && item.compareAtPrice > item.price
                ? item.compareAtPrice
                : item.price;
            return sum + (priceToUse * item.quantity);
        }, 0);
    }, [items, buyNowItem]);

    const discount = mrpTotal - subtotal;

    const itemCount = useMemo(() => {
        if (buyNowItem) return buyNowItem.quantity;
        return items.reduce((sum, item) => sum + item.quantity, 0);
    }, [items, buyNowItem]);

    const shippingCharge = useMemo(() => {
        const checkItems = buyNowItem ? [buyNowItem] : items;
        if (checkItems.length === 0) return 0;
        return subtotal >= SHIPPING_CHARGES.MIN_ORDER_FOR_FREE_SHIPPING ? 0 : SHIPPING_CHARGES.BASE_SHIPPING;
    }, [subtotal, items, buyNowItem]);

    const grandTotal = subtotal + shippingCharge;

    const addItem = async (product: Product, quantity: number, selectedVariants?: Record<string, string>, price?: number) => {
        if (!user) return; // Cart requires login for now
        const newItems = await addToCartService(user.uid, product, quantity, selectedVariants, price);
        setItems(newItems);
    };

    const removeItem = async (productId: string) => {
        if (!user) return;
        const newItems = await removeFromCartService(user.uid, productId);
        setItems(newItems);
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        if (!user) return;
        const newItems = await updateCartQuantityService(user.uid, productId, quantity);
        setItems(newItems);
    };

    const clearCart = async () => {
        if (!user) return;
        await saveCart(user.uid, []);
        setItems([]);
    };

    return (
        <CartContext.Provider value={{
            items,
            itemCount,
            subtotal,
            mrpTotal,
            discount,
            shippingCharge,
            grandTotal,
            totalAmount: grandTotal,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            loading,
            buyNowItem,
            setBuyNowItem
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCartContext() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCartContext must be used within a CartProvider");
    }
    return context;
}
