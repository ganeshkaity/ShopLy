"use client";

import React, { useEffect, useRef, useState } from "react";
import { getTShirtConfig, TShirtConfig, TShirtColor, TShirtSize, TShirtQuality } from "@/services/tshirt.service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn, formatCurrency } from "@/lib/utils";
import { Upload, X, Check, Shirt, AlertTriangle, Star, Palette, ChevronRight, Ruler, ArrowRight, ShoppingBag, Minus, Plus, Type } from "lucide-react";

// ── Text colour palette ──────────────────────────────────────────────────────
const TEXT_COLORS = [
    { label: "Black",  hex: "#000000" },
    { label: "White",  hex: "#FFFFFF" },
    { label: "Red",    hex: "#ef4444" },
    { label: "Blue",   hex: "#3b82f6" },
    { label: "Gold",   hex: "#eab308" },
    { label: "Green",  hex: "#22c55e" },
];

export default function TShirtPrintingPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { addItem } = useCart();
    const router = useRouter();

    const [config, setConfig] = useState<TShirtConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);

    // ── Design image ──────────────────────────────────────────────────────────
    const [designImage, setDesignImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Design overlay drag / resize ──────────────────────────────────────────
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const [isResizing, setIsResizing] = useState(false);
    const [resizeStart, setResizeStart] = useState({ y: 0, initialScale: 1 });

    // ── Custom text ───────────────────────────────────────────────────────────
    const [customText, setCustomText] = useState("");
    const [textColor, setTextColor] = useState("#000000");
    const [textScale, setTextScale] = useState(1);
    const [textPosition, setTextPosition] = useState({ x: 0, y: 60 }); // start below image
    const [isDraggingText, setIsDraggingText] = useState(false);
    const [textDragStart, setTextDragStart] = useState({ x: 0, y: 0 });

    const [isResizingText, setIsResizingText] = useState(false);
    const [textResizeStart, setTextResizeStart] = useState({ y: 0, initialScale: 1 });

    // ── Selections ────────────────────────────────────────────────────────────
    const [selectedColor, setSelectedColor] = useState<TShirtColor | null>(null);
    const [selectedSize, setSelectedSize] = useState<TShirtSize | null>(null);
    const [selectedQuality, setSelectedQuality] = useState<TShirtQuality | null>(null);
    const [printSide, setPrintSide] = useState<'front' | 'back'>('front');
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");

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

    // ── Image upload ──────────────────────────────────────────────────────────
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

    // ── Image drag handlers ───────────────────────────────────────────────────
    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        const bound = 150;
        let newX = e.clientX - dragStart.x;
        let newY = e.clientY - dragStart.y;
        newX = Math.max(-bound, Math.min(bound, newX));
        newY = Math.max(-bound, Math.min(bound, newY));
        setPosition({ x: newX, y: newY });
    };
    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    // ── Image resize handlers ─────────────────────────────────────────────────
    const handleResizePointerDown = (e: React.PointerEvent) => {
        e.stopPropagation();
        setIsResizing(true);
        setResizeStart({ y: e.clientY, initialScale: scale });
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const handleResizePointerMove = (e: React.PointerEvent) => {
        if (!isResizing) return;
        const deltaY = e.clientY - resizeStart.y;
        setScale(Math.max(0.2, Math.min(3.0, resizeStart.initialScale + deltaY / 100)));
    };
    const handleResizePointerUp = (e: React.PointerEvent) => {
        setIsResizing(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    // ── Text drag handlers ────────────────────────────────────────────────────
    const handleTextPointerDown = (e: React.PointerEvent) => {
        setIsDraggingText(true);
        setTextDragStart({ x: e.clientX - textPosition.x, y: e.clientY - textPosition.y });
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const handleTextPointerMove = (e: React.PointerEvent) => {
        if (!isDraggingText) return;
        const bound = 150;
        let newX = e.clientX - textDragStart.x;
        let newY = e.clientY - textDragStart.y;
        newX = Math.max(-bound, Math.min(bound, newX));
        newY = Math.max(-bound, Math.min(bound, newY));
        setTextPosition({ x: newX, y: newY });
    };
    const handleTextPointerUp = (e: React.PointerEvent) => {
        setIsDraggingText(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    // ── Text resize handlers ──────────────────────────────────────────────────
    const handleTextResizePointerDown = (e: React.PointerEvent) => {
        e.stopPropagation();
        setIsResizingText(true);
        setTextResizeStart({ y: e.clientY, initialScale: textScale });
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const handleTextResizePointerMove = (e: React.PointerEvent) => {
        if (!isResizingText) return;
        const deltaY = e.clientY - textResizeStart.y;
        setTextScale(Math.max(0.4, Math.min(4.0, textResizeStart.initialScale + deltaY / 80)));
    };
    const handleTextResizePointerUp = (e: React.PointerEvent) => {
        setIsResizingText(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    // ── Add to cart ───────────────────────────────────────────────────────────
    const totalPrice = (selectedQuality?.price || 0) * quantity;

    const handleProceedToCart = () => {
        if (!config || !selectedColor || !selectedSize || !selectedQuality) {
            toast("Please complete all selections", "error");
            return;
        }
        if (!designImage && !customText.trim()) {
            toast("Please upload a design or add custom text", "error");
            return;
        }

        const tshirtId = `tshirt_custom_${Date.now()}`;
        const safePrice = Number(selectedQuality.price) || 0;
        const safeQty   = Number(quantity) || 1;

        const tshirtDetails = {
            designImageBase64: designImage || "",
            customText:        customText.trim(),
            textColor,
            color:     { name: selectedColor.name, hex: selectedColor.hex },
            size:      selectedSize.label,
            quality:   selectedQuality.name,
            printSide,
            notes:     notes.trim(),
        };

        addItem({
            id: tshirtId,
            name: `Custom T-Shirt - ${selectedColor.name}`,
            price: safePrice,
            images: [designImage || ""],
            category: "T-Shirts",
            type: "TSHIRT",
            stock: 999,
            description: "Custom T-Shirt",
            slug: tshirtId,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tshirtDetails,
        } as any, safeQty, undefined, safePrice);

        toast("T-Shirt added to cart!", "success");
        router.push("/checkout");
    };

    // ── Early returns ─────────────────────────────────────────────────────────
    if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
    if (!config?.isServiceActive) return (
        <div className="container-custom py-32 text-center">
            <Shirt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">T-Shirt Printing Coming Soon</h1>
            <p className="text-muted-foreground mt-2">This service is not available right now. Check back later!</p>
        </div>
    );

    const steps = [
        { num: 1, label: "Design",    icon: Upload  },
        { num: 2, label: "Customize", icon: Palette },
        { num: 3, label: "Quality",   icon: Star    },
    ];

    const currentTshirtImage = printSide === 'front' ? '/front.png' : '/back.png';

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
                    <p className="text-white/80 text-lg max-w-xl mx-auto">Upload your design, add custom text, pick your style — delivered to your door.</p>
                </div>
            </div>

            <div className="container-custom py-12">
                {/* Step Indicator */}
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

                {/* ── STEP 1: Upload Design ─────────────────────────────────────────────── */}
                {step === 1 && (
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold font-serif">Upload Your Design</h2>
                            <p className="text-muted-foreground mt-1">PNG, JPG, or WEBP with transparent background works best. You can also just add text in the next step.</p>
                        </div>

                        <div className="mt-8">
                            {designImage ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative w-48 h-48 border border-border rounded-xl bg-gray-50 flex items-center justify-center p-4">
                                        <img src={designImage} alt="Design" className="max-w-full max-h-full object-contain drop-shadow-xl" />
                                    </div>
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

                        <div className="flex justify-end mt-8">
                            <Button
                                className="rounded-full px-8 gap-2"
                                onClick={() => setStep(2)}
                            >
                                Next: Customize <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── STEP 2: Color, Size & Position ───────────────────────────────────── */}
                {step === 2 && (
                    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold font-serif">Customize Your Shirt</h2>
                            <p className="text-muted-foreground mt-1">Drag and resize your design or text on the shirt</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                            {/* Left: Interactive T-Shirt Preview */}
                            <div className="relative flex flex-col items-center gap-4">
                                <div
                                    className="relative w-[300px] h-[360px] rounded-2xl border shadow-sm flex items-center justify-center overflow-hidden touch-none"
                                    style={{ backgroundColor: selectedColor?.hex || "#FFFFFF" }}
                                    ref={containerRef}
                                >
                                    {/* T-Shirt image (transparent PNG, BG colour shows through) */}
                                    <img
                                        src={currentTshirtImage}
                                        alt="T-Shirt"
                                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                        style={{ zIndex: 10 }}
                                    />

                                    {/* Draggable Design Overlay (z-20) */}
                                    {designImage && (
                                        <div
                                            className={cn(
                                                "absolute cursor-move ease-out",
                                                isDragging ? "transition-none" : "transition-transform duration-100"
                                            )}
                                            style={{
                                                top: "30%",
                                                left: "25%",
                                                width: "50%",
                                                height: "40%",
                                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                                zIndex: 20,
                                            }}
                                            onPointerDown={handlePointerDown}
                                            onPointerMove={handlePointerMove}
                                            onPointerUp={handlePointerUp}
                                            onPointerCancel={handlePointerUp}
                                        >
                                            <div className="relative w-full h-full p-1 border-2 border-dashed border-transparent hover:border-primary/60 group rounded-sm">
                                                <img src={designImage} alt="Design" className="w-full h-full object-contain pointer-events-none" />
                                                {/* Resize handle */}
                                                <div
                                                    className="absolute -bottom-2.5 -right-2.5 w-6 h-6 bg-white border-2 border-primary rounded-full cursor-nwse-resize shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-auto"
                                                    onPointerDown={handleResizePointerDown}
                                                    onPointerMove={handleResizePointerMove}
                                                    onPointerUp={handleResizePointerUp}
                                                    onPointerCancel={handleResizePointerUp}
                                                >
                                                    <div className="w-2 h-2 bg-primary rounded-full pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Draggable Text Overlay (z-30) */}
                                    {customText.trim() && (
                                        <div
                                            className={cn(
                                                "absolute cursor-move ease-out select-none",
                                                isDraggingText ? "transition-none" : "transition-transform duration-100"
                                            )}
                                            style={{
                                                top: "55%",
                                                left: "50%",
                                                transform: `translate(calc(-50% + ${textPosition.x}px), ${textPosition.y}px) scale(${textScale})`,
                                                zIndex: 30,
                                                whiteSpace: "nowrap",
                                            }}
                                            onPointerDown={handleTextPointerDown}
                                            onPointerMove={handleTextPointerMove}
                                            onPointerUp={handleTextPointerUp}
                                            onPointerCancel={handleTextPointerUp}
                                        >
                                            <div className="relative group border-2 border-dashed border-transparent hover:border-primary/60 px-2 py-1 rounded">
                                                <span
                                                    className="font-bold text-xl pointer-events-none"
                                                    style={{ color: textColor, textShadow: textColor === "#FFFFFF" ? "0 1px 2px rgba(0,0,0,0.4)" : "none" }}
                                                >
                                                    {customText}
                                                </span>
                                                {/* Text resize handle */}
                                                <div
                                                    className="absolute -bottom-2.5 -right-2.5 w-6 h-6 bg-white border-2 border-primary rounded-full cursor-nwse-resize shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-auto"
                                                    onPointerDown={handleTextResizePointerDown}
                                                    onPointerMove={handleTextResizePointerMove}
                                                    onPointerUp={handleTextResizePointerUp}
                                                    onPointerCancel={handleTextResizePointerUp}
                                                >
                                                    <div className="w-2 h-2 bg-primary rounded-full pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Image Scale Controls */}
                                {designImage && (
                                    <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border shadow-sm">
                                        <span className="text-xs text-muted-foreground font-semibold">Image Size</span>
                                        <button onClick={() => setScale(Math.max(0.2, scale - 0.1))} className="p-1 hover:text-primary"><Minus className="h-4 w-4" /></button>
                                        <span className="text-sm font-bold w-10 text-center">{Math.round(scale * 100)}%</span>
                                        <button onClick={() => setScale(Math.min(3.0, scale + 0.1))} className="p-1 hover:text-primary"><Plus className="h-4 w-4" /></button>
                                    </div>
                                )}

                                {/* Text Scale Controls */}
                                {customText.trim() && (
                                    <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border shadow-sm">
                                        <span className="text-xs text-muted-foreground font-semibold">Text Size</span>
                                        <button onClick={() => setTextScale(Math.max(0.4, textScale - 0.1))} className="p-1 hover:text-primary"><Minus className="h-4 w-4" /></button>
                                        <span className="text-sm font-bold w-10 text-center">{Math.round(textScale * 100)}%</span>
                                        <button onClick={() => setTextScale(Math.min(4.0, textScale + 0.1))} className="p-1 hover:text-primary"><Plus className="h-4 w-4" /></button>
                                    </div>
                                )}
                            </div>

                            {/* Right: Options */}
                            <div className="space-y-7">
                                {/* Print Side */}
                                <div>
                                    <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Print Side</label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setPrintSide('front')}
                                            className={cn("flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all", printSide === 'front' ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground")}
                                        >Front Print</button>
                                        <button
                                            onClick={() => setPrintSide('back')}
                                            className={cn("flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all", printSide === 'back' ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground")}
                                        >Back Print</button>
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
                                                    selectedColor?.id === color.id ? "border-primary scale-110 shadow-lg shadow-primary/30" : "border-transparent hover:border-gray-300"
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

                                {/* Custom Text */}
                                <div>
                                    <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                        <Type className="h-4 w-4 inline mr-2" />Custom Text (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={customText}
                                        onChange={e => setCustomText(e.target.value)}
                                        placeholder="e.g. My Cool Text"
                                        maxLength={40}
                                        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                                    />
                                    {/* Text colour picker */}
                                    {customText.trim() && (
                                        <div className="mt-3">
                                            <p className="text-xs font-semibold text-muted-foreground mb-2">Text Colour</p>
                                            <div className="flex gap-2">
                                                {TEXT_COLORS.map(tc => (
                                                    <button
                                                        key={tc.hex}
                                                        title={tc.label}
                                                        onClick={() => setTextColor(tc.hex)}
                                                        className={cn(
                                                            "h-8 w-8 rounded-full border-4 transition-all hover:scale-110",
                                                            textColor === tc.hex ? "border-primary scale-110 shadow-md" : "border-transparent hover:border-gray-300"
                                                        )}
                                                        style={{ backgroundColor: tc.hex, outline: tc.hex === "#FFFFFF" ? "1px solid #e5e7eb" : "none" }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-8 border-t">
                            <Button variant="outline" className="rounded-full px-6" onClick={() => setStep(1)}>Back</Button>
                            <Button
                                className="rounded-full px-8 gap-2"
                                onClick={() => setStep(3)}
                                disabled={!selectedColor || !selectedSize}
                            >
                                Next: Quality <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── STEP 3: Quality & Finalize ────────────────────────────────────────── */}
                {step === 3 && (
                    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* Notes */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground">Notes for Seller (Optional)</label>
                                <textarea
                                    className="w-full rounded-2xl border border-border p-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none shadow-sm"
                                    rows={4}
                                    placeholder="E.g., Please ensure the design is centered high on the chest..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            {/* Summary & Checkout */}
                            <div className="bg-white rounded-3xl border p-6 shadow-sm space-y-6">
                                {config!.isOrderStopped && (
                                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex gap-3">
                                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                                        <div>
                                            <p className="font-bold text-amber-800 text-sm">Orders Temporarily Paused</p>
                                            <p className="text-amber-700 text-xs mt-1">{config!.temporaryStopMessage}</p>
                                        </div>
                                    </div>
                                )}

                                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Summary</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-muted-foreground">Color</span> <span className="font-semibold">{selectedColor?.name}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Size</span> <span className="font-semibold">{selectedSize?.label}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Quality</span> <span className="font-semibold">{selectedQuality?.name || "—"}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Print Side</span> <span className="font-semibold capitalize">{printSide}</span></div>
                                    {customText.trim() && <div className="flex justify-between"><span className="text-muted-foreground">Custom Text</span> <span className="font-semibold truncate max-w-[120px]">{customText}</span></div>}
                                </div>
                                <hr />
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-sm">Quantity:</span>
                                    <div className="flex items-center rounded-full border border-border bg-gray-50 px-2 h-10">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 hover:text-primary transition-colors">-</button>
                                        <span className="w-8 text-center font-bold">{quantity}</span>
                                        <button onClick={() => setQuantity(Math.min(50, quantity + 1))} className="w-8 hover:text-primary transition-colors">+</button>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between pt-2">
                                    <span className="text-muted-foreground font-medium">Total</span>
                                    <span className="text-3xl font-extrabold text-primary">{formatCurrency(totalPrice)}</span>
                                </div>

                                <Button
                                    className="w-full rounded-full h-12 text-lg gap-2"
                                    onClick={handleProceedToCart}
                                    disabled={config!.isOrderStopped || !selectedQuality}
                                >
                                    <ShoppingBag className="h-5 w-5" />
                                    {config!.isOrderStopped ? "Orders Paused" : "Add to Cart & Checkout"}
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-start">
                            <Button variant="outline" className="rounded-full px-6" onClick={() => setStep(2)}>Back</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
