import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import { APP_NAME } from "@/constants";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-border bg-gray-50">
            <div className="container-custom py-12 md:py-16">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="font-serif text-2xl font-bold text-primary">
                            {APP_NAME}
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Premium gift house and stationery store. We bring joy through beautiful handcrafted items and curated stationery.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            {['Home', 'Products', 'Wishlist', 'Cart', 'About Us', 'Contact'].map((item) => (
                                <li key={item}>
                                    <Link
                                        href={`/${item.toLowerCase().replace(' ', '-')}`}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="font-semibold mb-4">Customer Service</h4>
                        <ul className="space-y-2">
                            {['Privacy Policy', 'Terms & Conditions', 'Return Policy', 'Shipping Policy', 'Track Order'].map((item) => (
                                <li key={item}>
                                    <Link
                                        href={`/${item.toLowerCase().replace(/[ &]/g, '-')}`}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold mb-4">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-primary shrink-0" />
                                <span className="text-sm text-muted-foreground">
                                    123 Paper Street, Blossom City,<br />Flower Estate, India - 700001
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-primary shrink-0" />
                                <span className="text-sm text-muted-foreground">+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-primary shrink-0" />
                                <span className="text-sm text-muted-foreground">hello@paperpetals.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {currentYear} {APP_NAME}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 grayscale opacity-60">
                        {/* Payment Icons Placeholder */}
                        <span className="text-[10px] font-bold tracking-widest uppercase">Razorpay Secured</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
