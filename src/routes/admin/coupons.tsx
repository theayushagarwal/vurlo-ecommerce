import { createFileRoute } from "@tanstack/react-router";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

const CouponsComponent = React.lazy(() => import("@/components/coupons-component"));

export const Route = createFileRoute("/admin/coupons")({
  component: CouponsLazy,
});

function CouponsLazy() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          <p className="text-sm text-white/45">Loading Coupons Admin...</p>
        </div>
      }
    >
      <CouponsComponent />
    </Suspense>
  );
}
