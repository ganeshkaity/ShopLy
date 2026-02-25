"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import React, { useEffect } from "react";
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, BarChart3, ChevronLeft, Menu, X, Settings, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { APP_NAME } from "@/constants";

const ADMIN_LINKS = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Coupons", href: "/admin/coupons", icon: Tag },
    { name: "Popups", href: "/admin/popups", icon: MessageSquare },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push("/");
        }
    }, [user, isAdmin, loading, router]);

    if (loading) {
        return <div className="flex h-[80vh] items-center justify-center"><Spinner size="lg" /></div>;
    }

    if (!user || !isAdmin) return null;

    return (
        <div className="flex min-h-[calc(100vh-64px)]">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-white p-6 gap-6">
                <Link href="/admin" className="font-serif text-xl font-bold text-primary">{APP_NAME} Admin</Link>
                <nav className="flex flex-col gap-1">
                    {ADMIN_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                pathname === link.href ? "bg-primary text-white" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            <link.icon className="h-4 w-4" />
                            {link.name}
                        </Link>
                    ))}
                </nav>
                <div className="mt-auto">
                    <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ChevronLeft className="h-4 w-4" /> Back to Store
                    </Link>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-16 left-0 right-0 z-30 flex items-center gap-4 bg-white border-b border-border px-4 py-3">
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                    <Menu className="h-5 w-5" />
                </Button>
                <span className="font-semibold text-sm">Admin Panel</span>
            </div>

            {/* Mobile Sidebar */}
            {isSidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-white">
                    <div className="flex items-center justify-between p-4 border-b">
                        <span className="font-serif text-lg font-bold text-primary">{APP_NAME} Admin</span>
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}><X className="h-5 w-5" /></Button>
                    </div>
                    <nav className="flex flex-col gap-1 p-4">
                        {ADMIN_LINKS.map((link) => (
                            <Link key={link.href} href={link.href} onClick={() => setIsSidebarOpen(false)}
                                className={cn("flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium",
                                    pathname === link.href ? "bg-primary text-white" : "text-foreground hover:bg-accent"
                                )}
                            >
                                <link.icon className="h-4 w-4" /> {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-grow p-6 lg:p-8 bg-gray-50/30 lg:mt-0 mt-14">
                {children}
            </main>
        </div>
    );
}
