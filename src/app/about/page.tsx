"use client";

import React, { useEffect, useState } from "react";
import {
    Heart,
    Star,
    Users,
    Leaf,
    ArrowRight,
    Award,
    Sparkles,
    ShoppingBag,
    MoveRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { getSettings, DEFAULT_SETTINGS } from "@/services/settings.service";
import { AppSettings } from "@/types";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error);
    }, []);

    const stats = [
        { label: "Happy Customers", value: "10K+", icon: Users },
        { label: "Unique Products", value: "500+", icon: Sparkles },
        { label: "Cities Reached", value: "150+", icon: Award },
        { label: "Quality Rating", value: "4.9/5", icon: Star },
    ];

    const values = [
        {
            icon: Heart,
            title: "Handcrafted with Love",
            desc: "Every item in our collection is selected or designed with care and attention to detail.",
            color: "bg-pink-50 text-pink-600"
        },
        {
            icon: Star,
            title: "Premium Quality",
            desc: "We source the finest materials to ensure our products feel as special as the moments they celebrate.",
            color: "bg-blue-50 text-blue-600"
        },
        {
            icon: Leaf,
            title: "Eco-Friendly",
            desc: "Sustainability matters. We use recycled and eco-conscious materials wherever possible.",
            color: "bg-green-50 text-green-600"
        },
        {
            icon: Users,
            title: "Community First",
            desc: "We support local artisans and small businesses, bringing you closer to the makers.",
            color: "bg-orange-50 text-orange-600"
        },
    ];

    return (
        <div className="flex flex-col gap-0 overflow-hidden">
            {/* --- Hero Section --- */}
            <section className="relative min-h-[60vh] flex items-center justify-center bg-[#fff1f2] py-20 overflow-hidden">
                {/* Abstract background blobs */}
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[60%] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="container-custom relative z-10 text-center space-y-8">
                    <div className="flex justify-center">
                        <Badge variant="secondary" className="bg-white/50 border-primary/10 text-primary px-6 py-1.5 rounded-full animate-in fade-in slide-in-from-bottom duration-500">
                            The Heart of {settings.appName}
                        </Badge>
                    </div>
                    <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom duration-700 delay-100">
                        Crafting <span className="text-primary italic">Memorable</span> <br className="hidden md:block" /> Every Day
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
                        {settings.appName} was born from a love of beautiful paper, thoughtful gifts, and the belief that every gesture of kindness deserves to be wrapped in something special.
                    </p>
                </div>
            </section>

            {/* --- Our Journey / Focus --- */}
            <section className="py-24 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative aspect-square md:aspect-video lg:aspect-square rounded-3xl overflow-hidden shadow-2xl group">
                            <Image
                                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop"
                                alt="Our Craftmanship"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            <div className="absolute bottom-8 left-8">
                                <p className="text-white/90 font-medium italic">"Artistry in every fold, joy in every gift."</p>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="font-serif text-4xl font-bold">The Artisanal Journey</h2>
                                <div className="h-1 w-20 bg-primary rounded-full" />
                            </div>
                            <div className="space-y-6 text-muted-foreground leading-relaxed">
                                <p>
                                    Founded with a mission to revive the charm of handwritten notes and tactile gifts, we've grown from a small home studio to a premium destination for quality stationery.
                                </p>
                                <p>
                                    Our process is slow, intentional, and deeply rooted in craftsmanship. We believe that in a digital world, the feel of luxury paper and the shimmer of a handwritten gold-foil card carry a weight that screens simply cannot match.
                                </p>
                                <ul className="space-y-4 pt-4">
                                    {[
                                        "Curating unique designs from local artisans",
                                        "Using premium, sustainable paper stocks",
                                        "Thoughtful packaging that protects and delights",
                                        "A customer-first approach to every order"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-medium text-foreground">
                                            <div className="h-2 w-2 rounded-full bg-primary" /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Stats Counter Section --- */}
            <section className="py-20 bg-primary text-white">
                <div className="container-custom">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                        {stats.map(({ label, value, icon: Icon }) => (
                            <div key={label} className="text-center space-y-2 flex flex-col items-center group">
                                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-4xl font-bold tracking-tight">{value}</h3>
                                <p className="text-primary-foreground/80 text-sm font-medium uppercase tracking-wider">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Core Values Section --- */}
            <section className="py-24 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                        <h2 className="font-serif text-4xl font-bold">Why Choose Us?</h2>
                        <p className="text-muted-foreground italic">Beyond just products, we deliver emotions and lasting memories.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map(({ icon: Icon, title, desc, color }) => (
                            <Card key={title} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
                                <CardContent className="p-8 text-center space-y-4">
                                    <div className={`mx-auto h-16 w-16 rounded-2xl ${color} flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                                        <Icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="font-bold text-xl">{title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Mission Statement Section --- */}
            <section className="relative py-32 overflow-hidden bg-white">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />

                <div className="container-custom relative z-10 text-center space-y-10">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="h-0.5 w-12 bg-primary mx-auto" />
                        <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
                            "Our mission is to make gifting effortless and joyful, one <span className="text-primary italic">petal</span> at a time."
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            We exist to bridge the gap between hearts through thoughtfully designed stationery and gift products that bring people closer together.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/products">
                            <Button size="lg" className="rounded-full h-14 px-8 shadow-lg shadow-primary/20">
                                Explore Collection <ShoppingBag className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="rounded-full h-14 px-8 group">
                                Get in Touch <MoveRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
