"use client";

import React, { useState, useEffect, useRef } from "react";
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
    Loader2,
    Ticket,
    Trash2,
    Lock,
    Link as LinkIcon,
    PlusCircle,
    Home,
    Briefcase
} from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import { 
    getUserData, 
    updateUserData, 
    compressImageToBase64,
    createSupportTicket,
    createDeletionRequest,
    UserData,
    Address,
    AddressLabel,
    saveUserAddresses
} from "@/services/user.service";

type ViewState = "overview" | "edit" | "security" | "addresses";

export default function AccountPage() {
    const { user, isAdmin, loading: authLoading, logout, linkGoogleAccount, addPasswordToUser, resetPassword } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [view, setView] = useState<ViewState>("overview");
    const [displayName, setDisplayName] = useState("");
    const [phone, setPhone] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Custom user data for Base64 avatar
    const [userData, setUserData] = useState<UserData | null>(null);
    const [avatarLoading, setAvatarLoading] = useState(false);
    
    // Security tab states
    const [ticketSubject, setTicketSubject] = useState("");
    const [ticketMessage, setTicketMessage] = useState("");
    const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

    const [deletionReason, setDeletionReason] = useState("");
    const [isSubmittingDeletion, setIsSubmittingDeletion] = useState(false);

    const [newPassword, setNewPassword] = useState("");
    const [isAddingPassword, setIsAddingPassword] = useState(false);
    const [isSendingReset, setIsSendingReset] = useState(false);

    // Addresses states
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [addrLabel, setAddrLabel] = useState<AddressLabel>("Home");
    const [addrFullName, setAddrFullName] = useState("");
    const [addrPhone, setAddrPhone] = useState("");
    const [addrLine1, setAddrLine1] = useState("");
    const [addrLine2, setAddrLine2] = useState("");
    const [addrCity, setAddrCity] = useState("");
    const [addrState, setAddrState] = useState("");
    const [addrPincode, setAddrPincode] = useState("");
    const [addrIsDefault, setAddrIsDefault] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/login?redirect=/account");
            } else if (auth.currentUser && !auth.currentUser.emailVerified && auth.currentUser.providerData?.some(p => p.providerId === 'password')) {
                router.push("/verification");
            }
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || "");
            getUserData(user.uid).then(data => {
                setUserData(data);
                if (data?.phone) setPhone(data.phone);
            });
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsUpdating(true);
        try {
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName });
                await updateUserData(user.uid, { displayName, phone });
                toast("Profile updated successfully", "success");
                setView("overview");
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

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setAvatarLoading(true);
        try {
            const base64 = await compressImageToBase64(file, 200, 0.7);
            await updateUserData(user.uid, { avatarBase64: base64 });
            setUserData(prev => prev ? { ...prev, avatarBase64: base64 } : { uid: user.uid, email: user.email, displayName, avatarBase64: base64 });
            toast("Avatar updated successfully", "success");
        } catch (error: any) {
            console.error("Error uploading avatar:", error);
            toast(error.message || "Failed to upload avatar", "error");
        } finally {
            setAvatarLoading(false);
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

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmittingTicket(true);
        try {
            await createSupportTicket({
                uid: user.uid,
                email: user.email,
                subject: ticketSubject,
                message: ticketMessage
            });
            toast("Support ticket submitted successfully", "success");
            setTicketSubject("");
            setTicketMessage("");
        } catch (error: any) {
            toast(error.message || "Failed to submit ticket", "error");
        } finally {
            setIsSubmittingTicket(false);
        }
    };

    const handleRequestDeletion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmittingDeletion(true);
        try {
            await createDeletionRequest({
                uid: user.uid,
                email: user.email,
                reason: deletionReason
            });
            toast("Account deletion request submitted", "success");
            setDeletionReason("");
        } catch (error: any) {
            toast(error.message || "Failed to request deletion", "error");
        } finally {
            setIsSubmittingDeletion(false);
        }
    };

    const handleLinkGoogle = async () => {
        try {
            await linkGoogleAccount();
            toast("Google account linked successfully", "success");
        } catch (error: any) {
            toast(error.message || "Failed to link Google account", "error");
        }
    };

    const handleAddPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddingPassword(true);
        try {
            await addPasswordToUser(newPassword);
            toast("Password added/updated successfully", "success");
            setNewPassword("");
        } catch (error: any) {
            console.error("Error adding password:", error);
            toast(error.message || "Failed to set password", "error");
        } finally {
            setIsAddingPassword(false);
        }
    };

    const handleSendResetEmail = async () => {
        if (!user?.email) {
            toast("No email address found to send the reset link to.", "error");
            return;
        }
        setIsSendingReset(true);
        try {
            await resetPassword(user.email);
            toast("Password reset email sent! Check your inbox.", "success");
        } catch (error: any) {
            console.error("Error sending reset email:", error);
            toast(error.message || "Failed to send reset email.", "error");
        } finally {
            setIsSendingReset(false);
        }
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !userData) return;

        const currentAddresses = userData.addresses || [];
        const newAddress: Address = {
            id: editingAddress?.id || Date.now().toString(),
            label: addrLabel,
            fullName: addrFullName,
            phone: addrPhone,
            addressLine1: addrLine1,
            addressLine2: addrLine2,
            city: addrCity,
            state: addrState,
            pincode: addrPincode,
            isDefault: addrIsDefault
        };

        let updatedAddresses = [...currentAddresses];
        if (editingAddress) {
            updatedAddresses = updatedAddresses.map(a => a.id === editingAddress.id ? newAddress : a);
        } else {
            updatedAddresses.push(newAddress);
        }

        try {
            await saveUserAddresses(user.uid, updatedAddresses);
            setUserData({ ...userData, addresses: updatedAddresses });
            toast(`Address ${editingAddress ? 'updated' : 'added'} successfully`, "success");
            setIsAddressModalOpen(false);
            setEditingAddress(null);
        } catch (error) {
            toast("Failed to save address", "error");
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!user || !userData) return;
        const updated = (userData.addresses || []).filter(a => a.id !== id);
        try {
            await saveUserAddresses(user.uid, updated);
            setUserData({ ...userData, addresses: updated });
            toast("Address deleted", "success");
        } catch (error) {
            toast("Failed to delete address", "error");
        }
    };

    const handleSetDefaultAddress = async (id: string) => {
        if (!user || !userData) return;
        const updated = (userData.addresses || []).map(a => ({
            ...a,
            isDefault: a.id === id
        }));
        try {
            await saveUserAddresses(user.uid, updated);
            setUserData({ ...userData, addresses: updated });
            toast("Default address updated", "success");
        } catch (error) {
            toast("Failed to set default address", "error");
        }
    };

    const openAddressModal = (addr?: Address) => {
        if (addr) {
            setEditingAddress(addr);
            setAddrLabel(addr.label);
            setAddrFullName(addr.fullName);
            setAddrPhone(addr.phone);
            setAddrLine1(addr.addressLine1);
            setAddrLine2(addr.addressLine2 || "");
            setAddrCity(addr.city);
            setAddrState(addr.state);
            setAddrPincode(addr.pincode);
            setAddrIsDefault(addr.isDefault);
        } else {
            setEditingAddress(null);
            setAddrLabel("Home");
            setAddrFullName("");
            setAddrPhone("");
            setAddrLine1("");
            setAddrLine2("");
            setAddrCity("");
            setAddrState("");
            setAddrPincode("");
            setAddrIsDefault((userData?.addresses || []).length === 0); // first is default
        }
        setIsAddressModalOpen(true);
    };

    if (authLoading || !user) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    const hasPassword = auth.currentUser?.providerData.some(p => p.providerId === "password") || false;
    const hasGoogle = auth.currentUser?.providerData.some(p => p.providerId === "google.com") || false;

    const avatarUrl = userData?.avatarBase64 || user.photoURL;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            <div className="container-custom py-6 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mx-auto max-w-4xl w-full">
                    {view === "overview" && (
                        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
                            {/* Left Column: Avatar & Name */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center space-y-4 h-fit">
                                <h1 className="text-xl font-bold text-gray-900 w-full text-center hidden md:block">Profile</h1>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    ref={fileInputRef} 
                                    onChange={handleAvatarUpload}
                                />
                                <div className="relative group" onClick={() => fileInputRef.current?.click()}>
                                    <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden flex items-center justify-center relative">
                                        {avatarLoading ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        ) : avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt={user.displayName || "User"}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-white flex items-center justify-center p-6">
                                                <img src="/paper.png" alt="Default Avatar" className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                                            <Camera className="text-white h-6 w-6 mb-1" />
                                            <span className="text-white text-[10px] font-bold uppercase">Change</span>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-primary border-4 border-white flex items-center justify-center text-white shadow-sm pointer-events-none">
                                        <div className="h-3 w-3 bg-white rounded-full transform scale-75" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold text-gray-900">{user.displayName || "User"}</h2>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                        {isAdmin ? "Administrator" : "Valued Customer"}
                                    </p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                                
                                <Button
                                    variant="outline"
                                    className="w-full mt-4 rounded-full font-bold"
                                    onClick={() => setView("edit")}
                                >
                                    <User className="h-4 w-4 mr-2" />
                                    Edit Profile
                                </Button>
                            </div>

                            {/* Right Column: Menu Items */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
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
                                        icon={<MapPin className="h-5 w-5" />}
                                        label="Shipping Address"
                                        onClick={() => setView("addresses")}
                                    />
                                    <MenuButton
                                        icon={<Shield className="h-5 w-5" />}
                                        label="Security Settings"
                                        onClick={() => setView("security")}
                                    />
                                </div>

                                {/* Sign Out */}
                                <Button
                                    variant="ghost"
                                    className="w-full h-14 rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-bold flex items-center justify-center gap-2"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-5 w-5" />
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    )}

                    {view === "edit" && (
                        <div className="max-w-md mx-auto space-y-8 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between pb-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="bg-gray-50 shadow-sm border border-gray-100 rounded-xl"
                                    onClick={() => setView("overview")}
                                >
                                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                                </Button>
                                <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
                                <div className="w-10" />
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
                                                className="h-14 pl-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white shadow-sm focus-visible:ring-primary/20 text-gray-900 font-medium"
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
                                                className="h-14 pl-12 rounded-2xl border-none bg-gray-100 shadow-inner text-gray-400 font-medium cursor-not-allowed"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 px-2 uppercase tracking-wider font-bold">Email cannot be changed</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Phone</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <Input
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="h-14 pl-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white shadow-sm focus-visible:ring-primary/20 text-gray-900 font-medium"
                                                placeholder="+91 00000 00000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-14 rounded-2xl bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all font-bold text-lg"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                    Save Changes
                                </Button>
                            </form>
                        </div>
                    )}

                    {view === "security" && (
                        <div className="max-w-2xl mx-auto space-y-8">
                            <div className="flex items-center justify-between pb-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="bg-gray-50 shadow-sm border border-gray-100 rounded-xl"
                                    onClick={() => setView("overview")}
                                >
                                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                                </Button>
                                <h1 className="text-xl font-bold text-gray-900">Security & Support</h1>
                                <div className="w-10" />
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {/* Provider Linking & Passwords */}
                                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                            <Lock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold">Authentication</h2>
                                            <p className="text-sm text-gray-500">Manage how you sign in</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            {hasGoogle && (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                                    <span className="text-sm font-medium">Google Linked</span>
                                                </div>
                                            )}
                                            {hasPassword && (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                                                    <Mail className="w-5 h-5 text-gray-600" />
                                                    <span className="text-sm font-medium">Email/Password</span>
                                                </div>
                                            )}
                                        </div>

                                        {!hasGoogle && (
                                            <Button variant="outline" onClick={handleLinkGoogle} className="w-full h-12 rounded-xl border-gray-200 mt-2">
                                                <LinkIcon className="w-4 h-4 mr-2" /> Link with Google Account
                                            </Button>
                                        )}
                                        {hasPassword ? (
                                            <div className="space-y-3 pt-4 border-t border-gray-50">
                                                <h3 className="text-sm font-bold">Change Password</h3>
                                                <p className="text-sm text-gray-500">We will send a password reset link to your email.</p>
                                                <Button 
                                                    onClick={handleSendResetEmail} 
                                                    disabled={isSendingReset} 
                                                    variant="outline"
                                                    className="w-full h-12 rounded-xl border-gray-200"
                                                >
                                                    {isSendingReset ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                                                    Send Password Reset Email
                                                </Button>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleAddPassword} className="space-y-3 pt-4 border-t border-gray-50">
                                                <h3 className="text-sm font-bold">Add Password (If using Google Login)</h3>
                                                <div className="flex gap-2">
                                                    <Input 
                                                        type="password" 
                                                        placeholder="New Password" 
                                                        value={newPassword}
                                                        onChange={e => setNewPassword(e.target.value)}
                                                        required
                                                        className="h-12 rounded-xl"
                                                    />
                                                    <Button type="submit" disabled={isAddingPassword} className="h-12 rounded-xl px-6">
                                                        {isAddingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Set"}
                                                    </Button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>

                                {/* Submit Issue */}
                                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                            <Ticket className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold">Submit a Ticket</h2>
                                            <p className="text-sm text-gray-500">Report an issue or bug</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmitTicket} className="space-y-4">
                                        <Input 
                                            placeholder="Subject / Summary" 
                                            value={ticketSubject}
                                            onChange={e => setTicketSubject(e.target.value)}
                                            required
                                            className="h-12 rounded-xl"
                                        />
                                        <textarea 
                                            placeholder="Describe your issue..." 
                                            value={ticketMessage}
                                            onChange={e => setTicketMessage(e.target.value)}
                                            required
                                            className="w-full min-h-[100px] p-3 rounded-xl border border-input bg-transparent shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                                        />
                                        <Button type="submit" disabled={isSubmittingTicket} className="h-12 rounded-xl w-full">
                                            {isSubmittingTicket ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            Submit Ticket
                                        </Button>
                                    </form>
                                </div>

                                {/* Account Deletion */}
                                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-red-100 space-y-6">
                                    <div className="flex items-center gap-3 border-b border-red-50 pb-4">
                                        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                                            <Trash2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-red-600">Danger Zone</h2>
                                            <p className="text-sm text-red-400">Request account deletion</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleRequestDeletion} className="space-y-4">
                                        <textarea 
                                            placeholder="Please let us know why you are leaving (optional)" 
                                            value={deletionReason}
                                            onChange={e => setDeletionReason(e.target.value)}
                                            className="w-full min-h-[80px] p-3 rounded-xl border border-red-100 bg-red-50/30 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400 resize-y"
                                        />
                                        <Button type="submit" variant="danger" disabled={isSubmittingDeletion} className="h-12 rounded-xl w-full">
                                            {isSubmittingDeletion ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            Request Deletion
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === "addresses" && (
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div className="flex items-center justify-between pb-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="bg-gray-50 shadow-sm border border-gray-100 rounded-xl"
                                    onClick={() => setView("overview")}
                                >
                                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                                </Button>
                                <h1 className="text-xl font-bold text-gray-900">Shipping Addresses</h1>
                                <div className="w-10" />
                            </div>

                            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                                <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                                    <h2 className="text-lg font-bold">Saved Addresses</h2>
                                    <Button onClick={() => openAddressModal()} className="rounded-xl">
                                        <PlusCircle className="w-4 h-4 mr-2" /> Add New Address
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(userData?.addresses || []).length === 0 ? (
                                        <p className="text-gray-500 text-sm col-span-full py-4 text-center">No addresses saved yet.</p>
                                    ) : (
                                        (userData?.addresses || []).map((addr) => (
                                            <div key={addr.id} className={`p-4 rounded-2xl border ${addr.isDefault ? 'border-primary bg-primary/5' : 'border-gray-200'} relative group`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-700 flex items-center gap-1">
                                                            {addr.label === "Home" ? <Home className="w-3 h-3" /> : (addr.label === "Office" || addr.label === "Work" ? <Briefcase className="w-3 h-3" /> : <MapPin className="w-3 h-3" />)}
                                                            {addr.label}
                                                        </span>
                                                        {addr.isDefault && (
                                                            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-primary text-white">Default</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="font-bold text-gray-900 text-sm">{addr.fullName}</p>
                                                <p className="text-sm text-gray-600 mt-1">{addr.addressLine1}</p>
                                                {addr.addressLine2 && <p className="text-sm text-gray-600">{addr.addressLine2}</p>}
                                                <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.pincode}</p>
                                                <p className="text-sm font-medium text-gray-800 mt-1">Phone: {addr.phone}</p>

                                                <div className="mt-4 flex gap-2">
                                                    {!addr.isDefault && (
                                                        <Button variant="outline" size="sm" onClick={() => handleSetDefaultAddress(addr.id)} className="flex-1 h-8 text-xs rounded-lg">Set Default</Button>
                                                    )}
                                                    <Button variant="outline" size="sm" onClick={() => openAddressModal(addr)} className="flex-1 h-8 text-xs rounded-lg">Edit</Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAddress(addr.id)} className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {isAddressModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                            <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold">{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
                                    <Button variant="ghost" size="icon" onClick={() => setIsAddressModalOpen(false)} className="rounded-full">
                                        <Trash2 className="h-5 w-5 text-gray-400 rotate-45" /> {/* Use rotate-45 for X or import X icon */}
                                    </Button>
                                </div>

                                <form onSubmit={handleSaveAddress} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Save As</label>
                                        <div className="flex gap-2">
                                            {["Home", "Office", "Work", "Other"].map(lbl => (
                                                <button
                                                    key={lbl}
                                                    type="button"
                                                    onClick={() => setAddrLabel(lbl as AddressLabel)}
                                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${addrLabel === lbl ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                >
                                                    {lbl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Full Name" value={addrFullName} onChange={e => setAddrFullName(e.target.value)} required />
                                        <Input label="Phone Number" value={addrPhone} onChange={e => setAddrPhone(e.target.value)} required />
                                    </div>
                                    <Input label="Address Line 1" value={addrLine1} onChange={e => setAddrLine1(e.target.value)} required />
                                    <Input label="Address Line 2 (Optional)" value={addrLine2} onChange={e => setAddrLine2(e.target.value)} />
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="City" value={addrCity} onChange={e => setAddrCity(e.target.value)} required />
                                        <Input label="State" value={addrState} onChange={e => setAddrState(e.target.value)} required />
                                    </div>
                                    <Input label="Pincode" value={addrPincode} onChange={e => setAddrPincode(e.target.value)} required />

                                    {!addrIsDefault && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <input 
                                                type="checkbox" 
                                                id="isDefault" 
                                                checked={addrIsDefault}
                                                onChange={e => setAddrIsDefault(e.target.checked)}
                                                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                                            />
                                            <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">Make this my default address</label>
                                        </div>
                                    )}

                                    <div className="pt-4 flex gap-4">
                                        <Button type="button" variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setIsAddressModalOpen(false)}>Cancel</Button>
                                        <Button type="submit" className="flex-1 rounded-xl h-12">Save Address</Button>
                                    </div>
                                </form>
                            </div>
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
