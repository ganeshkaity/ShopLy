"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getOrderById } from "@/services/order.service";
import { Order } from "@/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ORDER_STATUS_COLORS, ORDER_STATUS_FLOW } from "@/constants";
import { Package, MapPin, CreditCard, CheckCircle, Truck, ChevronDown, ChevronUp, Download } from "lucide-react";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [isStatusExpanded, setIsStatusExpanded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadInvoice = async () => {
        if (!order) return;
        setIsDownloading(true);
        try {
            const { getSettings } = await import("@/services/settings.service");
            const { generateInvoice } = await import("@/lib/invoice");
            const settings = await getSettings();
            await generateInvoice(order, settings);
        } catch (error) {
            console.error("Failed to download invoice:", error);
        } finally {
            setIsDownloading(false);
        }
    };

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
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Package className="h-5 w-5 text-primary" /> Order Status
                                </h3>
                                <button
                                    onClick={() => setIsStatusExpanded(!isStatusExpanded)}
                                    className="md:hidden flex items-center gap-1 text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20 transition-all hover:bg-primary/10"
                                >
                                    {isStatusExpanded ? "Hide History" : "View History"}
                                    {isStatusExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </button>
                            </div>

                            {/* Desktop Horizontal Tracker */}
                            <div className="hidden md:flex items-center justify-between relative mt-8 mb-4">
                                <div className="absolute top-4 left-0 right-0 h-0.5 bg-border z-0" />
                                {/* Progress Line */}
                                {currentStatusIndex >= 0 && (
                                    <div
                                        className="absolute top-4 left-4 h-0.5 bg-primary z-0 transition-all duration-1000"
                                        style={{
                                            width: currentStatusIndex === ORDER_STATUS_FLOW.length - 1
                                                ? `calc(100% - 2rem)`
                                                : `calc(${((currentStatusIndex + 0.5) / (ORDER_STATUS_FLOW.length - 1)) * 100}% - ${((currentStatusIndex + 0.5) / (ORDER_STATUS_FLOW.length - 1)) * 2}rem)`
                                        }}
                                    />
                                )}
                                {/* Moving Truck */}
                                {currentStatusIndex < ORDER_STATUS_FLOW.length - 1 && (
                                    <div
                                        className="absolute top-[-4px] z-20 transition-all duration-1000 h-9 w-9 flex items-center justify-center"
                                        style={{
                                            left: `calc(${((currentStatusIndex + 0.5) / (ORDER_STATUS_FLOW.length - 1)) * 100}% - ${((currentStatusIndex + 0.5) / (ORDER_STATUS_FLOW.length - 1)) * 2}rem + 1rem)`,
                                            transform: 'translateX(-50%)'
                                        }}
                                    >
                                        <div className="bg-white p-1 rounded-full shadow-sm border border-primary/20">
                                            <Truck className="h-4 w-4 text-primary animate-truck-move" />
                                        </div>
                                    </div>
                                )}
                                {ORDER_STATUS_FLOW.map((status, index) => {
                                    const statusHistoryItem = order.statusHistory?.find(h => h.status === status);
                                    return (
                                        <div key={status} className="relative z-10 flex flex-col items-center gap-2">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${index <= currentStatusIndex ? "bg-primary text-white" : "bg-gray-200 text-muted-foreground"
                                                }`}>
                                                {index <= currentStatusIndex ? <CheckCircle className="h-4 w-4" /> : index + 1}
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className={`text-[10px] font-bold uppercase tracking-tight ${index <= currentStatusIndex ? "text-primary" : "text-muted-foreground"}`}>
                                                    {status}
                                                </span>
                                                {statusHistoryItem && (
                                                    <span className="text-[8px] text-muted-foreground whitespace-nowrap">
                                                        {formatDateTime(statusHistoryItem.timestamp)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Mobile Vertical Tracker */}
                            <div className="md:hidden space-y-2">
                                {!isStatusExpanded ? (
                                    /* Compact View */
                                    <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                                            <Truck className="h-5 w-5 animate-bounce-subtle" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-primary/60 tracking-wider">Current Status</span>
                                            <span className="text-sm font-bold text-foreground">{order.status}</span>
                                        </div>
                                    </div>
                                ) : (
                                    /* Expanded History View */
                                    <div className="relative pl-3 pt-2 pb-2 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                        {/* Vertical Linear Track */}
                                        <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-border z-0" />

                                        {/* Vertical Progress Line */}
                                        {currentStatusIndex >= 0 && (
                                            <div
                                                className="absolute left-[27px] top-6 bg-primary z-0 transition-all duration-1000"
                                                style={{
                                                    height: currentStatusIndex === ORDER_STATUS_FLOW.length - 1
                                                        ? 'calc(100% - 3rem)'
                                                        : `calc(${(currentStatusIndex + 0.5) / (ORDER_STATUS_FLOW.length - 1) * 100}% - 1.5rem)`
                                                }}
                                            />
                                        )}

                                        {/* Moving Truck Vertical */}
                                        {currentStatusIndex < ORDER_STATUS_FLOW.length - 1 && (
                                            <div
                                                className="absolute left-[11px] z-20 transition-all duration-1000"
                                                style={{
                                                    top: `calc(${((currentStatusIndex + 0.5) / (ORDER_STATUS_FLOW.length - 1)) * 100}% + 0.5rem)`,
                                                    transform: 'translateY(-50%)'
                                                }}
                                            >
                                                <div className="bg-white p-1 rounded-full shadow-md border border-primary/20">
                                                    <Truck className="h-4 w-4 text-primary animate-truck-move-vertical" />
                                                </div>
                                            </div>
                                        )}

                                        {ORDER_STATUS_FLOW.map((status, index) => {
                                            const statusHistoryItem = order.statusHistory?.find(h => h.status === status);
                                            return (
                                                <div key={status} className="relative z-10 flex items-center gap-5">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-500 ${index <= currentStatusIndex ? "bg-primary text-white shadow-md shadow-primary/20 scale-110" : "bg-gray-200 text-muted-foreground"
                                                        }`}>
                                                        {index <= currentStatusIndex ? <CheckCircle className="h-4 w-4" /> : index + 1}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-[10px] uppercase font-bold tracking-widest ${index <= currentStatusIndex ? "text-primary/60" : "text-muted-foreground/60"}`}>Step {index + 1}</span>
                                                        <span className={`text-sm font-bold ${index <= currentStatusIndex ? "text-foreground" : "text-muted-foreground"}`}>
                                                            {status}
                                                        </span>
                                                        {statusHistoryItem && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDateTime(statusHistoryItem.timestamp)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
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
                                                <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
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

                    {/* Download Invoice Button */}
                    <button
                        onClick={handleDownloadInvoice}
                        disabled={isDownloading}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-border text-foreground hover:bg-gray-50 py-3 px-4 rounded-xl font-medium transition-all shadow-sm disabled:opacity-70"
                    >
                        {isDownloading ? <Spinner size="sm" className="border-t-primary" /> : <Download className="h-4 w-4" />}
                        {isDownloading ? "Generating..." : "Download Invoice"}
                    </button>

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
