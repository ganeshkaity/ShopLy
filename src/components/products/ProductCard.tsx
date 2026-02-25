"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star, Minus, Plus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Product } from "@/types";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";

interface ProductCardProps {
    product: Product;
    className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
    const { items, addItem, updateQuantity, removeItem } = useCart();
    const { toggleItem, isInWishlist } = useWishlist();
    const { user } = useAuth();
    const { toast } = useToast();

    const cartItem = items.find(item => item.productId === product.id);
    const isInCart = !!cartItem;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product, 1);
        toast(`Added ${product.name} to cart`, "success");
    };

    const handleIncrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (cartItem) {
            updateQuantity(product.id, cartItem.quantity + 1);
        }
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (cartItem) {
            if (cartItem.quantity > 1) {
                updateQuantity(product.id, cartItem.quantity - 1);
            } else {
                removeItem(product.id);
                toast(`Removed ${product.name} from cart`, "success");
            }
        }
    };

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast("Please login to add items to wishlist", "error");
            return;
        }
        await toggleItem(product);
        const isAdded = isInWishlist(product.id);
        toast(isAdded ? "Added to wishlist" : "Removed from wishlist", "success");
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4) return "bg-green-600";
        if (rating >= 3) return "bg-green-500";
        if (rating >= 2) return "bg-orange-500";
        return "bg-red-500";
    };

    // Dummy rating for preview if not provided in product type
    const rating = 4.7;

    return (
        <Card hover className={cn("group flex flex-col h-full", className)}>
            <div className="relative aspect-square overflow-hidden bg-white">
                <Link href={`/products/${product.slug}`} className="block h-full w-full p-0">
                    {product.images?.[0] ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-contain object-center transition-all duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            unoptimized
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-primary/10">
                            <Star className="h-20 w-20" fill="currentColor" />
                        </div>
                    )}
                </Link>

                {/* Badges */}
                <div className="absolute left-3 top-3 flex flex-col gap-2">
                    {product.stock <= 0 && <Badge variant="destructive">Out of Stock</Badge>}
                    {!!product.compareAtPrice && product.compareAtPrice > product.price && (
                        <Badge variant="success">
                            -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                        </Badge>
                    )}
                </div>

                {/* Wishlist Button */}
                <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                        "absolute right-3 top-3 h-8 w-8 rounded-full border-none bg-white/80 shadow-sm transition-all hover:bg-white",
                        isInWishlist(product.id) ? "text-primary" : "text-gray-600"
                    )}
                    onClick={handleToggleWishlist}
                >
                    <Heart className={cn("h-4 w-4", isInWishlist(product.id) && "fill-current")} />
                </Button>

                {/* Add to Cart Button Overlay */}
                <div className="absolute bottom-2 right-2 z-10">
                    {isInCart ? (
                        <div className="flex items-center gap-1 rounded-full border border-primary/20 bg-white shadow-md p-0.5">
                            <button
                                onClick={handleDecrement}
                                className="flex h-5 w-5 items-center justify-center rounded-full text-primary hover:bg-primary/5 transition-colors"
                            >
                                <Minus className="h-2.5 w-2.5" />
                            </button>
                            <span className="min-w-[0.7rem] text-center text-[10px] font-bold text-primary">
                                {cartItem?.quantity}
                            </span>
                            <button
                                onClick={handleIncrement}
                                className="flex h-5 w-5 items-center justify-center rounded-full text-primary hover:bg-primary/5 transition-colors"
                                disabled={cartItem && cartItem.quantity >= product.stock}
                            >
                                <Plus className="h-2.5 w-2.5" />
                            </button>
                        </div>
                    ) : (
                        <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full bg-white shadow-md text-primary hover:bg-primary hover:text-white transition-all transform group-hover:scale-110"
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                        >
                            <ShoppingCart className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <CardContent className="flex flex-col flex-grow p-3 gap-0.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    {product.category}
                </p>
                <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors">
                    <h3 className="text-sm font-medium line-clamp-1">
                        {product.name}
                    </h3>
                </Link>
                {product.secondaryTag && (
                    <div className="-ml-3 mt-0.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600/15 to-transparent text-blue-600 text-[9px] h-4 px-3 flex items-center font-bold uppercase tracking-wider">
                            {product.secondaryTag}
                        </div>
                    </div>
                )}
                <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <p className="text-base font-bold text-foreground">
                                {formatCurrency(product.price)}
                            </p>
                        </div>
                        {!!product.compareAtPrice && product.compareAtPrice > product.price && (
                            <p className="text-[10px] text-muted-foreground line-through">
                                {formatCurrency(product.compareAtPrice)}
                            </p>
                        )}
                    </div>

                    {/* Rating Badge */}
                    <div className={cn(
                        "flex items-center gap-0.5 px-1.5 py-0.5 rounded-l-md text-white font-bold text-[10px] shadow-sm -mr-3",
                        getRatingColor(rating)
                    )}>
                        <Star className="h-2.5 w-2.5 fill-current" />
                        <span>{rating}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
