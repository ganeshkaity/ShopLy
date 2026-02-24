"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getOrderById } from "@/services/order.service";
import { Order } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ORDER_STATUS_COLORS, ORDER_STATUS_FLOW } from "@/constants";
import { Package, MapPin, CreditCard, CheckCircle } from "lucide-react";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            const { id } = await params;
            try {
                const data = await getOrderById(id);
                if (!data) return notFound();
                setOrder(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [params]);

    if (loading) return <div className="flex h-[70vh] items-center justify-center"><Spinner size="lg" /></div>;
    if (!order) return notFound();

    const statusColor = ORDER_STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800";
    const currentStatusIndex = ORDER_STATUS_FLOW.indexOf(order.status);

    return (
        <div className="container-custom py-8 md:py-16">
            <div className="mb-8">
                <h1 className="font-serif text-3xl font-bold">Order Details</h1>
                <p className="text-muted-foreground mt-1">Order #{order.id?.slice(-8).toUpperCase()} &bull; {formatDate(order.createdAt)}</p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Tracker */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Order Status</h3>
                            <div className="flex items-center justify-between relative">
                                <div className="absolute top-4 left-0 right-0 h-0.5 bg-border z-0" />
                                {ORDER_STATUS_FLOW.map((status, index) => (
                                    <div key={status} className="relative z-10 flex flex-col items-center gap-2">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${index <= currentStatusIndex ? "bg-primary text-white" : "bg-gray-200 text-muted-foreground"
                                            }`}>
                                            {index <= currentStatusIndex ? <CheckCircle className="h-4 w-4" /> : index + 1}
                                        </div>
                                        <span className={`text-[10px] font-medium ${index <= currentStatusIndex ? "text-primary" : "text-muted-foreground"}`}>
                                            {status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-lg mb-4">Items Ordered</h3>
                            <div className="divide-y divide-border">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 py-4">
                                        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    {/* Payment Summary */}
                    <Card className="bg-gray-50/50 border-none shadow-lg">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-serif text-lg font-bold flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Payment</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(order.totalAmount - (order.shippingCharge || 0))}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{order.shippingCharge === 0 ? "Free" : formatCurrency(order.shippingCharge || 0)}</span></div>
                                <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">{formatCurrency(order.totalAmount)}</span></div>
                            </div>
                            <Badge className={statusColor}>{order.status}</Badge>
                            {order.paymentId && <p className="text-xs text-muted-foreground">Payment ID: {order.paymentId}</p>}
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card>
                        <CardContent className="p-6 space-y-3">
                            <h3 className="font-semibold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Shipping Address</h3>
                            {order.shippingAddress && (
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
                                    <p>{order.shippingAddress.addressLine1}</p>
                                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                    <p>Phone: {order.shippingAddress.phone}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
