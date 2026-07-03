import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import React from "react";

// Asset Imports
import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";
import pOrbit from "@/assets/orbit_galaxy_projector.png";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const localImages: Record<string, string> = {
  "product-1.jpg": p1,
  "product-2.jpg": p2,
  "product-3.jpg": p3,
  "product-4.jpg": p4,
  "orbit_galaxy_projector.png": pOrbit,
};

const FALLBACKS = {
  earbuds:
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
  charger:
    "https://images.unsplash.com/photo-1622445262465-2481c4574875?w=600&auto=format&fit=crop&q=80",
  vacuum:
    "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80",
  default:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
};

export function getProductSpecificFallback(productName?: string): string {
  if (!productName) return FALLBACKS.default;
  const nameLower = productName.toLowerCase();
  if (
    nameLower.includes("earbud") ||
    nameLower.includes("earbuds") ||
    nameLower.includes("buds") ||
    nameLower.includes("headphone") ||
    nameLower.includes("audio")
  )
    return FALLBACKS.earbuds;
  if (
    nameLower.includes("charging pad") ||
    nameLower.includes("charger") ||
    nameLower.includes("pad") ||
    nameLower.includes("charging") ||
    nameLower.includes("power bank")
  )
    return FALLBACKS.charger;
  if (nameLower.includes("vacuum") || nameLower.includes("cleaner") || nameLower.includes("sweep"))
    return FALLBACKS.vacuum;
  return FALLBACKS.default;
}

export function resolveProductImage(path: string | undefined, productName?: string): string {
  const fallback = getProductSpecificFallback(productName);
  if (!path || path.trim() === "") return fallback;

  // Reject known broken placeholder paths — they don't exist in the build
  if (path === "/fallback.jpg" || path === "/placeholder.jpg" || path === "/fallback.png") {
    return fallback;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Extract filename (e.g. "/src/assets/product-1.jpg" -> "product-1.jpg")
  const filename = path.split("/").pop()?.trim() || "";
  if (localImages[filename]) return localImages[filename];

  if (path.startsWith("/")) {
    if (path.match(/\.(png|jpg|jpeg)$/i)) {
      return path.replace(/\.(png|jpg|jpeg)$/i, ".webp");
    }
    return path;
  }
  return fallback;
}

export const formatPrice = (price: number | string) => {
  const num = typeof price === "number" ? price : parseFloat(String(price));
  if (isNaN(num)) return String(price);
  return new Intl.NumberFormat("en-IN").format(num);
};

export const formatPriceCurrency = (price: number | string) => {
  const num = typeof price === "number" ? price : parseFloat(String(price));
  if (isNaN(num)) return String(price);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

const IMAGE_ADJUSTMENTS: Record<string, { scale: number; objectPosition: string }> = {
  "product-1.jpg": { scale: 1.85, objectPosition: "56% 48%" },
  "product-2.jpg": { scale: 1.6, objectPosition: "50% 58%" },
  "product-3.jpg": { scale: 1.2, objectPosition: "44% 56%" },
  "product-4.jpg": { scale: 1.35, objectPosition: "50% 50%" },
};

const getFilename = (path: string | undefined): string => {
  if (!path) return "";
  const parts = path.split("/");
  return parts[parts.length - 1] || "";
};

export const getAdjustmentStyle = (path: string | undefined): React.CSSProperties => {
  const filename = getFilename(path);
  const adj = IMAGE_ADJUSTMENTS[filename];

  const makeStyle = (s: number, pos: string): React.CSSProperties => ({
    transform: `scale(${s})`,
    transformOrigin: "center center",
    objectPosition: pos,
    objectFit: "cover" as const,
    width: "100%",
    height: "100%",
    position: "absolute" as const,
    top: 0,
    left: 0,
    willChange: "transform",
  });

  if (adj) return makeStyle(adj.scale, adj.objectPosition);

  const pathLower = path?.toLowerCase() || "";
  if (pathLower.includes("1590658268037")) return makeStyle(1.85, "56% 48%");
  if (pathLower.includes("1622445262465")) return makeStyle(1.6, "50% 58%");
  if (pathLower.includes("1558317374")) return makeStyle(1.2, "44% 56%");

  return makeStyle(1.0, "center");
};
