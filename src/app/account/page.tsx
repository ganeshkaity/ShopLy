"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import {
    User,
    History,
    Heart,
    LayoutDashboard,
    LogOut,
    ChevronRight,
    ArrowLeft,
    Camera,
    Shield,
    Bell,
    MapPin,
    Smartphone,
    Mail,
    UserCircle,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

type ViewState = "overview" | "edit";

export default function AccountPage() {
    const { user, isAdmin, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [view, setView] = useState<ViewState>("overview");
    const [displayName, setDisplayName] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login?redirect=/account");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || "");
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsUpdating(true);
        try {
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName });
                toast("Profile updated successfully", "success");
                setView("overview");
                // Allow a small delay for Firebase state to catch up, though window.location.reload is surest for header
                setTimeout(() => window.location.reload(), 500);
            } else {
                throw new Error("No authenticated user found.");
            }
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast(error.message || "Failed to update profile", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast("Logged out successfully", "success");
            router.push("/");
        } catch (error) {
            toast("Failed to logout", "error");
        }
    };

    if (authLoading || !user) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            <div className="container-custom py-6 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mx-auto max-w-md w-full">
                    {view === "overview" ? (
                        <div className="space-y-8">
                            {/* Profile Header */}
                            <div className="flex flex-col items-center text-center space-y-4 pt-4">
                                <h1 className="text-xl font-bold text-gray-900 w-full text-center">Profile</h1>

                                <div className="relative group">
                                    <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden flex items-center justify-center relative">
                                        {user.photoURL ? (
                                            <img
                                                src={user.photoURL}
                                                alt={user.displayName || "User"}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <UserCircle className="h-full w-full text-primary/10" />
                                        )}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <Camera className="text-white h-8 w-8" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-primary border-4 border-white flex items-center justify-center text-white shadow-sm">
                                        <div className="h-3 w-3 bg-white rounded-full transform scale-75" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold text-gray-900">{user.displayName || "User"}</h2>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                        {isAdmin ? "Administrator" : "Valued Customer"}
                                    </p>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                                <MenuButton
                                    icon={<User className="h-5 w-5" />}
                                    label="Edit Profile"
                                    onClick={() => setView("edit")}
                                />
                                <MenuLink
                                    icon={<History className="h-5 w-5" />}
                                    label="Order History"
                                    href="/orders"
                                />
                                <MenuLink
                                    icon={<Heart className="h-5 w-5" />}
                                    label="My Wishlist"
                                    href="/wishlist"
                                />
                                {isAdmin && (
                                    <MenuLink
                                        icon={<LayoutDashboard className="h-5 w-5" />}
                                        label="Admin Dashboard"
                                        href="/admin"
                                        isAccent
                                    />
                                )}
                                <MenuButton
                                    icon={<Bell className="h-5 w-5" />}
                                    label="Notifications"
                                    onClick={() => toast("Notifications coming soon!", "info")}
                                />
                                <MenuButton
                                    icon={<MapPin className="h-5 w-5" />}
                                    label="Shipping Address"
                                    onClick={() => toast("Address management coming soon!", "info")}
                                />
                                <MenuButton
                                    icon={<Shield className="h-5 w-5" />}
                                    label="Security"
                                    onClick={() => toast("Security settings coming soon!", "info")}
                                />
                            </div>

                            {/* Sign Out */}
                            <Button
                                variant="ghost"
                                className="w-full h-14 rounded-2xl bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all font-bold flex items-center justify-center gap-2"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-5 w-5" />
                                Sign Out
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Edit Profile Header */}
                            <div className="flex items-center justify-between pb-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="bg-white shadow-sm border border-gray-100 rounded-xl"
                                    onClick={() => setView("overview")}
                                >
                                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                                </Button>
                                <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
                                <div className="w-10" /> {/* Spacer */}
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-6 pt-4">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <Input
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="h-14 pl-12 rounded-2xl border-none bg-white shadow-sm focus-visible:ring-primary/20 text-gray-900 font-medium"
                                                placeholder="Enter your name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <Input
                                                type="email"
                                                value={user.email || ""}
                                                disabled
                                                className="h-14 pl-12 rounded-2xl border-none bg-gray-50 shadow-inner text-gray-400 font-medium cursor-not-allowed"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 px-2 uppercase tracking-wider font-bold">Email cannot be changed</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Phone (Optional)</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <Input
                                                className="h-14 pl-12 rounded-2xl border-none bg-white shadow-sm focus-visible:ring-primary/20 text-gray-900 font-medium"
                                                placeholder="+91 00000 00000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-14 rounded-2xl bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all font-bold text-lg"
                                    disabled={isUpdating || displayName === user.displayName}
                                >
                                    {isUpdating ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : null}
                                    Save Changes
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MenuButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-between w-full px-5 py-5 hover:bg-gray-50 transition-colors group"
        >
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    {icon}
                </div>
                <span className="font-bold text-gray-700 text-[15px]">{label}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
        </button>
    );
}

function MenuLink({ icon, label, href, isAccent }: { icon: React.ReactNode, label: string, href: string, isAccent?: boolean }) {
    return (
        <Link
            href={href}
            className="flex items-center justify-between w-full px-5 py-5 hover:bg-gray-50 transition-colors group"
        >
            <div className="flex items-center gap-4">
                <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                    isAccent ? "bg-primary text-white" : "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white"
                )}>
                    {icon}
                </div>
                <span className={cn(
                    "font-bold text-[15px]",
                    isAccent ? "text-primary" : "text-gray-700"
                )}>{label}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
        </Link>
    );
}
