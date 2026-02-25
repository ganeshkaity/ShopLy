"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types";
import { ProductForm } from "@/components/admin/ProductForm";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const docSnap = await getDoc(doc(db, "products", id));
                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
                } else {
                    toast("Product not found", "error");
                }
            } catch (error) {
                console.error(error);
                toast("Failed to load product", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div className="flex h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;
    if (!product) return <div className="text-center py-20">Product not found.</div>;

    return (
        <div className="container-custom py-8">
            <ProductForm initialData={product} productId={id} isEdit />
        </div>
    );
}
