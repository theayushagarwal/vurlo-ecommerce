import type { VercelRequest, VercelResponse } from "@vercel/node";

interface CondensedProduct {
  id: string;
  name: string;
  category?: string;
  tags?: string[];
  price: number;
  accent?: string;
}

const cache = new Map<string, { recommendedIds: string[]; timestamp: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { currentProduct, allProducts } = req.body;

    if (!currentProduct || !currentProduct.id || !allProducts || !Array.isArray(allProducts)) {
      return res.status(200).json({ recommendedIds: [], source: "none" });
    }

    // Check valid cached entry
    const cacheKey = currentProduct.id;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.status(200).json({
        recommendedIds: cached.recommendedIds,
        source: "gemini-cached",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ recommendedIds: [], source: "none" });
    }

    // Build condensed current product and condensed catalog
    const condense = (p: any): CondensedProduct => ({
      id: p.id,
      name: p.name || "",
      category: p.category,
      tags: Array.isArray(p.tags) ? p.tags : [],
      price: p.price ?? 0,
      accent: p.accent,
    });

    const condensedCurrent = condense(currentProduct);
    const condensedCatalog = allProducts
      .filter((p: any) => p.id !== currentProduct.id && p.active !== false)
      .map(condense);

    const prompt = `You are a product recommendation engine for an RGB lighting/decor store called Vurlo. Given this current product: ${JSON.stringify(condensedCurrent)} and this catalog: ${JSON.stringify(condensedCatalog)}, return ONLY a JSON array of up to 4 product 'id' strings from the catalog (excluding the current product's id) that would pair well aesthetically or functionally with the current product. Output ONLY the JSON array, nothing else, no markdown.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 200 },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Gemini API error:", response.status, errorBody);
        return res.status(200).json({ recommendedIds: [], source: "none" });
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text || typeof text !== "string") {
        return res.status(200).json({ recommendedIds: [], source: "none" });
      }

      let cleaned = text.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      }

      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) {
        return res.status(200).json({ recommendedIds: [], source: "none" });
      }

      const validIds = new Set(allProducts.map((p: any) => p.id));
      const recommendedIds = parsed
        .filter((id: any): id is string => typeof id === "string")
        .filter((id: string) => id !== currentProduct.id && validIds.has(id))
        .slice(0, 4);

      // Prevent unbounded memory growth: if cache.size exceeds 200 entries, delete the oldest
      if (!cache.has(currentProduct.id) && cache.size >= 200) {
        let oldestKey: string | null = null;
        let oldestTimestamp = Infinity;
        for (const [k, v] of cache.entries()) {
          if (v.timestamp < oldestTimestamp) {
            oldestTimestamp = v.timestamp;
            oldestKey = k;
          }
        }
        if (oldestKey !== null) {
          cache.delete(oldestKey);
        }
      }

      // Store in-memory cache
      cache.set(currentProduct.id, {
        recommendedIds,
        timestamp: Date.now(),
      });

      return res.status(200).json({ recommendedIds, source: "gemini" });
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Gemini API call failed:", err);
      return res.status(200).json({ recommendedIds: [], source: "none" });
    }
  } catch (error) {
    console.error("AI recommendation route handler error:", error);
    return res.status(200).json({ recommendedIds: [], source: "none" });
  }
}
