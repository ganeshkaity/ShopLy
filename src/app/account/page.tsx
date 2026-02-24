"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import { User, History, Heart, LayoutDashboard, Save, Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";

export default function AccountPage() {
    const { user, isAdmin, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

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
                // Force reload to reflect changes in Header
                window.location.reload();
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
        <div className="container-custom py-12 animate-in fade-in duration-500">
            <h1 className="text-3xl font-serif font-bold text-primary mb-8">My Account</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Settings */}
                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" /> Profile Settings
                            </CardTitle>
                            <CardDescription>
                                Update your personal information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={user.email || ""}
                                        disabled
                                        className="bg-gray-50 text-muted-foreground"
                                    />
                                    <p className="text-xs text-muted-foreground">Your email address cannot be changed here.</p>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="displayName" className="text-sm font-medium">Display Name</label>
                                    <Input
                                        id="displayName"
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={isUpdating || displayName === user.displayName}>
                                    {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Links & Actions */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/orders">
                                <Button variant="outline" className="w-full justify-start h-12">
                                    <History className="mr-3 h-5 w-5 text-muted-foreground" /> Order History
                                </Button>
                            </Link>
                            <Link href="/wishlist">
                                <Button variant="outline" className="w-full justify-start h-12">
                                    <Heart className="mr-3 h-5 w-5 text-pink-500" /> My Wishlist
                                </Button>
                            </Link>
                            {isAdmin && (
                                <Link href="/admin">
                                    <Button variant="outline" className="w-full justify-start h-12 border-primary/50 text-primary hover:bg-primary/5">
                                        <LayoutDashboard className="mr-3 h-5 w-5" /> Admin Dashboard
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-red-100 bg-red-50/50">
                        <CardContent className="pt-6">
                            <Button
                                variant="danger"
                                className="w-full bg-red-500 hover:bg-red-600"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-5 w-5" /> Sign Out
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
