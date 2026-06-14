import { useState, useEffect, useMemo } from "react";
import { FirestoreProduct } from "@/hooks/use-products";
import { getLocalRecommendations } from "@/lib/recommendations";

/**
 * Custom hook that returns product recommendations.
 * Computes local scoring immediately to avoid loading layouts, then fetches
 * AI recommendations in the background.
 */
export function useRecommendations(
  currentProduct: FirestoreProduct | undefined,
  allProducts: FirestoreProduct[],
  enabled = true
) {
  const [recommendations, setRecommendations] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const localResults = useMemo(() => {
    if (!currentProduct || allProducts.length === 0) return [];
    return getLocalRecommendations(currentProduct, allProducts);
  }, [currentProduct?.id, allProducts.length]);

  useEffect(() => {
    if (!currentProduct || !allProducts || allProducts.length === 0) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    const product = currentProduct;

    // Set local recommendations immediately
    setRecommendations(localResults);

    if (!enabled) return;

    setLoading(true);
    let isMounted = true;

    // 2. In background, POST to /api/ai-recommend
    async function fetchAiRecommendations() {
      try {
        const condensedCatalog = allProducts
          .filter(p => p.active !== false && p.id !== product.id)
          .map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            tags: p.tags,
            price: p.price,
            accent: p.accent,
          }));

        const response = await fetch("/api/ai-recommend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currentProduct: product, allProducts: condensedCatalog }),
        });

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();

        if (isMounted) {
          if (
            (data.source === "gemini" || data.source === "gemini-cached") &&
            Array.isArray(data.recommendedIds) &&
            data.recommendedIds.length > 0
          ) {
            // Map ids back to FirestoreProduct objects from allProducts (in the order returned)
            const mappedProducts: FirestoreProduct[] = [];
            const addedIds = new Set<string>();

            for (const id of data.recommendedIds) {
              const matched = allProducts.find((p) => p.id === id);
              if (
                matched &&
                matched.active !== false &&
                matched.id !== product.id
              ) {
                mappedProducts.push(matched);
                addedIds.add(matched.id);
              }
            }

            // If mapping yields fewer than 4 valid products, fill remaining slots from localResults
            if (mappedProducts.length < 4) {
              for (const p of localResults) {
                if (mappedProducts.length >= 4) break;
                if (!addedIds.has(p.id)) {
                  mappedProducts.push(p);
                  addedIds.add(p.id);
                }
              }
            }

            setRecommendations(mappedProducts);
          }
          // If response.source === "none" or fetch fails, keep localResults as-is (do nothing else)
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch AI recommendations, using local fallback:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchAiRecommendations();

    return () => {
      isMounted = false;
    };
  }, [currentProduct?.id, allProducts.length, enabled, localResults]);

  return { recommendations, loading };
}