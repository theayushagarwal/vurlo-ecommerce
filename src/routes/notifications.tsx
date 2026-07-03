import { createFileRoute } from "@tanstack/react-router";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

const NotificationsComponent = React.lazy(() => import("@/components/notifications-component"));

export const Route = createFileRoute("/notifications")({
  component: NotificationsLazy,
  head: () => ({
    meta: [
      { title: "Your Notifications - VURLO" },
      { name: "description", content: "Stay updated with your VURLO order statuses and security alerts." },
    ],
  }),
});

function NotificationsLazy() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          <p className="text-sm text-white/40">Loading Notifications...</p>
        </div>
      }
    >
      <NotificationsComponent />
    </Suspense>
  );
}
