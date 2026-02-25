"use client";

import { useEffect, useState } from "react";
import imageCompression from 'browser-image-compression';
import { useRouter } from "next/navigation";
import { Product, ProductType, Category } from "@/types";
import { createProduct, updateProduct } from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { Plus, X, Upload, ArrowLeft } from "lucide-react";
import { uploadFile, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ProductCard } from "@/components/products/ProductCard";

interface ProductFormProps {
    initialData?: Partial<Product>;
    productId?: string;
    isEdit?: boolean;
}

const EMPTY_PRODUCT: any = {
    name: "", description: "", price: 0, compareAtPrice: 0,
    category: "", images: [], stock: 0, type: "PHYSICAL",
    isActive: true, weight: 0, productDetails: "", minOrderQty: 1,
    freeShipping: false, returnAvailable: false, returnDays: 7,
    codAvailable: false, securePayment: true,
};

export function ProductForm({ initialData, productId, isEdit }: ProductFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [formData, setFormData] = useState(initialData || EMPTY_PRODUCT);
    const [categories, setCategories] = useState<Category[]>([]);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageInputMode, setImageInputMode] = useState<Record<string, 'upload' | 'link'>>({ cover: 'upload', additional: 'upload' });
    const [tempUrl, setTempUrl] = useState({ cover: '', additional: '' });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.error(error);
                toast("Failed to load categories", "error");
            }
        };
        fetchCategories();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const options = {
                maxSizeMB: isCover ? 0.05 : 0.07,
                maxWidthOrHeight: 1200,
                useWebWorker: true,
                initialQuality: 0.8,
                fileType: 'image/webp' as const
            };

            const compressedFile = await imageCompression(file, options);
            const timestamp = Date.now();
            const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
            const webpName = `${timestamp}_${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}.webp`;
            const url = await uploadFile(PRODUCT_IMAGES_BUCKET, webpName, compressedFile, 'image/webp');

            setFormData((prev: any) => {
                const newImages = [...(prev.images || [])];
                if (isCover) {
                    if (newImages.length === 0) newImages.push(url);
                    else newImages[0] = url;
                } else {
                    if (newImages.length === 0) newImages.push("");
                    newImages.push(url);
                }
                return { ...prev, images: newImages };
            });
            toast("Image uploaded successfully", "success");
        } catch (error: any) {
            toast(error.message || "Failed to upload image", "error");
        } finally {
            setUploadingImage(false);
            e.target.value = "";
        }
    };

    const handleAddImageUrl = (isCover: boolean) => {
        const urlValue = isCover ? tempUrl.cover : tempUrl.additional;
        if (!urlValue.trim()) return;

        setFormData((prev: any) => {
            const newImages = [...(prev.images || [])];
            if (isCover) {
                if (newImages.length === 0) newImages.push(urlValue);
                else newImages[0] = urlValue;
            } else {
                if (newImages.length === 0) newImages.push("");
                newImages.push(urlValue);
            }
            return { ...prev, images: newImages };
        });

        setTempUrl(prev => ({ ...prev, [isCover ? 'cover' : 'additional']: '' }));
        toast("Image link added", "success");
    };

    const removeImage = (index: number) => {
        setFormData((prev: any) => {
            const newImages = [...prev.images];
            if (index === 0 && newImages.length > 1) {
                newImages.shift();
            } else if (index === 0) {
                newImages[0] = "";
            } else {
                newImages.splice(index, 1);
            }
            if (newImages.length === 1 && !newImages[0]) return { ...prev, images: [] };
            return { ...prev, images: newImages };
        });
    };

    const handleSave = async () => {
        if (!formData.name || !formData.category || !formData.price) {
            toast("Please fill all required fields", "error"); return;
        }
        setSaving(true);
        try {
            if (isEdit && productId) {
                await updateProduct(productId, formData);
                toast("Product updated!", "success");
            } else {
                await createProduct(formData as any);
                toast("Product created!", "success");
            }
            router.push("/admin/products");
            router.refresh();
        } catch (error: any) {
            toast(error.message || "Failed to save product", "error");
        } finally { setSaving(false); }
    };

    // Prepare preview product data
    const previewProduct: Product = {
        id: "preview",
        slug: "preview",
        name: formData.name || "Product Name",
        description: formData.description || "Short description...",
        price: formData.price || 0,
        compareAtPrice: formData.compareAtPrice || 0,
        category: formData.category || "Uncategorized",
        images: formData.images?.filter((img: string) => !!img) || [],
        stock: formData.stock || 0,
        type: formData.type || "PHYSICAL",
        isActive: formData.isActive || true,
        weight: formData.weight || 0,
        productDetails: formData.productDetails || "",
        minOrderQty: formData.minOrderQty || 1,
        freeShipping: !!formData.freeShipping,
        returnAvailable: !!formData.returnAvailable,
        returnDays: formData.returnDays || 7,
        codAvailable: !!formData.codAvailable,
        securePayment: formData.securePayment !== undefined ? formData.securePayment : true,
        secondaryTag: formData.secondaryTag || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    return (
        <div className="space-y-12">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="font-serif text-3xl font-bold">{isEdit ? "Edit Product" : "New Product"}</h1>
                    <p className="text-muted-foreground">Fill in the details below to {isEdit ? "update" : "create"} your product.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Name *" value={formData.name} onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))} />
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Category *</label>
                                    <select className="w-full rounded-lg border border-border bg-white p-2.5 text-sm outline-none" value={formData.category} onChange={(e) => setFormData((prev: any) => ({ ...prev, category: e.target.value }))}>
                                        <option value="">Select</option>
                                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <Input label="Secondary Tag (e.g. 2026 Edition)" value={formData.secondaryTag} onChange={(e) => setFormData((prev: any) => ({ ...prev, secondaryTag: e.target.value }))} />

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Short Description</label>
                                <textarea className="w-full rounded-lg border border-border bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[60px]" value={formData.description} onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))} placeholder="Brief summary for product cards..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Product Details (Markdown Supported)</label>
                                <textarea className="w-full rounded-lg border border-border bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] font-mono" value={formData.productDetails} onChange={(e) => setFormData((prev: any) => ({ ...prev, productDetails: e.target.value }))} placeholder="**Bold**, *Italic*, - List items, 1. Numbered items..." />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Input label="Price *" type="number" value={formData.price} onChange={(e) => setFormData((prev: any) => ({ ...prev, price: Number(e.target.value) }))} />
                                <Input label="Compare Price" type="number" value={formData.compareAtPrice} onChange={(e) => setFormData((prev: any) => ({ ...prev, compareAtPrice: Number(e.target.value) }))} />
                                <Input label="Stock" type="number" value={formData.stock} onChange={(e) => setFormData((prev: any) => ({ ...prev, stock: Number(e.target.value) }))} />
                                <Input label="Min Order Qty" type="number" value={formData.minOrderQty} onChange={(e) => setFormData((prev: any) => ({ ...prev, minOrderQty: Number(e.target.value) }))} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Type</label>
                                    <select className="w-full rounded-lg border border-border bg-white p-2.5 text-sm outline-none" value={formData.type} onChange={(e) => setFormData((prev: any) => ({ ...prev, type: e.target.value as any }))}>
                                        <option value="PHYSICAL">Physical</option>
                                        <option value="DIGITAL">Digital</option>
                                    </select>
                                </div>
                                <Input label="Weight (g)" type="number" value={formData.weight} onChange={(e) => setFormData((prev: any) => ({ ...prev, weight: Number(e.target.value) }))} />
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-border space-y-4">
                                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500">Product Features (Max 3 visible)</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" checked={formData.freeShipping} onChange={(e) => setFormData((prev: any) => ({ ...prev, freeShipping: e.target.checked }))} />
                                        <span className="text-sm font-medium">Free Shipping</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" checked={formData.codAvailable} onChange={(e) => setFormData((prev: any) => ({ ...prev, codAvailable: e.target.checked }))} />
                                        <span className="text-sm font-medium">COD Available</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" checked={formData.securePayment} onChange={(e) => setFormData((prev: any) => ({ ...prev, securePayment: e.target.checked }))} />
                                        <span className="text-sm font-medium">Secure Payment</span>
                                    </label>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" checked={formData.returnAvailable} onChange={(e) => setFormData((prev: any) => ({ ...prev, returnAvailable: e.target.checked }))} />
                                            <span className="text-sm font-medium">Return Available</span>
                                        </label>
                                        {formData.returnAvailable && (
                                            <div className="ml-7 flex items-center gap-2">
                                                <select
                                                    className="text-xs rounded border border-border bg-white p-1 outline-none"
                                                    value={formData.returnDays}
                                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, returnDays: Number(e.target.value) }))}
                                                >
                                                    {[3, 7, 10, 15, 30].map(day => (
                                                        <option key={day} value={day}>{day} Days</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-border pt-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-sm font-medium">Cover Image (Required)</label>
                                        <div className="flex border border-border rounded-lg overflow-hidden text-[10px] font-bold">
                                            <button type="button" onClick={() => setImageInputMode(p => ({ ...p, cover: 'upload' }))} className={cn("px-3 py-1.5 transition-colors", imageInputMode.cover === 'upload' ? "bg-primary text-white" : "bg-white hover:bg-gray-50")}>UPLOAD</button>
                                            <button type="button" onClick={() => setImageInputMode(p => ({ ...p, cover: 'link' }))} className={cn("px-3 py-1.5 transition-colors", imageInputMode.cover === 'link' ? "bg-primary text-white" : "bg-white hover:bg-gray-50")}>LINK</button>
                                        </div>
                                    </div>
                                    {formData.images?.[0] ? (
                                        <div className="relative h-40 w-40 border border-border rounded-xl overflow-hidden mb-3">
                                            <Image src={formData.images[0]} alt="Cover" fill className="object-cover" unoptimized />
                                            <Button type="button" variant="outline" size="icon" className="absolute top-2 right-2 h-7 w-7 bg-white/80 hover:bg-white text-red-500 border-none shadow-sm" onClick={() => removeImage(0)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <Badge className="absolute bottom-2 left-2 text-[10px] shadow-sm" variant="secondary">Cover</Badge>
                                        </div>
                                    ) : (
                                        <div className="mb-3">
                                            {imageInputMode.cover === 'upload' ? (
                                                <>
                                                    <input type="file" id="cover-upload" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, true)} disabled={uploadingImage} />
                                                    <label htmlFor="cover-upload" className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-accent transition-colors">
                                                        {uploadingImage ? <Spinner size="sm" /> : (
                                                            <>
                                                                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                                                                <span className="text-xs font-medium text-muted-foreground">Upload Cover</span>
                                                            </>
                                                        )}
                                                    </label>
                                                </>
                                            ) : (
                                                <div className="flex flex-col gap-2 max-w-md">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="url"
                                                            placeholder="Paste image URL here..."
                                                            className="flex-grow rounded-lg border border-border bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                                            value={tempUrl.cover}
                                                            onChange={(e) => setTempUrl(prev => ({ ...prev, cover: e.target.value }))}
                                                        />
                                                        <Button type="button" onClick={() => handleAddImageUrl(true)}>Add</Button>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground italic">Provide a direct path to an image (e.g. .jpg, .png)</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-sm font-medium">Additional Images</label>
                                        <div className="flex border border-border rounded-lg overflow-hidden text-[10px] font-bold">
                                            <button type="button" onClick={() => setImageInputMode(p => ({ ...p, additional: 'upload' }))} className={cn("px-3 py-1.5 transition-colors", imageInputMode.additional === 'upload' ? "bg-primary text-white" : "bg-white hover:bg-gray-50")}>UPLOAD</button>
                                            <button type="button" onClick={() => setImageInputMode(p => ({ ...p, additional: 'link' }))} className={cn("px-3 py-1.5 transition-colors", imageInputMode.additional === 'link' ? "bg-primary text-white" : "bg-white hover:bg-gray-50")}>LINK</button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4 mb-3">
                                        {formData.images?.slice(1).map((url: string, i: number) => url ? (
                                            <div key={i} className="relative h-24 w-24 border border-border rounded-xl overflow-hidden shrink-0">
                                                <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" unoptimized />
                                                <Button type="button" variant="outline" size="icon" className="absolute top-1.5 right-1.5 h-6 w-6 bg-white/80 hover:bg-white text-red-500 border-none shadow-sm" onClick={() => removeImage(i + 1)}>
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ) : null)}

                                        {imageInputMode.additional === 'upload' ? (
                                            <>
                                                <input type="file" id="additional-upload" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, false)} disabled={uploadingImage || !formData.images?.[0]} />
                                                <label htmlFor="additional-upload" className={`flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-border rounded-2xl cursor-pointer transition-colors shrink-0 ${!formData.images?.[0] ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent'}`}>
                                                    {uploadingImage ? <Spinner size="sm" /> : <Plus className="h-6 w-6 text-muted-foreground" />}
                                                </label>
                                            </>
                                        ) : (
                                            <div className={cn("flex-grow flex gap-2 min-w-[280px]", !formData.images?.[0] && "opacity-50")}>
                                                <input
                                                    type="url"
                                                    placeholder="Additional image URL..."
                                                    className="flex-grow rounded-lg border border-border bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                                    value={tempUrl.additional}
                                                    onChange={(e) => setTempUrl(prev => ({ ...prev, additional: e.target.value }))}
                                                    disabled={!formData.images?.[0]}
                                                />
                                                <Button type="button" onClick={() => handleAddImageUrl(false)} disabled={!formData.images?.[0]}>Add</Button>
                                            </div>
                                        )}
                                    </div>
                                    {!formData.images?.[0] && <p className="text-xs text-muted-foreground italic">Upload or link a cover image first to add more images.</p>}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end gap-3 pt-6 border-t border-border">
                        <Button variant="outline" size="lg" onClick={() => router.back()} disabled={saving}>Cancel</Button>
                        <Button size="lg" className="min-w-[150px]" onClick={handleSave} isLoading={saving}>{isEdit ? "Update Product" : "Create Product"}</Button>
                    </div>
                </div>

                {/* Preview Column */}
                <div className="space-y-6">
                    <div className="sticky top-24">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-serif text-xl font-bold">Product Card Preview</h3>
                            <Badge variant="outline">Live Update</Badge>
                        </div>
                        <div className="max-w-[280px] mx-auto">
                            <ProductCard product={previewProduct} />
                        </div>
                        <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                            <h4 className="font-bold text-primary mb-2">Editor Tip</h4>
                            <p className="text-sm text-primary/80">Use high-quality vertical images for the best visual appeal in your shop.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("rounded-2xl border border-border bg-white shadow-sm", className)} {...props}>
            {children}
        </div>
    );
}
