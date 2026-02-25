"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { getPopups, createPopup, updatePopup, deletePopup, uploadPopupImage } from "@/services/popup.service";
import { compressImage } from "@/lib/image-utils";
import { PromoPopup } from "@/types";
import { Loader2, Plus, Trash2, Edit2, ImageIcon, Link as LinkIcon, CheckCircle2, MessageSquare, Power, Clock, Code, Layout } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminPopupsPage() {
    const { toast } = useToast();
    const [popups, setPopups] = useState<PromoPopup[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingPopup, setEditingPopup] = useState<Partial<PromoPopup> | null>(null);
    const [uploadStatus, setUploadStatus] = useState<{ stage: 'compressing' | 'uploading' | 'done' } | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPopups();
    }, []);

    const fetchPopups = async () => {
        try {
            const data = await getPopups();
            setPopups(data);
        } catch (error) {
            console.error("Failed to fetch popups:", error);
            toast("Failed to load popups", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (popup: PromoPopup) => {
        setEditingPopup(popup);
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setEditingPopup({
            type: 'DEFAULT',
            title: "",
            description: "",
            imageUrl: "",
            link: "",
            buttonText: "Shop Now",
            isActive: true,
            showDelay: 3,
            htmlContent: ""
        });
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this popup?")) return;
        try {
            await deletePopup(id);
            toast("Popup deleted", "success");
            fetchPopups();
        } catch (error) {
            toast("Failed to delete popup", "error");
        }
    };

    const handleToggleActive = async (popup: PromoPopup) => {
        try {
            await updatePopup(popup.id, { isActive: !popup.isActive });
            toast(`Popup ${!popup.isActive ? 'activated' : 'deactivated'}`, "success");
            fetchPopups();
        } catch (error) {
            toast("Failed to update status", "error");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadStatus({ stage: 'compressing' });
            // For IMAGE_ONLY, we might want slightly higher quality or support GIFs
            const compressedBlob = await compressImage(file, {
                targetSizeKB: editingPopup?.type === 'IMAGE_ONLY' ? 200 : 100
            });
            const compressedFile = new File([compressedBlob], `popup-${Date.now()}.webp`, { type: 'image/webp' });

            setUploadStatus({ stage: 'uploading' });
            const url = await uploadPopupImage(compressedFile, `popups/${Date.now()}`);

            setEditingPopup(prev => ({ ...prev, imageUrl: url }));
            setUploadStatus({ stage: 'done' });
            toast("Image uploaded & optimized", "success");

            setTimeout(() => setUploadStatus(null), 2000);
        } catch (error: any) {
            setUploadStatus(null);
            toast(error.message || "Upload failed", "error");
        }
    };

    const handleSave = async () => {
        // Validation based on type
        if (editingPopup?.type === 'DEFAULT') {
            if (!editingPopup.title || !editingPopup.imageUrl) {
                toast("Title and Image are required for Default type", "error");
                return;
            }
        } else if (editingPopup?.type === 'IMAGE_ONLY') {
            if (!editingPopup.imageUrl) {
                toast("Image is required for Image Only type", "error");
                return;
            }
        } else if (editingPopup?.type === 'HTML') {
            if (!editingPopup.htmlContent) {
                toast("HTML Content is required for HTML type", "error");
                return;
            }
        }

        setSaving(true);
        try {
            if (editingPopup?.id) {
                await updatePopup(editingPopup.id, editingPopup);
                toast("Popup updated", "success");
            } else {
                await createPopup(editingPopup as Omit<PromoPopup, 'id' | 'createdAt' | 'updatedAt'>);
                toast("Popup created", "success");
            }
            setIsEditing(false);
            setEditingPopup(null);
            fetchPopups();
        } catch (error) {
            toast("Failed to save popup", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Popups Management</h1>
                    <p className="text-muted-foreground mt-1">Manage promotional popups for your storefront.</p>
                </div>
                {!isEditing && (
                    <Button onClick={handleAddNew} className="rounded-full px-6">
                        <Plus className="h-4 w-4 mr-2" /> Add New Popup
                    </Button>
                )}
            </div>

            {isEditing ? (
                <Card className="border-primary/20 shadow-xl shadow-primary/5">
                    <CardContent className="p-8 space-y-8">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                {editingPopup?.id ? <Edit2 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                                {editingPopup?.id ? "Edit Popup" : "Create New Popup"}
                            </h2>
                            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>

                        <div className="space-y-6">
                            {/* Type Selector */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Select Popup Type</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'DEFAULT', name: 'Default', icon: Layout, desc: 'Image + Title + Description' },
                                        { id: 'IMAGE_ONLY', name: 'Image/GIF Only', icon: ImageIcon, desc: 'Single featured image' },
                                        { id: 'HTML', name: 'Custom HTML', icon: Code, desc: 'Full design control' },
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setEditingPopup({ ...editingPopup!, type: t.id as any })}
                                            className={cn(
                                                "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all text-left",
                                                editingPopup?.type === t.id
                                                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                                                    : "border-gray-100 bg-white hover:border-gray-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
                                                editingPopup?.type === t.id ? "bg-primary text-white" : "bg-gray-50 text-gray-400"
                                            )}>
                                                <t.icon className="h-6 w-6" />
                                            </div>
                                            <div className="text-center">
                                                <div className="font-bold text-gray-900">{t.name}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
                                {/* Left Side: Media Upload or HTML Editor */}
                                {editingPopup?.type !== 'HTML' ? (
                                    <div className="space-y-4">
                                        <label className="text-sm font-semibold text-gray-700">Popup Image {editingPopup?.type === 'IMAGE_ONLY' ? '(GIFs supported)' : ''}</label>
                                        <div className="aspect-square bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-100 overflow-hidden relative group/img flex items-center justify-center ring-offset-4 ring-primary/5 hover:ring-2 transition-all">
                                            {editingPopup?.imageUrl ? (
                                                <>
                                                    <img src={editingPopup.imageUrl} alt="Popup Preview" className="w-full h-full object-cover" />
                                                    {uploadStatus && (
                                                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300">
                                                            {uploadStatus.stage === 'done' ? <CheckCircle2 className="h-10 w-10 text-green-500 animate-bounce" /> : <Loader2 className="h-10 w-10 text-primary animate-spin" />}
                                                            <span className="text-sm font-bold text-gray-900 capitalize">{uploadStatus.stage}...</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                        <label className="cursor-pointer bg-white text-gray-900 px-6 py-2.5 rounded-full text-sm font-bold shadow-2xl hover:scale-105 transition-transform">
                                                            Change Image
                                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                        </label>
                                                    </div>
                                                </>
                                            ) : (
                                                <label className="cursor-pointer flex flex-col items-center gap-4 text-muted-foreground hover:text-primary transition-all group/label">
                                                    <div className="h-16 w-16 rounded-full bg-white shadow-lg flex items-center justify-center group-hover/label:scale-110 transition-transform">
                                                        <Plus className="h-8 w-8 text-primary" />
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="block text-sm font-bold uppercase tracking-widest text-gray-900">Upload Image</span>
                                                        <span className="text-xs text-muted-foreground mt-1">Square images work best</span>
                                                    </div>
                                                    {uploadStatus && (
                                                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300">
                                                            {uploadStatus.stage === 'done' ? <CheckCircle2 className="h-10 w-10 text-green-500 animate-bounce" /> : <Loader2 className="h-10 w-10 text-primary animate-spin" />}
                                                            <span className="text-sm font-bold text-gray-900 capitalize">{uploadStatus.stage}...</span>
                                                        </div>
                                                    )}
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <label className="text-sm font-semibold text-gray-700">Custom HTML Content</label>
                                        <textarea
                                            className="w-full rounded-2xl border border-border bg-gray-50 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20 min-h-[300px]"
                                            placeholder="<div style='...'>Content</div>"
                                            value={editingPopup?.htmlContent}
                                            onChange={(e) => setEditingPopup({ ...editingPopup!, htmlContent: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground italic">Note: Use inline styles for best results. External stylesheets may not load correctly.</p>
                                    </div>
                                )}

                                {/* Right Side: Content & Settings */}
                                <div className="space-y-6">
                                    {editingPopup?.type === 'DEFAULT' && (
                                        <>
                                            <Input
                                                label="Popup Title"
                                                placeholder="e.g. Summer Sale 20% Off!"
                                                value={editingPopup?.title}
                                                onChange={(e) => setEditingPopup({ ...editingPopup!, title: e.target.value })}
                                            />
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium">Description</label>
                                                <textarea
                                                    className="w-full rounded-xl border border-border bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                                                    placeholder="Enter popup message..."
                                                    value={editingPopup?.description}
                                                    onChange={(e) => setEditingPopup({ ...editingPopup!, description: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input
                                                    label="Button Text"
                                                    placeholder="e.g. Shop Now"
                                                    value={editingPopup?.buttonText}
                                                    onChange={(e) => setEditingPopup({ ...editingPopup!, buttonText: e.target.value })}
                                                />
                                                <Input
                                                    label="Redirect Link"
                                                    placeholder="e.g. /products/sale"
                                                    value={editingPopup?.link}
                                                    onChange={(e) => setEditingPopup({ ...editingPopup!, link: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {editingPopup?.type === 'IMAGE_ONLY' && (
                                        <Input
                                            label="Redirect Link (Optional)"
                                            placeholder="e.g. /products/sale"
                                            value={editingPopup?.link}
                                            onChange={(e) => setEditingPopup({ ...editingPopup!, link: e.target.value })}
                                        />
                                    )}

                                    {editingPopup?.type === 'HTML' && (
                                        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                                            <h4 className="font-bold text-sm text-primary uppercase tracking-wider mb-2">HTML Content Mode</h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                In this mode, you have complete control over the popup design.
                                                You can add images, forms, or any other HTML elements.
                                                <br /><br />
                                                <strong>Tip:</strong> Ensure your content is mobile-responsive!
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <Input
                                            label="Show Delay (seconds)"
                                            type="number"
                                            value={editingPopup?.showDelay}
                                            onChange={(e) => setEditingPopup({ ...editingPopup!, showDelay: Number(e.target.value) })}
                                        />
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium">Status</label>
                                            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingPopup({ ...editingPopup!, isActive: !editingPopup?.isActive })}
                                                    className={cn(
                                                        "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                                                        editingPopup?.isActive ? "bg-green-500 text-white shadow-lg" : "bg-gray-200 text-gray-500"
                                                    )}
                                                >
                                                    <Power className="h-5 w-5" />
                                                </button>
                                                <span className="text-sm font-semibold">{editingPopup?.isActive ? 'Active' : 'Hidden'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Discard</Button>
                            <Button onClick={handleSave} isLoading={saving} className="px-8 rounded-full">Save Popup</Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {popups.map((popup) => (
                        <Card key={popup.id} className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-none bg-white">
                            <div className="aspect-[4/5] relative">
                                {popup.type === 'HTML' ? (
                                    <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center p-8 text-white text-center">
                                        <Code className="h-12 w-12 text-primary mb-4" />
                                        <div className="font-bold">HTML Custom Content</div>
                                        <div className="text-xs text-white/50 mt-2">Design managed via code</div>
                                    </div>
                                ) : (
                                    <img src={popup.imageUrl} alt={popup.title || "Popup"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="secondary" className="bg-white/20 text-white border-none text-[10px] uppercase font-bold tracking-tighter">
                                            {popup.type || 'DEFAULT'}
                                        </Badge>
                                    </div>
                                    <h3 className="text-white font-bold text-xl leading-tight truncate">
                                        {popup.type === 'HTML' ? 'Custom Layout' : (popup.title || 'Visual Promotion')}
                                    </h3>
                                    {popup.description && <p className="text-white/80 text-sm mt-1 line-clamp-1">{popup.description}</p>}

                                    <div className="flex items-center gap-3 mt-4">
                                        <Button size="sm" variant="secondary" className="bg-white/10 border-white/20 backdrop-blur-md text-white hover:bg-white hover:text-primary rounded-full" onClick={() => handleEdit(popup)}>
                                            <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
                                        </Button>
                                        <Button size="sm" variant="secondary" className="bg-red-500/10 border-red-500/20 backdrop-blur-md text-red-500 hover:bg-red-500 hover:text-white rounded-full" onClick={() => handleDelete(popup.id)}>
                                            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                                        </Button>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 flex flex-col gap-2 scale-90 origin-top-right">
                                    <Badge className={cn("rounded-full border-none shadow-lg", popup.isActive ? "bg-green-500/90" : "bg-red-500/90")}>
                                        {popup.isActive ? "Live" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {popups.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-[2rem] bg-gray-50/50">
                            <div className="h-16 w-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="h-8 w-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No popups yet</h3>
                            <p className="text-sm text-gray-500 mt-1">Create your first promotional popup to boost sales.</p>
                            <Button variant="outline" className="mt-6 rounded-full" onClick={handleAddNew}>
                                <Plus className="h-4 w-4 mr-2" /> Add Your First Popup
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
