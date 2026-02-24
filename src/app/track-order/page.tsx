"use client";

import React, { useState } from "react";
import { Search, Package, Truck, CheckCircle2, AlertCircle, Box, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [showStatus, setShowStatus] = useState(false);

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId) return;

        setIsSearching(true);
        // Simulate tracking lookup
        setTimeout(() => {
            setIsSearching(false);
            setShowStatus(true);
        }, 1200);
    };

    const trackingSteps = [
        { status: 'Confirmed', date: 'Oct 24, 2023', time: '10:30 AM', active: true, done: true, icon: CheckCircle2 },
        { status: 'Processing', date: 'Oct 24, 2023', time: '02:45 PM', active: true, done: true, icon: Box },
        { status: 'Shipped', date: 'Oct 25, 2023', time: '09:15 AM', active: true, done: false, icon: Truck },
        { status: 'Out for Delivery', date: '--', time: '--', active: false, done: false, icon: Package },
        { status: 'Delivered', date: '--', time: '--', active: false, done: false, icon: MapPin },
    ];

    return (
        <div className="flex flex-col gap-0 min-h-screen bg-gray-50/30">
            {/* Elegant Header */}
            <section className="bg-white border-b border-border py-16 md:py-24 relative overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[100%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="container-custom relative z-10 text-center max-w-3xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-6 py-1.5 rounded-full tracking-wide">
                            Live Tracking
                        </Badge>
                        <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight">Track Your Joy</h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Enter your order ID below to see the real-time status of your package. You'll find the order ID in your confirmation email.
                        </p>
                    </div>

                    <form onSubmit={handleTrack} className="relative max-w-xl mx-auto group">
                        <div className="relative">
                            <Input
                                placeholder="Enter Order ID (e.g. #SL-98241)"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                className="h-16 pl-14 pr-32 rounded-full border-2 border-border focus:border-primary/50 transition-all text-lg shadow-lg group-hover:shadow-xl group-focus-within:shadow-xl"
                            />
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Button
                                type="submit"
                                size="lg"
                                className="absolute right-2 top-2 h-12 px-8 rounded-full shadow-lg shadow-primary/20"
                                disabled={isSearching || !orderId}
                            >
                                {isSearching ? "Finding..." : "Track"}
                            </Button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Results Section */}
            <section className="py-16 md:py-24">
                <div className="container-custom">
                    {showStatus ? (
                        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
                            {/* Order Summary Header */}
                            <div className="bg-white rounded-3xl p-8 md:p-10 border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-2">
                                    <p className="text-sm font-bold uppercase tracking-widest text-primary">Order {orderId}</p>
                                    <h2 className="text-2xl font-bold">Estimated Delivery: Oct 28, 2023</h2>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Ordered on Oct 24</span>
                                        <span className="h-1 w-1 rounded-full bg-border" />
                                        <span className="flex items-center gap-1 font-medium text-blue-600">Status: On its way</span>
                                    </div>
                                </div>
                                <Button variant="outline" className="rounded-full border-primary/20 text-primary hover:bg-primary/5 px-8">
                                    View Order Details
                                </Button>
                            </div>

                            {/* Tracking Timeline */}
                            <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem]">
                                <CardContent className="p-8 md:p-12">
                                    <div className="space-y-12">
                                        {trackingSteps.map((step, idx) => (
                                            <div key={idx} className="relative flex gap-8 group">
                                                {/* Vertical Connector Line */}
                                                {idx !== trackingSteps.length - 1 && (
                                                    <div className={cn(
                                                        "absolute left-6 top-12 bottom-[-48px] w-[2px] rounded-full",
                                                        step.done ? "bg-primary" : "bg-gray-100"
                                                    )} />
                                                )}

                                                {/* Step Icon */}
                                                <div className={cn(
                                                    "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all duration-500",
                                                    step.active ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "bg-gray-100 text-gray-400"
                                                )}>
                                                    <step.icon className="h-6 w-6" />
                                                </div>

                                                {/* Step Info */}
                                                <div className="flex flex-col gap-1 py-1">
                                                    <div className="flex items-baseline gap-3">
                                                        <h3 className={cn(
                                                            "text-xl font-bold transition-colors",
                                                            step.active ? "text-gray-900" : "text-gray-400"
                                                        )}>
                                                            {step.status}
                                                        </h3>
                                                        {step.done && (
                                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                                        )}
                                                    </div>
                                                    <p className={cn(
                                                        "text-sm",
                                                        step.active ? "text-muted-foreground" : "text-gray-300"
                                                    )}>
                                                        {step.date} • {step.time}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="max-w-xl mx-auto text-center space-y-6 opacity-60 grayscale py-12">
                            <div className="mx-auto h-24 w-24 rounded-3xl bg-gray-100 flex items-center justify-center text-gray-400">
                                <Search className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">Waiting for your Order ID</h3>
                                <p className="text-muted-foreground">Enter your order ID above to reveal the tracking timeline.</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Need Help CTA */}
            <section className="py-24 bg-white">
                <div className="container-custom">
                    <div className="bg-gray-900 rounded-[2.5rem] p-10 md:p-16 text-center space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[100px]" />
                        <div className="relative z-10 space-y-6">
                            <div className="mx-auto h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm">
                                <AlertCircle className="h-8 w-8 text-primary" />
                            </div>
                            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">Can't find your order?</h2>
                            <p className="text-gray-400 max-w-xl mx-auto">
                                If you haven't received a tracking number via email, or if your order status hasn't updated in 48 hours, our team is ready to assist.
                            </p>
                            <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
                                <Button variant="outline" className="rounded-full bg-white text-gray-900 hover:bg-gray-100 border-none px-10 h-14 font-bold">
                                    Contact Support
                                </Button>
                                <Button variant="ghost" className="rounded-full text-white hover:bg-white/10 h-14 px-10">
                                    Track on App
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
