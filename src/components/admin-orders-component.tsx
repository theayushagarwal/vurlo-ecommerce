import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resolveProductImage, formatPrice } from "@/components/FeaturedProducts";
import { getProductImage } from "@/utils/product";
import {
  Loader2,
  Calendar,
  User,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  userEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentStatus?: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
  shippingDetails?: {
    name: string;
    address: string;
    city: string;
    pinCode: string;
    phone: string;
  };
  trackingNumber?: string;
  courierName?: string;
}

interface UserProfile {
  name: string;
  email: string;
}

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Tracking number states
  const [trackingInputs, setTrackingInputs] = useState<Record<string, { trackingNumber: string; courierName: string }>>({});
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // Save tracking details mutation
  const saveTrackingMutation = useMutation({
    mutationFn: async ({
      orderId,
      trackingNumber,
      courierName,
    }: {
      orderId: string;
      trackingNumber: string;
      courierName: string;
    }) => {
      await updateDoc(doc(db, "orders", orderId), {
        trackingNumber: trackingNumber.trim(),
        courierName: courierName.trim(),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Tracking information saved successfully!");
      setEditingOrderId(null);
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to save tracking information.");
    },
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // 1. Fetch Orders
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "orders"));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
    },
  });

  // 2. Fetch Users Map
  const { data: usersMap, isLoading: usersLoading } = useQuery<Record<string, UserProfile>>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const map: Record<string, UserProfile> = {};
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        map[docSnap.id] = {
          name: data.name || "Customer",
          email: data.email || "No email",
        };
      });
      return map;
    },
  });

  // 3. Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await updateDoc(doc(db, "orders", orderId), { status });
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      // Invalidate customer orders view so updates show on their end too
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(`Order status updated to "${variables.status}"`);

      const orderObj = orders?.find((o) => o.id === variables.orderId);

      // Trigger notification if status is updated to 'confirmed', 'shipped', or 'delivered'
      if (orderObj && ["confirmed", "shipped", "delivered"].includes(variables.status)) {
        let notifMsg = "";
        if (variables.status === "confirmed") {
          notifMsg = `Your order #${orderObj.id.slice(0, 8).toUpperCase()} has been confirmed! Γ£¿`;
        } else if (variables.status === "shipped") {
          notifMsg = `Your order #${orderObj.id.slice(0, 8).toUpperCase()} has been shipped! ≡ƒÜÜ`;
        } else if (variables.status === "delivered") {
          notifMsg = `Your order #${orderObj.id.slice(0, 8).toUpperCase()} has been delivered! Γ£à`;
        }

        console.log("[notifications] Writing status notification for userId:", orderObj.userId, "msg:", notifMsg);
        try {
          await addDoc(collection(db, "notifications"), {
            userId: orderObj.userId,
            message: notifMsg,
            type: "order",
            read: false,
            timestamp: serverTimestamp(),
            link: "/orders",
          });
          console.log("[notifications] Status notification written OK");
        } catch (e) {
          console.error("Notification error:", e);
        }
      }

      // Trigger Delivery Email if status is updated to 'delivered'
      if (variables.status === "delivered") {
        if (orderObj) {
          const customerProfile = usersMap?.[orderObj.userId];
          const destEmail = orderObj?.userEmail || customerProfile?.email || null;

          if (typeof destEmail === "string" && destEmail.includes("@") && destEmail !== "No email") {
            const { auth } = await import("@/lib/firebase");
            const idToken = await auth.currentUser?.getIdToken();
            fetch("/api/send-delivery-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-firebase-token": idToken || "",
              },
              body: JSON.stringify({
                orderId: orderObj.id,
                customerEmail: destEmail,
                customerName: orderObj.shippingDetails?.name || customerProfile?.name || "Customer",
                deliveredItems: orderObj.items.map((item) => ({
                  name: item.name,
                  quantity: item.quantity,
                })),
              }),
            })
              .then(async (res) => {
                if (!res.ok) throw new Error("API failed");
                let data: any = null;
                try { data = await res.json(); } catch {}
                if (data?.success) {
                  toast.success("Delivery notification email sent to customer!");
                }
              })
              .catch((err) => console.error("Failed to trigger delivery email:", err));
          }
        }
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update order status.");
    },
  });

  const loading = ordersLoading || usersLoading;

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
        <p className="text-sm text-white/45">
          Loading transaction history and customer profiles...
        </p>
      </div>
    );
  }

  // Summary Metrics
  const metrics = {
    total: orders?.length ?? 0,
    pending: orders?.filter((o) => o.status === "pending").length ?? 0,
    shipped: orders?.filter((o) => o.status === "shipped").length ?? 0,
    delivered: orders?.filter((o) => o.status === "delivered").length ?? 0,
  };

  // Filter and Search logic
  const filteredOrders = orders
    ? orders
        .filter((order) => {
          // Status filter
          if (statusFilter !== "all" && order.status !== statusFilter) {
            return false;
          }
          // Search query (matches Order ID, customer name, customer email)
          if (searchQuery.trim() !== "") {
            const term = searchQuery.toLowerCase().trim();
            const customer = usersMap?.[order.userId] || { name: "", email: "" };
            const matchesId = order.id.toLowerCase().includes(term);
            const matchesName = customer.name.toLowerCase().includes(term);
            const matchesEmail = customer.email.toLowerCase().includes(term);
            return matchesId || matchesName || matchesEmail;
          }
          return true;
        })
        .sort((a, b) => {
          // Sort newest first
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        })
    : [];

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };



  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 border-amber-500/25 text-amber-400";
      case "confirmed":
        return "bg-blue-500/10 border-blue-500/25 text-blue-450 text-blue-400";
      case "shipped":
        return "bg-cyan-500/10 border-cyan-500/25 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.04)]";
      case "delivered":
        return "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.04)]";
      case "cancelled":
        return "bg-red-500/10 border-red-500/25 text-red-400";
      default:
        return "bg-white/10 border-white/20 text-white";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title & metrics */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white/90">
          Order Management
        </h1>
        <p className="text-xs text-white/45">
          Review purchases, update fulfillment statuses, and manage user shipments.
        </p>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Total Logs</p>
          <p className="text-xl font-bold mt-1 text-white">{metrics.total}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/[0.04] bg-amber-500/[0.02] border-l-amber-500/40">
          <p className="text-[9px] font-bold text-amber-500/40 uppercase tracking-widest">
            Pending
          </p>
          <p className="text-xl font-bold mt-1 text-amber-400">{metrics.pending}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/[0.04] bg-cyan-500/[0.02] border-l-cyan-500/40">
          <p className="text-[9px] font-bold text-cyan-500/40 uppercase tracking-widest">Shipped</p>
          <p className="text-xl font-bold mt-1 text-cyan-400">{metrics.shipped}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/[0.04] bg-emerald-500/[0.02] border-l-emerald-500/40">
          <p className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest">
            Delivered
          </p>
          <p className="text-xl font-bold mt-1 text-emerald-400">{metrics.delivered}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="text"
            placeholder="Search by Order ID or customer credentials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-violet-500/40 text-white rounded-xl placeholder:text-white/20 h-10 pl-10 pr-10 text-xs tracking-wide focus:outline-none transition-all duration-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/40 hover:text-white/80 transition-colors duration-200 px-1 cursor-pointer focus:outline-none"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-2 border border-white/[0.06] bg-white/[0.02] p-1 rounded-xl shrink-0 overflow-x-auto">
          {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer focus:outline-none select-none border border-transparent ${
                statusFilter === status
                  ? "bg-white/[0.05] text-white border-white/[0.04]"
                  : "text-white/45 hover:text-white/70"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-white/35 border border-white/[0.06] bg-white/[0.01] rounded-2xl">
            {searchQuery || statusFilter !== "all"
              ? "No orders match your filter criteria."
              : "No orders have been placed in the store yet."}
          </div>
        ) : (
          paginatedOrders.map((order) => {
            const customer = usersMap?.[order.userId] || {
              name: "Guest User",
              email: "No account profile",
            };
            const date = order.createdAt
              ? new Date(order.createdAt.seconds * 1000).toLocaleString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Pending processing";

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0f0f18]/60 to-[#07070c]/80 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md"
              >
                {/* Header card info */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] bg-white/[0.02] px-6 py-4.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                        Order Ref
                      </span>
                      <span className="text-xs font-mono font-bold text-white/90 uppercase">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-white/35">
                      <Calendar className="h-3 w-3" />
                      <span>{date}</span>
                    </div>
                  </div>

                  {/* Status Dropdown Selector */}
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusBadge(order.status)}`}
                    >
                      {order.status}
                    </span>

                    {order.paymentStatus && (
                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          order.paymentStatus === "paid"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : order.paymentStatus === "upi_pending"
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                              : "bg-white/[0.04] border-white/10 text-white/40"
                        }`}
                      >
                        {order.paymentStatus === "paid"
                          ? "UPI Paid"
                          : order.paymentStatus === "upi_pending"
                            ? "UPI Pending"
                            : order.paymentStatus}
                      </span>
                    )}

                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updateStatusMutation.isPending}
                        className="bg-black/60 border border-white/10 hover:border-white/20 text-white rounded-lg text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1.5 focus:outline-none focus:border-violet-500/50 cursor-pointer h-7"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Customer Details Box */}
                <div className="border-b border-white/[0.04] bg-white/[0.01]/30 px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                        Customer Details
                      </p>
                      <p className="font-semibold text-white/90 mt-0.5">{customer.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                        Contact Email
                      </p>
                      <p className="font-medium text-white/60 mt-0.5">{customer.email}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Details Box */}
                {order.shippingDetails && (
                  <div className="border-b border-white/[0.04] bg-white/[0.01]/20 px-6 py-4 text-xs">
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">
                      Shipping Details
                    </p>
                    <div className="text-white/70 space-y-0.5">
                      <p>
                        <span className="text-white/40">Recipient:</span>{" "}
                        {order.shippingDetails.name} ({order.shippingDetails.phone})
                      </p>
                      <p>
                        <span className="text-white/40">Address:</span>{" "}
                        {order.shippingDetails.address}, {order.shippingDetails.city} -{" "}
                        {order.shippingDetails.pinCode}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tracking Details Box (for Shipped & Delivered Orders) */}
                {["shipped", "delivered"].includes(order.status) && (
                  <div className="border-b border-white/[0.04] bg-violet-500/[0.01] px-6 py-4 text-xs border-l-2 border-l-violet-500/30">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[9px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1">
                        <Truck className="h-3 w-3" /> Shipment Tracking Info
                      </p>
                      {editingOrderId !== order.id && (
                        <button
                          onClick={() => {
                            setEditingOrderId(order.id);
                            setTrackingInputs((prev) => ({
                              ...prev,
                              [order.id]: {
                                trackingNumber: order.trackingNumber || "",
                                courierName: order.courierName || "",
                              },
                            }));
                          }}
                          className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold cursor-pointer transition uppercase"
                        >
                          {order.trackingNumber ? "Edit" : "Add Details"}
                        </button>
                      )}
                    </div>

                    {editingOrderId === order.id ? (
                      <div className="space-y-3 mt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">
                              Courier / Service Partner
                            </label>
                            <input
                              type="text"
                              placeholder="E.G. Delhivery, Bluedart"
                              value={trackingInputs[order.id]?.courierName || ""}
                              onChange={(e) =>
                                setTrackingInputs((prev) => ({
                                  ...prev,
                                  [order.id]: {
                                    ...prev[order.id],
                                    courierName: e.target.value,
                                  },
                                }))
                              }
                              className="w-full bg-black/40 border border-white/10 focus:border-violet-500/50 text-white rounded-lg h-8 px-2.5 text-xs focus:outline-none transition-colors"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-white/35 uppercase tracking-wider">
                              Tracking AWB Number
                            </label>
                            <input
                              type="text"
                              placeholder="E.G. 1234567890"
                              value={trackingInputs[order.id]?.trackingNumber || ""}
                              onChange={(e) =>
                                setTrackingInputs((prev) => ({
                                  ...prev,
                                  [order.id]: {
                                    ...prev[order.id],
                                    trackingNumber: e.target.value,
                                  },
                                }))
                              }
                              className="w-full bg-black/40 border border-white/10 focus:border-violet-500/50 text-white rounded-lg h-8 px-2.5 text-xs focus:outline-none transition-colors"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingOrderId(null)}
                            className="px-3 py-1 rounded-lg border border-white/10 bg-transparent text-[10px] font-bold uppercase tracking-wider hover:bg-white/[0.02] text-white/60 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={saveTrackingMutation.isPending}
                            onClick={() => {
                              const input = trackingInputs[order.id];
                              if (!input?.trackingNumber.trim()) {
                                toast.error("Tracking number is required.");
                                return;
                              }
                              saveTrackingMutation.mutate({
                                orderId: order.id,
                                trackingNumber: input.trackingNumber,
                                courierName: input.courierName,
                              });
                            }}
                            className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50"
                          >
                            {saveTrackingMutation.isPending ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : order.trackingNumber ? (
                      <div className="text-white/70 space-y-0.5">
                        <p>
                          <span className="text-white/40">Courier:</span>{" "}
                          <span className="font-semibold text-white/90">{order.courierName || "Standard Delivery"}</span>
                        </p>
                        <p>
                          <span className="text-white/40">AWB/Tracking ID:</span>{" "}
                          <span className="font-mono text-white/80 select-all font-semibold">{order.trackingNumber}</span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-white/30 italic text-[11px] py-1">
                        No shipment tracking info added yet. Click "Add Details" to set courier & tracking ID.
                      </p>
                    )}
                  </div>
                )}

                {/* Order Items Breakdown */}
                <div className="divide-y divide-white/[0.03] px-6 py-1 bg-black/10">
                  {order.items?.map((item) => (
                    <div key={item.productId} className="flex items-center gap-4 py-3 text-xs">
                      <img
                        src={resolveProductImage(getProductImage(item), item.name)}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover bg-white/[0.03] border border-white/[0.06] shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = resolveProductImage(
                            "",
                            item.name,
                          );
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white/90 truncate leading-snug">
                          {item.name}
                        </h4>
                        <p className="text-[9px] text-white/35 mt-0.5">
                          Quantity: {item.quantity} &middot; Price: {formatPrice(item.price)} each
                        </p>
                      </div>
                      <span className="font-bold text-white/80 shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer summary */}
                <div className="flex items-center justify-between bg-white/[0.01] px-6 py-4.5 border-t border-white/[0.05]">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Order Total Amount
                  </span>
                  <span className="text-base font-black text-white">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.04] text-xs">
          <span className="text-white/35 font-medium">
            Showing {Math.min(filteredOrders.length, (currentPage - 1) * itemsPerPage + 1)}-
            {Math.min(filteredOrders.length, currentPage * itemsPerPage)} of {filteredOrders.length}{" "}
            orders
          </span>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-3 rounded-lg border border-white/10 bg-transparent text-xs hover:bg-white/[0.03] text-white/80 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
            >
              Previous
            </Button>
            <span className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-3 rounded-lg border border-white/10 bg-transparent text-xs hover:bg-white/[0.03] text-white/80 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
