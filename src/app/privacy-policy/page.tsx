"use client";

import React, { useEffect, useState } from "react";
import { Shield, Lock, Eye, FileText, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { getSettings, DEFAULT_SETTINGS } from "@/services/settings.service";
import { AppSettings } from "@/types";

export default function PrivacyPolicyPage() {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error);
    }, []);

    const sections = [
        {
            icon: Eye,
            title: "Information We Collect",
            content: `When you visit ${settings.appName}, we collect certain information about your device, your interaction with the site, and information necessary to process your purchases. We may also collect additional information if you contact us for customer support. In this Privacy Policy, we refer to any information that can uniquely identify an individual as "Personal Information".`
        },
        {
            icon: Lock,
            title: "How We Use Your Information",
            content: `We use your personal information to provide our services to you, which includes: offering products for sale, processing payments, shipping and fulfillment of your order, and keeping you up to date on new products, services, and offers.`
        },
        {
            icon: Shield,
            title: "Data Security",
            content: "The security of your personal information is important to us. We follow industry standards to protect the personal information submitted to us, both during transmission and once it is received. We use administrative, technical, and physical security measures to help protect your personal information."
        },
        {
            icon: FileText,
            title: "Cookies",
            content: "A cookie is a small amount of information that’s downloaded to your computer or device when you visit our Site. We use a number of different cookies, including functional, performance, advertising, and social media or content cookies. Cookies make your browsing experience better by allowing the website to remember your actions and preferences."
        }
    ];

    return (
        <div className="flex flex-col gap-0 min-h-screen bg-gray-50/30">
            {/* Hero Section */}
            <section className="relative py-20 bg-white border-b border-border overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="container-custom relative z-10">
                    <div className="max-w-3xl space-y-4">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-4 py-1"> Legal Document </Badge>
                        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">Privacy Policy</h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 md:py-24">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="border-none shadow-sm bg-primary/5 sticky top-24">
                                <CardContent className="p-8 space-y-6">
                                    <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-xl">Your Privacy Matters</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            We are committed to protecting your personal data and providing a transparent shopping experience at {settings.appName}.
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-primary/10 flex flex-col gap-3">
                                        <p className="text-xs font-bold uppercase tracking-widest text-primary/60">Contact Legal Team</p>
                                        <a href={`mailto:${settings.supportEmail}`} className="text-sm font-medium hover:text-primary transition-colors underline underline-offset-4">
                                            {settings.supportEmail}
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Text */}
                        <div className="lg:col-span-8 space-y-12">
                            {sections.map((section, idx) => (
                                <div key={idx} className="space-y-4 group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-white border border-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                                            <section.icon className="h-4 w-4" />
                                        </div>
                                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">{section.title}</h2>
                                    </div>
                                    <p className="text-lg text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-6 py-2 bg-white/50 rounded-r-2xl">
                                        {section.content}
                                    </p>
                                </div>
                            ))}

                            <div className="bg-white rounded-3xl p-8 md:p-12 border border-border/50 space-y-6 shadow-sm">
                                <div className="flex items-center gap-2 text-primary">
                                    <Info className="h-5 w-5" />
                                    <span className="font-bold uppercase tracking-wider text-xs">Policy Updates</span>
                                </div>
                                <h3 className="text-xl font-bold">Changes to This Policy</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new policy on this page.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
