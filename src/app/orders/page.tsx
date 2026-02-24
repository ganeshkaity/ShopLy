"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getOrdersByUser } from "@/services/order.service";
import { Order } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Package, ArrowRight } from "lucide-react";
import { ORDER_STATUS_COLORS } from "@/constants";

export default function OrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const data = await getOrdersByUser(user.uid);
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    if (!user) {
        return (
            <div className="container-custom flex h-[70vh] flex-col items-center justify-center text-center gap-6">
                <Package className="h-20 w-20 text-muted-foreground/30" />
                <h2 className="font-serif text-3xl font-bold">Login to view orders</h2>
                <Link href="/login"><Button size="lg" className="rounded-full px-8">Login</Button></Link>
            </div>
        );
    }

    if (loading) {
        return <div className="flex h-[70vh] items-center justify-center"><Spinner size="lg" /></div>;
    }

    if (orders.length === 0) {
        return (
            <div className="container-custom flex h-[70vh] flex-col items-center justify-center text-center gap-6">
                <Package className="h-20 w-20 text-muted-foreground/30" />
                <h2 className="font-serif text-3xl font-bold">No orders yet</h2>
                <p className="text-muted-foreground max-w-md">Start shopping to see your orders here.</p>
                <Link href="/products"><Button size="lg" className="rounded-full px-8">Shop Now</Button></Link>
            </div>
        );
    }

    return (
        <div className="container-custom py-8 md:py-16">
            <h1 className="font-serif text-3xl font-bold mb-8">My Orders</h1>
            <div className="flex flex-col gap-4">
                {orders.map((order) => {
                    const statusColor = ORDER_STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800";
                    return (
                        <Card key={order.id} hover>
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className="text-sm font-medium text-muted-foreground">Order #{order.id?.slice(-8).toUpperCase()}</p>
                                            <Badge className={statusColor}>{order.status}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{order.items?.length || 0} item(s)</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-xl font-bold">{formatCurrency(order.totalAmount)}</p>
                                        <Link href={`/orders/${order.id}`}>
                                            <Button variant="outline" size="sm" className="rounded-full">
                                                View <ArrowRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
