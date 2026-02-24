"use client";

import React, { useEffect, useState } from "react";
import {
    Mail,
    Phone,
    MapPin,
    MessageSquare,
    Send,
    Facebook,
    Instagram,
    Clock,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getSettings, DEFAULT_SETTINGS } from "@/services/settings.service";
import { AppSettings } from "@/types";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

export default function ContactPage() {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setFormSubmitted(true);
        toast("Message sent successfully! We'll get back to you soon.", "success");
    };

    const contactMethods = [
        {
            icon: Phone,
            title: "Call Us",
            value: settings.supportPhone,
            desc: "Mon-Sat, 10am - 7pm",
            link: `tel:${settings.supportPhone.replace(/\s/g, '')}`,
            color: "bg-blue-50 text-blue-600"
        },
        {
            icon: Mail,
            title: "Email Us",
            value: settings.supportEmail,
            desc: "We reply within 24 hours",
            link: `mailto:${settings.supportEmail}`,
            color: "bg-purple-50 text-purple-600"
        },
        {
            icon: MessageSquare,
            title: "WhatsApp",
            value: settings.whatsapp,
            desc: "Instant chat support",
            link: `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`,
            color: "bg-green-50 text-green-600"
        }
    ];

    return (
        <div className="flex flex-col gap-0 overflow-hidden">
            {/* --- Hero Section --- */}
            <section className="relative min-h-[45vh] flex items-center justify-center bg-[#fff1f2] py-20 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[60%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="container-custom relative z-10 text-center space-y-6">
                    <Badge variant="secondary" className="bg-white/50 border-primary/10 text-primary px-6 py-1.5 rounded-full animate-in fade-in slide-in-from-bottom duration-500">
                        Get In Touch
                    </Badge>
                    <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom duration-700 delay-100">
                        We'd Love to <span className="text-primary italic">Hear</span> from You
                    </h1>
                    <p className="max-w-xl mx-auto text-lg text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
                        Have a question about our collections or need a custom gift solution? Our team is here to help make your moments special.
                    </p>
                </div>
            </section>

            {/* --- Contact Info Grid --- */}
            <section className="py-12 -mt-16 relative z-20">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {contactMethods.map((method, i) => (
                            <Link key={method.title} href={method.link} target={method.title === "WhatsApp" ? "_blank" : undefined}>
                                <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group h-full">
                                    <CardContent className="p-8 flex items-center gap-6">
                                        <div className={`h-14 w-14 rounded-2xl ${method.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                            <method.icon className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-gray-900">{method.title}</h3>
                                            <p className="text-sm font-medium text-primary">{method.value}</p>
                                            <p className="text-xs text-muted-foreground">{method.desc}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Form & Address Section --- */}
            <section className="py-24 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Form Side */}
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <h2 className="font-serif text-4xl font-bold">Send an Inquiry</h2>
                                <p className="text-muted-foreground">Fill out the form below and we'll get back to you shortly.</p>
                            </div>

                            {formSubmitted ? (
                                <div className="bg-green-50 rounded-3xl p-12 text-center space-y-4 animate-in zoom-in duration-500">
                                    <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                                        <CheckCircle2 className="h-10 w-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-green-900">Message Received!</h3>
                                    <p className="text-green-800/70">Thank you for reaching out. We've received your message and will respond via email within 24 hours.</p>
                                    <Button
                                        variant="outline"
                                        className="mt-4 border-green-200 text-green-700 hover:bg-green-100"
                                        onClick={() => setFormSubmitted(false)}
                                    >
                                        Send Another Message
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Full Name" placeholder="John Doe" required />
                                        <Input label="Email Address" type="email" placeholder="john@example.com" required />
                                    </div>
                                    <Input label="Subject" placeholder="How can we help?" required />
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Message</label>
                                        <textarea
                                            className="w-full rounded-2xl border border-border bg-gray-50/50 p-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[150px] transition-all focus:bg-white"
                                            placeholder="Write your message here..."
                                            required
                                        />
                                    </div>
                                    <Button size="lg" className="w-full md:w-fit px-12 h-14 rounded-full shadow-lg shadow-primary/20" disabled={isSubmitting}>
                                        {isSubmitting ? "Sending..." : "Send Message"} <Send className="ml-2 h-4 w-4" />
                                    </Button>
                                </form>
                            )}
                        </div>

                        {/* Info Side */}
                        <div className="lg:pl-12 space-y-12">
                            <div className="bg-gray-50 rounded-3xl p-10 space-y-10">
                                <div className="space-y-6">
                                    <h3 className="font-serif text-2xl font-bold">Visit Our Studio</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-sm uppercase tracking-wider text-gray-400">Location</p>
                                                <p className="text-muted-foreground leading-relaxed">{settings.address}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-sm uppercase tracking-wider text-gray-400">Working Hours</p>
                                                <p className="text-muted-foreground leading-relaxed">Mon - Sat: 10:00 AM - 07:00 PM<br />Sunday: Closed</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="font-serif text-2xl font-bold">Follow Our Story</h3>
                                    <div className="flex gap-4">
                                        {[
                                            { icon: Facebook, link: settings.facebook, label: "Facebook" },
                                            { icon: Instagram, link: settings.instagram, label: "Instagram" }
                                        ].map((social) => (
                                            <Link key={social.label} href={social.link} target="_blank">
                                                <Button variant="outline" className="h-12 w-12 rounded-xl p-0 hover:bg-primary hover:text-white hover:border-primary transition-all">
                                                    <social.icon className="h-5 w-5" />
                                                </Button>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Map Placeholder */}
                            <div className="relative h-64 w-full rounded-3xl overflow-hidden bg-gray-100 border border-border/50 group">
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-accent/30 gap-3 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                    <MapPin className="h-10 w-10 text-primary animate-bounce" />
                                    <p className="text-sm font-semibold tracking-wide text-muted-foreground">Interactive Map Coming Soon</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
