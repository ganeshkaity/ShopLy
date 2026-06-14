"use client";

import React, { useEffect, useState } from "react";
import {
    getTShirtConfig,
    updateTShirtConfig,
    getTShirtOrders,
    updateTShirtOrderStatus,
    TShirtConfig,
    TShirtColor,
    TShirtSize,
    TShirtQuality,
    TShirtOrder,
} from "@/services/tshirt.service";
import { uploadFile, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Plus, X, Upload, Shirt, Palette, Ruler, Star, ShoppingBag, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import imageCompression from "browser-image-compression";

type TabId = "overview" | "colors" | "sizes" | "qualities" | "orders";

export default function AdminTShirtPrintPage() {
    const { toast } = useToast();
    const [config, setConfig] = useState<TShirtConfig | null>(null);
    const [orders, setOrders] = useState<TShirtOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>("overview");
    const [uploadingImage, setUploadingImage] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cfg, ords] = await Promise.all([getTShirtConfig(), getTShirtOrders()]);
            setConfig(cfg);
            setOrders(ords);
        } catch (e) {
            toast("Failed to load T-Shirt config", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        try {
            await updateTShirtConfig(config);
            toast("Configuration saved!", "success");
        } catch (e) {
            toast("Failed to save", "error");
        } finally {
            setSaving(false);
        }
    };

    const uploadToImgBB = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=f836d90a7d863714c3ebfd67412a5cbf`, {
            method: "POST",
            body: formData,
        });
        if (!res.ok) throw new Error("Failed to upload to ImgBB");
        const data = await res.json();
        // Prefer direct image URL (original quality) if available; fallback to provided URL
        const directUrl =
            // If `url` points to a page (contains 'ibb.co'), try `display_url` or `image.url`
            (typeof data?.data?.url === "string" && data.data.url.includes("ibb.co")
                ? data?.data?.display_url ?? data?.data?.image?.url
                : data?.data?.url) ||
            // Fallback to any image URL present
            data?.data?.image?.url ||
            "";
        if (!directUrl) throw new Error("ImgBB response missing image URL");
        return directUrl;
    };

    const handleQualityImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, qualityId: string) => {
        const file = e.target.files?.[0];
        if (!file || !config) return;
        setUploadingImage(qualityId);
        try {
            const compressed = await imageCompression(file, { maxSizeMB: 0.2, maxWidthOrHeight: 800, useWebWorker: true });
            const url = await uploadToImgBB(compressed);
            setConfig(prev => prev ? {
                ...prev,
                qualities: prev.qualities.map(q => q.id === qualityId ? { ...q, imageUrl: url } : q)
            } : prev);
            toast("Image uploaded", "success");
        } catch {
            toast("Failed to upload image", "error");
        } finally {
            setUploadingImage(null);
            e.target.value = "";
        }
    };

    const handleColorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, colorId: string, side: 'front' | 'back') => {
        const file = e.target.files?.[0];
        if (!file || !config) return;
        setUploadingImage(`${colorId}-${side}`);
        try {
            const compressed = await imageCompression(file, { maxSizeMB: 0.2, maxWidthOrHeight: 800, useWebWorker: true });
            const url = await uploadToImgBB(compressed);
            setConfig(prev => prev ? {
                ...prev,
                colors: prev.colors.map(c => {
                    if (c.id !== colorId) return c;
                    return side === 'front' ? { ...c, frontImageUrl: url } : { ...c, backImageUrl: url };
                })
            } : prev);
            toast(`${side === 'front' ? 'Front' : 'Back'} image uploaded`, "success");
        } catch {
            toast("Failed to upload image", "error");
        } finally {
            setUploadingImage(null);
            e.target.value = "";
        }
    };

    const addColor = () => {
        if (!config) return;
        const newColor: TShirtColor = { id: Date.now().toString(), name: "New Color", hex: "#cccccc", isActive: true };
        setConfig({ ...config, colors: [...config.colors, newColor] });
    };

    const addSize = () => {
        if (!config) return;
        const newSize: TShirtSize = { id: Date.now().toString(), label: "New", isActive: true };
        setConfig({ ...config, sizes: [...config.sizes, newSize] });
    };

    const addQuality = () => {
        if (!config) return;
        const newQ: TShirtQuality = { id: Date.now().toString(), name: "New Quality", description: "", price: 499, isActive: true };
        setConfig({ ...config, qualities: [...config.qualities, newQ] });
    };

    if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
    if (!config) return null;

    const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
        { id: "overview", label: "Overview", icon: Shirt },
        { id: "colors", label: "Colors", icon: Palette },
        { id: "sizes", label: "Sizes", icon: Ruler },
        { id: "qualities", label: "Qualities", icon: Star },
        { id: "orders", label: `Orders (${orders.length})`, icon: ShoppingBag },
    ];

    return (
        <div className="container-custom py-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
                        <Shirt className="h-8 w-8 text-primary" /> T-Shirt Print Manager
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage colors, sizes, quality options and orders for your custom T-shirt printing service.</p>
                </div>
                <Button onClick={handleSave} isLoading={saving} className="rounded-full px-8">Save All Changes</Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit flex-wrap">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                            activeTab === tab.id ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <h2 className="font-bold text-lg">Service Status</h2>

                            <div className="flex items-center justify-between p-4 border rounded-2xl">
                                <div>
                                    <p className="font-semibold">Service Active</p>
                                    <p className="text-sm text-muted-foreground">Show/hide the T-shirt printing page for users</p>
                                </div>
                                <button onClick={() => setConfig({ ...config, isServiceActive: !config.isServiceActive })}>
                                    {config.isServiceActive
                                        ? <ToggleRight className="h-10 w-10 text-green-500" />
                                        : <ToggleLeft className="h-10 w-10 text-gray-400" />}
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-2xl bg-amber-50/50 border-amber-200">
                                <div>
                                    <p className="font-semibold flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        Orders Temporarily Stopped
                                    </p>
                                    <p className="text-sm text-muted-foreground">Prevents users from placing orders (show a message instead)</p>
                                </div>
                                <button onClick={() => setConfig({ ...config, isOrderStopped: !config.isOrderStopped })}>
                                    {config.isOrderStopped
                                        ? <ToggleRight className="h-10 w-10 text-amber-500" />
                                        : <ToggleLeft className="h-10 w-10 text-gray-400" />}
                                </button>
                            </div>

                            {config.isOrderStopped && (
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Stop Message (shown to users)</label>
                                    <textarea
                                        className="w-full rounded-xl border border-border p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        rows={3}
                                        value={config.temporaryStopMessage}
                                        onChange={(e) => setConfig({ ...config, temporaryStopMessage: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-4 pt-2">
                                <div className="bg-primary/5 p-4 rounded-2xl text-center">
                                    <p className="text-2xl font-bold text-primary">{config.colors.filter(c => c.isActive).length}</p>
                                    <p className="text-xs text-muted-foreground font-medium mt-1">Active Colors</p>
                                </div>
                                <div className="bg-primary/5 p-4 rounded-2xl text-center">
                                    <p className="text-2xl font-bold text-primary">{config.sizes.filter(s => s.isActive).length}</p>
                                    <p className="text-xs text-muted-foreground font-medium mt-1">Active Sizes</p>
                                </div>
                                <div className="bg-primary/5 p-4 rounded-2xl text-center">
                                    <p className="text-2xl font-bold text-primary">{config.qualities.filter(q => q.isActive).length}</p>
                                    <p className="text-xs text-muted-foreground font-medium mt-1">Active Qualities</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* COLORS TAB */}
            {activeTab === "colors" && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={addColor} className="rounded-full gap-2" variant="outline">
                            <Plus className="h-4 w-4" /> Add Color
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {config.colors.map((color, idx) => (
                            <Card key={color.id} className={cn("transition-all", !color.isActive && "opacity-50")}>
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: color.hex }} />
                                            <div>
                                                <Input
                                                    value={color.name}
                                                    onChange={(e) => setConfig({ ...config, colors: config.colors.map((c, i) => i === idx ? { ...c, name: e.target.value } : c) })}
                                                    className="h-7 text-sm font-bold border-none px-0 bg-transparent focus:ring-0"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setConfig({ ...config, colors: config.colors.filter((_, i) => i !== idx) })}
                                            className="text-red-400 hover:text-red-600 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="text-xs font-medium text-muted-foreground">Hex Color</label>
                                        <div className="flex items-center gap-2 flex-grow">
                                            <input
                                                type="color"
                                                value={color.hex}
                                                onChange={(e) => setConfig({ ...config, colors: config.colors.map((c, i) => i === idx ? { ...c, hex: e.target.value } : c) })}
                                                className="w-8 h-8 cursor-pointer rounded border border-border"
                                            />
                                            <input
                                                type="text"
                                                value={color.hex}
                                                onChange={(e) => setConfig({ ...config, colors: config.colors.map((c, i) => i === idx ? { ...c, hex: e.target.value } : c) })}
                                                className="flex-grow rounded-lg border border-border bg-white p-1.5 text-xs font-mono outline-none"
                                            />
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer mt-4">
                                        <input
                                            type="checkbox"
                                            checked={color.isActive}
                                            onChange={(e) => setConfig({ ...config, colors: config.colors.map((c, i) => i === idx ? { ...c, isActive: e.target.checked } : c) }) }
                                            className="rounded border-gray-300 text-primary"
                                        />
                                        <span className="text-sm font-medium">Active</span>
                                    </label>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* SIZES TAB */}
            {activeTab === "sizes" && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={addSize} className="rounded-full gap-2" variant="outline">
                            <Plus className="h-4 w-4" /> Add Size
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {config.sizes.map((size, idx) => (
                            <Card key={size.id} className={cn("transition-all", !size.isActive && "opacity-50")}>
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <Input
                                            value={size.label}
                                            onChange={(e) => setConfig({ ...config, sizes: config.sizes.map((s, i) => i === idx ? { ...s, label: e.target.value } : s) })}
                                            className="text-2xl font-extrabold text-center border-none focus:ring-0 bg-transparent"
                                        />
                                        <button
                                            onClick={() => setConfig({ ...config, sizes: config.sizes.filter((_, i) => i !== idx) })}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={size.isActive}
                                            onChange={(e) => setConfig({ ...config, sizes: config.sizes.map((s, i) => i === idx ? { ...s, isActive: e.target.checked } : s) })}
                                            className="rounded border-gray-300 text-primary"
                                        />
                                        <span className="text-sm font-medium">Active</span>
                                    </label>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* QUALITIES TAB */}
            {activeTab === "qualities" && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={addQuality} className="rounded-full gap-2" variant="outline">
                            <Plus className="h-4 w-4" /> Add Quality
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {config.qualities.map((q, idx) => (
                            <Card key={q.id} className={cn("transition-all", !q.isActive && "opacity-50")}>
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <Input
                                            value={q.name}
                                            onChange={(e) => setConfig({ ...config, qualities: config.qualities.map((qu, i) => i === idx ? { ...qu, name: e.target.value } : qu) })}
                                            className="text-lg font-bold border-none px-0 bg-transparent focus:ring-0"
                                            placeholder="Quality Name"
                                        />
                                        <button
                                            onClick={() => setConfig({ ...config, qualities: config.qualities.filter((_, i) => i !== idx) })}
                                            className="text-red-400 hover:text-red-600 mt-2"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {q.imageUrl ? (
                                        <div className="relative rounded-xl overflow-hidden border">
                                            <img src={q.imageUrl} alt={q.name} className="w-full h-32 object-cover" />
                                            <button
                                                onClick={() => setConfig({ ...config, qualities: config.qualities.map((qu, i) => i === idx ? { ...qu, imageUrl: undefined } : qu) })}
                                                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-xl cursor-pointer hover:bg-accent transition-colors">
                                            {uploadingImage === q.id ? <Spinner size="sm" /> : (
                                                <>
                                                    <Upload className="h-5 w-5 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground">Upload sample image</span>
                                                </>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleQualityImageUpload(e, q.id)} />
                                        </label>
                                    )}

                                    <textarea
                                        className="w-full rounded-xl border border-border p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                        rows={2}
                                        placeholder="Description..."
                                        value={q.description}
                                        onChange={(e) => setConfig({ ...config, qualities: config.qualities.map((qu, i) => i === idx ? { ...qu, description: e.target.value } : qu) })}
                                    />

                                    <Input
                                        label="Base Price (₹)"
                                        type="number"
                                        value={q.price}
                                        onChange={(e) => setConfig({ ...config, qualities: config.qualities.map((qu, i) => i === idx ? { ...qu, price: Number(e.target.value) } : qu) })}
                                    />

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={q.isActive}
                                            onChange={(e) => setConfig({ ...config, qualities: config.qualities.map((qu, i) => i === idx ? { ...qu, isActive: e.target.checked } : qu) })}
                                            className="rounded border-gray-300 text-primary"
                                        />
                                        <span className="text-sm font-medium">Active</span>
                                    </label>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed rounded-3xl">
                            <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-muted-foreground font-medium">No T-shirt orders yet</p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <Card key={order.id}>
                                <CardContent className="p-5">
                                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                                        {order.designImageBase64 && (
                                            <img src={order.designImageBase64} alt="Design" className="w-20 h-20 object-contain rounded-xl border bg-gray-50 shrink-0" />
                                        )}
                                        <div className="flex-grow space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-bold">{order.userName}</p>
                                                <span className="text-xs text-muted-foreground">{order.userEmail}</span>
                                                <Badge variant={
                                                    order.status === 'Delivered' ? 'success' :
                                                        order.status === 'Cancelled' ? 'destructive' :
                                                            order.status === 'Shipped' ? 'info' : 'warning'
                                                }>{order.status}</Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                <span>Color: <b>{order.color.name}</b></span>
                                                <span>Size: <b>{order.size.label}</b></span>
                                                <span>Quality: <b>{order.quality.name}</b></span>
                                                <span>Qty: <b>{order.quantity}</b></span>
                                                <span>Total: <b>₹{order.totalPrice}</b></span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {order.shippingAddress.fullName}, {order.shippingAddress.addressLine1}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
                                            </p>
                                        </div>
                                        <div className="shrink-0">
                                            <select
                                                className="rounded-lg border border-border bg-white p-2 text-sm outline-none"
                                                value={order.status}
                                                onChange={(e) => {
                                                    updateTShirtOrderStatus(order.id!, e.target.value as any);
                                                    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: e.target.value as any } : o));
                                                    toast("Order status updated", "success");
                                                }}
                                            >
                                                {['Pending', 'In Production', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
