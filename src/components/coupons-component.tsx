import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Tag, Plus, Trash2, Calendar, DollarSign, Percent, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  expiryDate?: string;
  minOrder?: number;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  createdAt?: any;
}

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  const { data: coupons, isLoading } = useQuery<Coupon[]>({
    queryKey: ["admin", "coupons"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "coupons"));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Coupon[];
      // Sort: newest first
      return items.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newCoupon: Omit<Coupon, "id" | "usageCount">) => {
      await addDoc(collection(db, "coupons"), {
        ...newCoupon,
        usageCount: 0,
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
      toast.success("Coupon created successfully!");
      setShowAddForm(false);
      resetForm();
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to create coupon.");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await updateDoc(doc(db, "coupons", id), { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
      toast.success("Coupon status updated.");
    },
    onError: () => toast.error("Failed to update status."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "coupons", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
      toast.success("Coupon deleted.");
    },
    onError: () => toast.error("Failed to delete coupon."),
  });

  const resetForm = () => {
    setCode("");
    setType("percentage");
    setValue("");
    setExpiryDate("");
    setMinOrder("");
    setUsageLimit("");
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomStr = "";
    for (let i = 0; i < 5; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(`VURLO-${randomStr}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }
    const val = Number(value);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid positive discount value.");
      return;
    }
    if (type === "percentage" && val > 100) {
      toast.error("Percentage discount cannot exceed 100%.");
      return;
    }

    addMutation.mutate({
      code: code.trim().toUpperCase(),
      type,
      value: val,
      expiryDate: expiryDate || undefined,
      minOrder: minOrder ? Number(minOrder) : undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      isActive: true,
    });
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
        <p className="text-sm text-white/45">Loading coupon configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white/90">
            Coupon Codes
          </h1>
          <p className="text-xs text-white/45">
            Configure discounts, promotional codes, and cart minimum requirements.
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white shrink-0 flex items-center gap-2 cursor-pointer transition-all hover:opacity-90 self-start sm:self-center"
          style={{ background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)" }}
        >
          {showAddForm ? "View List" : "Create Coupon"}
          {showAddForm ? <Tag className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {showAddForm ? (
        /* Coupon Creator Form */
        <div className="max-w-xl rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0f0f18]/60 to-[#07070c]/80 p-6 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-sm font-bold text-white/90 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400" /> Create Promotional Coupon
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Coupon Code input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Coupon Code
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="E.G. SUMMER20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  className="bg-white/[0.02] border-white/[0.06] focus:border-violet-500/50 text-white rounded-xl placeholder:text-white/20 h-10 px-3 text-xs uppercase font-semibold"
                />
                <Button
                  type="button"
                  onClick={generateCode}
                  className="h-10 px-4 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-bold uppercase tracking-wider hover:bg-white/[0.08] text-white shrink-0 cursor-pointer"
                >
                  Generate
                </Button>
              </div>
            </div>

            {/* Discount Type selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                Discount Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("percentage")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    type === "percentage"
                      ? "border-violet-500/40 bg-violet-500/[0.06] text-violet-400"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] text-white/60"
                  }`}
                >
                  <Percent className="h-3.5 w-3.5" /> Percentage
                </button>
                <button
                  type="button"
                  onClick={() => setType("fixed")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    type === "fixed"
                      ? "border-violet-500/40 bg-violet-500/[0.06] text-violet-400"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] text-white/60"
                  }`}
                >
                  <DollarSign className="h-3.5 w-3.5" /> Fixed Amount (₹)
                </button>
              </div>
            </div>

            {/* Discount Value */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Discount Value {type === "percentage" ? "(%)" : "(₹)"}
              </label>
              <Input
                type="number"
                placeholder={type === "percentage" ? "10" : "150"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                min={1}
                max={type === "percentage" ? 100 : undefined}
                className="bg-white/[0.02] border-white/[0.06] focus:border-violet-500/50 text-white rounded-xl placeholder:text-white/20 h-10 px-3 text-xs font-semibold"
              />
            </div>

            {/* Minimum Order */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Minimum Order Requirement (₹) (Optional)
              </label>
              <Input
                type="number"
                placeholder="E.G. 500"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                min={0}
                className="bg-white/[0.02] border-white/[0.06] focus:border-violet-500/50 text-white rounded-xl placeholder:text-white/20 h-10 px-3 text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Expiry Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-violet-500/50 text-white rounded-xl h-10 px-3 text-xs font-semibold focus:outline-none transition-colors"
                />
              </div>

              {/* Usage Limit */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                  Total Usage Limit (Optional)
                </label>
                <Input
                  type="number"
                  placeholder="E.G. 100"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  min={1}
                  className="bg-white/[0.02] border-white/[0.06] focus:border-violet-500/50 text-white rounded-xl placeholder:text-white/20 h-10 px-3 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="flex-1 h-10 rounded-xl border border-white/10 bg-transparent text-xs font-bold uppercase tracking-wider hover:bg-white/[0.02] text-white/70 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addMutation.isPending}
                className="flex-1 h-10 rounded-xl text-xs font-bold uppercase tracking-wider text-white cursor-pointer transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)" }}
              >
                {addMutation.isPending ? "Creating..." : "Save Coupon"}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        /* Coupons List */
        <div className="space-y-4">
          {!coupons || coupons.length === 0 ? (
            <div className="py-16 text-center text-xs text-white/35 border border-white/[0.06] bg-white/[0.01] rounded-2xl">
              No promotional coupons configured yet. Click "Create Coupon" to start.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.map((coupon) => {
                const isExpired = coupon.expiryDate ? new Date(coupon.expiryDate) < new Date() : false;
                const isLimitReached = coupon.usageLimit ? coupon.usageCount >= coupon.usageLimit : false;

                return (
                  <div
                    key={coupon.id}
                    className={`rounded-2xl border p-5 bg-gradient-to-b from-[#0f0f18]/60 to-[#07070c]/80 shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300 ${
                      !coupon.isActive || isExpired || isLimitReached
                        ? "border-white/[0.03] opacity-65"
                        : "border-white/[0.06] hover:border-violet-500/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-white tracking-wider">
                            {coupon.code}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                              coupon.isActive && !isExpired && !isLimitReached
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-red-500/10 border-red-500/20 text-red-400"
                            }`}
                          >
                            {coupon.isActive && !isExpired && !isLimitReached
                              ? "Active"
                              : isExpired
                                ? "Expired"
                                : isLimitReached
                                  ? "Limit Reached"
                                  : "Inactive"}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/35 font-medium">
                          Created: {coupon.createdAt ? new Date(coupon.createdAt.seconds * 1000).toLocaleDateString("en-IN") : "—"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle active status */}
                        <button
                          onClick={() => toggleMutation.mutate({ id: coupon.id, isActive: !coupon.isActive })}
                          disabled={toggleMutation.isPending}
                          className="text-white/40 hover:text-white transition-colors cursor-pointer p-1 rounded hover:bg-white/[0.03]"
                          title={coupon.isActive ? "Deactivate" : "Activate"}
                        >
                          {coupon.isActive ? (
                            <ToggleRight className="h-5 w-5 text-violet-400" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete coupon "${coupon.code}"?`)) {
                              deleteMutation.mutate(coupon.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="text-white/25 hover:text-red-400 transition-colors cursor-pointer p-1 rounded hover:bg-white/[0.03]"
                          title="Delete Coupon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Coupon Metrics */}
                    <div className="grid grid-cols-2 gap-4 mt-6 border-t border-white/[0.04] pt-4 text-xs">
                      <div>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                          Discount
                        </p>
                        <p className="font-extrabold text-white mt-0.5">
                          {coupon.type === "percentage" ? `${coupon.value}%` : `₹${coupon.value}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                          Redeemed
                        </p>
                        <p className="font-semibold text-white/80 mt-0.5">
                          {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "times"}
                        </p>
                      </div>
                    </div>

                    {/* Restrictions / Dates */}
                    <div className="mt-4 space-y-1.5 text-[10px] text-white/50 border-t border-white/[0.03] pt-3">
                      {coupon.minOrder && (
                        <div className="flex justify-between">
                          <span className="text-white/30">Min. Purchase requirement:</span>
                          <span className="font-medium text-white/70">₹{coupon.minOrder}</span>
                        </div>
                      )}
                      {coupon.expiryDate && (
                        <div className="flex justify-between">
                          <span className="text-white/30">Expiration Date:</span>
                          <span className="font-medium text-white/70 flex items-center gap-1">
                            <Calendar className="h-3 w-3 shrink-0" />
                            {new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
