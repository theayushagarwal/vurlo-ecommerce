import { createFileRoute } from "@tanstack/react-router";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

const WishlistComponent = React.lazy(() => import("@/components/wishlist-component"));

export const Route = createFileRoute("/wishlist")({
  component: WishlistLazy,
  head: () => ({
    meta: [
      { title: "Your Wishlist - VURLO" },
      { name: "description", content: "Review your saved Vurlo lighting and aesthetic room decor." },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
});

function WishlistLazy() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          <p className="text-sm text-white/40">Loading Wishlist...</p>
        </div>
      }
    >
      <WishlistComponent />
    </Suspense>
  );
}
