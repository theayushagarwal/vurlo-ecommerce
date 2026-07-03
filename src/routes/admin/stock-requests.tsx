import { createFileRoute } from "@tanstack/react-router";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

const StockRequestsComponent = React.lazy(() => import("@/components/stock-requests-component"));

export const Route = createFileRoute("/admin/stock-requests")({
  component: StockRequestsLazy,
});

function StockRequestsLazy() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          <p className="text-sm text-white/45">Loading Stock Requests...</p>
        </div>
      }
    >
      <StockRequestsComponent />
    </Suspense>
  );
}
