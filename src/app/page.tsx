"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Heart, ShoppingBag, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getProducts } from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import { getSettings, DEFAULT_SETTINGS } from "@/services/settings.service";
import { Product, AppSettings, Category } from "@/types";
import { ProductCard } from "@/components/products/ProductCard";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageLoader } from "@/components/ui/PageLoader";
import { BannerSlider } from "@/components/home/BannerSlider";
import { PromoPopupComponent } from "@/components/home/PromoPopup";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Handle Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // For draggable category scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragAmount, setDragAmount] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    setDragAmount(0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    setDragAmount((prev) => prev + Math.abs(x - startX));
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (dragAmount > 10) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, settingsData, categoriesData] = await Promise.all([
          getProducts({ pageLimit: 20 }),
          getSettings(),
          getCategories(true) // Get only active categories
        ]);
        setProducts(prodData.products);
        setSettings(settingsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {/* {loading && <PageLoader />} */}
      <div className="flex flex-col gap-12 pb-12">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] w-full overflow-hidden bg-[#fff1f2] flex items-center pt-0 lg:pt-5">
          {/* Abstract background blobs for depth */}
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[60%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="container-custom relative z-10 py-12 lg:py-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-8">
              {/* Left Content */}
              <div className="flex flex-col gap-6 order-2 lg:order-1 items-center text-center lg:items-start lg:text-left relative z-20">

                {/* Mobile Search Box */}
                <form
                  onSubmit={handleSearch}
                  className="w-full max-w-sm mb-4 lg:hidden animate-in fade-in slide-in-from-top duration-500 -mt-20"
                >
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Search for products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-14 pl-12 pr-4 rounded-2xl border-none bg-white/80 backdrop-blur-md shadow-lg shadow-primary/5 outline-none transition-all focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60 text-lg"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary group-focus-within:scale-110 transition-transform" />
                    <button type="submit" className="sr-only">Search</button>
                  </div>
                </form>

                <Badge variant="secondary" className="w-fit animate-in fade-in slide-in-from-bottom duration-500 bg-white/50 border-primary/10 text-primary px-4 py-1">
                  Handcrafted with love
                </Badge>
                {settings && (
                  <>
                    <h1 className="font-serif text-5xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl animate-in fade-in slide-in-from-bottom duration-700">
                      {settings.heroTitlePrefix} <span className="text-primary italic">{settings.heroTitleHighlight1}</span> <span className="text-primary">{settings.heroTitleHighlight2}</span> {settings.heroTitleSuffix}
                    </h1>
                    <p className="max-w-xl text-base md:text-l text-muted-foreground animate-in fade-in slide-in-from-bottom duration-1000">
                      {settings.heroSubtitle}
                    </p>
                  </>
                )}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-4 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
                  <Link href="/products">
                    <Button size="lg" className="rounded-full px-8 h-14 text-white shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                      Shop Collection <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Image/Illustration - Large with Overlap */}
              <div className="relative order-1 lg:order-2 hidden lg:flex justify-center lg:justify-end animate-in fade-in zoom-in duration-1000 lg:-ml-32 z-10">
                <div className="relative w-full max-w-[550px] lg:max-w-none aspect-square lg:aspect-auto lg:h-[90vh] lg:w-[120%] lg:scale-110 xl:scale-125 origin-top">
                  <Image
                    src="/illus.png"
                    alt="Paper Petals Illustration"
                    fill
                    priority
                    className="object-contain drop-shadow-2xl"
                    sizes="(max-width: 768px) 100vw, 60vw"
                  />
                  {/* Soft glow behind image */}
                  <div className="absolute inset-0 bg-primary/10 blur-[100px] -z-10 rounded-full scale-90 opacity-40" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="w-full overflow-hidden">
          <div className="container-custom">
            <div className="flex flex-col gap-4 mb-8">
              <h2 className="font-serif text-3xl font-bold">Shop by Category</h2>
              <p className="text-muted-foreground">Everything you need for your creative needs.</p>
            </div>
            <div
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory ${isDragging ? "cursor-grabbing" : "cursor-grab"
                } select-none`}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {loading || categories.length === 0 ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-none w-[180px] md:w-[240px] snap-start">
                    <div className="flex flex-col gap-3">
                      <Skeleton className="aspect-[4/5] md:aspect-[3/4] w-full rounded-[2rem]" />
                      <Skeleton className="h-4 w-2/3 mx-auto" />
                    </div>
                  </div>
                ))
              ) : (
                categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.name}`}
                    className="group flex-none w-[180px] md:w-[240px] snap-start"
                    onClick={handleLinkClick}
                    draggable={false}
                  >
                    <Card hover className="h-full border-none overflow-hidden relative aspect-[4/5] md:aspect-[3/4] rounded-[2rem]">
                      <div className="absolute inset-0">
                        <img
                          src={category.backgroundImage}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      </div>
                      <CardContent className="relative h-full flex flex-col items-center justify-end p-6 gap-3 z-10 text-white">
                        <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform pointer-events-none mb-2">
                          <ShoppingBag className="h-6 w-6" />
                        </div>
                        <span className="text-base font-bold text-center pointer-events-none">{category.name}</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
          <style dangerouslySetInnerHTML={{
            __html: `
          .scrollbar-hide::-webkit-scrollbar {
              display: none;
          }
        `}} />
        </section>

        {/* Dynamic Banner Slider */}
        <BannerSlider banners={settings.banners || []} />

        {/* Featured Products */}
        <section className="container-custom">
          <div className="flex items-end justify-between mb-8">
            <div className="flex flex-col gap-2">
              <h2 className="font-serif text-3xl font-bold">Featured Arrivals</h2>
              <p className="text-muted-foreground">Hand-picked items from our new season collection.</p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-primary hover:underline">
              View All Products
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="aspect-square w-full rounded-3xl" />
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
          ) : products.length > 0 ? (
            <div className="space-y-12">
              <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="flex justify-center pt-4">
                <Link href="/products">
                  <Button size="lg" variant="outline" className="rounded-full px-12 h-14 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                    Show All Products
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-accent/30 rounded-3xl border-2 border-dashed border-border">
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground">Check back later for new arrivals.</p>
            </div>
          )}
        </section>

      </div>
      <PromoPopupComponent />
    </>
  );
}
