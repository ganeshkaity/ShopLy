"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function CartPage() {
    const { items, itemCount, subtotal, shippingCharge, grandTotal, loading, updateQuantity, removeItem } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    if (loading && items.length === 0) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container-custom flex h-[70vh] flex-col items-center justify-center text-center gap-6">
                <ShoppingBag className="h-20 w-20 text-muted-foreground/30" />
                <h2 className="font-serif text-3xl font-bold">Sign in to view cart</h2>
                <p className="max-w-md text-muted-foreground">
                    Please login or create an account to start adding items to your cart.
                </p>
                <Link href="/login">
                    <Button size="lg" className="rounded-full px-8">Login to Continue</Button>
                </Link>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container-custom flex h-[70vh] flex-col items-center justify-center text-center gap-6">
                <ShoppingBag className="h-20 w-20 text-muted-foreground/30" />
                <h2 className="font-serif text-3xl font-bold">Your cart is empty</h2>
                <p className="max-w-md text-muted-foreground">
                    Discover our curated collection and find something you love.
                </p>
                <Link href="/products">
                    <Button size="lg" className="rounded-full px-8">Start Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container-custom py-8 md:py-16">
            <h1 className="font-serif text-3xl font-bold mb-8">Shopping Cart ({itemCount} items)</h1>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {items.map((item) => (
                        <Card key={item.productId} className="overflow-hidden">
                            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
                                <div className="shrink-0 relative h-24 w-24 sm:h-32 sm:w-32 rounded-xl overflow-hidden bg-gray-50 border border-border">
                                    {item.image ? (
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">No img</div>
                                    )}
                                </div>
                                <div className="flex flex-col flex-grow gap-2 w-full text-center sm:text-left">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                        <div>
                                            <p className="font-medium text-lg">{item.name}</p>
                                            <p className="text-sm text-muted-foreground mt-1 capitalize">{item.category}</p>
                                        </div>
                                        <p className="font-bold text-lg">{formatCurrency(item.price)}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto pt-4">
                                        <div className="flex items-center rounded-full border border-border px-2 bg-gray-50/50">
                                            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2 hover:text-primary transition-colors">-</button>
                                            <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-2 hover:text-primary transition-colors">+</button>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => removeItem(item.productId)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4 mr-2" /> Remove
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-24 border-none shadow-lg bg-gray-50/50">
                        <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
                            <h3 className="font-serif text-xl font-bold">Order Summary</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="font-medium">{shippingCharge === 0 ? "Free" : formatCurrency(shippingCharge)}</span>
                                </div>
                                <div className="border-t border-border pt-4 flex items-center justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">{formatCurrency(grandTotal)}</span>
                                </div>
                            </div>
                            <Button size="lg" className="w-full rounded-full text-base h-14 shadow-md" onClick={() => router.push("/checkout")}>
                                Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">Taxes calculated at checkout.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
