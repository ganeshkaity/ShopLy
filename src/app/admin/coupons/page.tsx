"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Coupon } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";

const EMPTY_COUPON = { code: "", discountPercent: 10, maxDiscount: 100, minOrderAmount: 200, isActive: true, validUntil: "" };

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [formData, setFormData] = useState(EMPTY_COUPON);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const fetchCoupons = async () => {
        try {
            const snap = await getDocs(collection(db, "coupons"));
            setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Coupon[]);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleSave = async () => {
        if (!formData.code || !formData.discountPercent) { toast("Fill required fields", "error"); return; }
        setSaving(true);
        try {
            if (editingCoupon?.id) {
                await updateDoc(doc(db, "coupons", editingCoupon.id), { ...formData, updatedAt: serverTimestamp() });
                toast("Coupon updated!", "success");
            } else {
                await addDoc(collection(db, "coupons"), { ...formData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
                toast("Coupon created!", "success");
            }
            setIsModalOpen(false);
            await fetchCoupons();
        } catch (error: any) { toast(error.message || "Failed", "error"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this coupon?")) return;
        try {
            await deleteDoc(doc(db, "coupons", id));
            setCoupons(prev => prev.filter(c => c.id !== id));
            toast("Coupon deleted", "success");
        } catch (error) { toast("Failed to delete", "error"); }
    };

    if (loading) return <div className="flex h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-serif text-3xl font-bold">Coupons ({coupons.length})</h1>
                <Button onClick={() => { setEditingCoupon(null); setFormData(EMPTY_COUPON); setIsModalOpen(true); }} className="rounded-full"><Plus className="h-4 w-4 mr-2" /> Add Coupon</Button>
            </div>

            {coupons.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground"><Tag className="h-16 w-16 mx-auto mb-4 opacity-20" /><p>No coupons yet.</p></div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {coupons.map((coupon) => (
                        <Card key={coupon.id}>
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-mono font-bold text-lg tracking-wider">{coupon.code}</p>
                                        <Badge variant={coupon.isActive ? "success" : "destructive"}>{coupon.isActive ? "Active" : "Inactive"}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{coupon.discountPercent}% off (max ₹{coupon.maxDiscount}) &bull; Min order ₹{coupon.minOrderAmount}</p>
                                    {coupon.validUntil && <p className="text-xs text-muted-foreground mt-1">Expires: {coupon.validUntil}</p>}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { setEditingCoupon(coupon); setFormData({ code: coupon.code, discountPercent: coupon.discountPercent, maxDiscount: coupon.maxDiscount, minOrderAmount: coupon.minOrderAmount, isActive: coupon.isActive, validUntil: coupon.validUntil || "" }); setIsModalOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(coupon.id!)}><Trash2 className="h-3 w-3" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCoupon ? "Edit Coupon" : "New Coupon"}>
                <div className="space-y-4">
                    <Input label="Code *" value={formData.code} onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))} placeholder="SAVE10" />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Discount %" type="number" value={formData.discountPercent} onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: Number(e.target.value) }))} />
                        <Input label="Max Discount (₹)" type="number" value={formData.maxDiscount} onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: Number(e.target.value) }))} />
                    </div>
                    <Input label="Min Order Amount (₹)" type="number" value={formData.minOrderAmount} onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: Number(e.target.value) }))} />
                    <Input label="Valid Until" type="date" value={formData.validUntil} onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))} />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} isLoading={saving}>{editingCoupon ? "Update" : "Create"}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
