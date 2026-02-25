"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { getSettings, updateSettings, DEFAULT_SETTINGS, uploadImage } from "@/services/settings.service";
import { compressImage } from "@/lib/image-utils";
import { AppSettings } from "@/types";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
    Settings,
    Globe,
    Mail,
    Phone,
    MessageSquare,
    Facebook,
    Instagram,
    Share2,
    Truck,
    CreditCard,
    Save,
    LayoutDashboard,
    Plus,
    Trash2,
    Link as LinkIcon,
    Image as ImageIcon
} from "lucide-react";

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [uploadStatus, setUploadStatus] = useState<Record<string, { stage: 'compressing' | 'uploading' | 'done', progress?: number }>>({});

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getSettings();
                setSettings(data);
            } catch (error) {
                console.error("Failed to fetch settings:", error);
                toast("Failed to load settings", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [toast]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSettings(settings);
            toast("Settings updated successfully", "success");
        } catch (error) {
            console.error("Failed to update settings:", error);
            toast("Failed to update settings", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Admin Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your store's global configurations.</p>
                </div>
                <Button
                    onClick={handleSave}
                    isLoading={saving}
                    className="rounded-full px-6"
                >
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* General Settings */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" /> General Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Application Name"
                                value={settings.appName}
                                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                            />
                            <Input
                                label="Support Email"
                                type="email"
                                value={settings.supportEmail}
                                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                            />
                            <Input
                                label="Support Phone"
                                value={settings.supportPhone}
                                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                            />
                            <Input
                                label="Store Address"
                                value={settings.address}
                                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Store Configurations */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Truck className="h-5 w-5 text-primary" /> Store & Shipping
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Currency Symbol</label>
                                <select
                                    className="w-full rounded-lg border border-border bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={settings.currencySymbol}
                                    onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                                >
                                    <option value="₹">₹ (INR)</option>
                                    <option value="$">$ (USD)</option>
                                    <option value="£">£ (GBP)</option>
                                </select>
                            </div>
                            <Input
                                label="Free Shipping Threshold"
                                type="number"
                                value={settings.freeShippingThreshold}
                                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                            />
                            <div className="flex flex-col justify-end pb-2">
                                <Badge variant="secondary" className="w-fit">Current Currency: {settings.currency}</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Social & Contact */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Share2 className="h-5 w-5 text-primary" /> Social Links & Contact
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <div className="absolute left-3 top-9 -translate-y-1/2">
                                    <MessageSquare className="h-4 w-4 text-green-500" />
                                </div>
                                <Input
                                    label="WhatsApp Number"
                                    className="pl-9"
                                    placeholder="+91..."
                                    value={settings.whatsapp}
                                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-9 -translate-y-1/2">
                                    <Instagram className="h-4 w-4 text-pink-500" />
                                </div>
                                <Input
                                    label="Instagram URL"
                                    className="pl-9"
                                    placeholder="https://instagram.com/..."
                                    value={settings.instagram}
                                    onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-9 -translate-y-1/2">
                                    <Facebook className="h-4 w-4 text-blue-600" />
                                </div>
                                <Input
                                    label="Facebook URL"
                                    className="pl-9"
                                    placeholder="https://facebook.com/..."
                                    value={settings.facebook}
                                    onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Banner Management */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-primary" /> Home Page Banners (1440:370)
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                onClick={() => {
                                    const newBanners = [...(settings.banners || []), { id: Date.now().toString(), imageUrl: "", link: "" }];
                                    setSettings({ ...settings, banners: newBanners });
                                }}
                            >
                                <Plus className="h-4 w-4 mr-1" /> Add Banner
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground italic mb-4">Upload banners and set custom hyperlinks. Banners will auto-scroll on the home page.</p>

                        <div className="space-y-6">
                            {(settings.banners || []).map((banner, index) => (
                                <div key={banner.id} className="p-4 border border-border rounded-2xl bg-gray-50/50 space-y-4 relative group">
                                    <button
                                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        onClick={() => {
                                            const newBanners = settings.banners?.filter(b => b.id !== banner.id);
                                            setSettings({ ...settings, banners: newBanners });
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div className="aspect-[1440/370] bg-white rounded-xl border-2 border-dashed border-border overflow-hidden relative flex items-center justify-center group/img">
                                                {banner.imageUrl ? (
                                                    <>
                                                        <img src={banner.imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />

                                                        {/* Upload Overlay */}
                                                        {uploadStatus[banner.id] && (
                                                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300">
                                                                {uploadStatus[banner.id].stage === 'done' ? (
                                                                    <CheckCircle2 className="h-10 w-10 text-green-500 animate-bounce" />
                                                                ) : (
                                                                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                                                )}
                                                                <div className="flex flex-col items-center">
                                                                    <span className="text-sm font-bold text-gray-900">
                                                                        {uploadStatus[banner.id].stage === 'compressing' ? 'Compressing Image...' :
                                                                            uploadStatus[banner.id].stage === 'uploading' ? 'Uploading to Server...' :
                                                                                'Complete!'}
                                                                    </span>
                                                                    {uploadStatus[banner.id].stage === 'compressing' && (
                                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Optimizing Quality</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                            <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-full text-xs font-bold shadow-xl">
                                                                Change Image
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept="image/*"
                                                                    onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            try {
                                                                                setUploadStatus(prev => ({ ...prev, [banner.id]: { stage: 'compressing' } }));

                                                                                // Compress image to WebP < 80KB (targeting 70-100KB range)
                                                                                const compressedBlob = await compressImage(file, { targetSizeKB: 80 });
                                                                                const compressedFile = new File([compressedBlob], `${banner.id}.webp`, { type: 'image/webp' });

                                                                                setUploadStatus(prev => ({ ...prev, [banner.id]: { stage: 'uploading' } }));

                                                                                const url = await uploadImage(compressedFile, `banners/${banner.id}`);

                                                                                const newBanners = [...(settings.banners || [])];
                                                                                newBanners[index].imageUrl = url;
                                                                                setSettings({ ...settings, banners: newBanners });

                                                                                setUploadStatus(prev => ({ ...prev, [banner.id]: { stage: 'done' } }));
                                                                                toast("Banner image uploaded & optimized", "success");

                                                                                // Clear status after a delay
                                                                                setTimeout(() => {
                                                                                    setUploadStatus(prev => {
                                                                                        const next = { ...prev };
                                                                                        delete next[banner.id];
                                                                                        return next;
                                                                                    });
                                                                                }, 2000);
                                                                            } catch (err: any) {
                                                                                setUploadStatus(prev => {
                                                                                    const next = { ...prev };
                                                                                    delete next[banner.id];
                                                                                    return next;
                                                                                });
                                                                                toast(err.message || "Upload failed", "error");
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <label className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                                                        <Plus className="h-8 w-8" />
                                                        <span className="text-xs font-bold uppercase tracking-wider">Upload 1440:370 Image</span>

                                                        {/* Initial Upload Overlay */}
                                                        {uploadStatus[banner.id] && (
                                                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300">
                                                                {uploadStatus[banner.id].stage === 'done' ? (
                                                                    <CheckCircle2 className="h-10 w-10 text-green-500 animate-bounce" />
                                                                ) : (
                                                                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                                                )}
                                                                <div className="flex flex-col items-center">
                                                                    <span className="text-sm font-bold text-gray-900">
                                                                        {uploadStatus[banner.id].stage === 'compressing' ? 'Compressing Image...' :
                                                                            uploadStatus[banner.id].stage === 'uploading' ? 'Uploading to Server...' :
                                                                                'Complete!'}
                                                                    </span>
                                                                    {uploadStatus[banner.id].stage === 'compressing' && (
                                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Optimizing Quality</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    try {
                                                                        setUploadStatus(prev => ({ ...prev, [banner.id]: { stage: 'compressing' } }));

                                                                        // Compress image to WebP < 80KB (targeting 70-100KB range)
                                                                        const compressedBlob = await compressImage(file, { targetSizeKB: 80 });
                                                                        const compressedFile = new File([compressedBlob], `${banner.id}.webp`, { type: 'image/webp' });

                                                                        setUploadStatus(prev => ({ ...prev, [banner.id]: { stage: 'uploading' } }));

                                                                        const url = await uploadImage(compressedFile, `banners/${banner.id}`);

                                                                        const newBanners = [...(settings.banners || [])];
                                                                        newBanners[index].imageUrl = url;
                                                                        setSettings({ ...settings, banners: newBanners });

                                                                        setUploadStatus(prev => ({ ...prev, [banner.id]: { stage: 'done' } }));
                                                                        toast("Banner image uploaded & optimized", "success");

                                                                        // Clear status after a delay
                                                                        setTimeout(() => {
                                                                            setUploadStatus(prev => {
                                                                                const next = { ...prev };
                                                                                delete next[banner.id];
                                                                                return next;
                                                                            });
                                                                        }, 2000);
                                                                    } catch (err: any) {
                                                                        setUploadStatus(prev => {
                                                                            const next = { ...prev };
                                                                            delete next[banner.id];
                                                                            return next;
                                                                        });
                                                                        toast(err.message || "Upload failed", "error");
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4 self-center">
                                            <div className="relative">
                                                <div className="absolute left-3 top-9 -translate-y-1/2">
                                                    <ImageIcon className="h-4 w-4 text-primary" />
                                                </div>
                                                <Input
                                                    label="Image URL"
                                                    className="pl-9"
                                                    placeholder="https://example.com/banner.jpg"
                                                    value={banner.imageUrl}
                                                    onChange={(e) => {
                                                        const newBanners = [...(settings.banners || [])];
                                                        newBanners[index].imageUrl = e.target.value;
                                                        setSettings({ ...settings, banners: newBanners });
                                                    }}
                                                    helperText="Paste a link or upload an image on the left."
                                                />
                                            </div>

                                            <div className="relative">
                                                <div className="absolute left-3 top-9 -translate-y-1/2">
                                                    <LinkIcon className="h-4 w-4 text-primary" />
                                                </div>
                                                <Input
                                                    label="Hyperlink"
                                                    className="pl-9"
                                                    placeholder="/products/new-arrivals"
                                                    value={banner.link}
                                                    onChange={(e) => {
                                                        const newBanners = [...(settings.banners || [])];
                                                        newBanners[index].link = e.target.value;
                                                        setSettings({ ...settings, banners: newBanners });
                                                    }}
                                                    helperText="Where should this banner redirect to?"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(settings.banners || []).length === 0 && (
                                <div className="py-12 text-center border-2 border-dashed border-border rounded-3xl opacity-50">
                                    <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                    <p className="text-sm">No banners added yet. Add banners to show a slider on the home page.</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-border flex justify-end">
                            <Button
                                onClick={handleSave}
                                isLoading={saving}
                                variant="outline"
                                size="sm"
                                className="rounded-full px-6 border-primary/20 text-primary hover:bg-primary/5"
                            >
                                <Save className="h-4 w-4 mr-2" /> Save Banners
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Hero Section Settings */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <LayoutDashboard className="h-5 w-5 text-primary" /> Home Page - Hero Section
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Hero Title Prefix"
                                    value={settings.heroTitlePrefix}
                                    onChange={(e) => setSettings({ ...settings, heroTitlePrefix: e.target.value })}
                                    placeholder="e.g. Beautiful"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        label="Highlight 1 (Pink)"
                                        value={settings.heroTitleHighlight1}
                                        onChange={(e) => setSettings({ ...settings, heroTitleHighlight1: e.target.value })}
                                        placeholder="e.g. Paper"
                                    />
                                    <Input
                                        label="Highlight 2 (Pink)"
                                        value={settings.heroTitleHighlight2}
                                        onChange={(e) => setSettings({ ...settings, heroTitleHighlight2: e.target.value })}
                                        placeholder="e.g. Petals"
                                    />
                                </div>
                                <Input
                                    label="Hero Title Suffix"
                                    value={settings.heroTitleSuffix}
                                    onChange={(e) => setSettings({ ...settings, heroTitleSuffix: e.target.value })}
                                    placeholder="e.g. for Every Occasion"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Hero Subtitle</label>
                                <textarea
                                    className="w-full rounded-lg border border-border bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                                    value={settings.heroSubtitle}
                                    onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                                    placeholder="Enter hero subtitle text..."
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
                <Button variant="outline" className="mr-3" onClick={() => window.location.reload()}>Discard Changes</Button>
                <Button onClick={handleSave} isLoading={saving}>Save Settings</Button>
            </div>
        </div>
    );
}
