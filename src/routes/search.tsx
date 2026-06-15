import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductQuickView } from "@/components/ProductQuickView";
import { useWishlist } from "@/hooks/use-wishlist";
import { useProducts, FirestoreProduct } from "@/hooks/use-products";
import { getProductImage } from "@/utils/product";
import { Search, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";

type SearchParams = {
  q?: string;
  category?: string;
};

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      q: (search.q as string) || "",
      category: (search.category as string) || "",
    };
  },
  component: SearchPage,
  head: (ctx) => {
    const search = ctx.match.search;
    const title = search.category
      ? `Collection: ${search.category} - VURLO`
      : search.q
        ? `Search: "${search.q}" - VURLO`
        : "Search - VURLO";
    return {
      meta: [
        { title },
        { name: "description", content: "Search premium RGB lighting & aesthetic room decor." },
        { name: "robots", content: "noindex, follow" },
      ],
      links: [
        { rel: "canonical", href: "https://vurlo.store/search" },
      ],
    };
  },
});

const ACCENT_PALETTES = [
  { accent: "#8a2eff", accentRgb: "138,46,255" }, // Brand Violet
  { accent: "#00e5ff", accentRgb: "0,229,255" }, // Brand Cyan
];

// Levenshtein distance helper
function getLevenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }
  return matrix[a.length][b.length];
}

function isFuzzyMatch(word: string, target: string, threshold = 2): boolean {
  const w = word.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  if (!w || !t) return false;
  if (w.includes(t) || t.includes(w)) return true;
  return getLevenshteinDistance(w, t) <= threshold;
}

function SearchPage() {
  const { q = "", category = "" } = Route.useSearch();
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
  const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc" | "rating">("relevance");
  const [maxPrice, setMaxPrice] = useState<number>(5000);

  const { data: dbProducts = [], isLoading } = useProducts();
  const { toggleWishlist, isWishlisted } = useWishlist();

  // 1. Filter products based on search query tokens and category
  const productsToDisplay = dbProducts.filter((p) => {
    if (p.active === false) return false;

    if (category) {
      const matchesCategory = p.category?.toLowerCase() === category.toLowerCase();
      if (!matchesCategory) return false;
    }

    if (q) {
      const queryTokens = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (queryTokens.length > 0) {
        const nameLower = p.name.toLowerCase();
        const displayNameLower = (p.displayName || "").toLowerCase();
        const seoTitleLower = (p.seoTitle || "").toLowerCase();
        const descLower = (p.description || "").toLowerCase();
        const catLower = (p.category || "").toLowerCase();
        const tagsLower = (p.tags || []).map((t) => t.toLowerCase());

        const matchesQuery = queryTokens.some(
          (token: string) =>
            nameLower.includes(token) ||
            displayNameLower.includes(token) ||
            seoTitleLower.includes(token) ||
            descLower.includes(token) ||
            catLower.includes(token) ||
            tagsLower.some((tag: string) => tag.includes(token))
        );
        if (!matchesQuery) return false;
      }
    }

    return true;
  });

  const sortedProducts = [...productsToDisplay]
    .filter((p) => p.price <= maxPrice)
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0; // relevance — keep original order
    });

  const isFuzzyFallbackUsed = false;

  // 3. Recommended for You popular/featured items
  const recommendations = dbProducts
    .filter((p) => p.active !== false)
    .sort((a, b) => {
      const aFeatured = a.isFeatured ? 1 : 0;
      const bFeatured = b.isFeatured ? 1 : 0;
      return bFeatured - aFeatured;
    })
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between page-transition">
      <div>
        <Navbar />

        <section className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8">
          {/* Ambient background glows */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/[0.03] blur-[120px]" />
            <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/[0.02] blur-[100px]" />
          </div>

          <div className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 backdrop-blur-sm">
                <Search className="h-3 w-3 text-violet-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
                  Search Results
                </span>
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Shop Aesthetic Room Lights & RGB Lights in India
              </h1>
              <p className="text-xs text-white/45">
                {category
                  ? `Category: ${category}`
                  : q
                    ? `Search results for "${q}"`
                    : "Discover premium ambient lighting and aesthetic decor collections."}
                {` — We found ${sortedProducts.length} premium lighting products matching your criteria.`}
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/40 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft size={14} />
              Continue Shopping
            </Link>
          </div>

          {/* Sort & Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="flex items-center gap-2 border border-white/[0.06] bg-white/[0.02] px-3 py-2 rounded-xl">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white/80 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="relevance" className="bg-[#0f0f18]">Relevance</option>
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
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 accent-violet-500 cursor-pointer"
              />
            </div>

            {(sortBy !== "relevance" || maxPrice < 5000) && (
              <button
                onClick={() => { setSortBy("relevance"); setMaxPrice(5000); }}
                className="text-[10px] font-bold text-white/40 hover:text-white/80 uppercase tracking-widest border border-white/[0.06] px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              <p className="text-sm text-white/40">Searching catalog...</p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="space-y-16">
              <div className="py-20 text-center flex flex-col items-center justify-center gap-4 border border-white/[0.04] bg-white/[0.01] rounded-2xl max-w-xl mx-auto shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-sm animate-in fade-in duration-300">
                <div className="relative w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-white/40 shadow-[0_0_30px_rgba(138,46,255,0.06)]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-cyan-500/10 rounded-full blur-md" />
                  <Search className="h-6 w-6 text-violet-400 relative z-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white tracking-tight">No results found</p>
                  <p className="text-xs text-gray-400 max-w-[280px] leading-relaxed mx-auto">
                    We couldn't find any products matching "{q}". Try checking your spelling or
                    search for popular terms like "Lights" or "Lamps".
                  </p>
                </div>
                <Link
                  to="/"
                  className="text-xs font-bold uppercase tracking-wider h-10 px-6 rounded-xl text-white transition-all duration-300 relative overflow-hidden cursor-pointer shadow-[0_4px_20px_rgba(124,58,237,0.25)] flex items-center justify-center gap-2 mt-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:brightness-110"
                >
                  Go to Home
                </Link>
              </div>

              {recommendations.length > 0 && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="text-center">
                    <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                      Recommended for You
                    </h2>
                    <p className="text-xs text-white/45 mt-1">
                      Check out these popular essentials from our catalog.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {recommendations.map((p, i) => (
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
                          accentRgb:
                            p.accentRgb || ACCENT_PALETTES[i % ACCENT_PALETTES.length].accentRgb,
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
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {isFuzzyFallbackUsed && (
                <div className="inline-flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3.5 py-2 backdrop-blur-sm text-violet-400 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  <span>
                    Showing results similar to <strong>"{q}"</strong>
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                {sortedProducts.map((p, i) => (
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
                      accentRgb:
                        p.accentRgb || ACCENT_PALETTES[i % ACCENT_PALETTES.length].accentRgb,
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
            </div>
          )}

          {/* Bottom SEO Text Block */}
          <div className="mt-20 border-t border-white/[0.06] pt-12 text-left max-w-4xl space-y-4">
            <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider">
              Aesthetic Room Lights & Smart RGB Ambient Lighting
            </h2>
            <p className="text-xs text-white/45 leading-relaxed">
              Explore aesthetic lighting, RGB lights, and ambient lamps for bedrooms and gaming setups in India at Vurlo. We specialize in bringing state-of-the-art room lights that instantly shift the mood of your living space. From 3D laser-engraved crystal ball lamps to color-pulsing smart LED strips and realistic sunset projectors, our curated collection is engineered to enhance your comfort, visual setup, and home styling. Whether you are searching for aesthetic desk setups, baby nursery night lights, or neon-inspired workspace decor, find the highest quality products in India with USB-powered convenience and secure shipping. Calm your space, boost your productivity, and elevate your daily atmosphere with premium lights.
            </p>
          </div>
        </section>
      </div>

      <Footer />

      {/* Quick View Details Modal */}
      {selectedProduct && (
        <ProductQuickView product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </main>
  );
}
