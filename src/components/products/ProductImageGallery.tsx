"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface ImageGalleryProps {
    images: string[];
    name: string;
}

export function ProductImageGallery({ images, name }: ImageGalleryProps) {
    const [activeImage, setActiveImage] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-gray-50 text-primary/10">
                <Star className="h-32 w-32" fill="currentColor" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
                <Image
                    src={images[activeImage]}
                    alt={name}
                    fill
                    className="object-cover object-center"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                />
            </div>

            {images.length > 1 && (
                <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveImage(idx)}
                            className={cn(
                                "relative h-14 w-14 md:h-20 md:w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                                activeImage === idx ? "border-primary scale-105" : "border-transparent opacity-70 hover:opacity-100"
                            )}
                        >
                            <Image src={img} alt={`${name} ${idx + 1}`} fill className="object-cover" unoptimized />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
