import { createFileRoute } from "@tanstack/react-router";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

const CheckoutComponent = React.lazy(() => import("@/components/checkout-component"));

export const Route = createFileRoute("/checkout")({
  component: CheckoutLazy,
  head: () => ({
    meta: [
      { title: "Checkout - VURLO" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
});

function CheckoutLazy() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          <p className="text-sm text-white/40">Loading Checkout...</p>
        </div>
      }
    >
      <CheckoutComponent />
    </Suspense>
  );
}
