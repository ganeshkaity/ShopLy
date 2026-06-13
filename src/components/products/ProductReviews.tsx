"use client";

import React, { useState, useEffect, useRef } from "react";
import { ProductReview } from "@/types";
import { getProductReviews, addProductReview } from "@/services/review.service";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { compressImageToBase64 } from "@/services/user.service";
import { Star, Image as ImageIcon, X, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductReviewsProps {
    productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isWriting, setIsWriting] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const data = await getProductReviews(productId);
            setReviews(data);
        } catch (error) {
            console.error("Failed to load reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Check size ~5MB limit for Base64 processing memory
        if (file.size > 5 * 1024 * 1024) {
            toast("Image must be smaller than 5MB", "error");
            return;
        }

        try {
            toast("Compressing image...", "info");
            // Compress very small for firestore limit
            const base64 = await compressImageToBase64(file, 400, 0.6);
            
            // Check rough string size (Firestore doc limit 1MB)
            if (base64.length > 800000) {
                toast("Image is too complex, please choose a simpler photo.", "error");
                return;
            }
            
            setImagePreview(base64);
        } catch (error) {
            toast("Failed to process image", "error");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast("Please login to write a review.", "error");
            return;
        }
        if (!comment.trim()) {
            toast("Review comment is required.", "error");
            return;
        }

        setSubmitting(true);
        try {
            await addProductReview({
                productId,
                userId: user.uid,
                userName: user.displayName || "Anonymous User",
                userAvatar: user.photoURL || null,
                rating,
                comment: comment.trim(),
                imageBase64: imagePreview || null,
            });
            
            toast("Review submitted successfully!", "success");
            setComment("");
            setRating(5);
            setImagePreview(null);
            setIsWriting(false);
            fetchReviews();
        } catch (error) {
            console.error(error);
            toast("Failed to submit review", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    return (
        <div className="space-y-8 mt-16 border-t border-border pt-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900">Customer Reviews</h2>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={cn("w-5 h-5", parseFloat(averageRating) >= star ? "fill-amber-400" : "fill-gray-200 text-gray-200")} />
                            ))}
                        </div>
                        <span className="text-lg font-bold">{averageRating} out of 5</span>
                        <span className="text-muted-foreground">({reviews.length} reviews)</span>
                    </div>
                </div>
                
                <Button 
                    onClick={() => {
                        if (!user) {
                            toast("Please login to write a review.", "info");
                            return;
                        }
                        setIsWriting(!isWriting);
                    }}
                    className="rounded-full"
                    variant={isWriting ? "outline" : "primary"}
                >
                    {isWriting ? "Cancel Review" : "Write a Review"}
                </Button>
            </div>

            {isWriting && (
                <Card className="border-primary/20 shadow-xl shadow-primary/5 animate-in slide-in-from-top-4">
                    <CardContent className="p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Your Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star className={cn("w-8 h-8", rating >= star ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-300")} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold mb-2">Review Comment</label>
                                <textarea
                                    className="w-full rounded-2xl border border-input bg-transparent p-4 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 resize-y min-h-[120px]"
                                    placeholder="Share your experience with this product..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Attach Photo (Optional)</label>
                                {imagePreview ? (
                                    <div className="relative inline-block border rounded-2xl overflow-hidden shadow-sm">
                                        <img src={imagePreview} alt="Review preview" className="w-32 h-32 object-cover" />
                                        <button 
                                            type="button" 
                                            onClick={() => setImagePreview(null)}
                                            className="absolute top-1 right-1 bg-black/50 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground"
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                        <span>Click to add photo</span>
                                    </button>
                                )}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>

                            <div className="flex justify-end pt-4 border-t border-border">
                                <Button type="submit" isLoading={submitting} className="rounded-full px-8">
                                    Submit Review
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-16 bg-gray-50/50 rounded-[2rem] border border-dashed border-border">
                    <p className="text-gray-500 font-medium">No reviews yet. Be the first to share your thoughts!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map((review) => (
                        <Card key={review.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        {review.userAvatar ? (
                                            <img src={review.userAvatar} alt={review.userName} className="w-10 h-10 rounded-full object-cover shadow-sm border border-border" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <User className="w-5 h-5" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">{review.userName}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={cn("w-3.5 h-3.5", i < review.rating ? "fill-amber-400" : "fill-gray-200 text-gray-200")} />
                                        ))}
                                    </div>
                                </div>
                                
                                <p className="text-sm text-gray-700 leading-relaxed mb-4">"{review.comment}"</p>
                                
                                {review.imageBase64 && (
                                    <div className="rounded-xl overflow-hidden border border-border">
                                        <img src={review.imageBase64} alt="Review" className="w-full h-32 object-cover hover:scale-105 transition-transform duration-500" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
