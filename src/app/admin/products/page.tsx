"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types";
import { deleteProduct } from "@/services/product.service";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { getCategories } from "@/services/category.service";
import { Category } from "@/types";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const { toast } = useToast();

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [productsSnap, categoriesData] = await Promise.all([
                getDocs(collection(db, "products")),
                getCategories()
            ]);

            const prodData = productsSnap.docs.map(d => ({
                id: d.id, ...d.data(),
                createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt,
                updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() || d.data().updatedAt,
            })) as Product[];

            setProducts(prodData);
            setCategories(categoriesData);
        } catch (error) {
            console.error(error);
            toast("Failed to load initial data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInitialData(); }, []);

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
                <Link href="/admin/products/new">
                    <Button className="rounded-full"><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
                </Link>
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
                                    {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill className="object-cover" unoptimized /> : <Package className="h-8 w-8 text-muted-foreground/20 m-auto" />}
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
                                    <Link href={`/admin/products/edit/${product.id}`}>
                                        <Button variant="outline" size="icon" className="h-8 w-8"><Pencil className="h-3 w-3" /></Button>
                                    </Link>
                                    <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(product.id)}><Trash2 className="h-3 w-3" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
