import type { VercelRequest, VercelResponse } from "@vercel/node";

const SYSTEM_PROMPT =
  "You are the friendly customer support assistant for Vurlo (vurlo.store), an Indian online store selling RGB lights, lamps, and room decor. Help customers with questions about products, shipping (ships across India, see Refund Policy for returns/refunds), orders, and general store info. Keep replies short (2-4 sentences), friendly, and conversational. If asked something you don't know (specific order status, account issues, payment problems), tell them to use the Contact page for that. Do not make up specific prices, stock levels, or shipping dates you don't know — speak generally. Never discuss topics unrelated to Vurlo or shopping.";

interface HistoryMessage {
  role: "user" | "model";
  text: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ reply: null, source: "none" });
    }

    // Validation
    if (
      typeof message !== "string" ||
      message.trim() === "" ||
      message.length > 500
    ) {
      return res.status(200).json({ reply: null, source: "none" });
    }

    // Limit history to the last 10 messages
    let slicedHistory: HistoryMessage[] = Array.isArray(history)
      ? history.slice(-10)
      : [];

    // Defensively ensure contents array starts with a "user" role
    while (slicedHistory.length > 0 && slicedHistory[0].role === "model") {
      slicedHistory.shift();
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            ...slicedHistory.map((h) => ({
              role: h.role,
              parts: [{ text: h.text }],
            })),
            { role: "user", parts: [{ text: message }] },
          ],
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          generationConfig: { temperature: 0.5, maxOutputTokens: 300 },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Gemini API error:", response.status, errorBody);
        return res.status(200).json({ reply: null, source: "none" });
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text || typeof text !== "string" || text.trim() === "") {
        return res.status(200).json({ reply: null, source: "none" });
      }

      return res.status(200).json({ reply: text.trim(), source: "gemini" });
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Gemini support chat API call failed:", err);
      return res.status(200).json({ reply: null, source: "none" });
    }
  } catch (error) {
    console.error("AI support chat route handler error:", error);
    return res.status(200).json({ reply: null, source: "none" });
  }
}
