import { Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useWishlist, WishlistItem } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { resolveProductImage, formatPrice } from "@/components/FeaturedProducts";
import { getProductImage } from "@/utils/product";
import { Heart, ShoppingBag, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import React from "react";

export default function WishlistPage() {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addingCartId, setAddingCartId] = useState<string | null>(null);
  const [addingAll, setAddingAll] = useState(false);

  const handleAddToCart = async (item: WishlistItem) => {
    setAddingCartId(item.productId);
    try {
      await addToCart({
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: getProductImage(item),
      });
      // use-cart.tsx already toasts on success
    } catch (err) {
      toast.error("Failed to add to cart");
    } finally {
      setAddingCartId(null);
    }
  };

  const handleAddAllToCart = async () => {
    if (wishlistItems.length === 0) return;
    setAddingAll(true);
    let addedCount = 0;
    let failedStock = 0;
    try {
      for (const item of wishlistItems) {
        try {
          await addToCart({
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: getProductImage(item),
          });
          addedCount++;
        } catch (err) {
          failedStock++;
          console.error(err);
        }
      }
      if (addedCount > 0) {
        toast.success(`Successfully added ${addedCount} item(s) to your bag!`);
      }
      if (failedStock > 0) {
        toast.error(`Some items could not be added due to stock limits.`);
      }
    } finally {
      setAddingAll(false);
    }
  };

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
                <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 animate-pulse">
                  Your Favorites
                </span>
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Saved Essentials
              </h1>
              <p className="text-xs text-white/45">
                Keep track of items you need to complete your dream room setup.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {wishlistItems.length > 0 && (
                <button
                  onClick={handleAddAllToCart}
                  disabled={addingAll}
                  className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider h-10 px-5 rounded-xl text-white transition-all duration-300 relative overflow-hidden cursor-pointer shadow-[0_4px_15px_rgba(124,58,237,0.2)] disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)",
                  }}
                >
                  {addingAll ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Adding all...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Add all to cart
                    </>
                  )}
                </button>
              )}
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white/45 hover:text-white transition-colors duration-200 h-10 border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] rounded-xl px-5"
              >
                <ArrowLeft size={14} />
                Continue Shopping
              </Link>
            </div>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-4 border border-white/[0.04] bg-white/[0.01] rounded-2xl max-w-xl mx-auto shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-sm animate-in fade-in duration-300">
              <div className="relative w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-white/40 shadow-[0_0_30px_rgba(244,63,94,0.06)]">
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-violet-500/10 rounded-full blur-md" />
                <Heart className="h-6 w-6 text-rose-400 relative z-10" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white tracking-tight">No lights saved yet</p>
                <p className="text-xs text-gray-400 max-w-[240px] leading-relaxed mx-auto">
                  Browse our lighting collections and save your favorite decor here.
                </p>
              </div>
              <Link
                to="/"
                className="text-xs font-bold uppercase tracking-wider h-10 px-6 rounded-xl text-white transition-all duration-300 relative overflow-hidden cursor-pointer shadow-[0_4px_20px_rgba(124,58,237,0.25)] flex items-center justify-center gap-2 mt-2"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)",
                }}
              >
                Browse Collection
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <div
                  key={item.productId}
                  className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0d0d16] to-[#070710] p-5 flex flex-col h-full hover:border-white/[0.12] transition duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                  style={
                    {
                      "--accent": item.accent || "#8a2eff",
                      "--accent-rgb": item.accentRgb || "138,46,255",
                    } as React.CSSProperties
                  }
                >
                  {/* Remove Button */}
                  <button
                    onClick={() =>
                      toggleWishlist({
                        id: item.productId,
                        name: item.name,
                        price: item.price,
                        image: getProductImage(item),
                        images: item.images,
                        tag: item.tag,
                        accent: item.accent,
                        accentRgb: item.accentRgb,
                        originalPrice: item.originalPrice,
                        isOnSale: item.isOnSale,
                        discountPercentage: item.discountPercentage,
                      })
                    }
                    className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-black/40 border border-white/[0.06] hover:border-red-500/30 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition duration-200 cursor-pointer focus:outline-none"
                    aria-label="Remove item"
                  >
                    <Trash2 size={13} />
                  </button>

                  {/* Image container */}
                  <div className="relative w-full aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    {item.isOnSale && item.discountPercentage && (
                      <span className="absolute top-4 left-4 z-10 text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-red-500 to-orange-500 border border-red-500/35 text-white px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                        -{item.discountPercentage}%
                      </span>
                    )}
                    <img
                      src={resolveProductImage(getProductImage(item), item.name)}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = resolveProductImage(
                          "",
                          item.name
                        );
                      }}
                    />
                  </div>

                  <div className="flex flex-col flex-1 mt-4 space-y-4">
                    <div className="flex-1 space-y-2">
                      {item.tag && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-violet-500/10 border border-violet-500/25 text-violet-400">
                          {item.tag}
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-white leading-snug truncate group-hover:text-white/90 transition-colors">
                        {item.name}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-300">
                          ₹{formatPrice(item.price)}
                        </span>
                        {item.isOnSale && item.originalPrice && (
                          <span className="text-[11px] text-white/35 line-through font-semibold">
                            ₹{formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      disabled={addingCartId === item.productId}
                      onClick={() => handleAddToCart(item)}
                      className="w-full text-xs font-bold uppercase tracking-wider h-10 rounded-xl text-white transition-all duration-300 relative overflow-hidden cursor-pointer shadow-[0_4px_15px_rgba(124,58,237,0.25)] flex items-center justify-center gap-1.5"
                      style={{
                        background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)",
                      }}
                    >
                      {addingCartId === item.productId ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </main>
  );
}
