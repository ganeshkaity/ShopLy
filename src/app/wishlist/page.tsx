"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function WishlistPage() {
    const { items, loading, toggleItem } = useWishlist();
    const { user } = useAuth();

    if (loading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container-custom flex h-[70vh] flex-col items-center justify-center text-center gap-6">
                <Heart className="h-20 w-20 text-muted-foreground/30" />
                <h2 className="font-serif text-3xl font-bold">Sign in to view wishlist</h2>
                <p className="max-w-md text-muted-foreground">Login to save your favorite items.</p>
                <Link href="/login">
                    <Button size="lg" className="rounded-full px-8">Login to Continue</Button>
                </Link>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container-custom flex h-[70vh] flex-col items-center justify-center text-center gap-6">
                <Heart className="h-20 w-20 text-muted-foreground/30" />
                <h2 className="font-serif text-3xl font-bold">Your wishlist is empty</h2>
                <p className="max-w-md text-muted-foreground">Browse our collection and save the items you love.</p>
                <Link href="/products">
                    <Button size="lg" className="rounded-full px-8">Explore Products</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container-custom py-8 md:py-16">
            <h1 className="font-serif text-3xl font-bold mb-8">My Wishlist ({items.length} items)</h1>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {items.map((item) => (
                    <Card key={item.productId} hover className="group flex flex-col">
                        <div className="relative aspect-square bg-gray-50 overflow-hidden shrink-0">
                            {/* Fallback to productId if slug is not stored */}
                            <Link href={`/products/${(item as any).slug || item.productId}`} className="block h-full w-full">
                                {item.image ? (
                                    <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/20">
                                        <Heart className="h-20 w-20" />
                                    </div>
                                )}
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 text-red-500 hover:bg-red-50"
                                onClick={() => toggleItem({ id: item.productId, name: item.name, price: item.price, images: [item.image] } as any)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardContent className="p-3 flex flex-col flex-grow gap-2">
                            <Link href={`/products/${(item as any).slug || item.productId}`} className="text-sm font-medium hover:text-primary transition-colors line-clamp-2 leading-snug">
                                {item.name}
                            </Link>
                            <div className="mt-auto flex items-center justify-between pt-2">
                                <p className="text-base font-bold">{formatCurrency(item.price)}</p>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full border border-primary/20 text-primary hover:bg-primary hover:text-white shrink-0">
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
