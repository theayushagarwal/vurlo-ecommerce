import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Loader2,
  ArrowLeft,
  ShoppingBag,
  Clock,
  ShieldAlert,
  Check,
  Truck,
  Package,
  ChevronDown,
  RefreshCw,
  Copy,
} from "lucide-react";
import { resolveProductImage, formatPrice } from "@/components/FeaturedProducts";
import { toast } from "sonner";
import { getProductImage } from "@/utils/product";
import { useCart } from "@/hooks/use-cart";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
  head: () => ({
    meta: [
      { title: "My Orders - VURLO" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
});

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

function OrdersPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between overflow-x-hidden page-transition">
      <div>
        <Navbar />
        <OrdersContent />
      </div>
      <Footer />
    </main>
  );
}

function getLogisticsLogs(order: any) {
  const logs: { time: string; event: string; done: boolean }[] = [];
  const baseTime = order.createdAt ? order.createdAt.seconds * 1000 : Date.now();

  const formatLogTime = (ms: number) => {
    return (
      new Date(ms).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      }) +
      ", " +
      new Date(ms).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );
  };

  // Step 1: Placed
  logs.push({
    time: formatLogTime(baseTime),
    event: "Order placed successfully & payment processed",
    done: true,
  });

  const isConfirmed = ["confirmed", "shipped", "delivered"].includes(order.status);
  const isShipped = ["shipped", "delivered"].includes(order.status);
  const isDelivered = order.status === "delivered";

  // Step 2: Confirmed
  if (isConfirmed) {
    logs.push({
      time: formatLogTime(baseTime + 6 * 60 * 60 * 1000), // 6 hrs later
      event: "Order confirmed and item prepared for packaging",
      done: true,
    });
  } else if (order.status !== "cancelled") {
    logs.push({
      time: "Pending",
      event: "Preparing package for dispatch",
      done: false,
    });
  }

  // Step 3: Shipped
  if (isShipped) {
    logs.push({
      time: formatLogTime(baseTime + 18 * 60 * 60 * 1000), // 18 hrs later
      event: "Package picked up by Vurlo Express Cargo & in transit",
      done: true,
    });
    logs.push({
      time: formatLogTime(baseTime + 28 * 60 * 60 * 1000), // 28 hrs later
      event: "Arrived at destination distribution center",
      done: true,
    });
  } else if (order.status !== "cancelled") {
    logs.push({
      time: "Pending",
      event: "Awaiting courier pickup",
      done: false,
    });
  }

  // Step 4: Delivered
  if (isDelivered) {
    logs.push({
      time: formatLogTime(baseTime + 42 * 60 * 60 * 1000), // 42 hrs later
      event: "Out for delivery - Courier partner assigned",
      done: true,
    });
    logs.push({
      time: formatLogTime(baseTime + 45 * 60 * 60 * 1000), // 45 hrs later
      event: "Delivered & signed by customer",
      done: true,
    });
  } else if (order.status !== "cancelled") {
    logs.push({
      time: "Pending",
      event: "Delivery to recipient address",
      done: false,
    });
  }

  if (order.status === "cancelled") {
    logs.push({
      time: formatLogTime(Date.now()),
      event: "Order cancelled - refund initiated if applicable",
      done: true,
    });
  }

  return logs.reverse();
}

function OrderStatusTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center justify-center gap-2 border border-red-500/20 bg-red-500/5 px-4 py-3 rounded-2xl text-xs font-bold text-red-400 max-w-md mx-auto">
        <ShieldAlert className="h-4.5 w-4.5" />
        This order has been cancelled.
      </div>
    );
  }

  const steps = [
    { key: "placed", label: "Placed" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];

  let currentIdx = 0; // Placed
  if (status === "shipped") {
    currentIdx = 1;
  } else if (status === "delivered") {
    currentIdx = 2;
  } else if (status === "confirmed") {
    currentIdx = 0;
  }

  // Stepper colors based on status
  let activeTrackColor = "from-yellow-500 to-yellow-600";
  if (status === "shipped") {
    activeTrackColor = "from-yellow-500 via-blue-500 to-blue-500";
  } else if (status === "delivered") {
    activeTrackColor = "from-yellow-500 via-blue-500 to-green-500";
  }

  return (
    <div className="w-full py-2">
      {/* Visual Stepper Progress Bar */}
      <div className="relative w-full py-4 mb-2">
        {/* Background track line */}
        <div className="absolute left-[15%] right-[15%] top-[24px] h-[3px] -translate-y-1/2 bg-white/[0.06] rounded-full" />

        {/* Active colored progress track line */}
        <div
          className={`absolute left-[15%] top-[24px] h-[3px] -translate-y-1/2 bg-gradient-to-r ${activeTrackColor} transition-all duration-700 rounded-full`}
          style={{
            width: `${(currentIdx / (steps.length - 1)) * 70}%`,
            transformOrigin: "left",
          }}
        />

        <div className="flex justify-between items-start">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isUpcoming = idx > currentIdx;

            let nodeDot = "";
            let labelClass = "";

            if (isCompleted) {
              nodeDot = "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]";
              labelClass = "text-white/80 font-bold";
            } else if (isCurrent) {
              if (status === "delivered") {
                nodeDot = "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]";
              } else if (status === "shipped") {
                nodeDot =
                  "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-white/20 animate-pulse";
              } else {
                nodeDot =
                  "bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)] border border-white/10 animate-pulse";
              }
              labelClass = "text-white font-extrabold";
            } else {
              nodeDot = "bg-[#090910] border border-white/[0.12] text-white/30";
              labelClass = "text-white/30 font-medium";
            }

            return (
              <div
                key={step.key}
                className="flex flex-col items-center gap-2.5 w-[30%] relative z-10"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 text-xs ${nodeDot}`}
                >
                  {isCompleted || (isCurrent && status === "delivered") ? (
                    <Check className="h-4 w-4" />
                  ) : idx === 1 ? (
                    <Truck className="h-3.5 w-3.5" />
                  ) : idx === 2 ? (
                    <Package className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider block text-center leading-tight ${labelClass}`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OrdersContent() {
  const { user } = useAuth();
  const { addMultipleToCart } = useCart();
  const navigate = useNavigate();

  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [visibleCount, setVisibleCount] = useState(5);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const unsubRef = useRef<(() => void) | null>(null);
  const queryKey = ["orders", user?.uid] as const;

  // Real-time listener: pushes every Firestore update into React Query cache.
  // Runs once when user is available, cleans up on unmount.
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        queryClient.setQueryData(queryKey, items);
      },
      (err) => {
        console.error("Orders listener error:", err);
      },
    );
    unsubRef.current = unsub;
    return () => unsub();
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery<Order[]>({
    queryKey,
    enabled: !!user,
    queryFn: () =>
      new Promise<Order[]>((resolve) => {
        const q = query(collection(db, "orders"), where("userId", "==", user!.uid));
        const unsub = onSnapshot(q, (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Order[];
          items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          unsub();
          resolve(items);
        });
      }),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    placeholderData: (prev) => prev,
  });

  const toggleExpand = (orderId: string) => {
    setExpandedOrderIds((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleReorder = async (orderItems: OrderItem[], orderId: string) => {
    setReorderingId(orderId);
    try {
      const itemsToCart = orderItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      }));
      await addMultipleToCart(itemsToCart);
      navigate({ to: "/" });
    } catch (e) {
      console.error("Reorder failed:", e);
    } finally {
      setReorderingId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order? This cannot be undone.",
    );
    if (!confirmed) return;
    setCancellingId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), { status: "cancelled" });
      toast.success("Order cancelled successfully.", {
        description: "If payment was made, a refund will be initiated.",
      });
    } catch (e) {
      toast.error("Failed to cancel order. Please contact support.");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
          dot: "bg-yellow-400",
          label: "Pending",
        };
      case "confirmed":
        return {
          bg: "bg-blue-500/10 border-blue-500/20 text-blue-400",
          dot: "bg-blue-400",
          label: "Confirmed",
        };
      case "shipped":
        return {
          bg: "bg-purple-500/10 border-purple-500/20 text-purple-400",
          dot: "bg-purple-400",
          label: "Shipped",
        };
      case "delivered":
        return {
          bg: "bg-green-500/10 border-green-500/20 text-green-400",
          dot: "bg-green-400",
          label: "Delivered",
        };
      case "cancelled":
        return {
          bg: "bg-red-500/10 border-red-500/20 text-red-400",
          dot: "bg-red-400",
          label: "Cancelled",
        };
      default:
        return {
          bg: "bg-white/10 border-white/20 text-white/80",
          dot: "bg-white",
          label: status,
        };
    }
  };

  // Stats Calculations
  const visibleOrders = (orders ?? []).filter(
    (o) => !(o.paymentStatus === "upi_pending" && o.status === "pending")
  );

  const totalOrders = visibleOrders.length;
  const totalSpent =
    visibleOrders.reduce((acc, o) => (o.status !== "cancelled" ? acc + o.totalAmount : acc), 0);
  const activeOrdersCount =
    visibleOrders.filter((o) => ["pending", "confirmed", "shipped"].includes(o.status)).length;

  const tabs = [
    { id: "all", label: "All Orders", count: totalOrders },
    { id: "active", label: "Active", count: activeOrdersCount },
    {
      id: "completed",
      label: "Completed",
      count: visibleOrders.filter((o) => o.status === "delivered").length,
    },
    {
      id: "cancelled",
      label: "Cancelled",
      count: visibleOrders.filter((o) => o.status === "cancelled").length,
    },
  ] as const;

  // Filter & Paginate
  const filteredOrders =
    visibleOrders.filter((order) => {
      if (activeTab === "all") return true;
      if (activeTab === "active") {
        return ["pending", "confirmed", "shipped"].includes(order.status);
      }
      if (activeTab === "completed") {
        return order.status === "delivered";
      }
      if (activeTab === "cancelled") {
        return order.status === "cancelled";
      }
      return true;
    });

  const paginatedOrders = filteredOrders.slice(0, visibleCount);

  return (
    <div className="relative mx-auto max-w-4xl px-6 py-16 sm:py-24">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex justify-center items-center">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/[0.03] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-cyan-500/[0.02] blur-[100px]" />
      </div>

      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors duration-200 group mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to Collection
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white/90 sm:text-4xl">
            My Orders
          </h1>
          <p className="text-sm text-white/45">Track and view details of your premium purchases</p>
        </div>

        {/* Premium Stats Grid */}
        {visibleOrders && visibleOrders.length > 0 && (
          <div className="grid grid-cols-3 gap-4 border border-white/[0.06] bg-white/[0.02] rounded-2xl p-4 min-w-[280px] md:min-w-[360px]">
            <div className="text-center">
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Orders</p>
              <p className="text-sm font-extrabold text-white mt-0.5">{totalOrders}</p>
            </div>
            <div className="text-center border-x border-white/[0.06] px-2">
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider">
                Total Spent
              </p>
              <p className="text-sm font-extrabold text-violet-400 mt-0.5">
                ₹{formatPrice(totalSpent)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Active</p>
              <p className="text-sm font-extrabold text-cyan-400 mt-0.5">{activeOrdersCount}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-white/[0.06] pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setVisibleCount(5);
            }}
            className={`px-4 py-2 text-xs font-semibold tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? "bg-violet-600/20 text-violet-400 border border-violet-500/30"
                : "text-white/40 hover:text-white/70 border border-transparent"
            }`}
          >
            {tab.label}{" "}
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/[0.04] text-[10px] text-white/50">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
          <p className="text-xs text-white/40">Fetching your orders...</p>
        </div>
      ) : error ? (
        <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6 text-center text-sm text-red-400">
          An error occurred while loading your orders. Please refresh.
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/70">No order history found</h3>
            <p className="text-xs text-white/40 mt-1">
              Explore our premium lighting setup products to place your first order.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-white text-black px-6 py-2 text-xs font-semibold hover:bg-white/90 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-2">
          <p className="text-sm font-semibold text-white/60">No orders matching this filter</p>
          <p className="text-xs text-white/40">Try switching tabs to view other orders.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedOrders.map((order) => {
            const isExpanded = !!expandedOrderIds[order.id];
            const date = order.createdAt
              ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Pending processing";

            const badge = getStatusBadgeConfig(order.status);

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0f0f18] to-[#090910] shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-white/[0.12]"
              >
                {/* 1. Amazon-Style Header */}
                <div className="grid grid-cols-2 md:flex md:flex-wrap items-center justify-between gap-y-4 gap-x-8 bg-white/[0.02] px-6 py-4.5 border-b border-white/[0.06]">
                  <div>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                      Order Placed
                    </p>
                    <p className="text-xs font-semibold text-white/80 mt-1">{date}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                      Total
                    </p>
                    <p className="text-xs font-extrabold text-white/95 mt-1">
                      ₹{formatPrice(order.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                      Ship To
                    </p>
                    <div className="relative group mt-1">
                      <span className="text-xs font-semibold text-white/80 border-b border-dashed border-white/20 hover:text-violet-400 transition-colors cursor-help">
                        {order.shippingDetails?.name}
                      </span>
                      {order.shippingDetails && (
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-30 w-64 p-3 bg-[#0f0f18]/95 border border-white/[0.08] rounded-xl shadow-2xl text-[11px] text-white/70 backdrop-blur-md">
                          <p className="font-bold text-white mb-1">{order.shippingDetails.name}</p>
                          <p className="leading-relaxed">{order.shippingDetails.address}</p>
                          <p>
                            {order.shippingDetails.city} - {order.shippingDetails.pinCode}
                          </p>
                          <p className="text-[10px] text-white/40 mt-1.5 font-medium">
                            Phone: {order.shippingDetails.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right md:text-left md:ml-auto">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                      Order ID
                    </p>
                    <div className="flex items-center justify-end md:justify-start gap-1.5 mt-1">
                      <span className="text-xs font-mono font-semibold text-white/60">
                        {order.id.slice(0, 12).toUpperCase()}...
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(order.id);
                          toast.success("Order ID copied to clipboard!");
                        }}
                        className="hover:text-violet-400 text-white/30 transition-colors p-1 rounded hover:bg-white/[0.04] cursor-pointer"
                        title="Copy full Order ID"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Card Body (Layout: split columns) */}
                <div className="p-6">
                  {/* Real-time Status Message */}
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${badge.dot} animate-pulse`} />
                        {order.status === "delivered"
                          ? `Delivered on ${date}`
                          : order.status === "cancelled"
                            ? "Cancelled"
                            : order.status === "shipped"
                              ? "Package shipped - In Transit"
                              : "Order received - Preparing for shipment"}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {order.status === "delivered"
                          ? "Your setup upgrade has successfully arrived."
                          : order.status === "cancelled"
                            ? "Your order has been cancelled and refunded."
                            : "VURLO Express Cargo Trackable Shipment."}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider border ${badge.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between gap-8">
                    {/* Left Column: Products List */}
                    <div className="flex-1 divide-y divide-white/[0.04]">
                      {order.items?.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                        >
                          <img
                            src={resolveProductImage(getProductImage(item), item.name)}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover bg-white/[0.03] border border-white/[0.06] flex-shrink-0 transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = resolveProductImage(
                                "",
                                item.name,
                              );
                            }}
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-white/95 truncate leading-snug">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-white/40 mt-1">
                              Qty: {item.quantity} &middot; ₹{formatPrice(item.price)} each
                            </p>
                          </div>
                          <p className="text-xs font-bold text-white/80 shrink-0">
                            ₹{formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Right Column: Actions Stack */}
                    <div className="w-full md:w-52 shrink-0 flex flex-col gap-2.5">
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          isExpanded
                            ? "bg-white/[0.08] border border-white/[0.12] text-white"
                            : "bg-transparent border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.02] text-white/80 hover:text-white"
                        }`}
                      >
                        {isExpanded ? "Hide Tracking" : "Track Order"}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>

                      <button
                        onClick={() => handleReorder(order.items, order.id)}
                        disabled={reorderingId !== null}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-[0_4px_15px_rgba(124,58,237,0.2)]"
                      >
                        {reorderingId === order.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                        Buy It Again
                      </button>

                      {order.status === "pending" &&
                        (() => {
                          const TWO_HOURS = 2 * 60 * 60 * 1000;
                          const canCancel = order.createdAt
                            ? Date.now() - order.createdAt.seconds * 1000 < TWO_HOURS
                            : true;

                          if (canCancel) {
                            return (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={cancellingId === order.id}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                              >
                                {cancellingId === order.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  "Cancel Order"
                                )}
                              </button>
                            );
                          }

                          return (
                            <p className="w-full text-center text-[10px] text-white/25 py-1">
                              Cancellation window closed (2h limit)
                            </p>
                          );
                        })()}

                      <Link
                        to="/contact"
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-transparent hover:bg-white/[0.03] text-white/50 hover:text-white/80 px-4 py-2 text-xs font-semibold transition-all text-center"
                      >
                        Contact Support
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 3. Expanded Tracking Drawer */}
                {isExpanded && (
                  <div className="border-t border-white/[0.06] bg-white/[0.005] px-6 py-6 transition-all duration-300">
                    <OrderStatusTimeline status={order.status} />

                    {order.trackingNumber && (
                      <div className="mt-6 border border-violet-500/20 bg-violet-500/5 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                            Courier Partner / Shipment Details
                          </p>
                          <p className="text-xs font-semibold text-white/90">
                            {order.courierName || "Standard Delivery"} &middot; {order.trackingNumber}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(order.trackingNumber!);
                            toast.success("Tracking number copied!");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-[10px] font-bold text-white hover:bg-white/[0.1] hover:text-white transition-all cursor-pointer"
                        >
                          <Copy className="h-3 w-3" />
                          Copy Tracking ID
                        </button>
                      </div>
                    )}

                    {/* Logistics History Scan */}
                    <div className="mt-6 border-t border-white/[0.04] pt-5">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">
                        Logistics History & Tracking Scan
                      </p>
                      <div className="relative pl-6 space-y-4">
                        {/* Vertical timeline line */}
                        <div className="absolute left-[7px] top-2 bottom-2 w-[1.5px] bg-white/[0.06]" />

                        {getLogisticsLogs(order).map((log, logIdx) => (
                          <div
                            key={logIdx}
                            className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                          >
                            {/* Timeline Node dot */}
                            <div
                              className={`absolute -left-[23px] w-2.5 h-2.5 rounded-full border-2 border-[#090910] ${
                                log.done
                                  ? "bg-violet-500 shadow-[0_0_8px_rgba(124,58,237,0.5)]"
                                  : "bg-white/10"
                              }`}
                            />

                            <p
                              className={`text-xs font-medium ${log.done ? "text-white/80" : "text-white/30"}`}
                            >
                              {log.event}
                            </p>
                            <span className="text-[10px] text-white/35 font-mono shrink-0">
                              {log.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Load More Pagination */}
          {filteredOrders.length > visibleCount && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white/80 rounded-full px-6 py-2 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
