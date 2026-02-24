"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types";
import { createProduct, updateProduct, deleteProduct } from "@/services/product.service";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { PRODUCT_CATEGORIES } from "@/constants";
import { Plus, Pencil, Trash2, Search, Package, X, Upload } from "lucide-react";
import { uploadFile, generateFilePath, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase";
import { ProductType } from "@/types";

const EMPTY_PRODUCT: {
    name: string; description: string; price: number; compareAtPrice: number;
    category: string; images: string[]; stock: number; type: ProductType;
    isActive: boolean; weight: number;
} = {
    name: "", description: "", price: 0, compareAtPrice: 0,
    category: "", images: [], stock: 0, type: "PHYSICAL",
    isActive: true, weight: 0,
};

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [formData, setFormData] = useState(EMPTY_PRODUCT);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const path = generateFilePath('products', file.name);
            const url = await uploadFile(PRODUCT_IMAGES_BUCKET, path, file);

            setFormData(prev => {
                const newImages = [...prev.images];
                if (isCover) {
                    if (newImages.length === 0) newImages.push(url);
                    else newImages[0] = url;
                } else {
                    if (newImages.length === 0) newImages.push(""); // ensure cover slot exists
                    newImages.push(url);
                }
                return { ...prev, images: newImages };
            });
            toast("Image uploaded successfully", "success");
        } catch (error: any) {
            toast(error.message || "Failed to upload image", "error");
        } finally {
            setUploadingImage(false);
            e.target.value = ""; // clear input
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => {
            const newImages = [...prev.images];
            if (index === 0 && newImages.length > 1) {
                newImages.shift(); // remove cover, next image becomes cover
            } else if (index === 0) {
                newImages[0] = ""; // clear cover but keep array structure if no other images
            } else {
                newImages.splice(index, 1);
            }
            // cleanup if array is just empty strings
            if (newImages.length === 1 && !newImages[0]) return { ...prev, images: [] };
            return { ...prev, images: newImages };
        });
    };

    const fetchProducts = async () => {
        try {
            const snap = await getDocs(collection(db, "products"));
            const data = snap.docs.map(d => ({
                id: d.id, ...d.data(),
                createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt,
                updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() || d.data().updatedAt,
            })) as Product[];
            setProducts(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProducts(); }, []);

    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData(EMPTY_PRODUCT);
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name, description: product.description, price: product.price,
            compareAtPrice: product.compareAtPrice || 0, category: product.category,
            images: product.images || [], stock: product.stock, type: product.type,
            isActive: product.isActive, weight: product.weight || 0,
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.category || !formData.price) {
            toast("Please fill all required fields", "error"); return;
        }
        setSaving(true);
        try {
            if (editingProduct?.id) {
                await updateProduct(editingProduct.id, formData);
                toast("Product updated!", "success");
            } else {
                await createProduct(formData as any);
                toast("Product created!", "success");
            }
            setIsModalOpen(false);
            await fetchProducts();
        } catch (error: any) {
            toast(error.message || "Failed to save product", "error");
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
            toast("Product deleted", "success");
        } catch (error) { toast("Failed to delete", "error"); }
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) return <div className="flex h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="font-serif text-3xl font-bold">Products ({products.length})</h1>
                <Button onClick={openCreateModal} className="rounded-full"><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Search products..." className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground"><Package className="h-16 w-16 mx-auto mb-4 opacity-20" /><p>No products found.</p></div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {filtered.map((product) => (
                        <Card key={product.id}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                                    {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill className="object-cover" /> : <Package className="h-8 w-8 text-muted-foreground/20 m-auto" />}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="font-medium truncate">{product.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="text-[10px]">{product.category}</Badge>
                                        <span className="text-sm font-bold">{formatCurrency(product.price)}</span>
                                        <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                                        {!product.isActive && <Badge variant="destructive" className="text-[10px]">Inactive</Badge>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditModal(product)}><Pencil className="h-3 w-3" /></Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(product.id)}><Trash2 className="h-3 w-3" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? "Edit Product" : "New Product"}>
                <div className="space-y-4">
                    <Input label="Name *" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Description</label>
                        <textarea className="w-full rounded-lg border border-border bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Price *" type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))} />
                        <Input label="Compare At Price" type="number" value={formData.compareAtPrice} onChange={(e) => setFormData(prev => ({ ...prev, compareAtPrice: Number(e.target.value) }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Category *</label>
                            <select className="w-full rounded-lg border border-border bg-white p-2.5 text-sm outline-none" value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}>
                                <option value="">Select</option>
                                {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <Input label="Stock" type="number" value={formData.stock} onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Type</label>
                            <select className="w-full rounded-lg border border-border bg-white p-2.5 text-sm outline-none" value={formData.type} onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}>
                                <option value="PHYSICAL">Physical</option>
                                <option value="DIGITAL">Digital</option>
                            </select>
                        </div>
                        {/* Empty div to preserve grid layout previously held by Image URL */}
                        <div></div>
                    </div>

                    <div className="space-y-4 border-t border-border pt-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Cover Image (Required)</label>
                            {formData.images[0] ? (
                                <div className="relative h-32 w-32 border border-border rounded-lg overflow-hidden mb-3">
                                    <Image src={formData.images[0]} alt="Cover" fill className="object-cover" />
                                    <Button variant="outline" size="icon" className="absolute top-1 right-1 h-6 w-6 bg-white/80 hover:bg-white text-red-500 border-none shadow-sm" onClick={() => removeImage(0)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <Badge className="absolute bottom-1 left-1 text-[10px] shadow-sm" variant="secondary">Cover</Badge>
                                </div>
                            ) : (
                                <div className="mb-3">
                                    <input type="file" id="cover-upload" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, true)} disabled={uploadingImage} />
                                    <label htmlFor="cover-upload" className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                                        {uploadingImage ? <Spinner size="sm" /> : (
                                            <>
                                                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                                                <span className="text-xs font-medium text-muted-foreground">Upload Cover</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Additional Images</label>
                            <div className="flex flex-wrap gap-3 mb-3">
                                {formData.images.slice(1).map((url, i) => url ? (
                                    <div key={i} className="relative h-20 w-20 border border-border rounded-lg overflow-hidden shrink-0">
                                        <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" />
                                        <Button variant="outline" size="icon" className="absolute top-1 right-1 h-5 w-5 bg-white/80 hover:bg-white text-red-500 border-none shadow-sm" onClick={() => removeImage(i + 1)}>
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : null)}

                                <input type="file" id="additional-upload" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, false)} disabled={uploadingImage || !formData.images[0]} />
                                <label htmlFor="additional-upload" className={`flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-border rounded-lg cursor-pointer transition-colors shrink-0 ${!formData.images[0] ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent'}`}>
                                    {uploadingImage ? <Spinner size="sm" /> : <Plus className="h-5 w-5 text-muted-foreground" />}
                                </label>
                            </div>
                            {!formData.images[0] && <p className="text-xs text-muted-foreground">Upload a cover image first to add more images.</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} isLoading={saving}>{editingProduct ? "Update" : "Create"}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
