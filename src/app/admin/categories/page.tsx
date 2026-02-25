"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { getCategories, createCategory, updateCategory, deleteCategory, uploadCategoryImage } from "@/services/category.service";
import { compressImage } from "@/lib/image-utils";
import { Category } from "@/types";
import { Loader2, Plus, Trash2, Edit2, ImageIcon, Power, CheckCircle2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminCategoriesPage() {
    const { toast } = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
    const [uploadStatus, setUploadStatus] = useState<{ stage: 'compressing' | 'uploading' | 'done' } | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            toast("Failed to load categories", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setEditingCategory({
            name: "",
            backgroundImage: "",
            isActive: true,
        });
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category? This might affect products using it.")) return;
        try {
            await deleteCategory(id);
            toast("Category deleted", "success");
            fetchCategories();
        } catch (error) {
            toast("Failed to delete category", "error");
        }
    };

    const handleToggleActive = async (category: Category) => {
        try {
            await updateCategory(category.id, { isActive: !category.isActive });
            toast(`Category ${!category.isActive ? 'activated' : 'deactivated'}`, "success");
            fetchCategories();
        } catch (error) {
            toast("Failed to update status", "error");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadStatus({ stage: 'compressing' });
            const compressedBlob = await compressImage(file, {
                targetSizeKB: 200 // Background images can be slightly larger
            });
            const compressedFile = new File([compressedBlob], `category-${Date.now()}.webp`, { type: 'image/webp' });

            setUploadStatus({ stage: 'uploading' });
            const url = await uploadCategoryImage(compressedFile, `categories/${Date.now()}`);

            setEditingCategory(prev => ({ ...prev, backgroundImage: url }));
            setUploadStatus({ stage: 'done' });
            toast("Image uploaded & optimized", "success");

            setTimeout(() => setUploadStatus(null), 2000);
        } catch (error: any) {
            setUploadStatus(null);
            toast(error.message || "Upload failed", "error");
        }
    };

    const handleSave = async () => {
        if (!editingCategory?.name || !editingCategory.backgroundImage) {
            toast("Name and Background Image are required", "error");
            return;
        }

        setSaving(true);
        try {
            if (editingCategory?.id) {
                await updateCategory(editingCategory.id, editingCategory);
                toast("Category updated", "success");
            } else {
                await createCategory(editingCategory as Omit<Category, 'id' | 'slug' | 'createdAt' | 'updatedAt'>);
                toast("Category created", "success");
            }
            setIsEditing(false);
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            toast("Failed to save category", "error");
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
                    <h1 className="font-serif text-3xl font-bold">Categories Management</h1>
                    <p className="text-muted-foreground mt-1">Manage product categories and their showcase visuals.</p>
                </div>
                {!isEditing && (
                    <Button onClick={handleAddNew} className="rounded-full px-6">
                        <Plus className="h-4 w-4 mr-2" /> Add New Category
                    </Button>
                )}
            </div>

            {isEditing ? (
                <Card className="border-primary/20 shadow-xl shadow-primary/5">
                    <CardContent className="p-8 space-y-8">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                {editingCategory?.id ? <Edit2 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                                {editingCategory?.id ? "Edit Category" : "Create New Category"}
                            </h2>
                            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
                            {/* Left Side: Media Upload */}
                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-gray-700">Category Background Image</label>
                                <div className="aspect-video bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-100 overflow-hidden relative group/img flex items-center justify-center ring-offset-4 ring-primary/5 hover:ring-2 transition-all">
                                    {editingCategory?.backgroundImage ? (
                                        <>
                                            <img src={editingCategory.backgroundImage} alt="Category Preview" className="w-full h-full object-cover" />
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
                                                <span className="text-xs text-muted-foreground mt-1">Recommended width: 800px+</span>
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

                            {/* Right Side: Content & Settings */}
                            <div className="space-y-6">
                                <Input
                                    label="Category Name"
                                    placeholder="e.g. Greeting Cards"
                                    value={editingCategory?.name}
                                    onChange={(e) => setEditingCategory({ ...editingCategory!, name: e.target.value })}
                                />

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg w-fit">
                                        <button
                                            type="button"
                                            onClick={() => setEditingCategory({ ...editingCategory!, isActive: !editingCategory?.isActive })}
                                            className={cn(
                                                "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                                                editingCategory?.isActive ? "bg-green-500 text-white shadow-lg" : "bg-gray-200 text-gray-500"
                                            )}
                                        >
                                            <Power className="h-5 w-5" />
                                        </button>
                                        <span className="text-sm font-semibold">{editingCategory?.isActive ? 'Active' : 'Hidden'}</span>
                                    </div>
                                </div>

                                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                                    <h4 className="font-bold text-sm text-primary uppercase tracking-wider mb-2">Category Tips</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Categories with high-quality background images perform better.
                                        Images will be used as background for cards on the home page.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Discard</Button>
                            <Button onClick={handleSave} isLoading={saving} className="px-8 rounded-full">Save Category</Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <Card key={category.id} className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-none bg-white">
                            <div className="aspect-video relative">
                                <img src={category.backgroundImage} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                    <h3 className="text-white font-bold text-xl leading-tight truncate">
                                        {category.name}
                                    </h3>

                                    <div className="flex items-center gap-3 mt-4">
                                        <Button size="sm" variant="secondary" className="bg-white/10 border-white/20 backdrop-blur-md text-white hover:bg-white hover:text-primary rounded-full" onClick={() => handleEdit(category)}>
                                            <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
                                        </Button>
                                        <Button size="sm" variant="secondary" className="bg-red-500/10 border-red-500/20 backdrop-blur-md text-red-500 hover:bg-red-500 hover:text-white rounded-full" onClick={() => handleDelete(category.id)}>
                                            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                                        </Button>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 flex flex-col gap-2 scale-90 origin-top-right">
                                    <Badge className={cn("rounded-full border-none shadow-lg", category.isActive ? "bg-green-500/90" : "bg-red-500/90")}>
                                        {category.isActive ? "Live" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {categories.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-[2rem] bg-gray-50/50">
                            <div className="h-16 w-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="h-8 w-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No categories yet</h3>
                            <p className="text-sm text-gray-500 mt-1">Create your first product category.</p>
                            <Button variant="outline" className="mt-6 rounded-full" onClick={handleAddNew}>
                                <Plus className="h-4 w-4 mr-2" /> Add Your First Category
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
