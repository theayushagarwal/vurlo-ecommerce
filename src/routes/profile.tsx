import { createFileRoute } from "@tanstack/react-router";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

const ProfileComponent = React.lazy(() => import("@/components/profile-component"));

export const Route = createFileRoute("/profile")({
  component: ProfileLazy,
  head: () => ({
    meta: [
      { title: "Profile Settings - VURLO" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
});

function ProfileLazy() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          <p className="text-sm text-white/40">Loading Profile Settings...</p>
        </div>
      }
    >
      <ProfileComponent />
    </Suspense>
  );
}
