"use client";

import React, { useEffect, useState } from "react";
import { Scale, Gavel, Handshake, ScrollText, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { getSettings, DEFAULT_SETTINGS } from "@/services/settings.service";
import { AppSettings } from "@/types";

export default function TermsConditionsPage() {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error);
    }, []);

    const sections = [
        {
            icon: Gavel,
            title: "Acceptance of Terms",
            content: `By accessing or using the ${settings.appName} website, you agree to be bound by these Terms and Conditions. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.`
        },
        {
            icon: ScrollText,
            title: "Intellectual Property",
            content: `All content included on this site, such as text, graphics, logos, images, and software, is the property of ${settings.appName} and is protected by international copyright laws. You may not reproduce, distribute, or create derivative works from this content without express written permission.`
        },
        {
            icon: AlertTriangle,
            title: "User Responsibilities",
            content: "You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password."
        },
        {
            icon: Handshake,
            title: "Governing Law",
            content: `These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which ${settings.appName} operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.`
        }
    ];

    return (
        <div className="flex flex-col gap-0 min-h-screen bg-gray-50/30">
            {/* Hero Section */}
            <section className="relative py-20 bg-white border-b border-border overflow-hidden">
                <div className="absolute top-0 left-0 w-1/3 h-full bg-secondary/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2" />
                <div className="container-custom relative z-10">
                    <div className="max-w-3xl space-y-4 text-left">
                        <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground border-none px-4 py-1"> Legal Document </Badge>
                        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">Terms & Conditions</h1>
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
                        {/* Main Text */}
                        <div className="lg:col-span-8 space-y-12">
                            {sections.map((section, idx) => (
                                <div key={idx} className="space-y-4 group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-white border border-border flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white group-hover:border-secondary transition-all duration-300">
                                            <section.icon className="h-4 w-4" />
                                        </div>
                                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">{section.title}</h2>
                                    </div>
                                    <p className="text-lg text-muted-foreground leading-relaxed italic border-l-2 border-secondary/20 pl-6 py-2 bg-white/50 rounded-r-2xl">
                                        {section.content}
                                    </p>
                                </div>
                            ))}

                            <div className="bg-white rounded-3xl p-8 md:p-12 border border-border/50 space-y-6 shadow-sm">
                                <h3 className="text-xl font-bold">Termination</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                                </p>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="border-none shadow-sm bg-secondary/5 sticky top-24">
                                <CardContent className="p-8 space-y-6">
                                    <div className="h-12 w-12 rounded-2xl bg-secondary text-white flex items-center justify-center shadow-lg shadow-secondary/20">
                                        <Scale className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-xl">Agreement</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            These Terms and Conditions constitute the entire agreement between you and {settings.appName} regarding our Service.
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-secondary/10 flex flex-col gap-3">
                                        <p className="text-xs font-bold uppercase tracking-widest text-secondary/60">Questions?</p>
                                        <p className="text-sm font-medium">
                                            Please contact us at:<br />
                                            <a href={`mailto:${settings.supportEmail}`} className="underline underline-offset-4 hover:text-secondary">
                                                {settings.supportEmail}
                                            </a>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
