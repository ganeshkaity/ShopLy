"use client";

import React, { useEffect, useRef, useState } from "react";
import { getTShirtConfig, createTShirtOrder, TShirtConfig, TShirtColor, TShirtSize, TShirtQuality } from "@/services/tshirt.service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";
import { cn, formatCurrency } from "@/lib/utils";
import { Upload, X, Check, Shirt, AlertTriangle, Star, Palette, ChevronRight, Ruler, Package, ArrowRight, ShoppingBag } from "lucide-react";

export default function TShirtPrintingPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [config, setConfig] = useState<TShirtConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Design
    const [designImage, setDesignImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Selections
    const [selectedColor, setSelectedColor] = useState<TShirtColor | null>(null);
    const [selectedSize, setSelectedSize] = useState<TShirtSize | null>(null);
    const [selectedQuality, setSelectedQuality] = useState<TShirtQuality | null>(null);
    const [quantity, setQuantity] = useState(1);

    // Shipping
    const [shipping, setShipping] = useState({
        fullName: user?.displayName || "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
    });

    useEffect(() => {
        getTShirtConfig().then(cfg => {
            setConfig(cfg);
            const firstColor = cfg.colors.find(c => c.isActive);
            const firstSize = cfg.sizes.find(s => s.isActive);
            const firstQuality = cfg.qualities.find(q => q.isActive);
            if (firstColor) setSelectedColor(firstColor);
            if (firstSize) setSelectedSize(firstSize);
            if (firstQuality) setSelectedQuality(firstQuality);
        }).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (user) {
            setShipping(prev => ({ ...prev, fullName: user.displayName || "" }));
        }
    }, [user]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { toast("Max 10MB image size", "error"); return; }

        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX = 800;
                const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
                setDesignImage(canvas.toDataURL("image/png", 0.85));
            };
            img.src = ev.target!.result as string;
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const totalPrice = (selectedQuality?.price || 0) * quantity;

    const handlePlaceOrder = async () => {
        if (!config || !user || !selectedColor || !selectedSize || !selectedQuality || !designImage) {
            toast("Please complete all selections", "error");
            return;
        }
        if (!shipping.fullName || !shipping.phone || !shipping.addressLine1 || !shipping.city || !shipping.state || !shipping.pincode) {
            toast("Please fill all shipping details", "error");
            return;
        }
        setSubmitting(true);
        try {
            await createTShirtOrder({
                userId: user.uid,
                userName: user.displayName || "User",
                userEmail: user.email || "",
                phone: shipping.phone,
                designImageBase64: designImage,
                color: selectedColor,
                size: selectedSize,
                quality: selectedQuality,
                quantity,
                totalPrice,
                shippingAddress: shipping,
                status: "Pending",
            });
            toast("Order placed! We'll contact you soon.", "success");
            setStep(5); // success step
        } catch (e) {
            toast("Failed to place order", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
    if (!config?.isServiceActive) return (
        <div className="container-custom py-32 text-center">
            <Shirt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">T-Shirt Printing Coming Soon</h1>
            <p className="text-muted-foreground mt-2">This service is not available right now. Check back later!</p>
        </div>
    );

    const steps = [
        { num: 1, label: "Design", icon: Upload },
        { num: 2, label: "Customize", icon: Palette },
        { num: 3, label: "Quality", icon: Star },
        { num: 4, label: "Checkout", icon: ShoppingBag },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50/30">
            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary/90 to-rose-600 text-white py-16 px-4">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
                <div className="container-custom relative text-center">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-4">
                        <Shirt className="h-4 w-4" /> Custom T-Shirt Printing
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">Design Your Perfect Shirt</h1>
                    <p className="text-white/80 text-lg max-w-xl mx-auto">Upload your design, pick your style, and we'll print it with love. Delivered to your door.</p>
                </div>
            </div>

            <div className="container-custom py-12">
                {/* Step Indicator */}
                {step < 5 && (
                    <div className="flex items-center justify-center gap-2 mb-10">
                        {steps.map((s, idx) => (
                            <React.Fragment key={s.num}>
                                <button
                                    onClick={() => step > s.num && setStep(s.num)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                                        step === s.num ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105" :
                                            step > s.num ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30" :
                                                "bg-gray-100 text-muted-foreground"
                                    )}
                                >
                                    {step > s.num ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                                    <span className="hidden sm:block">{s.label}</span>
                                </button>
                                {idx < steps.length - 1 && (
                                    <ChevronRight className={cn("h-4 w-4 shrink-0", step > s.num ? "text-primary" : "text-gray-300")} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* STEP 1: Upload Design */}
                {step === 1 && (
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold font-serif">Upload Your Design</h2>
                            <p className="text-muted-foreground mt-1">PNG, JPG, or WEBP with transparent background works best</p>
                        </div>

                        <div className="relative">
                            {/* T-shirt mockup */}
                            <div className="relative mx-auto w-72 h-80 select-none">
                                {/* T-shirt SVG shape */}
                                <svg viewBox="0 0 300 340" className="absolute inset-0 w-full h-full drop-shadow-2xl" style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))" }}>
                                    <path
                                        d="M100,20 L70,10 L20,50 L50,80 L50,320 L250,320 L250,80 L280,50 L230,10 L200,20 C190,60 110,60 100,20 Z"
                                        fill={selectedColor?.hex || "#FFFFFF"}
                                        stroke="#e5e7eb"
                                        strokeWidth="2"
                                    />
                                </svg>
                                {/* Design overlay */}
                                {designImage && (
                                    <div className="absolute" style={{ top: "30%", left: "25%", width: "50%", height: "40%" }}>
                                        <img src={designImage} alt="Design" className="w-full h-full object-contain" />
                                    </div>
                                )}
                            </div>

                            {/* Upload area */}
                            <div className="mt-8">
                                {designImage ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-3">
                                            <Check className="h-5 w-5 text-green-600" />
                                            <span className="font-semibold text-green-700">Design uploaded!</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button variant="outline" className="rounded-full gap-2" onClick={() => fileInputRef.current?.click()}>
                                                <Upload className="h-4 w-4" /> Change Design
                                            </Button>
                                            <Button variant="outline" className="rounded-full gap-2 text-red-500 border-red-200 hover:bg-red-50" onClick={() => setDesignImage(null)}>
                                                <X className="h-4 w-4" /> Remove
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="tshirt-design-upload"
                                        className="flex flex-col items-center gap-4 p-10 border-2 border-dashed border-primary/30 rounded-3xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 group"
                                    >
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                                            <Upload className="h-8 w-8 text-primary" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-lg">Click to upload your design</p>
                                            <p className="text-muted-foreground text-sm mt-1">PNG, JPG, WEBP up to 10MB</p>
                                        </div>
                                    </label>
                                )}
                                <input id="tshirt-design-upload" type="file" className="hidden" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} />
                            </div>
                        </div>

                        <div className="flex justify-end mt-8">
                            <Button
                                className="rounded-full px-8 gap-2"
                                onClick={() => setStep(2)}
                                disabled={!designImage}
                            >
                                Next: Customize <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Color & Size */}
                {step === 2 && (
                    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold font-serif">Choose Color & Size</h2>
                            <p className="text-muted-foreground mt-1">Pick the shirt color and your size</p>
                        </div>

                        {/* Live preview */}
                        <div className="flex justify-center">
                            <div className="relative w-44 h-48">
                                <svg viewBox="0 0 300 340" className="absolute inset-0 w-full h-full drop-shadow-xl transition-all duration-500">
                                    <path
                                        d="M100,20 L70,10 L20,50 L50,80 L50,320 L250,320 L250,80 L280,50 L230,10 L200,20 C190,60 110,60 100,20 Z"
                                        fill={selectedColor?.hex || "#FFFFFF"}
                                        stroke="#e5e7eb"
                                        strokeWidth="2"
                                    />
                                </svg>
                                {designImage && (
                                    <div className="absolute" style={{ top: "30%", left: "25%", width: "50%", height: "40%" }}>
                                        <img src={designImage} alt="Design" className="w-full h-full object-contain" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Colors */}
                        <div>
                            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                <Palette className="h-4 w-4 inline mr-2" />Color: <span className="text-foreground">{selectedColor?.name}</span>
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {config!.colors.filter(c => c.isActive).map(color => (
                                    <button
                                        key={color.id}
                                        onClick={() => setSelectedColor(color)}
                                        title={color.name}
                                        className={cn(
                                            "h-11 w-11 rounded-full border-4 transition-all duration-200 hover:scale-110",
                                            selectedColor?.id === color.id
                                                ? "border-primary scale-110 shadow-lg shadow-primary/30"
                                                : "border-transparent hover:border-gray-300"
                                        )}
                                        style={{ backgroundColor: color.hex, outline: color.hex === "#FFFFFF" ? "1px solid #e5e7eb" : "none" }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Sizes */}
                        <div>
                            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                <Ruler className="h-4 w-4 inline mr-2" />Size: <span className="text-foreground">{selectedSize?.label}</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {config!.sizes.filter(s => s.isActive).map(size => (
                                    <button
                                        key={size.id}
                                        onClick={() => setSelectedSize(size)}
                                        className={cn(
                                            "min-w-[52px] px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all duration-200 hover:scale-105",
                                            selectedSize?.id === size.id
                                                ? "border-primary bg-primary text-white shadow-md shadow-primary/30"
                                                : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                                        )}
                                    >
                                        {size.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" className="rounded-full px-6" onClick={() => setStep(1)}>Back</Button>
                            <Button className="rounded-full px-8 gap-2" onClick={() => setStep(3)} disabled={!selectedColor || !selectedSize}>
                                Next: Quality <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Quality */}
                {step === 3 && (
                    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold font-serif">Select T-Shirt Quality</h2>
                            <p className="text-muted-foreground mt-1">Choose the quality tier that suits you best</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {config!.qualities.filter(q => q.isActive).map((quality) => (
                                <button
                                    key={quality.id}
                                    onClick={() => setSelectedQuality(quality)}
                                    className={cn(
                                        "text-left p-5 rounded-3xl border-2 transition-all duration-300 hover:shadow-lg group",
                                        selectedQuality?.id === quality.id
                                            ? "border-primary bg-primary/5 shadow-md shadow-primary/20"
                                            : "border-border hover:border-primary/40"
                                    )}
                                >
                                    {quality.imageUrl && (
                                        <img src={quality.imageUrl} alt={quality.name} className="w-full h-32 object-cover rounded-xl mb-4 border border-border" />
                                    )}
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg">{quality.name}</h3>
                                        {selectedQuality?.id === quality.id && (
                                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                                                <Check className="h-3.5 w-3.5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{quality.description}</p>
                                    <p className="text-2xl font-extrabold text-primary">{formatCurrency(quality.price)}</p>
                                    <p className="text-xs text-muted-foreground">per shirt</p>
                                </button>
                            ))}
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4">
                            <span className="font-semibold text-sm">Quantity:</span>
                            <div className="flex items-center rounded-full border border-border bg-white px-2">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:text-primary transition-colors">-</button>
                                <span className="w-10 text-center font-bold">{quantity}</span>
                                <button onClick={() => setQuantity(Math.min(50, quantity + 1))} className="p-2 hover:text-primary transition-colors">+</button>
                            </div>
                            <div className="ml-auto">
                                <span className="text-sm text-muted-foreground">Total: </span>
                                <span className="text-xl font-extrabold text-primary">{formatCurrency(totalPrice)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" className="rounded-full px-6" onClick={() => setStep(2)}>Back</Button>
                            <Button className="rounded-full px-8 gap-2" onClick={() => setStep(4)} disabled={!selectedQuality}>
                                Next: Checkout <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 4: Checkout */}
                {step === 4 && (
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold font-serif">Shipping Details</h2>
                            <p className="text-muted-foreground mt-1">Where should we deliver your shirt?</p>
                        </div>

                        {/* Order Stopped Banner */}
                        {config!.isOrderStopped && (
                            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex gap-4">
                                <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-amber-800">Orders Temporarily Paused</p>
                                    <p className="text-amber-700 text-sm mt-1">{config!.temporaryStopMessage}</p>
                                </div>
                            </div>
                        )}

                        {/* Order summary */}
                        <div className="bg-white rounded-3xl border p-5 space-y-3 shadow-sm">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Order Summary</h3>
                            <div className="flex items-center gap-4">
                                <div className="relative w-14 h-14">
                                    <svg viewBox="0 0 300 340" className="w-full h-full">
                                        <path d="M100,20 L70,10 L20,50 L50,80 L50,320 L250,320 L250,80 L280,50 L230,10 L200,20 C190,60 110,60 100,20 Z" fill={selectedColor?.hex || "#fff"} stroke="#e5e7eb" strokeWidth="4" />
                                    </svg>
                                    {designImage && <img src={designImage} alt="Design" className="absolute" style={{ top: "30%", left: "25%", width: "50%", height: "40%", objectFit: "contain" }} />}
                                </div>
                                <div className="flex-grow text-sm space-y-1">
                                    <p><b>Color:</b> {selectedColor?.name} | <b>Size:</b> {selectedSize?.label} | <b>Qty:</b> {quantity}</p>
                                    <p><b>Quality:</b> {selectedQuality?.name}</p>
                                    <p className="text-primary font-bold text-lg">{formatCurrency(totalPrice)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Shipping form */}
                        <div className="bg-white rounded-3xl border p-6 shadow-sm space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Full Name *" value={shipping.fullName} onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })} />
                                <Input label="Phone *" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} />
                            </div>
                            <Input label="Address Line 1 *" value={shipping.addressLine1} onChange={(e) => setShipping({ ...shipping, addressLine1: e.target.value })} />
                            <Input label="Address Line 2" value={shipping.addressLine2} onChange={(e) => setShipping({ ...shipping, addressLine2: e.target.value })} />
                            <div className="grid grid-cols-3 gap-4">
                                <Input label="City *" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
                                <Input label="State *" value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} />
                                <Input label="Pincode *" value={shipping.pincode} onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" className="rounded-full px-6" onClick={() => setStep(3)}>Back</Button>
                            <Button
                                className="rounded-full px-8 gap-2"
                                onClick={handlePlaceOrder}
                                isLoading={submitting}
                                disabled={config!.isOrderStopped}
                            >
                                {config!.isOrderStopped ? "Orders Paused" : "Place Order"}
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 5: Success */}
                {step === 5 && (
                    <div className="max-w-lg mx-auto text-center animate-in fade-in zoom-in duration-500 py-12 space-y-6">
                        <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                            <Check className="h-12 w-12 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold">Order Placed! 🎉</h2>
                        <p className="text-muted-foreground text-lg">Your custom T-shirt order has been received. Our team will review it and reach out to you soon!</p>
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
                            <AlertTriangle className="h-4 w-4 inline mr-2" />
                            Note: Orders are currently reviewed manually. You'll be contacted at the email or phone you provided.
                        </div>
                        <Button className="rounded-full px-8" onClick={() => window.location.href = "/"}>Back to Home</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
