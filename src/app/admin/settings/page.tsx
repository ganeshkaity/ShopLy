"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { getSettings, updateSettings, DEFAULT_SETTINGS } from "@/services/settings.service";
import { AppSettings } from "@/types";
import { Loader2 } from "lucide-react";
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
    LayoutDashboard
} from "lucide-react";

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

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
