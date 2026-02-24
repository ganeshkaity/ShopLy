"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    lowStockProducts: any[];
    recentOrders: any[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [ordersSnap, productsSnap, usersSnap] = await Promise.all([
                    getDocs(collection(db, "orders")),
                    getDocs(collection(db, "products")),
                    getDocs(collection(db, "users")),
                ]);

                const totalRevenue = ordersSnap.docs.reduce((sum, d) => sum + (d.data().totalAmount || 0), 0);

                const lowStockProducts = productsSnap.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter((p: any) => p.stock <= 5 && p.isActive)
                    .slice(0, 5);

                const recentOrders = ordersSnap.docs
                    .map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt }))
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5);

                setStats({
                    totalRevenue,
                    totalOrders: ordersSnap.size,
                    totalProducts: productsSnap.size,
                    totalUsers: usersSnap.size,
                    lowStockProducts,
                    recentOrders,
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="flex h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div className="space-y-8">
            <h1 className="font-serif text-3xl font-bold">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { title: "Total Revenue", value: formatCurrency(stats?.totalRevenue || 0), icon: DollarSign, color: "text-green-600 bg-green-50" },
                    { title: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingCart, color: "text-blue-600 bg-blue-50" },
                    { title: "Products", value: stats?.totalProducts || 0, icon: Package, color: "text-purple-600 bg-purple-50" },
                    { title: "Customers", value: stats?.totalUsers || 0, icon: Users, color: "text-orange-600 bg-orange-50" },
                ].map(({ title, value, icon: Icon, color }) => (
                    <Card key={title}>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{title}</p>
                                <p className="text-2xl font-bold">{value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        {stats?.recentOrders?.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No orders yet.</p>
                        ) : (
                            <div className="divide-y divide-border">
                                {stats?.recentOrders?.map((order: any) => (
                                    <Link key={order.id} href={`/admin/orders`} className="flex items-center justify-between py-3 hover:bg-accent/50 -mx-2 px-2 rounded-lg transition-colors">
                                        <div>
                                            <p className="text-sm font-medium">#{order.id?.slice(-6).toUpperCase()}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">{formatCurrency(order.totalAmount)}</p>
                                            <Badge variant="secondary" className="text-[10px]">{order.status}</Badge>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Low Stock Alert */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-500" /> Low Stock Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        {stats?.lowStockProducts?.length === 0 ? (
                            <p className="text-muted-foreground text-sm">All products are well stocked.</p>
                        ) : (
                            <div className="divide-y divide-border">
                                {stats?.lowStockProducts?.map((product: any) => (
                                    <div key={product.id} className="flex items-center justify-between py-3">
                                        <p className="text-sm font-medium">{product.name}</p>
                                        <Badge variant={product.stock === 0 ? "destructive" : "warning"}>{product.stock} left</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
