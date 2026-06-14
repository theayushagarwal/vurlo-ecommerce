import { useState, useEffect, useMemo, useCallback } from "react";
import { ShoppingBag, Loader2, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { useProducts, formatPrice, resolveProductImage } from "@/hooks/use-products";
import { RecommendedProducts } from "./RecommendedProducts";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";

interface ProductQuickViewProps {
  product: any;
  onClose: () => void;
}

export function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
  const { addToCart } = useCart();
  const { data: allProducts = [] } = useProducts();
  const [addingToCart, setAddingToCart] = useState(false);

  // RULE 2 — hasVariants DETECTION
  const hasVariants = useMemo(() => {
    return (
      product?.images != null &&
      typeof product.images === "object" &&
      !Array.isArray(product.images) &&
      Object.keys(product.images).length > 0
    );
  }, [product?.images]);

  // RULE 5 — VARIANT SWITCHING INITIALIZATION
  const getInitialVariant = useCallback(() => {
    if (hasVariants) {
      const keys = Object.keys(product.images);
      if (product.defaultVariant) {
        const found = keys.find((k) => k.toLowerCase() === product.defaultVariant.toLowerCase());
        if (found) return found;
      }
      return keys[0] || "";
    }
    return "";
  }, [hasVariants, product?.images, product?.defaultVariant]);

  const [selectedVariant, setSelectedVariant] = useState(getInitialVariant);

  const activePrice = useMemo(() => {
    if (product.variantPrices && selectedVariant && product.variantPrices[selectedVariant]) {
      return product.variantPrices[selectedVariant].price;
    }
    return product.price;
  }, [product.variantPrices, product.price, selectedVariant]);

  const activeOriginalPrice = useMemo(() => {
    if (product.variantPrices && selectedVariant && product.variantPrices[selectedVariant]) {
      return product.variantPrices[selectedVariant].originalPrice ?? product.originalPrice;
    }
    return product.originalPrice;
  }, [product.variantPrices, product.originalPrice, selectedVariant]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitting, setNotifySubmitting] = useState(false);
  const [notifyDone, setNotifyDone] = useState(false);

  // RULE 3 — resolvedImages WITH useMemo
  const resolvedImages = useMemo(() => {
    let imgs: string[] = [];
    if (hasVariants) {
      imgs = (product.images as Record<string, string[]>)[selectedVariant] || [];
    } else if (Array.isArray(product.images)) {
      imgs = product.images;
    } else if (typeof product.image === "string") {
      imgs = [product.image];
    }
    // Deduplicate + filter empty strings
    return Array.from(new Set(imgs)).filter((img) => typeof img === "string" && img.trim() !== "");
  }, [hasVariants, product?.images, product?.image, selectedVariant]);

  // RULE 4 — SINGLE IMAGE RENDER CURRENT IMAGE
  const currentImage = useMemo(() => {
    return resolvedImages[currentImageIndex] ?? resolvedImages[0] ?? "";
  }, [resolvedImages, currentImageIndex]);

  // Reset variant/states on product change
  useEffect(() => {
    setCurrentImageIndex(0);
    setSelectedVariant(getInitialVariant());
    setImgError(false);
  }, [product?.id, getInitialVariant]);

  // RULE 7 — Reset imgError whenever currentImage changes
  useEffect(() => {
    setImgError(false);
  }, [currentImage]);

  // RULE 5 — VARIANT SWITCHING HANDLER
  const handleVariantChange = useCallback((variant: string) => {
    setSelectedVariant(variant);
    setCurrentImageIndex(0);
    setImgError(false);
  }, []);

  const handleImgError = useCallback(() => {
    setImgError(true);
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (addingToCart || !product || product.stock === 0) return;
    setAddingToCart(true);
    try {
      await addToCart({
        productId: product.id,
        name: hasVariants ? `${product.name} (${selectedVariant})` : product.name,
        price: activePrice,
        image: resolvedImages[0] || resolveProductImage("", product.name),
      });
      onClose();
    } catch (err) {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  }, [addingToCart, product, hasVariants, selectedVariant, resolvedImages, addToCart, onClose]);

  const handleNotifyMe = async () => {
    const cleanEmail = notifyEmail.trim().toLowerCase();
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      toast.error("Enter a valid email address.");
      return;
    }
    setNotifySubmitting(true);
    try {
      const q = query(
        collection(db, "stock_notifications"),
        where("productId", "==", product.id),
        where("email", "==", cleanEmail),
      );
      const existing = await getDocs(q);
      if (!existing.empty) {
        toast.info("You're already on the list for this product.");
        setNotifyDone(true);
        return;
      }
      await addDoc(collection(db, "stock_notifications"), {
        productId: product.id,
        productName: product.name,
        email: cleanEmail,
        createdAt: serverTimestamp(),
      });
      setNotifyDone(true);
      toast.success("We'll notify you when it's back!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setNotifySubmitting(false);
    }
  };

  if (!product || !product.id) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/75 overflow-y-auto overflow-x-hidden"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90dvh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0d0d16] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8),0_0_50px_rgba(138,46,255,0.08)] flex flex-col relative my-auto"
        onClick={(e) => e.stopPropagation()}
        style={
          {
            "--accent": product.accent || "#8a2eff",
            "--accent-rgb": product.accentRgb || "138,46,255",
          } as React.CSSProperties
        }
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 rounded-xl bg-black/40 border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.04] text-white/50 hover:text-white transition duration-200 cursor-pointer focus:outline-none"
          aria-label="Close details"
        >
          <X size={15} />
        </button>

        <div className="flex flex-col md:flex-row w-full">

        {/* Product Image Section */}
        <div className="w-full h-56 sm:h-72 md:h-auto md:w-2/5 md:min-h-[420px] relative bg-white/[0.01] border-b md:border-b-0 md:border-r border-white/[0.06] flex flex-col p-4 sm:p-5 shrink-0 overflow-hidden">
          <div className="flex-1 flex items-center justify-center relative overflow-hidden w-full h-full">
            <div
              className="absolute w-[80%] h-[80%] rounded-full opacity-30 blur-[40px] pointer-events-none"
              style={{
                background: `radial-gradient(circle, rgba(var(--accent-rgb), 0.15) 0%, transparent 70%)`,
              }}
            />
            {/* 7. IMAGE RENDERING (Main image) */}
            <img
              src={imgError || !currentImage ? resolveProductImage("", product.name) : currentImage}
              alt={product.name}
              onError={handleImgError}
              className="max-w-full max-h-full object-contain relative z-10 rounded-xl"
              loading="eager"
            />
          </div>

          {/* 8. THUMBNAILS */}
          {resolvedImages.length > 1 && (
            <div className="flex gap-2 justify-start mt-4 overflow-x-auto py-1 min-h-[52px]">
              {resolvedImages.map((img: string, idx: number) => (
                <div
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-12 h-12 rounded-xl border shrink-0 bg-white/[0.02] transition-all duration-200 cursor-pointer overflow-hidden flex-none ${
                    idx === currentImageIndex
                      ? "border-violet-500 scale-105 opacity-100"
                      : "border-white/[0.08] opacity-50"
                  }`}
                >
                  <img
                    src={img || resolveProductImage("", "")}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = resolveProductImage("", "");
                    }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="w-full md:w-3/5 p-4 sm:p-5 md:p-7 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {product.stock === 0 ? (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/25 text-red-400">
                  Sold Out
                </span>
              ) : (
                <>
                  {product.badge && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/25 text-amber-400 animate-pulse">
                      {product.badge}
                    </span>
                  )}
                  {product.isOnSale && product.discountPercentage && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/25 text-red-400">
                      Sale
                    </span>
                  )}
                  {product.isNew && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
                      New
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-violet-500/10 border border-violet-500/25 text-violet-400">
                      Featured
                    </span>
                  )}
                </>
              )}
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
              {product.displayName || product.name}
            </h3>
            {product.rating !== undefined && (
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const isFilled = idx < Math.floor(product.rating || 0);
                    return (
                      <span
                        key={idx}
                        className={isFilled ? "text-amber-400 font-bold" : "text-white/20"}
                      >
                        ★
                      </span>
                    );
                  })}
                </div>
                <span className="font-bold text-amber-400">{product.rating}</span>
                {product.reviewsCount !== undefined && product.reviewsCount > 0 && (
                  <span className="text-white/35 font-medium">
                    ({product.reviewsCount} reviews)
                  </span>
                )}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <p
                  className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-300"
                  style={{ textShadow: `0 0 20px rgba(var(--accent-rgb), 0.2)` }}
                >
                  ₹{formatPrice(activePrice)}
                </p>
                {product.isOnSale && activeOriginalPrice && (
                  <p className="text-xs text-white/30 line-through font-semibold">
                    ₹{formatPrice(activeOriginalPrice)}
                  </p>
                )}
              </div>

              {/* 6. VARIANT BUTTON CLICK & 5. ACTIVE VARIANT UI */}
              {hasVariants && (
                <div className="space-y-1.5 mt-1 border-t border-white/[0.04] pt-3">
                  <label className="text-[9px] font-bold text-white/45 uppercase tracking-widest block">
                    Select Variant
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(product.images).map((variant) => (
                      <button
                        key={variant}
                        type="button"
                        onClick={() => handleVariantChange(variant)}
                        className={
                          selectedVariant === variant
                            ? "active-variant-class"
                            : "inactive-variant-class"
                        }
                      >
                        {variant.charAt(0).toUpperCase() + variant.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-[1px] bg-white/[0.06] my-4" />
            <div className="space-y-3">
              <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">
                {product.description ||
                  "Premium lighting product designed to elevate your room's aesthetic and vibe."}
              </p>

              {/* 9. VARIANT LABEL & DESCRIPTION */}
              {hasVariants && (
                <div
                  key={selectedVariant}
                  className="p-3 rounded-xl border border-violet-500/10 bg-violet-500/[0.02] text-xs text-violet-300 leading-relaxed whitespace-pre-line animate-in fade-in duration-300"
                >
                  <p className="font-bold text-[9px] text-white/50 uppercase tracking-wider block mb-1">
                    {selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)} Edition
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {selectedVariant.toLowerCase() === "galaxy" &&
                      "Vibrant nebula lighting, best for gaming & aesthetic setups"}
                    {selectedVariant.toLowerCase() === "moon" &&
                      "Warm cozy glow, perfect for bedroom & relaxation"}
                    {selectedVariant.toLowerCase() === "saturn" &&
                      "Elegant Saturn design etched inside a crystal sphere, glowing with a warm ambient light. Perfect for aesthetic setups and cozy room decor."}
                    {selectedVariant.toLowerCase() === "astronaut" &&
                      "A glowing astronaut crystal ball lamp with a dreamy moon and stars design. Perfect for cozy lighting, aesthetic setups, and unique gifting."}
                  </p>
                </div>
              )}
            </div>

            {product.features && product.features.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">
                  Key Features
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(product.features as string[]).map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-400">
                      <span className="text-violet-400 font-bold select-none">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-white/[0.06]">
            {product.stock === 0 ? (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-center">
                  Out of Stock — Get Notified
                </p>
                {notifyDone ? (
                  <div className="w-full h-11 rounded-xl border border-green-500/20 bg-green-500/5 flex items-center justify-center text-xs font-bold text-green-400">
                    ✓ You're on the list!
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      className="flex-1 bg-white/[0.03] border border-white/[0.08] focus:border-violet-500/50 text-white rounded-xl placeholder:text-white/20 h-11 px-4 text-xs focus:outline-none transition-all"
                    />
                    <button
                      onClick={handleNotifyMe}
                      disabled={notifySubmitting}
                      className="h-11 px-4 rounded-xl text-xs font-bold text-white cursor-pointer disabled:opacity-50 transition-all"
                      style={{ background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)" }}
                    >
                      {notifySubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Notify Me"
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                disabled={addingToCart}
                onClick={handleAddToCart}
                className={`w-full text-xs font-bold uppercase tracking-wider h-11 rounded-xl text-white transition-all duration-300 relative overflow-hidden cursor-pointer shadow-[0_4px_20px_rgba(124,58,237,0.25)] flex items-center justify-center gap-2`}
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)" }}
              >
                {addingToCart ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Adding to Cart...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        </div>

        <RecommendedProducts currentProduct={product} allProducts={allProducts} isModal={true} />
      </div>
    </div>
  );
}
