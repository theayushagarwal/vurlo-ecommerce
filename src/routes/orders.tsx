import { createFileRoute } from "@tanstack/react-router";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

const OrdersComponent = React.lazy(() => import("@/components/orders-component"));

export const Route = createFileRoute("/orders")({
  component: OrdersLazy,
  head: () => ({
    meta: [
      { title: "My Orders - VURLO" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
});

function OrdersLazy() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          <p className="text-sm text-white/40">Loading Orders...</p>
        </div>
      }
    >
      <OrdersComponent />
    </Suspense>
  );
}
