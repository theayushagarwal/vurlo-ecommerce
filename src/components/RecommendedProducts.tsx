import { Sparkles } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { ProductCard } from "./ProductCard";
import { useRecommendations } from "@/hooks/use-recommendations";
import { FirestoreProduct } from "@/hooks/use-products";
import { getProductImage } from "@/utils/product";
import { useRef, useState, useEffect } from "react";

interface RecommendedProductsProps {
  currentProduct: FirestoreProduct;
  allProducts: FirestoreProduct[];
  isModal?: boolean;
}

const ACCENT_PALETTES = [
  { accent: "#8a2eff", accentRgb: "138,46,255" }, // Brand Violet
  { accent: "#00e5ff", accentRgb: "0,229,255" }, // Brand Cyan
];

export function RecommendedProducts({
  currentProduct,
  allProducts,
  isModal,
}: RecommendedProductsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const { recommendations } = useRecommendations(currentProduct, allProducts, isVisible);
  const { toggleWishlist, isWishlisted } = useWishlist();

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className={`relative px-4 py-10 sm:px-6 sm:py-16 md:py-20 border-t border-white/[0.06] ${
        isModal ? "mt-8" : "mx-auto max-w-7xl mt-16"
      }`}
    >
      {/* Background glow overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-40 left-1/3 w-[600px] h-[600px] rounded-full opacity-25 blur-[120px]"
          style={{
            background: `radial-gradient(circle, ${currentProduct.accent || "#8a2eff"}10 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Header section matching FeaturedProducts style */}
      <div className="mb-8 flex items-end justify-between gap-4 md:mb-12">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-violet-400" />
            <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/50">
              Complete the Vibe
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white/90 leading-[1.05] sm:text-3xl md:text-5xl">
            Elevate
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              your layout setup.
            </span>
          </h2>
        </div>
      </div>

      {/* Horizontal scrollable row */}
      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
        {recommendations.map((p, i) => (
          <div
            key={p.id}
            className="w-[280px] sm:w-[320px] shrink-0 snap-start"
          >
            <ProductCard
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
              }}
              index={i}
              isWishlisted={isWishlisted}
              toggleWishlist={toggleWishlist}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
