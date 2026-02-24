"use client";

import React, { useEffect, useState } from "react";
import { Truck, Globe, Clock, Package, ShieldCheck, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { getSettings, DEFAULT_SETTINGS } from "@/services/settings.service";
import { AppSettings } from "@/types";

export default function ShippingPolicyPage() {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error);
    }, []);

    const shippingInfo = [
        {
            icon: Clock,
            title: "Processing Time",
            desc: "Orders are typically processed within 1-2 business days (excluding weekends and holidays) after receiving your order confirmation email."
        },
        {
            icon: Truck,
            title: "Shipping Rates",
            desc: `Orders over ₹${settings.freeShippingThreshold} ship for free! For orders below this amount, flat shipping rates will apply during checkout.`
        },
        {
            icon: Package,
            title: "Local Delivery",
            desc: `We offer local delivery within our city for a flat fee. You'll see the option at checkout if your address is within our delivery zone.`
        },
        {
            icon: ShieldCheck,
            title: "Shipping Security",
            desc: "All shipments are insured and tracked. You'll receive a tracking number as soon as your order leaves our studio."
        }
    ];

    return (
        <div className="flex flex-col gap-0 min-h-screen bg-white">
            {/* Minimal Hero */}
            <section className="bg-gray-50 border-b border-border py-16">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none"> Delivery & Logistics </Badge>
                            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">Shipping Policy</h1>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground bg-white p-4 rounded-2xl border border-border shadow-sm">
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <Globe className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium">Pan-India Shipping Available</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Info Grid */}
            <section className="py-20 md:py-32">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                        {shippingInfo.map((item, idx) => (
                            <div key={idx} className="flex gap-6 group">
                                <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all scale-100 group-hover:scale-110 shrink-0">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-xl font-bold">{item.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed italic">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-24 bg-gray-900 rounded-[2.5rem] p-10 md:p-20 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 blur-[120px] pointer-events-none" />

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <h2 className="font-serif text-3xl md:text-4xl font-bold">How to check the status of your order?</h2>
                                <p className="text-gray-400 leading-relaxed text-lg">
                                    When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available.
                                </p>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <MapPin className="h-6 w-6 text-primary shrink-0" />
                                    <div>
                                        <p className="font-bold">Shipping from:</p>
                                        <p className="text-sm text-gray-400">{settings.address}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 lg:pl-12">
                                <Card className="bg-white/10 border-white/10 text-white backdrop-blur-xl">
                                    <CardContent className="p-8 space-y-4">
                                        <h3 className="text-xl font-bold border-b border-white/10 pb-4">Estimated Delivery</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400 text-sm">Metros</span>
                                                <span className="font-bold">3-5 Business Days</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400 text-sm">Other Cities</span>
                                                <span className="font-bold">5-7 Business Days</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400 text-sm">Rest of India</span>
                                                <span className="font-bold">7-10 Business Days</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
