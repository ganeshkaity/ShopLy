"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Search,
    ShoppingCart,
    Heart,
    Menu,
    User,
    X,
    LogOut,
    LayoutDashboard,
    History,
    UserCircle,
    Mic
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";
import { APP_NAME } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

const NAV_LINKS = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "About", href: "/about" },
];

export function Header() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [shouldRenderMenu, setShouldRenderMenu] = React.useState(false);
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
    const [isListening, setIsListening] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isVoiceModalOpen, setIsVoiceModalOpen] = React.useState(false);
    const [transcript, setTranscript] = React.useState("");

    const [barStyles, setBarStyles] = React.useState<{ duration: number; delay: number }[]>([]);

    React.useEffect(() => {
        setBarStyles(
            [...Array(12)].map(() => ({
                duration: 0.4 + Math.random() * 0.4,
                delay: Math.random() * 0.5
            }))
        );
    }, []);

    const { user, logout, isAdmin } = useAuth();
    const { itemCount } = useCart();
    const { items: wishlistItems } = useWishlist();
    const { toast } = useToast();
    const router = useRouter();

    // Handle sidebar animation lifecycle
    React.useEffect(() => {
        if (isMenuOpen) {
            setShouldRenderMenu(true);
        } else {
            const timer = setTimeout(() => {
                setShouldRenderMenu(false);
            }, 300); // Wait for transition-duration 300ms
            return () => clearTimeout(timer);
        }
    }, [isMenuOpen]);

    const handleLogout = async () => {
        try {
            await logout();
            toast("Logged out successfully", "success");
            setIsUserMenuOpen(false);
            router.push("/");
        } catch (error) {
            toast("Failed to logout", "error");
        }
    };

    const handleVoiceSearch = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast("Voice search is not supported in this browser.", "error");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setIsListening(true);
            setIsVoiceModalOpen(true);
            setTranscript("");
        };

        recognition.onresult = (event: any) => {
            const current = event.resultIndex;
            const transcriptText = event.results[current][0].transcript;
            setTranscript(transcriptText);

            // If it's a final result, stop listening animation immediately
            if (event.results[current].isFinal) {
                setIsListening(false);
            }
        };

        recognition.onerror = () => {
            setIsListening(false);
            toast("Voice search failed. Please try again.", "error");
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const confirmVoiceSearch = () => {
        if (transcript.trim()) {
            router.push(`/products?search=${encodeURIComponent(transcript.trim())}`);
            setIsSearchOpen(false);
            setIsVoiceModalOpen(false);
        }
    };

    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b border-border bg-white/80 backdrop-blur-md">
                <div className="container-custom flex h-16 items-center justify-between">
                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-serif text-2xl font-bold tracking-tight text-primary">
                            {APP_NAME}
                        </span>
                    </Link>

                    {/* Desktop Navigation / Inline Search */}
                    <div className={cn(
                        "hidden md:flex flex-1 items-center justify-center px-8 relative",
                        isSearchOpen && "flex absolute inset-0 bg-white z-50 px-4 md:relative md:bg-transparent md:inset-auto md:px-8"
                    )}>
                        {!isSearchOpen ? (
                            <nav className="flex gap-8 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
                                {NAV_LINKS.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                                            pathname === link.href ? "text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className={cn(
                                            "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 whitespace-nowrap",
                                            pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        <LayoutDashboard className="h-4 w-4" /> Admin
                                    </Link>
                                )}
                            </nav>
                        ) : (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const q = formData.get("q") as string;
                                    if (q.trim()) {
                                        router.push(`/products?search=${encodeURIComponent(q.trim())}`);
                                        setIsSearchOpen(false);
                                    }
                                }}
                                className="w-full max-w-lg flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300"
                            >
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        name="q"
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-10 pl-10 pr-10 rounded-full bg-accent border-none outline-none text-sm focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === "Escape") setIsSearchOpen(false);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVoiceSearch}
                                        className={cn(
                                            "absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-all",
                                            isListening ? "text-primary animate-pulse scale-125" : "text-muted-foreground hover:text-primary"
                                        )}
                                    >
                                        <Mic className="h-4 w-4" />
                                    </button>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-red-50 hover:text-red-500"
                                    onClick={() => setIsSearchOpen(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </form>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-4">
                        {!isSearchOpen && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="flex animate-in fade-in zoom-in duration-300"
                                onClick={() => setIsSearchOpen(true)}
                            >
                                <Search className="h-5 w-5" />
                            </Button>
                        )}
                        <Link href="/wishlist">
                            <Button variant="ghost" size="icon" className="hidden sm:flex relative">
                                <Heart className="h-5 w-5" />
                                {wishlistItems.length > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                                        {wishlistItems.length}
                                    </span>
                                )}
                            </Button>
                        </Link>

                        <Link href="/cart">
                            <Button variant="ghost" size="icon" className="relative">
                                <ShoppingCart className="h-5 w-5" />
                                {itemCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                                        {itemCount}
                                    </span>
                                )}
                            </Button>
                        </Link>

                        {user ? (
                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full border border-primary/20 bg-primary/5"
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                >
                                    <UserCircle className="h-6 w-6 text-primary" />
                                </Button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-white p-2 shadow-xl shadow-primary/5 animate-in fade-in zoom-in duration-200 z-50">
                                        <div className="px-3 py-2">
                                            <p className="text-sm font-semibold truncate">{user.displayName}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                        <hr className="my-2 border-border" />
                                        <Link
                                            href="/orders"
                                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <History className="h-4 w-4" /> Order History
                                        </Link>
                                        <Link
                                            href="/account"
                                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <User className="h-4 w-4" /> Account Settings
                                        </Link>
                                        {isAdmin && (
                                            <Link
                                                href="/admin"
                                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent text-primary transition-colors"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                                            </Link>
                                        )}
                                        <hr className="my-2 border-border" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login">
                                <Button size="sm" className="hidden sm:inline-flex rounded-full px-5">
                                    Login
                                </Button>
                                <Button variant="ghost" size="icon" className="sm:hidden">
                                    <User className="h-5 w-5" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar */}
            {shouldRenderMenu && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    {/* Backdrop */}
                    <div
                        className={cn(
                            "fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
                            isMenuOpen ? "opacity-100" : "opacity-0"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                    />

                    {/* Side Panel */}
                    <div
                        className={cn(
                            "fixed inset-y-0 left-0 w-[300px] max-w-[85%] bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col h-screen overflow-hidden",
                            isMenuOpen ? "translate-x-0" : "-translate-x-full"
                        )}
                    >
                        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b bg-white">
                            <span className="font-serif text-xl font-bold text-primary">{APP_NAME}</span>
                            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <nav className="flex flex-col gap-2 p-6 overflow-y-auto bg-white flex-grow overscroll-contain">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={cn(
                                        "px-4 py-3 rounded-xl text-lg font-medium transition-colors",
                                        pathname === link.href ? "bg-primary/10 text-primary" : "text-foreground hover:bg-accent"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={cn(
                                        "px-4 py-3 rounded-xl text-lg font-medium transition-colors text-primary",
                                        pathname.startsWith("/admin") ? "bg-primary/10 font-bold" : "hover:bg-primary/5"
                                    )}
                                >
                                    Admin Dashboard
                                </Link>
                            )}
                            <hr className="my-4 border-border" />
                            <Link
                                href="/wishlist"
                                onClick={() => setIsMenuOpen(false)}
                                className="px-4 py-3 rounded-xl text-lg font-medium flex items-center gap-3 hover:bg-accent transition-colors"
                            >
                                <Heart className="h-5 w-5" /> Wishlist
                            </Link>
                            <Link
                                href="/orders"
                                onClick={() => setIsMenuOpen(false)}
                                className="px-4 py-3 rounded-xl text-lg font-medium flex items-center gap-3 hover:bg-accent transition-colors"
                            >
                                <History className="h-5 w-5" /> My Orders
                            </Link>

                            {!user && (
                                <Link
                                    href="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="mt-4 px-4 py-3 rounded-xl text-lg font-bold bg-primary text-white text-center shadow-lg shadow-primary/20"
                                >
                                    Login / Register
                                </Link>
                            )}
                        </nav>
                    </div>
                </div>
            )}

            {/* Voice Search Modal */}
            {isVoiceModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                        onClick={() => setIsVoiceModalOpen(false)}
                    />

                    <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                        <div className="flex flex-col items-center gap-8">
                            {/* Wave Animation */}
                            <div className="flex items-end justify-center gap-2 h-16 w-full">
                                {barStyles.map((style, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-2 rounded-full flex-shrink-0 transition-opacity",
                                            isListening && "animate-voice-wave"
                                        )}
                                        style={{
                                            backgroundColor: '#f472b6',
                                            height: '8px',
                                            animationDuration: `${style.duration}s`,
                                            animationDelay: `${style.delay}s`,
                                            animationPlayState: isListening ? 'running' : 'paused'
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="text-center space-y-4">
                                <h3 className="text-2xl font-serif font-bold text-primary">
                                    {isListening ? "Listening..." : "Did you say?"}
                                </h3>
                                <p className={cn(
                                    "text-3xl font-medium min-h-[4.5rem] leading-tight",
                                    transcript ? "text-foreground" : "text-muted-foreground italic"
                                )}>
                                    {transcript || "Speak now..."}
                                </p>
                            </div>

                            <div className="flex w-full gap-4 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-14 rounded-2xl text-lg font-bold border-2"
                                    onClick={() => {
                                        setTranscript("");
                                        handleVoiceSearch();
                                    }}
                                >
                                    Retry
                                </Button>
                                <Button
                                    className="flex-1 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
                                    onClick={confirmVoiceSearch}
                                    disabled={!transcript.trim()}
                                >
                                    Search
                                </Button>
                            </div>

                            <button
                                onClick={() => setIsVoiceModalOpen(false)}
                                className="absolute right-6 top-6 rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
