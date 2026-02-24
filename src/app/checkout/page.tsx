"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { createOrder } from "@/services/order.service";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { INDIAN_STATES } from "@/constants";
import { ShieldCheck, Truck, CreditCard } from "lucide-react";
import { getSettings } from "@/services/settings.service";
import { AppSettings } from "@/types";
import Link from "next/link";

declare global {
    interface Window { Razorpay: any; }
}

export default function CheckoutPage() {
    const { items: cartItems, subtotal, shippingCharge, grandTotal, clearCart, buyNowItem, setBuyNowItem } = useCart();
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [settings, setSettings] = useState<AppSettings | null>(null);
    const items = buyNowItem ? [buyNowItem] : cartItems;

    const [isProcessing, setIsProcessing] = useState(false);
    const [address, setAddress] = useState({
        fullName: user?.displayName || "",
        phone: user?.phone || "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
    });

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error);
    }, []);

    if (!user) {
        return (
            <div className="container-custom flex h-[70vh] flex-col items-center justify-center text-center gap-6">
                <CreditCard className="h-20 w-20 text-muted-foreground/30" />
                <h2 className="font-serif text-3xl font-bold">Please login to checkout</h2>
                <Link href="/login"><Button size="lg" className="rounded-full px-8">Login</Button></Link>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container-custom flex h-[70vh] flex-col items-center justify-center text-center gap-6">
                <CreditCard className="h-20 w-20 text-muted-foreground/30" />
                <h2 className="font-serif text-3xl font-bold">Nothing to checkout</h2>
                <Link href="/products"><Button size="lg" className="rounded-full px-8">Shop Now</Button></Link>
            </div>
        );
    }

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (window.Razorpay) { resolve(true); return; }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCheckout = async () => {
        if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.pincode) {
            toast("Please fill in all required address fields.", "error");
            return;
        }

        setIsProcessing(true);
        try {
            const loaded = await loadRazorpayScript();
            if (!loaded) { toast("Payment gateway failed to load.", "error"); setIsProcessing(false); return; }

            const res = await fetch("/api/payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: grandTotal, receipt: `order_${Date.now()}` }),
            });
            const razorpayOrder = await res.json();
            if (!razorpayOrder.id) { toast("Failed to create payment order.", "error"); setIsProcessing(false); return; }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: settings?.appName || "ShopLy",
                description: "Order Payment",
                order_id: razorpayOrder.id,
                prefill: { name: address.fullName, email: user.email, contact: address.phone },
                theme: { color: "#f472b6" },
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch("/api/payment/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(response),
                        });
                        const verifyData = await verifyRes.json();

                        if (verifyData.verified) {
                            const orderId = await createOrder({
                                userId: user.uid,
                                items: items.map((item) => ({
                                    productId: item.productId,
                                    name: item.name,
                                    price: item.price,
                                    quantity: item.quantity,
                                    image: item.image,
                                })),
                                shippingAddress: address,
                                totalAmount: grandTotal,
                                shippingCharge,
                                status: "CONFIRMED",
                                paymentId: response.razorpay_payment_id,
                                razorpayOrderId: response.razorpay_order_id,
                            });
                            if (buyNowItem) {
                                setBuyNowItem(null);
                            } else {
                                await clearCart();
                            }
                            toast("Order placed successfully!", "success");
                            router.push(`/orders/${orderId}`);
                        } else {
                            toast("Payment verification failed. Please contact support.", "error");
                        }
                    } catch (err) {
                        console.error(err);
                        toast("Something went wrong after payment. Contact support.", "error");
                    }
                },
                modal: { ondismiss: () => { setIsProcessing(false); } },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", (resp: any) => {
                toast(`Payment failed: ${resp.error.description}`, "error");
                setIsProcessing(false);
            });
            rzp.open();
        } catch (error: any) {
            console.error(error);
            toast(error.message || "Checkout failed.", "error");
            setIsProcessing(false);
        }
    };

    return (
        <div className="container-custom py-8 md:py-16">
            <h1 className="font-serif text-3xl font-bold mb-8">Checkout</h1>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Shipping Address</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="Full Name *" name="fullName" value={address.fullName} onChange={handleAddressChange} required />
                                <Input label="Phone Number *" name="phone" value={address.phone} onChange={handleAddressChange} required />
                                <div className="sm:col-span-2">
                                    <Input label="Address Line 1 *" name="addressLine1" value={address.addressLine1} onChange={handleAddressChange} required />
                                </div>
                                <div className="sm:col-span-2">
                                    <Input label="Address Line 2" name="addressLine2" value={address.addressLine2} onChange={handleAddressChange} />
                                </div>
                                <Input label="City *" name="city" value={address.city} onChange={handleAddressChange} required />
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">State *</label>
                                    <select name="state" value={address.state} onChange={handleAddressChange} className="w-full rounded-lg border border-border bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20" required>
                                        <option value="">Select State</option>
                                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <Input label="Pincode *" name="pincode" value={address.pincode} onChange={handleAddressChange} required />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-lg mb-4">Order Items</h3>
                            <div className="divide-y divide-border">
                                {items.map((item) => (
                                    <div key={item.productId} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-24 border-none shadow-lg bg-gray-50/50">
                        <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
                            <h3 className="font-serif text-xl font-bold">Payment Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shippingCharge === 0 ? "Free" : formatCurrency(shippingCharge)}</span></div>
                                <div className="border-t pt-3 flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">{formatCurrency(grandTotal)}</span></div>
                            </div>
                            <Button size="lg" className="w-full rounded-full h-14 text-base shadow-md" onClick={handleCheckout} isLoading={isProcessing} disabled={isProcessing}>
                                <ShieldCheck className="mr-2 h-5 w-5" /> Pay {formatCurrency(grandTotal)}
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">Powered by Razorpay. 100% secure checkout.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
