import { useRef, useState, useEffect, useMemo } from "react";
import { Sparkles, Search, ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-premium-interactions";
import { useWishlist } from "@/hooks/use-wishlist";
import { useNavigate } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts, FirestoreProduct } from "@/hooks/use-products";
import { ProductGrid } from "./ProductGrid";
import { ProductQuickView } from "./ProductQuickView";

// Re-export utility functions and components for backwards compatibility
export { resolveProductImage, formatPrice } from "@/hooks/use-products";
export { ProductCard } from "./ProductCard";
export type { ProductCardProps } from "./ProductCard";

interface FeaturedProductsProps {
  category?: string;
  sale?: boolean;
}

export function FeaturedProducts({ category, sale }: FeaturedProductsProps) {
  const headingRef = useRef<HTMLDivElement>(null);
  useScrollReveal(headingRef, 0);

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<FirestoreProduct | null>(null);

  const handleSelectProduct = (product: FirestoreProduct) => {
    // Preload first image so it's in browser cache when modal opens
    const firstImg = Array.isArray(product.images)
      ? product.images[0]
      : product.images && typeof product.images === "object"
      ? Object.values(product.images)[0]?.[0]
      : product.image;
    if (firstImg) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = firstImg;
      document.head.appendChild(link);
    }
    setSelectedProduct(product);
  };

  const { data: dbProducts = [], isLoading, isError, error } = useProducts();
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    if (isError) {
      console.error("FeaturedProducts fetch error:", error);
    }
  }, [isError, error]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith("#product-")) {
        const id = hash.replace("#product-", "");
        const prod = dbProducts.find((p) => p.id === id);
        if (prod) {
          handleSelectProduct(prod);
        }
      }
    };

    if (dbProducts.length > 0) {
      handleHashChange();
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [dbProducts]);

  const setSelectedCategory = (newCat: string) => {
    if (newCat === "all") {
      navigate({
        to: "/search",
      });
    } else {
      navigate({
        to: "/search",
        search: { category: newCat },
      });
    }
  };

  const setShowOnlySale = (onlySale: boolean) => {
    navigate({
      to: "/",
      search: (prev: Record<string, unknown>) => ({ ...prev, sale: onlySale ? true : undefined }),
      hash: "shop",
    });
  };

  const displayProducts = useMemo(() => {
    return [...dbProducts]
      .filter((p) => p.active !== false)
      .sort((a, b) => {
        const timeA = (a as any).createdAt?.seconds || 0;
        const timeB = (b as any).createdAt?.seconds || 0;
        if (timeA !== timeB) return timeB - timeA;
        
        const featA = a.isFeatured ? 1 : 0;
        const featB = b.isFeatured ? 1 : 0;
        return featB - featA;
      });
  }, [dbProducts]);

  const filteredProducts = useMemo(() => {
    return displayProducts.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !category ||
        category.toLowerCase() === "all" ||
        p.category?.toLowerCase() === category.toLowerCase();
      const matchesSale = !sale || p.isOnSale === true;
      return matchesSearch && matchesCategory && matchesSale && p.active !== false;
    });
  }, [displayProducts, searchQuery, category, sale]);

  if (isLoading) {
    return (
      <section
        id="shop"
        className="relative mx-auto max-w-7xl scroll-mt-28 px-4 py-10 sm:px-6 sm:py-16 md:py-20"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/3 w-[600px] h-[600px] rounded-full bg-violet-600/[0.04] blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/[0.03] blur-[100px]" />
        </div>

        <div className="mb-12 flex items-end justify-between gap-6 md:mb-16">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-violet-400" />
              <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/50">
                Featured Collection
              </span>
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white/90 leading-[1.05] sm:text-4xl md:text-6xl">
              Engineered
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                to stand out.
              </span>
            </h2>
          </div>
        </div>

        {/* Loading Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <ProductCardSkeleton key={i} index={i} />
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section
        id="shop"
        className="relative mx-auto max-w-7xl scroll-mt-28 px-4 py-10 sm:px-6 sm:py-16 md:py-20"
      >
        <div className="border border-white/[0.06] bg-[#0c0c14] rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <Search className="h-8 w-8 text-red-400" />
          <div>
            <p className="text-sm font-semibold text-red-400">Failed to load products</p>
            <p className="text-xs text-white/40 mt-1">
              Please check your network connection and try again.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="shop"
      className="relative mx-auto max-w-7xl scroll-mt-28 px-4 py-10 sm:px-6 sm:py-16 md:py-20"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/3 w-[600px] h-[600px] rounded-full bg-violet-600/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/[0.03] blur-[100px]" />
      </div>

      <div ref={headingRef} className="mb-8 flex items-end justify-between gap-4 md:mb-16">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-violet-400" />
            <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/50">
              Featured Collection
            </span>
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white/90 leading-[1.05] sm:text-4xl md:text-6xl">
            Elevate
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              your atmosphere.
            </span>
          </h2>
        </div>
        <a
          href="#"
          className="hidden md:inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/70 transition-colors duration-300 group"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>

      {/* Search Bar */}
      <div className="mb-6 w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="text"
            placeholder="Search aesthetic lighting & decor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-violet-500/40 text-white rounded-xl placeholder:text-white/20 h-10 pl-10 pr-10 text-xs tracking-wide focus:outline-none transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/40 hover:text-white/80 transition-colors duration-200 px-1 cursor-pointer focus:outline-none"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category & Sale Filtering Controls */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 border border-white/[0.06] bg-white/[0.02] p-1 rounded-xl overflow-x-auto no-scrollbar flex-nowrap min-w-0 touch-pan-x">
          {["all", "RGB Lights", "Ambient Lamps", "Bedroom Lighting", "Gaming Setup Lights", "Aesthetic Decor"].map((cat) => {
            const isSelected =
              (!category && cat === "all") || category?.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer focus:outline-none select-none border border-transparent ${
                  isSelected
                    ? "bg-white/[0.05] text-white border-white/[0.04]"
                    : "text-white/45 hover:text-white/70"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sale Filter Toggle */}
        <button
          onClick={() => setShowOnlySale(!sale)}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition cursor-pointer select-none focus:outline-none ${
            sale
              ? "bg-red-500/10 border-red-500/35 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.1)]"
              : "bg-white/[0.02] border-white/[0.06] text-white/50 hover:text-white"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              sale ? "bg-red-400 animate-pulse" : "bg-white/30"
            }`}
          />
          On Sale
        </button>
      </div>

      {/* Products Grid / Fallbacks */}
      {dbProducts.length === 0 ? (
        <div className="col-span-full py-16 text-center text-white/35 flex flex-col items-center justify-center gap-3 border border-white/[0.04] bg-white/[0.01] rounded-2xl">
          <Search className="h-6 w-6 text-white/20" />
          <div>
            <p className="text-sm font-semibold text-white/60">No products available</p>
            <p className="text-xs text-white/35 mt-1">
              Check back later for new lighting setup additions.
            </p>
          </div>
        </div>
      ) : (
        <>
          <ProductGrid
            products={filteredProducts}
            selectedProduct={selectedProduct}
            onSelectProduct={handleSelectProduct}
            isWishlisted={isWishlisted}
            toggleWishlist={toggleWishlist}
          />

          {filteredProducts.length === 0 && (
            <div className="col-span-full py-16 text-center text-white/35 flex flex-col items-center justify-center gap-3 border border-white/[0.04] bg-white/[0.01] rounded-2xl">
              <Search className="h-6 w-6 text-white/20" />
              <div>
                <p className="text-sm font-semibold text-white/60">
                  No lighting & decor products matching your search
                </p>
                <p className="text-xs text-white/35 mt-1">
                  Try adjusting your query or resetting the filter.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick View Details Modal */}
      {selectedProduct && (
        <ProductQuickView product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </section>
  );
}

function ProductCardSkeleton({ index }: { index: number }) {
  return (
    <div className="pcard flex flex-col h-full p-5">
      <div className="relative w-full aspect-square rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <Skeleton className="absolute inset-0 w-full h-full rounded-xl bg-white/[0.03]" />
      </div>
      <div className="pcard__body flex flex-col flex-1 mt-4 space-y-4">
        <div className="pcard__sep" />
        <Skeleton className="h-4 w-3/4 bg-white/[0.03]" />
        <div className="flex items-center justify-between mt-auto">
          <Skeleton className="h-5 w-1/3 bg-white/[0.03]" />
          <Skeleton className="h-8 w-8 rounded-lg bg-white/[0.03]" />
        </div>
      </div>
    </div>
  );
}
