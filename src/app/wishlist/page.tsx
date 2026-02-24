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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                    <Card key={item.productId} hover className="group">
                        <div className="relative aspect-square bg-gray-50 overflow-hidden">
                            <Link href={`/products/${item.productId}`} className="block h-full w-full">
                                {item.image ? (
                                    <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
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
                        <CardContent className="p-4 flex flex-col gap-2">
                            <Link href={`/products/${item.productId}`} className="font-medium hover:text-primary transition-colors line-clamp-1">
                                {item.name}
                            </Link>
                            <div className="flex items-center justify-between">
                                <p className="text-lg font-bold">{formatCurrency(item.price)}</p>
                                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full border border-primary/20 text-primary hover:bg-primary hover:text-white">
                                    <ShoppingCart className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
