import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { Product } from "@/types";
import { Spinner } from "../ui/Spinner";

interface ProductGridProps {
    products: Product[];
    loading?: boolean;
    className?: string;
}

export function ProductGrid({ products, loading, className }: ProductGridProps) {
    if (loading && products.length === 0) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Spinner size="lg" />
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
                <div className="col-span-full flex justify-center py-8">
                    <Spinner />
                </div>
            )}
        </div>
    );
}
