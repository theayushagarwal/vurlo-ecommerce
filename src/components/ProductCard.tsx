import { useRef, useState, useEffect } from "react";
import { ShoppingBag, ArrowUpRight, Loader2, Heart } from "lucide-react";
import { usePremiumTilt, useMagnetic, useScrollReveal } from "@/hooks/use-premium-interactions";
import { useCart } from "@/hooks/use-cart";
import { resolveProductImage, formatPrice, getAdjustmentStyle } from "@/hooks/use-products";
import { Link } from "@tanstack/react-router";
import { getProductSlug } from "@/utils/product";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    displayName?: string;
    seoTitle?: string;
    slug: string;
    price: number | string;
    img: string;
    images?: string[] | Record<string, string[]>;
    tag?: string | null;
    accent: string;
    accentRgb: string;
    description?: string;
    originalPrice?: number;
    discountPercentage?: number;
    discountPercent?: number;
    isOnSale?: boolean;
    onSale?: boolean;
    isFeatured?: boolean;
    isNew?: boolean;
    stock?: number;
    rating?: number;
    reviewsCount?: number;
    badge?: string | null;
    variants?: { name: string; images: string[] }[];
    defaultVariant?: string;
  };
  index: number;
  isSelected?: boolean;
  onSelect?: () => void;
  isWishlisted?: (productId: string) => boolean;
  toggleWishlist?: (product: {
    id: string;
    name: string;
    price: number;
    image: string;
    images?: string[] | Record<string, string[]>;
    tag?: string | null;
    accent?: string;
    accentRgb?: string;
    originalPrice?: number;
    isOnSale?: boolean;
    onSale?: boolean;
    discountPercentage?: number;
    discountPercent?: number;
    isFeatured?: boolean;
    isNew?: boolean;
    stock?: number;
    rating?: number;
    reviewsCount?: number;
    badge?: string | null;
    variants?: { name: string; images: string[] }[];
    defaultVariant?: string;
  }) => Promise<void>;
}

export function ProductCard({
  product: p,
  index,
  isSelected,
  onSelect,
  isWishlisted,
  toggleWishlist,
}: ProductCardProps) {
  const onSale = p.isOnSale || p.onSale || false;
  const discount = p.discountPercentage || p.discountPercent || 0;
  const hasOriginalPrice =
    p.originalPrice !== undefined && p.originalPrice !== null && !isNaN(Number(p.originalPrice));

  const [adding, setAdding] = useState(false);
  const enterRef = useRef<HTMLDivElement>(null);
  const tilt = usePremiumTilt<HTMLElement, HTMLDivElement, HTMLDivElement>({
    rotateX: 6,
    rotateY: 8,
    depth: 15,
  });
  const viewBtn = useMagnetic<HTMLButtonElement>({ strength: 3, scale: 1.01 });
  const cartBtn = useMagnetic<HTMLButtonElement>({ strength: 3, scale: 1.02 });
  const { addToCart } = useCart();

  useScrollReveal(enterRef, index * 80);

  const mainImage = (() => {
    if (Array.isArray(p.images)) {
      return p.images[0] || p.img || "";
    }
    if (p.images && typeof p.images === "object") {
      const imagesMap = p.images as Record<string, string[]>;
      const defVarRaw = p.defaultVariant || "";
      const defVarKey = Object.keys(imagesMap).find(
        (k) => k.toLowerCase() === defVarRaw.toLowerCase()
      ) || Object.keys(imagesMap)[0] || "";
      const variantImages = imagesMap[defVarKey] || Object.values(imagesMap)[0] || [];
      return variantImages[0] || p.img || "";
    }
    return p.img || "";
  })();
  const [imgSrc, setImgSrc] = useState(() => resolveProductImage(mainImage, p.name));
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const next = resolveProductImage(mainImage, p.name);
    if (next !== imgSrc) {
      setImgLoaded(false);
      setImgSrc(next);
    }
  }, [mainImage, p.name]);

  return (
    <div ref={enterRef} className="flex flex-col h-full pcard-enter" style={{ "--card-delay": `${index * 80}ms` } as React.CSSProperties}>
      <Link
        to="/product/$slug"
        params={{ slug: p.slug }}
        className="block h-full no-underline"
        onClick={(e) => {
          if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
            (window as any).gtag("event", "select_item", {
              item_name: p.name,
              item_id: p.slug,
            });
          }
          const isModifiedClick = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
          if (!isModifiedClick && onSelect) {
            e.preventDefault();
            onSelect();
          }
        }}
      >
        <article
          id={`product-${p.id}`}
          ref={tilt.cardRef}
          className={`pcard group flex flex-col h-full p-4 sm:p-5 ${isSelected ? "selected" : ""}`}
          onPointerEnter={tilt.onPointerEnter}
          onPointerMove={(e) => {
            tilt.onPointerMove(e);
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
            e.currentTarget.style.setProperty("--img-px", `${x}px`);
            e.currentTarget.style.setProperty("--img-py", `${y}px`);
          }}
          onPointerLeave={(e) => {
            tilt.onPointerLeave(e);
            e.currentTarget.style.setProperty("--img-px", "0px");
            e.currentTarget.style.setProperty("--img-py", "0px");
          }}
          style={
            {
              "--accent": p.accent,
              "--accent-rgb": p.accentRgb,
              "--card-index": index,
            } as React.CSSProperties
          }
        >
          <div ref={tilt.lightRef} className="pcard__light" />
          <div className="pcard__ring" />

          {/* Ambient glow orb behind image */}
          <div className="pcard__img-orb" />

          <div className="pcard__float-zone relative w-full aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div ref={tilt.depthRef} className="absolute inset-0 w-full h-full">
              <img
                src={imgSrc}
                alt={p.name}
                loading="lazy"
                className="pcard__img absolute inset-0 w-full h-full object-cover"
                style={{
                  ...getAdjustmentStyle(mainImage),
                  filter: imgLoaded ? "blur(0px)" : "blur(8px)",
                  transform: imgLoaded ? "scale(1)" : "scale(1.04)",
                  transition: "filter 0.5s ease, transform 0.5s ease",
                }}
                onLoad={() => setImgLoaded(true)}
                onError={() => { setImgSrc(resolveProductImage("", p.name)); setImgLoaded(true); }}
              />
            </div>

            {/* Scanline sweep */}
            <div className="pcard__scanline-wrap">
              <div className="pcard__scanline" />
            </div>

            {/* Corner sparks */}

            {/* Antigrav dust particles */}
            <div className="pcard__dust pcard__dust-1" />
            <div className="pcard__dust pcard__dust-2" />
            <div className="pcard__dust pcard__dust-3" />
            <div className="pcard__dust pcard__dust-4" />
            <div className="pcard__dust pcard__dust-5" />

            {/* Vignette overlay for depth */}
            <div className="pcard__vignette" />
            <div className="pcard__img-glow" />

            {/* Wishlist Heart Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist?.({
                  id: p.id,
                  name: p.name,
                  price: typeof p.price === "number" ? p.price : parseFloat(String(p.price)) || 0,
                  image: mainImage,
                  images: p.images,
                  tag: p.tag,
                  accent: p.accent,
                  accentRgb: p.accentRgb,
                  originalPrice: p.originalPrice,
                  isOnSale: onSale,
                  onSale: onSale,
                  discountPercentage: discount,
                  discountPercent: discount,
                  isFeatured: p.isFeatured,
                  isNew: p.isNew,
                  stock: p.stock,
                  rating: p.rating,
                  reviewsCount: p.reviewsCount,
                  badge: p.badge,
                });
              }}
              className={`pcard__wishlist-btn absolute top-4 right-4 z-10 p-2 rounded-xl bg-black/40 border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.04] transition duration-200 cursor-pointer focus:outline-none ${
                isWishlisted?.(p.id)
                  ? "text-rose-500 hover:text-rose-400"
                  : "text-white/40 hover:text-white"
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart size={14} className={isWishlisted?.(p.id) ? "fill-rose-500" : ""} />
            </button>

            <div className="pcard__tags-container">
              {p.stock === 0 ? (
                <span
                  className="pcard__tag"
                  style={{
                    color: "#ef4444",
                    background: "rgba(239,68,68,0.12)",
                    borderColor: "rgba(239,68,68,0.35)",
                    boxShadow: "0 0 12px rgba(239,68,68,0.2)",
                  }}
                >
                  Sold Out
                </span>
              ) : (
                <>
                  {p.badge && (
                    <span
                      className="pcard__tag animate-pulse"
                      style={{
                        color: "#fbbf24",
                        background: "rgba(251,191,36,0.12)",
                        borderColor: "rgba(251,191,36,0.35)",
                        boxShadow: "0 0 12px rgba(251,191,36,0.2)",
                      }}
                    >
                      {p.badge}
                    </span>
                  )}
                  {onSale && (discount > 0 || Number(p.originalPrice) !== Number(p.price)) && (
                    <span className="pcard__sale-tag">
                      {discount > 0 ? `${discount}% OFF` : "SALE"}
                    </span>
                  )}
                  {p.isNew && <span className="pcard__tag">New</span>}
                  {p.isFeatured && (
                    <span
                      className="pcard__tag"
                      style={{
                        color: "#a78bfa",
                        background: "rgba(167,139,250,0.12)",
                        borderColor: "rgba(167,139,250,0.35)",
                        boxShadow: "0 0 12px rgba(167,139,250,0.2)",
                      }}
                    >
                      Featured
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="pcard__hover-cta">
              <button
                type="button"
                ref={viewBtn.ref}
                className="pcard__view-btn flex items-center gap-2 cursor-pointer focus:outline-none"
                onPointerMove={viewBtn.onPointerMove}
                onPointerLeave={viewBtn.onPointerLeave}
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
                    (window as any).gtag("event", "select_item", {
                      item_name: p.name,
                      item_id: p.slug,
                    });
                  }
                  onSelect?.();
                }}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>Quick View</span>
              </button>
            </div>
          </div>

          <div className="pcard__body flex flex-col flex-1 mt-4">
            <div className="pcard__sep mb-4" />

            <div className="flex flex-col flex-1">
              <p className="pcard__name mb-2">{p.displayName || p.name}</p>
              {p.variants && p.variants.length > 0 && (
                <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest block mb-2">
                  Multiple Variants Available
                </span>
              )}
              {p.rating !== undefined && (
                <div className="flex items-center gap-1 mb-3 text-[11px] text-amber-400">
                  <span className="font-bold">{p.rating}★</span>
                  {p.reviewsCount !== undefined && (
                    <span className="text-[10px] text-white/30 font-medium">
                      ({p.reviewsCount} reviews)
                    </span>
                  )}
                </div>
              )}
              <div className="mt-auto flex items-center justify-between">
                <div className="flex flex-col">
                  {onSale && hasOriginalPrice && Number(p.originalPrice) !== Number(p.price) ? (
                    <div className="flex items-baseline gap-1.5">
                      <p className="pcard__price">₹{formatPrice(p.price)}</p>
                      <p className="text-[11px] text-white/30 line-through font-semibold">
                        ₹{formatPrice(p.originalPrice!)}
                      </p>
                    </div>
                  ) : (
                    <p className="pcard__price">₹{formatPrice(p.price)}</p>
                  )}
                </div>
                <button
                  type="button"
                  ref={cartBtn.ref}
                  className={`pcard__cart ${adding || p.stock === 0 ? "opacity-40 pointer-events-none cursor-not-allowed" : ""}`}
                  aria-label={p.stock === 0 ? "Sold out" : "Add to cart"}
                  disabled={adding || p.stock === 0}
                  onPointerMove={cartBtn.onPointerMove}
                  onPointerLeave={cartBtn.onPointerLeave}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Ripple — fixed position relative to viewport
                    const ripple = document.createElement("span");
                    ripple.className = "pcard__cart-ripple";
                    ripple.style.left = `${e.clientX - 3}px`;
                    ripple.style.top = `${e.clientY - 3}px`;
                    document.body.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 600);
                    if (adding || p.stock === 0) return;
                    setAdding(true);
                    try {
                      await addToCart({
                        productId: p.id,
                        name: p.name,
                        price:
                          typeof p.price === "number" ? p.price : parseFloat(String(p.price)) || 0,
                        image: mainImage,
                        stock: p.stock,
                      });
                    } finally {
                      setAdding(false);
                    }
                  }}
                >
                  {adding ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShoppingBag className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}
