import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { Product } from "@/types";
import { Spinner } from "../ui/Spinner";
import { Skeleton } from "../ui/Skeleton";

interface ProductGridProps {
    products: Product[];
    loading?: boolean;
    className?: string;
}

export function ProductGrid({ products, loading, className }: ProductGridProps) {
    if (loading && products.length === 0) {
        return (
            <div className={cn("grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4", className)}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-4">
                        <Skeleton className="aspect-square w-full rounded-2xl md:rounded-3xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-1/4" />
                            <Skeleton className="h-4 w-3/4" />
                            <div className="flex justify-between items-center pt-2">
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex h-[400px] w-full flex-col items-center justify-center text-center gap-4">
                <h3 className="text-xl font-serif font-semibold">No products found</h3>
                <p className="text-muted-foreground max-w-sm">
                    We couldn't find any products matching your criteria. Try adjusting your filters or search query.
                </p>
            </div>
        );
    }

    return (
        <div className={cn("grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4", className)}>
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
            {loading && (
                <>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={`load-more-${i}`} className="flex flex-col gap-4">
                            <Skeleton className="aspect-square w-full rounded-2xl md:rounded-3xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-1/4" />
                                <Skeleton className="h-4 w-3/4" />
                                <div className="flex justify-between items-center pt-2">
                                    <Skeleton className="h-5 w-1/3" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
