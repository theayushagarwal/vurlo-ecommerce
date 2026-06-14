import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductQuickView } from "@/components/ProductQuickView";
import { useWishlist } from "@/hooks/use-wishlist";
import { useProducts, FirestoreProduct } from "@/hooks/use-products";
import { getProductImage } from "@/utils/product";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useState } from "react";

type ShopSearchParams = {
  category?: string;
  sort?: string;
  sale?: boolean;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearchParams => {
    return {
      category: (search.category as string) || undefined,
      sort: (search.sort as string) || "featured",
      sale: (search.sale as boolean) || undefined,
    };
  },
  component: ShopPage,
  head: () => ({
    meta: [
      { title: "Shop - Vurlo | Premium Lighting & Aesthetic Decor" },
      {
        name: "description",
        content:
          "Browse the full Vurlo collection. Premium RGB lights, moon lamps, galaxy projectors, crystal lamps and aesthetic room decor. Free shipping available.",
      },
      { name: "robots", content: "index, follow" },
    ],
  }),
});

const ACCENT_PALETTES = [
  { accent: "#8a2eff", accentRgb: "138,46,255" },
  { accent: "#00e5ff", accentRgb: "0,229,255" },
];

const CATEGORIES = ["All", "Lamps", "Projectors", "RGB", "Decor"];

function ShopPage() {
  const { category, sort = "featured", sale } = Route.useSearch();
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
  const [sortBy, setSortBy] = useState<string>(sort);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [activeCategory, setActiveCategory] = useState<string>(category || "All");
  const [visibleCount, setVisibleCount] = useState(12);

  const { data: dbProducts = [], isLoading } = useProducts();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const filtered = dbProducts.filter((p) => {
    if (p.active === false) return false;
    if (sale && !p.isOnSale && !p.onSale) return false;
    if (activeCategory !== "All") {
      if (p.category?.toLowerCase() !== activeCategory.toLowerCase()) return false;
    }
    if (p.price > maxPrice) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const visibleProducts = sorted.slice(0, visibleCount);

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between page-transition">
      <div>
        <Navbar />

        <section className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8">
          {/* Ambient glows */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/[0.03] blur-[120px]" />
            <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/[0.02] blur-[100px]" />
          </div>

          {/* Header */}
          <div className="mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 backdrop-blur-sm">
              <ShoppingBag className="h-3 w-3 text-violet-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
                Full Collection
              </span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Shop All Products
            </h1>
            <p className="text-xs text-white/45">
              {isLoading
                ? "Loading catalog..."
                : `${sorted.length} product${sorted.length !== 1 ? "s" : ""} available`}
            </p>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setVisibleCount(12); }}
                className={`text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? "border-violet-500/60 bg-violet-500/15 text-violet-300"
                    : "border-white/[0.07] bg-white/[0.02] text-white/50 hover:text-white/80 hover:border-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort & Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <div className="flex items-center gap-2 border border-white/[0.06] bg-white/[0.02] px-3 py-2 rounded-xl">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Sort</span>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setVisibleCount(12); }}
                className="bg-transparent text-white/80 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-[#0f0f18]">Featured</option>
                <option value="newest" className="bg-[#0f0f18]">Newest</option>
                <option value="price_asc" className="bg-[#0f0f18]">Price: Low to High</option>
                <option value="price_desc" className="bg-[#0f0f18]">Price: High to Low</option>
                <option value="rating" className="bg-[#0f0f18]">Top Rated</option>
              </select>
            </div>

            <div className="flex items-center gap-2 border border-white/[0.06] bg-white/[0.02] px-3 py-2 rounded-xl">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Max Price</span>
              <span className="text-xs font-bold text-violet-400">₹{maxPrice.toLocaleString("en-IN")}</span>
              <input
                type="range"
                min={100}
                max={5000}
                step={100}
                value={maxPrice}
                onChange={(e) => { setMaxPrice(Number(e.target.value)); setVisibleCount(12); }}
                className="w-24 accent-violet-500 cursor-pointer"
              />
            </div>

            {(sortBy !== "featured" || maxPrice < 5000 || activeCategory !== "All") && (
              <button
                onClick={() => { setSortBy("featured"); setMaxPrice(5000); setActiveCategory("All"); setVisibleCount(12); }}
                className="text-[10px] font-bold text-white/40 hover:text-white/80 uppercase tracking-widest border border-white/[0.06] px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              <p className="text-sm text-white/40">Loading catalog...</p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-4 border border-white/[0.04] bg-white/[0.01] rounded-2xl max-w-xl mx-auto">
              <ShoppingBag className="h-8 w-8 text-violet-400/60" />
              <p className="text-sm font-bold text-white">No products found</p>
              <p className="text-xs text-gray-400">Try adjusting your filters.</p>
              <button
                onClick={() => { setSortBy("featured"); setMaxPrice(5000); setActiveCategory("All"); setVisibleCount(12); }}
                className="text-xs font-bold uppercase tracking-wider h-10 px-6 rounded-xl text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:brightness-110 transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                {visibleProducts.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={{
                      id: p.id,
                      name: p.name,
                      displayName: p.displayName,
                      seoTitle: p.seoTitle,
                      slug: p.slug,
                      price: p.price,
                      img: getProductImage(p),
                      images: p.images,
                      tag: p.tag || null,
                      accent: p.accent || ACCENT_PALETTES[i % ACCENT_PALETTES.length].accent,
                      accentRgb: p.accentRgb || ACCENT_PALETTES[i % ACCENT_PALETTES.length].accentRgb,
                      description: p.description,
                      originalPrice: p.originalPrice,
                      discountPercentage: p.discountPercentage,
                      discountPercent: p.discountPercent,
                      isOnSale: p.isOnSale,
                      onSale: p.onSale,
                      isFeatured: p.isFeatured,
                      isNew: p.isNew,
                      rating: p.rating,
                      reviewsCount: p.reviewsCount,
                      badge: p.badge,
                    }}
                    index={i}
                    isSelected={selectedProduct?.id === p.id}
                    onSelect={() => handleSelectProduct(p)}
                    isWishlisted={isWishlisted}
                    toggleWishlist={toggleWishlist}
                  />
                ))}
              </div>

              {sorted.length > visibleCount && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 8)}
                    className="bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white/80 rounded-full px-6 py-2 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <Footer />

      {selectedProduct && (
        <ProductQuickView product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </main>
  );
}
