"use client";

import React, { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import {
    Heart,
    Star,
    Share2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { getProductBySlug, getProducts } from "@/services/product.service";
import { Product } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import { ProductRow } from "@/components/products/ProductRow";
import { useToast } from "@/context/ToastContext";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, Truck, ShieldCheck, RotateCcw } from "lucide-react";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter();
    const { items, addItem, setBuyNowItem } = useCart();
    const { toggleItem, isInWishlist } = useWishlist();
    const { user } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const { toast } = useToast();

    useEffect(() => {
        const fetchProductData = async () => {
            const { slug } = await params;
            try {
                const data = await getProductBySlug(slug);
                if (!data) return notFound();
                setProduct(data);

                // Fetch similar products (same category)
                const similar = await getProducts({
                    category: data.category,
                    pageLimit: 6
                });
                setSimilarProducts(similar.products.filter((p: Product) => p.id !== data.id));

                // Fetch recommended products (other categories or high priority)
                const recommended = await getProducts({
                    pageLimit: 6,
                    sortBy: 'popular'
                });
                setRecommendedProducts(recommended.products.filter((p: Product) => p.id !== data.id));

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
    }, [params]);

    if (loading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!product) return notFound();

    const handleAddToCart = () => {
        addItem(product, quantity);
        toast(`Added ${quantity} x ${product.name} to cart!`, "success");
    };

    const handleBuyNow = () => {
        setBuyNowItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || "",
            quantity: quantity,
            category: product.category,
            type: product.type,
            slug: product.slug,
            stock: product.stock,
        });
        router.push("/checkout");
    };

    const handleToggleWishlist = async () => {
        if (!user) {
            toast("Please login to add items to wishlist", "error");
            return;
        }
        await toggleItem(product);
        const isAdded = !isInWishlist(product.id);
        toast(isAdded ? "Added to wishlist" : "Removed from wishlist", "success");
    };

    const handleShare = async () => {
        const shareData = {
            title: product.name,
            text: product.description,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast("Link copied to clipboard", "success");
            }
        } catch (error) {
            console.error("Error sharing", error);
        }
    };

    const isSale = product.compareAtPrice && product.compareAtPrice > product.price;

    return (
        <div className="container-custom py-8 md:py-16">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                {/* Left: Image Gallery */}
                <div className="relative">
                    <ProductImageGallery images={product.images || []} name={product.name} />

                    {/* Floating Buttons */}
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                                "h-14 w-14 rounded-full bg-white/80 backdrop-blur-md border-none shadow-sm transition-all hover:bg-white",
                                isInWishlist(product.id) ? "text-primary" : "text-gray-600"
                            )}
                            onClick={handleToggleWishlist}
                        >
                            <Heart className={cn("h-6 w-6", isInWishlist(product.id) && "fill-current")} />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-14 w-14 rounded-full bg-white/80 backdrop-blur-md border-none shadow-sm transition-all hover:bg-white text-gray-600"
                            onClick={handleShare}
                        >
                            <Share2 className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                {/* Right: Product Info */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="uppercase tracking-widest">{product.category}</Badge>
                            <div className="flex items-center gap-1 text-yellow-400">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="text-sm font-bold text-foreground">4.8</span>
                                <span className="text-xs text-muted-foreground">(124 reviews)</span>
                            </div>
                        </div>
                        <h1 className="font-serif text-3xl font-bold md:text-4xl">{product.name}</h1>
                    </div>

                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-primary">{formatCurrency(product.price)}</span>
                        {isSale && (
                            <span className="text-xl text-muted-foreground line-through">
                                {formatCurrency(product.compareAtPrice!)}
                            </span>
                        )}
                        {isSale && (
                            <Badge variant="success" className="mb-1">
                                Save {Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)}%
                            </Badge>
                        )}
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                        {product.description}
                    </p>

                    <hr className="border-border" />

                    {/* Add to Cart Controls */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center rounded-full border border-border px-2">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-2 hover:text-primary transition-colors disabled:opacity-30"
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <span className="w-10 text-center font-medium">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="p-2 hover:text-primary transition-colors disabled:opacity-30"
                                    disabled={quantity >= product.stock}
                                >
                                    +
                                </button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {product.stock > 0 ? `${product.stock} items available` : 'Out of stock'}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                className="flex-grow rounded-full text-lg h-12 bg-primary hover:bg-primary/90 text-white"
                                onClick={handleBuyNow}
                                disabled={product.stock <= 0}
                            >
                                Order Now
                            </Button>
                            {items.some(item => item.productId === product.id) ? (
                                <Button
                                    variant="outline"
                                    className="flex-grow rounded-full text-lg h-12 border-primary text-primary hover:bg-primary/5"
                                    onClick={() => router.push("/cart")}
                                >
                                    <ShoppingCart className="mr-2 h-5 w-5" /> View in Cart
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="flex-grow rounded-full text-lg h-12 border-primary/20 hover:bg-primary/5 text-primary"
                                    onClick={handleAddToCart}
                                    disabled={product.stock <= 0}
                                >
                                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Value Props */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                            <Truck className="h-5 w-5 text-primary shrink-0" />
                            <span className="text-xs font-medium">Free Shipping above ₹499</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                            <span className="text-xs font-medium">Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                            <RotateCcw className="h-5 w-5 text-primary shrink-0" />
                            <span className="text-xs font-medium">7 Days Returns</span>
                        </div>
                    </div>

                    {/* Additional Info Tabs (Simplified) */}
                    <div className="mt-8">
                        <h4 className="font-bold mb-3">Product Details</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                            <li>Material: {product.type === 'DIGITAL' ? 'Digital Download' : 'Premium Artisanal Paper'}</li>
                            <li>Sustainable and eco-friendly packaging</li>
                            <li>Handcrafted with attention to detail</li>
                            {product.type === 'DIGITAL' && <li>Instant access after payment</li>}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Recommendations Section */}
            <div className="mt-20 flex flex-col gap-16">
                <ProductRow
                    title="Similar Products"
                    products={similarProducts}
                    viewAllLink={`/products?category=${product.category}`}
                />

                <ProductRow
                    title="You Might Also Love"
                    products={recommendedProducts}
                    viewAllLink="/products"
                />
            </div>
        </div>
    );
}
