"use client";

import { Skeleton } from "../ui/Skeleton";

export function ProductDetailsSkeleton() {
    return (
        <div className="container-custom pt-4 md:pt-6 pb-8 md:pb-16 flex flex-col gap-6">
            {/* Breadcrumbs Skeleton */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-4 w-32 rounded-full hidden md:block" />
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                {/* Left: Image Gallery Skeleton */}
                <div className="flex flex-col gap-4">
                    <Skeleton className="aspect-square w-full rounded-2xl" />
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="aspect-square w-full rounded-xl" />
                        ))}
                    </div>
                </div>

                {/* Right: Product Info Skeleton */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-4 w-32 rounded-full" />
                        </div>
                        <Skeleton className="h-10 w-3/4 rounded-lg md:h-12" />
                    </div>

                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-32 rounded-lg" />
                        <Skeleton className="h-6 w-24 rounded-lg" />
                    </div>
                    <Skeleton className="h-4 w-24 rounded-full -mt-4 opacity-60" />

                    {/* Variants Skeleton */}
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-4 w-24 rounded-full" />
                        <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-thin-pink pb-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-8 w-20 rounded shrink-0" />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full rounded-full" />
                        <Skeleton className="h-4 w-full rounded-full" />
                        <Skeleton className="h-4 w-2/3 rounded-full" />
                    </div>

                    <Skeleton className="h-px w-full" />

                    {/* Controls Skeleton */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-32 rounded-full" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-24 rounded-full" />
                                <Skeleton className="h-3 w-16 rounded-full" />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Skeleton className="h-14 flex-grow rounded-full" />
                            <Skeleton className="h-14 flex-grow rounded-full" />
                        </div>
                    </div>

                    {/* Value Props Skeleton */}
                    <div className="grid grid-cols-3 gap-4 mt-4 py-4 border-y border-border/20">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col items-center gap-3">
                                <Skeleton className="h-12 w-12 md:h-14 md:w-14 rounded-full" />
                                <Skeleton className="h-3 w-full rounded-full" />
                                <Skeleton className="h-3 w-2/3 rounded-full md:hidden" />
                            </div>
                        ))}
                    </div>

                    {/* Detailed Info Skeleton */}
                    <div className="mt-8 space-y-4">
                        <Skeleton className="h-6 w-40 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full rounded-full" />
                            <Skeleton className="h-4 w-full rounded-full" />
                            <Skeleton className="h-4 w-full rounded-full" />
                            <Skeleton className="h-4 w-3/4 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations Skeleton */}
            <div className="mt-20 flex flex-col gap-12">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48 rounded-lg" />
                    <Skeleton className="h-4 w-20 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="aspect-square w-full rounded-xl" />
                            <Skeleton className="h-4 w-3/4 rounded-full" />
                            <Skeleton className="h-3 w-1/2 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
