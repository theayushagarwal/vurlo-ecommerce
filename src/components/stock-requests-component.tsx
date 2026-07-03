import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Bell, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import React from "react";

interface StockNotification {
  id: string;
  email: string;
  productId: string;
  productName?: string;
  createdAt?: { seconds: number; nanoseconds: number };
}

export default function StockRequestsPage() {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery<StockNotification[]>({
    queryKey: ["admin", "stock-requests"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "stock_notifications"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as StockNotification[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "stock_notifications", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "stock-requests"] });
      toast.success("Request dismissed.");
    },
    onError: () => toast.error("Failed to dismiss."),
  });

  // Group by productId
  const grouped = requests
    ? requests.reduce<Record<string, StockNotification[]>>((acc, r) => {
        const key = r.productId || "unknown";
        if (!acc[key]) acc[key] = [];
        acc[key].push(r);
        return acc;
      }, {})
    : {};

  const sortedGroups = Object.entries(grouped).sort(([, a], [, b]) => b.length - a.length);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
        <p className="text-sm text-white/45">Loading stock requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white/90">
          Stock Requests
        </h1>
        <p className="text-xs text-white/45">
          Customers who want to be notified when out-of-stock products are restocked.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Total Requests</p>
          <p className="text-xl font-bold mt-1 text-white">{requests?.length ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/[0.04] bg-violet-500/[0.02] border-l-violet-500/40">
          <p className="text-[9px] font-bold text-violet-500/40 uppercase tracking-widest">Products Requested</p>
          <p className="text-xl font-bold mt-1 text-violet-400">{sortedGroups.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/[0.04] bg-amber-500/[0.02] border-l-amber-500/40">
          <p className="text-[9px] font-bold text-amber-500/40 uppercase tracking-widest">Most Wanted</p>
          <p className="text-sm font-bold mt-1 text-amber-400 truncate">
            {sortedGroups[0]?.[1]?.[0]?.productName || sortedGroups[0]?.[0]?.slice(0, 10) || "—"}
          </p>
        </div>
      </div>

      {sortedGroups.length === 0 ? (
        <div className="py-16 text-center text-xs text-white/35 border border-white/[0.06] bg-white/[0.01] rounded-2xl">
          No stock notification requests yet.
        </div>
      ) : (
        <div className="space-y-6">
          {sortedGroups.map(([productId, items]) => (
            <div
              key={productId}
              className="overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0f0f18]/60 to-[#07070c]/80"
            >
              {/* Product header */}
              <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-6 py-4">
                <Package className="h-4 w-4 text-violet-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white/80 truncate">
                    {items[0]?.productName || "Product"}
                  </p>
                  <p className="text-[10px] text-white/35 font-mono mt-0.5">{productId}</p>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border border-violet-500/25 bg-violet-500/10 text-violet-400">
                  {items.length} request{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Email list */}
              <div className="divide-y divide-white/[0.03] px-6 py-1">
                {items.map((req) => (
                  <div key={req.id} className="flex items-center justify-between py-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Bell className="h-3.5 w-3.5 text-white/25 shrink-0" />
                      <span className="text-white/70 truncate">{req.email}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      {req.createdAt && (
                        <span className="text-[10px] text-white/25 hidden sm:block">
                          {new Date(req.createdAt.seconds * 1000).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(req.id)}
                        disabled={deleteMutation.isPending}
                        className="text-white/25 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
