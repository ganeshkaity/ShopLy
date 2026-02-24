"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getAllOrders, updateOrderStatus } from "@/services/order.service";
import { Order, OrderStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { ORDER_STATUS_FLOW, ORDER_STATUS_COLORS } from "@/constants";
import { ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getAllOrders();
                setOrders(data);
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
            toast(`Order updated to ${newStatus}`, "success");
        } catch (error) {
            toast("Failed to update status", "error");
        }
    };

    if (loading) return <div className="flex h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-serif text-3xl font-bold">Orders ({orders.length})</h1>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>No orders yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => {
                        const statusColor = ORDER_STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800";
                        const isExpanded = expandedOrder === order.id;
                        return (
                            <Card key={order.id}>
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : (order.id || null))}>
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="font-medium">#{order.id?.slice(-8).toUpperCase()}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge className={statusColor}>{order.status}</Badge>
                                            <p className="font-bold">{formatCurrency(order.totalAmount)}</p>
                                            <p className="text-sm text-muted-foreground">{order.items?.length || 0} items</p>
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="mt-6 space-y-4 border-t pt-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="font-semibold mb-1">Customer</p>
                                                    <p>{order.shippingAddress?.fullName}</p>
                                                    <p className="text-muted-foreground">{order.shippingAddress?.phone}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold mb-1">Shipping To</p>
                                                    <p className="text-muted-foreground">{order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="font-semibold mb-2">Items</p>
                                                <div className="divide-y">
                                                    {order.items?.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between py-2 text-sm">
                                                            <span>{item.name} x{item.quantity}</span>
                                                            <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <p className="font-semibold mb-2">Update Status</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {ORDER_STATUS_FLOW.map((status) => (
                                                        <Button
                                                            key={status}
                                                            variant={order.status === status ? "primary" : "outline"}
                                                            size="sm"
                                                            onClick={() => handleStatusUpdate(order.id!, status as OrderStatus)}
                                                            disabled={order.status === status}
                                                            className="text-xs"
                                                        >
                                                            {status}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            {order.paymentId && <p className="text-xs text-muted-foreground">Payment ID: {order.paymentId}</p>}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
