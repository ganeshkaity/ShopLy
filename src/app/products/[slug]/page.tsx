"use client";

import React, { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import {
    Heart,
    Star,
    Share2,
    Home,
    ChevronRight,
    ShoppingCart,
    Truck,
    ShieldCheck,
    RotateCcw,
    Banknote,
    PackageCheck,
    Minus,
    Plus as PlusIcon,
    ChevronDown,
} from "lucide-react";
import Link from "next/link";
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
import { ProductDetailsSkeleton } from "@/components/products/ProductDetailsSkeleton";
import { ProductRow } from "@/components/products/ProductRow";
import { useToast } from "@/context/ToastContext";
import { useCart } from "@/hooks/useCart";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter();
    const { items, addItem, setBuyNowItem, updateQuantity, removeItem } = useCart();
    const { toggleItem, isInWishlist } = useWishlist();
    const { user } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
    const { toast } = useToast();

    useEffect(() => {
        const fetchProductData = async () => {
            const { slug } = await params;
            try {
                const data = await getProductBySlug(slug);
                if (!data) return notFound();
                setProduct(data);
                if (data.minOrderQty && data.minOrderQty > 1) {
                    setQuantity(data.minOrderQty);
                }

                // Auto-select first option for each variant
                if (data.variants && data.variants.length > 0) {
                    const initialSelections: Record<string, string> = {};
                    data.variants.forEach(v => {
                        if (v.options && v.options.length > 0) {
                            initialSelections[v.name] = v.options[0].id;
                        }
                    });
                    setSelectedVariants(initialSelections);
                }

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
        return <ProductDetailsSkeleton />;
    }

    if (!product) return notFound();

    // Calculate dynamic price based on selected variants
    const getDynamicPrice = () => {
        let priceAdjustment = 0;

        if (product.variants && Object.keys(selectedVariants).length > 0) {
            product.variants.forEach(v => {
                const selectedId = selectedVariants[v.name];
                const option = v.options.find(o => o.id === selectedId);
                if (option) {
                    const adjustment = (option as any).priceAdjustment || 0;
                    if ((option as any).adjustmentType === '+') {
                        priceAdjustment += adjustment;
                    } else if ((option as any).adjustmentType === '-') {
                        priceAdjustment -= adjustment;
                    }
                }
            });
        }

        const currentPrice = product.price + priceAdjustment;
        const currentComparePrice = product.compareAtPrice ? product.compareAtPrice + priceAdjustment : 0;

        return { price: currentPrice, comparePrice: currentComparePrice };
    };

    const { price: displayPrice, comparePrice: displayComparePrice } = getDynamicPrice();

    const handleAddToCart = () => {
        const variantSelection = Object.entries(selectedVariants).reduce((acc, [name, id]) => {
            const v = product.variants?.find(v => v.name === name);
            const o = v?.options.find(o => o.id === id);
            if (o) acc[name] = o.value;
            return acc;
        }, {} as Record<string, string>);

        addItem(product, quantity, variantSelection, displayPrice);
        toast(`Added ${quantity} x ${product.name} to cart!`, "success");
    };

    const handleBuyNow = () => {
        const variantSelection = Object.entries(selectedVariants).reduce((acc, [name, id]) => {
            const v = product.variants?.find(v => v.name === name);
            const o = v?.options.find(o => o.id === id);
            if (o) acc[name] = o.value;
            return acc;
        }, {} as Record<string, string>);

        setBuyNowItem({
            productId: product.id,
            name: product.name,
            price: displayPrice,
            image: product.images?.[0] || "",
            quantity: quantity,
            category: product.category,
            type: product.type,
            slug: product.slug,
            stock: product.stock,
            selectedVariants: variantSelection
        });
        router.push("/checkout");
    };

    const cartItem = items.find(item => item.productId === product.id);
    const isInCart = !!cartItem;

    const handleIncrement = () => {
        if (cartItem) {
            updateQuantity(product.id, cartItem.quantity + 1);
        }
    };

    const handleDecrement = () => {
        if (cartItem) {
            if (cartItem.quantity > 1) {
                updateQuantity(product.id, cartItem.quantity - 1);
            } else {
                removeItem(product.id);
                toast(`Removed ${product.name} from cart`, "success");
            }
        }
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

    const isSale = !!product.compareAtPrice && product.compareAtPrice > product.price;

    return (
        <div className="container-custom pt-4 md:pt-6 pb-32 md:pb-16 flex flex-col gap-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[10px] md:text-sm font-medium text-muted-foreground overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
                <Link href="/" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <Home className="h-3.5 w-3.5 mb-0.5" />
                    <span className="sr-only">Home</span>
                </Link>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-40" />
                <Link href="/products" className="hover:text-primary transition-colors">
                    Products
                </Link>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-40" />
                <Link href={`/products?category=${product.category}`} className="hover:text-primary transition-colors capitalize">
                    {product.category}
                </Link>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-40" />
                <span className="text-primary font-bold truncate">
                    {product.name}
                </span>
            </nav>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
                {/* Left: Image Gallery */}
                <div className="lg:sticky lg:top-10 h-fit">
                    <ProductImageGallery images={product.images || []} name={product.name} />

                    {/* Floating Buttons */}
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2.5">
                        <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                                "h-11 w-11 rounded-full bg-white/40 backdrop-blur-xl border border-white/50 shadow-lg transition-all hover:bg-white/60 hover:scale-110 active:scale-95",
                                isInWishlist(product.id) ? "text-primary" : "text-gray-700"
                            )}
                            onClick={handleToggleWishlist}
                        >
                            <Heart className={cn("h-5 w-5", isInWishlist(product.id) && "fill-current")} />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 rounded-full bg-white/40 backdrop-blur-xl border border-white/50 shadow-lg transition-all hover:bg-white/60 hover:scale-110 active:scale-95 text-gray-700"
                            onClick={handleShare}
                        >
                            <Share2 className="h-5 w-5" />
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
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            {product.description}
                        </p>
                    </div>

                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-primary">{formatCurrency(displayPrice)}</span>
                        {displayComparePrice > displayPrice && (
                            <span className="text-xl text-muted-foreground line-through">
                                {formatCurrency(displayComparePrice)}
                            </span>
                        )}
                        {displayComparePrice > displayPrice && (
                            <Badge variant="success" className="mb-1">
                                Save {Math.round(((displayComparePrice - displayPrice) / displayComparePrice) * 100)}%
                            </Badge>
                        )}
                    </div>

                    <div className="flex flex-col gap-1 -mt-4">
                        {product.stock > 10 ? (
                            <span className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                                In stock
                            </span>
                        ) : product.stock > 5 ? (
                            <span className="text-sm font-semibold text-orange-500">Only Few Lefts</span>
                        ) : product.stock > 0 ? (
                            <span className="text-sm font-semibold text-red-600 font-bold">Only {product.stock} left!</span>
                        ) : (
                            <span className="text-sm font-semibold text-red-600 font-bold">Out of Stock</span>
                        )}
                    </div>

                    {/* Variant Selectors */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="flex flex-col gap-4 mt-2">
                            {product.variants.map((variant) => (
                                <div key={variant.id} className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground font-medium">Variants :</span>
                                        <span className="text-xs font-bold text-foreground">{variant.name}</span>
                                    </div>
                                    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 scrollbar-thin-pink">
                                        {variant.options.map((option) => {
                                            const isActive = selectedVariants[variant.name] === option.id;
                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => setSelectedVariants(prev => ({
                                                        ...prev,
                                                        [variant.name]: option.id
                                                    }))}
                                                    className={cn(
                                                        "px-4 py-2 rounded border text-xs font-bold transition-all duration-300 whitespace-nowrap shrink-0",
                                                        isActive
                                                            ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary"
                                                            : "border-border bg-white text-muted-foreground hover:border-primary/50 hover:text-primary"
                                                    )}
                                                >
                                                    {option.value.toUpperCase()}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <hr className="border-border/50 max-w-[200px]" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* {product.minOrderQty && product.minOrderQty > 1 && (
                        <div className="flex items-center gap-2 -mt-4 text-primary bg-primary/5 px-3 py-1.5 rounded-lg w-fit">
                            <PackageCheck className="h-4 w-4" />
                            <span className="text-sm font-medium">Minimum Order Quantity: {product.minOrderQty} units</span>
                        </div>
                    )} */}

                    <hr className="border-border" />

                    {/* Add to Cart Controls */}
                    <div className="flex flex-col gap-4">
                        {!isInCart && (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center rounded-full border border-border px-2">
                                    <button
                                        onClick={() => setQuantity(Math.max(product.minOrderQty || 1, quantity - 1))}
                                        className="p-2 hover:text-primary transition-colors disabled:opacity-30"
                                        disabled={quantity <= (product.minOrderQty || 1)}
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
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-muted-foreground">
                                        {product.stock > 0 ? `${product.stock} items available` : 'Out of stock'}
                                    </p>
                                    {product.minOrderQty && product.minOrderQty > 1 && (
                                        <p className="text-xs font-semibold text-primary">
                                            Min order quantity: {product.minOrderQty}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                className="flex-grow rounded-full text-lg h-12 bg-primary hover:bg-primary/90 text-white"
                                onClick={handleBuyNow}
                                disabled={product.stock <= 0}
                            >
                                Order Now
                            </Button>
                            {isInCart ? (
                                <div className="flex-grow flex items-center justify-between rounded-full border border-primary/20 bg-primary/5 px-2 h-12">
                                    <button
                                        onClick={handleDecrement}
                                        className="h-9 w-9 flex items-center justify-center rounded-full bg-white text-primary shadow-sm hover:bg-primary hover:text-white transition-all"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg font-bold text-primary">{cartItem?.quantity}</span>
                                        <span className="text-[8px] uppercase font-bold text-primary/60 tracking-tighter -mt-1">In Cart</span>
                                    </div>
                                    <button
                                        onClick={handleIncrement}
                                        className="h-9 w-9 flex items-center justify-center rounded-full bg-white text-primary shadow-sm hover:bg-primary hover:text-white transition-all"
                                        disabled={!!cartItem && cartItem.quantity >= product.stock}
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                    </button>
                                </div>
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

                    {/* Trust Badges */}
                    {(() => {
                        const badges = [
                            {
                                show: product.securePayment !== false,
                                icon: ShieldCheck,
                                label: "100% Safe & Secure Payments"
                            },
                            {
                                show: product.returnAvailable,
                                icon: RotateCcw,
                                label: product.returnDays ? `Easy ${product.returnDays} days return` : "Easy return and replacements"
                            },
                            {
                                show: product.freeShipping || (product.price >= 500),
                                icon: Truck,
                                label: "Trusted Shipping"
                            },
                            {
                                show: product.codAvailable,
                                icon: Banknote,
                                label: "Cash on Delivery"
                            }
                        ].filter(b => b.show).slice(0, 3);

                        if (badges.length === 0) return null;

                        return (
                            <div className={`grid grid-cols-${badges.length} gap-2 py-6 border-y border-border/50 mt-4`}>
                                {badges.map((badge, idx) => (
                                    <div key={idx} className="flex flex-col items-center text-center gap-3">
                                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-primary/5 flex items-center justify-center text-primary/80">
                                            <badge.icon className="h-6 w-6 md:h-7 md:w-7" />
                                        </div>
                                        <span className="text-[10px] md:text-sm font-medium leading-tight text-muted-foreground px-1">
                                            {badge.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}

                    {/* Product Details & Accordions */}
                    <div className="mt-8 space-y-4">
                        {/* Default Product Details Accordion */}
                        <AccordionItem title="Product Description">
                            {product.productDetails ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                    {product.productDetails}
                                </ReactMarkdown>
                            ) : (
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Material: {product.type === 'DIGITAL' ? 'Digital Download' : 'Premium Artisanal Paper'}</li>
                                    <li>Sustainable and eco-friendly packaging</li>
                                    <li>Handcrafted with attention to detail</li>
                                    {product.type === 'DIGITAL' && <li>Instant access after payment</li>}
                                </ul>
                            )}
                        </AccordionItem>

                        {/* Additional Custom Accordions */}
                        {product.productAccordions?.map((item) => (
                            <AccordionItem key={item.id} title={item.title}>
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                    {item.content}
                                </ReactMarkdown>
                            </AccordionItem>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Bar (Mobile/Tablet optimized) */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-border p-4 lg:hidden animate-in fade-in slide-in-from-bottom duration-500 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
                <div className="container-custom flex items-center gap-4">
                    <div className="flex-1 flex flex-col">
                        <span className="text-xl font-bold text-primary">{formatCurrency(displayPrice)}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Total Price</span>
                    </div>
                    <div className="flex-[2] flex gap-3">
                        {isInCart ? (
                            <div className="flex-1 flex items-center justify-between rounded-full border border-primary/20 bg-primary/5 px-2 h-12">
                                <button
                                    onClick={handleDecrement}
                                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white text-primary shadow-sm hover:bg-primary hover:text-white transition-all"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <div className="flex flex-col items-center">
                                    <span className="text-base font-bold text-primary">{cartItem?.quantity}</span>
                                    <span className="text-[7px] uppercase font-bold text-primary/60 tracking-tighter -mt-1">Cart</span>
                                </div>
                                <button
                                    onClick={handleIncrement}
                                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white text-primary shadow-sm hover:bg-primary hover:text-white transition-all"
                                    disabled={!!cartItem && cartItem.quantity >= product.stock}
                                >
                                    <PlusIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                className="flex-1 rounded-full h-12 border-primary/20 text-primary hover:bg-primary/5"
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                            >
                                <ShoppingCart className="h-5 w-5" />
                            </Button>
                        )}
                        <Button
                            className="flex-[2] rounded-full h-12 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 font-bold"
                            onClick={handleBuyNow}
                            disabled={product.stock <= 0}
                        >
                            Buy Now
                        </Button>
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

function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-border rounded-xl bg-gray-50/50 overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100/50 transition-colors"
            >
                <span className="font-bold text-foreground">{title}</span>
                <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
            </button>
            <div className={cn(
                "grid transition-all duration-300 ease-in-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}>
                <div className="overflow-hidden">
                    <div className="p-4 pt-0 text-muted-foreground prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-foreground prose-strong:text-foreground prose-li:marker:text-primary leading-relaxed">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
