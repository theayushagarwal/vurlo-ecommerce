import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getProductImage, getProductSlug } from "@/utils/product";

export {
  resolveProductImage,
  formatPrice,
  getAdjustmentStyle,
  getProductSpecificFallback,
} from "@/lib/utils";

export interface FirestoreProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  images: string[] | Record<string, string[]>; // Always a non-empty normalized array or variant map
  tag?: string | null;
  accent?: string;
  accentRgb?: string;
  active?: boolean;
  description?: string;
  originalPrice?: number;
  discountPercentage?: number;
  discountPercent?: number;
  isOnSale?: boolean;
  onSale?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  category?: string;
  stock?: number;
  rating?: number;
  reviewsCount?: number;
  badge?: string | null;
  features?: string[];
  tags?: string[];
  variants?: { name: string; images: string[] }[];
  defaultVariant?: string;
  displayName?: string;
  seoTitle?: string;
  variantPrices?: Record<string, { price: number; originalPrice?: number }>;
}

/**
 * Normalizes all image field variants into a clean string[] or Record<string, string[]>.
 * Handles: images[] (new), images object (variants), image (legacy string), img (ProductCard legacy).
 */
function normalizeImages(data: Record<string, unknown>): string[] | Record<string, string[]> {
  if (data.images && typeof data.images === "object" && !Array.isArray(data.images)) {
    return data.images as Record<string, string[]>;
  }
  if (Array.isArray(data.images) && data.images.length > 0) {
    return (data.images as string[]).filter((img) => typeof img === "string" && img.trim() !== "");
  }
  if (typeof data.image === "string" && data.image.trim() !== "") {
    return [data.image];
  }
  if (typeof data.img === "string" && (data.img as string).trim() !== "") {
    return [data.img as string];
  }
  return [];
}

export function useProducts() {
  return useQuery<FirestoreProduct[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const productsColRef = collection(db, "products");
      const querySnapshot = await getDocs(productsColRef);
      const items: FirestoreProduct[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        let feat = !!data.isFeatured;
        let nw = !!data.isNew;

        if (data.tag) {
          const t = String(data.tag).toUpperCase();
          if (t === "FEATURED") feat = true;
          if (t === "NEW") nw = true;
        }

        const variants = Array.isArray(data.variants)
          ? (data.variants as { name: string; images: string[] }[])
          : undefined;
        const defaultVariant = data.defaultVariant as string | undefined;

        let normalizedImages = normalizeImages(data);
        if (Array.isArray(normalizedImages) && normalizedImages.length === 0 && variants && defaultVariant) {
          const defVar = variants.find((v) => v.name.toLowerCase() === defaultVariant.toLowerCase());
          if (defVar && Array.isArray(defVar.images) && defVar.images.length > 0) {
            normalizedImages = defVar.images;
          }
        }

        let imgUrl = "";
        if (Array.isArray(normalizedImages)) {
          imgUrl = normalizedImages[0] || getProductImage(data as Parameters<typeof getProductImage>[0]);
        } else if (normalizedImages && typeof normalizedImages === "object") {
          const defVarName = (defaultVariant || "Galaxy").toLowerCase();
          const defVarImages = normalizedImages[defVarName] || Object.values(normalizedImages)[0] || [];
          imgUrl = defVarImages[0] || getProductImage(data as Parameters<typeof getProductImage>[0]);
        }

        items.push({
          id: docSnap.id,
          name: (data.name as string) || "",
          displayName: (data.displayName as string) || undefined,
          seoTitle: (data.seoTitle as string) || undefined,
          slug: (data.slug as string) || getProductSlug((data.name as string) || ""),
          price: (data.price as number) ?? 0,
          image: imgUrl,
          images: normalizedImages,
          tag: (data.tag as string) || null,
          accent: data.accent as string | undefined,
          accentRgb: data.accentRgb as string | undefined,
          active: data.active !== false,
          description: (data.description as string) || "",
          originalPrice: data.originalPrice as number | undefined,
          discountPercentage:
            (data.discountPercentage as number) !== undefined
              ? (data.discountPercentage as number)
              : (data.discountPercent as number),
          discountPercent:
            (data.discountPercent as number) !== undefined
              ? (data.discountPercent as number)
              : (data.discountPercentage as number),
          isOnSale: (data.isOnSale as boolean) !== undefined ? !!data.isOnSale : !!data.onSale,
          onSale: (data.onSale as boolean) !== undefined ? !!data.onSale : !!data.isOnSale,
          isFeatured: feat,
          isNew: nw,
          category: (data.category as string) || "RGB Lights",
          stock: data.stock !== undefined ? Number(data.stock) : 10,
          rating: data.rating !== undefined ? Number(data.rating) : undefined,
          reviewsCount: data.reviewsCount !== undefined ? Number(data.reviewsCount) : undefined,
          badge: (data.badge as string) || null,
          features: Array.isArray(data.features) ? (data.features as string[]) : [],
          tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
          variants,
          defaultVariant,
          variantPrices: data.variantPrices as Record<string, { price: number; originalPrice?: number }> | undefined,
        });
      });

      return items;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
