"use client";

import React, { useEffect, useState } from "react";
import { RefreshCcw, PackageCheck, AlertCircle, Clock, Truck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { getSettings, DEFAULT_SETTINGS } from "@/services/settings.service";
import { AppSettings } from "@/types";

export default function ReturnPolicyPage() {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error);
    }, []);

    const steps = [
        {
            icon: Clock,
            title: "30-Day Window",
            content: "You have 30 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it."
        },
        {
            icon: PackageCheck,
            title: "Original Packaging",
            content: "Your item must be in the original packaging. Please ensure that the item you're returning is repackaged with all the cords, adapters and documentation that were included when you received it."
        },
        {
            icon: RefreshCcw,
            title: "Refund Process",
            content: "Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item."
        },
        {
            icon: AlertCircle,
            title: "Non-Returnable Items",
            content: "Certain types of items cannot be returned, like perishable goods (such as food, flowers, or plants), custom products (such as special orders or personalized items), and personal care goods."
        }
    ];

    return (
        <div className="flex flex-col gap-0 min-h-screen bg-gray-50/30">
            {/* Hero Section */}
            <section className="relative py-20 bg-white border-b border-border overflow-hidden text-center">
                <div className="absolute inset-0 bg-yellow-50/30 pointer-events-none" />
                <div className="container-custom relative z-10 space-y-4">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-none px-4 py-1"> Return & Refund </Badge>
                    <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight">Easy Returns</h1>
                    <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
                        At {settings.appName}, we stand behind our products. If you're not completely satisfied, we're here to help.
                    </p>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-16 md:py-24">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, idx) => (
                            <div key={idx} className="flex flex-col gap-6 group">
                                <div className="h-16 w-16 rounded-3xl bg-white border border-border shadow-sm flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                    <step.icon className="h-8 w-8" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {step.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-2 border-none shadow-xl bg-white overflow-hidden">
                            <CardContent className="p-10 space-y-6">
                                <h2 className="text-3xl font-serif font-bold">Initiate a Return</h2>
                                <div className="space-y-4 text-muted-foreground leading-relaxed">
                                    <p>Contact our customer support team at <strong>{settings.supportEmail}</strong> with your order number and details about the product you would like to return.</p>
                                    <p>We will respond quickly with instructions for how to return items from your order.</p>
                                    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-2xl mt-8">
                                        <p className="text-blue-900 font-medium">Please note: You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <div className="bg-primary rounded-3xl p-8 text-white space-y-4 shadow-xl shadow-primary/20">
                                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Truck className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold">Fast Exchanges</h3>
                                <p className="text-primary-foreground/80 text-sm leading-relaxed">
                                    The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.
                                </p>
                            </div>

                            <div className="border border-border rounded-3xl p-8 space-y-4 bg-white shadow-sm">
                                <h3 className="font-bold flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-500" /> Damaged Items
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
