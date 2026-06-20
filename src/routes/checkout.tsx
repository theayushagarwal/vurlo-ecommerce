import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { trackEvent } from "@/lib/analytics";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { resolveProductImage, formatPrice } from "@/hooks/use-products";
import { getProductImage } from "@/utils/product";
import { Loader2, ShoppingBag, MapPin, CreditCard, ChevronRight, Check, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { collection, query, where, getDocs, doc, deleteDoc, addDoc, serverTimestamp, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({
    meta: [
      { title: "Checkout - VURLO" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
});

type PaymentMethod = "cod" | "upi";

function CheckoutPage() {
  const { user, loading, savedAddress, saveAddress } = useAuth();
  const { cartItems, placeOrder } = useCart();
  const navigate = useNavigate();

  // Shipping fields
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [phone, setPhone] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  // UI state
  const [placingOrder, setPlacingOrder] = useState(false);
  const [shippingDone, setShippingDone] = useState(false);
  const [usingSavedAddress, setUsingSavedAddress] = useState(true);

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (savedAddress && usingSavedAddress) {
      setName(savedAddress.name);
      setAddress(savedAddress.address);
      setCity(savedAddress.city);
      setState(savedAddress.state || "");
      setPinCode(savedAddress.pinCode);
      setPhone(savedAddress.phone);
    }
    if (!usingSavedAddress) {
      setName("");
      setAddress("");
      setCity("");
      setState("");
      setPinCode("");
      setPhone("");
    }
  }, [savedAddress, usingSavedAddress]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Coupon calculations
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percentage") {
      discount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else if (appliedCoupon.type === "fixed") {
      discount = Math.min(appliedCoupon.value, subtotal);
    }
  }

  const finalTotal = subtotal - discount;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const q = query(
        collection(db, "coupons"),
        where("code", "==", couponCode.trim().toUpperCase())
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setCouponError("Invalid coupon code.");
        setAppliedCoupon(null);
        toast.error("Invalid coupon code.");
        setCouponLoading(false);
        return;
      }

      const couponDoc = snap.docs[0];
      const couponData = { id: couponDoc.id, ...couponDoc.data() } as any;

      // Validate status
      if (!couponData.isActive) {
        setCouponError("This coupon is inactive.");
        setAppliedCoupon(null);
        toast.error("This coupon is inactive.");
        setCouponLoading(false);
        return;
      }

      // Validate expiration
      if (couponData.expiryDate) {
        const expiry = new Date(couponData.expiryDate);
        const now = new Date();
        // Set now to start of day for accurate comparison
        now.setHours(0, 0, 0, 0);
        const expiryDateObj = new Date(expiry);
        expiryDateObj.setHours(23, 59, 59, 999);
        if (expiryDateObj < now) {
          setCouponError("This coupon has expired.");
          setAppliedCoupon(null);
          toast.error("This coupon has expired.");
          setCouponLoading(false);
          return;
        }
      }

      // Validate min order
      if (couponData.minOrder && subtotal < couponData.minOrder) {
        setCouponError(`Minimum purchase requirement of ₹${couponData.minOrder} is not met.`);
        setAppliedCoupon(null);
        toast.error(`Minimum purchase requirement of ₹${couponData.minOrder} is not met.`);
        setCouponLoading(false);
        return;
      }

      // Validate usage limit
      if (couponData.usageLimit && (couponData.usageCount || 0) >= couponData.usageLimit) {
        setCouponError("This coupon usage limit has been reached.");
        setAppliedCoupon(null);
        toast.error("This coupon usage limit has been reached.");
        setCouponLoading(false);
        return;
      }

      setAppliedCoupon(couponData);
      toast.success(`Coupon "${couponData.code}" applied successfully!`);
    } catch (err) {
      console.error("Error applying coupon:", err);
      setCouponError("Failed to apply coupon.");
      toast.error("Failed to apply coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
    toast.success("Coupon removed.");
  };

  const checkoutFiredRef = useRef(false);

  useEffect(() => {
    if (cartItems.length > 0 && !checkoutFiredRef.current) {
      trackEvent("begin_checkout", {
        currency: "INR",
        value: subtotal,
        items: cartItems.map((item) => ({
          item_id: item.productId,
          item_name: item.name,
          price: Number(item.price),
          quantity: item.quantity,
        })),
      });
      checkoutFiredRef.current = true;
    }
  }, [cartItems, subtotal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" />;
  if (cartItems.length === 0) return <Navigate to="/" />;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      toast.error("Enter a valid 10-digit phone number.");
      return;
    }
    if (pinCode.length !== 6 || !/^\d+$/.test(pinCode)) {
      toast.error("Enter a valid 6-digit PIN code.");
      return;
    }
    setShippingDone(true);
    // Scroll to payment section smoothly
    setTimeout(() => {
      document.getElementById("payment-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === "upi") {
      setPlacingOrder(true);
      let orderId = "";
      try {
        // Step 1: Create Firestore order first to get orderId
        orderId = await placeOrder(
          {
            name: name.trim(),
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            pinCode: pinCode.trim(),
            phone: phone.trim(),
          },
          discount,
          appliedCoupon?.code,
          appliedCoupon?.id,
          "upi_pending" // payment status
        ) || "";

        if (!orderId) {
          throw new Error("Failed to create pending order");
        }

        // Step 2: Create Razorpay order
        const response = await fetch("/api/create-razorpay-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalTotal,
          }),
        });
        const { razorpayOrderId } = await response.json();

        // Step 3: Open Razorpay checkout
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: Math.round(finalTotal * 100),
          currency: "INR",
          name: "Vurlo",
          description: "Ambient Lighting Order",
          order_id: razorpayOrderId,
          handler: async function (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) {
            try {
              // Verify payment signature server-side before proceeding
              const verifyRes = await fetch("/api/verify-razorpay-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId,
                }),
              });

              if (!verifyRes.ok) {
                toast.error("Payment verification failed. Please contact support.");
                try {
                  await deleteDoc(doc(db, "orders", orderId!));
                } catch (e) {}
                for (const item of cartItems) {
                  try {
                    await runTransaction(db, async (t) => {
                      const ref = doc(db, "products", item.productId);
                      const snap = await t.get(ref);
                      if (snap.exists()) {
                        t.update(ref, { stock: (snap.data().stock ?? 0) + item.quantity });
                      }
                    });
                  } catch (e) {}
                }
                setPlacingOrder(false);
                return;
              }

              // Verification passed — write the notification
              await addDoc(collection(db, "notifications"), {
                userId: user.uid,
                message: `Your order #${orderId.slice(0, 8).toUpperCase()} has been placed successfully!`,
                type: "order",
                read: false,
                timestamp: serverTimestamp(),
                link: "/orders",
              });
              toast.success("Order placed successfully!", { description: "Thank you for your purchase.", duration: 3000 });

              // Save address and navigate
              if (!usingSavedAddress) {
                await saveAddress({
                  name: name.trim(),
                  address: address.trim(),
                  city: city.trim(),
                  state: state.trim(),
                  pinCode: pinCode.trim(),
                  phone: phone.trim(),
                });
              }
              navigate({ to: "/order-success", search: { orderId } });
            } catch (e) {
              console.error(e);
              toast.error("Payment verification failed. Please contact support.");
              try {
                await deleteDoc(doc(db, "orders", orderId!));
              } catch (err) {}
              for (const item of cartItems) {
                try {
                  await runTransaction(db, async (t) => {
                    const ref = doc(db, "products", item.productId);
                    const snap = await t.get(ref);
                    if (snap.exists()) {
                      t.update(ref, { stock: (snap.data().stock ?? 0) + item.quantity });
                    }
                  });
                } catch (err) {}
              }
              setPlacingOrder(false);
            }
          },
          prefill: {
            name: name.trim(),
            contact: phone.trim(),
          },
          theme: {
            color: "#7c3aed",
          },
          modal: {
            ondismiss: async function () {
              toast.error("Payment cancelled.");
              setPlacingOrder(false);
              // Delete the ghost order
              try {
                await deleteDoc(doc(db, "orders", orderId!));
              } catch (e) {
                console.error("Failed to delete cancelled order:", e);
              }
              // Re-increment stock for each cart item
              for (const item of cartItems) {
                try {
                  await runTransaction(db, async (t) => {
                    const ref = doc(db, "products", item.productId);
                    const snap = await t.get(ref);
                    if (snap.exists()) {
                      t.update(ref, { stock: (snap.data().stock ?? 0) + item.quantity });
                    }
                  });
                } catch (e) {
                  console.error("Stock rollback failed for", item.productId, e);
                }
              }
            },
          },
        };

        try {
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } catch (sdkErr) {
          console.error("Razorpay SDK crash:", sdkErr);
          toast.error("Payment failed. Please try again.");
          setPlacingOrder(false);
          try {
            await deleteDoc(doc(db, "orders", orderId!));
          } catch (e) {}
          for (const item of cartItems) {
            try {
              await runTransaction(db, async (t) => {
                const ref = doc(db, "products", item.productId);
                const snap = await t.get(ref);
                if (snap.exists()) {
                  t.update(ref, { stock: (snap.data().stock ?? 0) + item.quantity });
                }
              });
            } catch (e) {}
          }
        }
      } catch (e) {
        console.error(e);
        toast.error("Payment failed. Please try again.");
        setPlacingOrder(false);
        if (orderId) {
          try {
            await deleteDoc(doc(db, "orders", orderId!));
          } catch (err) {}
          for (const item of cartItems) {
            try {
              await runTransaction(db, async (t) => {
                const ref = doc(db, "products", item.productId);
                const snap = await t.get(ref);
                if (snap.exists()) {
                  t.update(ref, { stock: (snap.data().stock ?? 0) + item.quantity });
                }
              });
            } catch (err) {}
          }
        }
      }
      return;
    }

    // COD flow
    setPlacingOrder(true);
    try {
      const orderId = await placeOrder(
        {
          name: name.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pinCode: pinCode.trim(),
          phone: phone.trim(),
        },
        discount,
        appliedCoupon?.code,
        appliedCoupon?.id
      );
      if (!usingSavedAddress) {
        await saveAddress({
          name: name.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pinCode: pinCode.trim(),
          phone: phone.trim(),
        });
      }
      navigate({ to: "/order-success", search: { orderId } });
    } catch (e) {
      // placeOrder already shows toast on error
      console.error(e);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col page-transition">
      <Navbar />

      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white/90">
            Checkout
          </h1>
          <p className="text-xs text-white/40 mt-1">Complete your order in a few steps.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* LEFT COLUMN — Steps */}
          <div className="space-y-6">
            {/* ── STEP 1: ORDER SUMMARY ── */}
            <Section step={1} title="Order Summary" icon={<ShoppingBag size={14} />} done={true}>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3.5">
                    <img
                      src={resolveProductImage(getProductImage(item), item.name)}
                      alt={item.name}
                      className="w-11 h-11 rounded-xl object-cover bg-white/[0.03] border border-white/[0.06] shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = resolveProductImage(
                          "",
                          item.name,
                        );
                      }}
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/90 truncate">{item.name}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-white/80 shrink-0">
                      ₹{formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── STEP 2: SHIPPING DETAILS ── */}
            <Section
              step={2}
              title="Shipping Details"
              icon={<MapPin size={14} />}
              done={shippingDone}
            >
              {shippingDone ? (
                /* Collapsed view after confirmed */
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white/90">{name}</p>
                  <p className="text-xs text-white/50">
                    {address}, {city}, {state} – {pinCode}
                  </p>
                  <p className="text-xs text-white/40">Phone: {phone}</p>
                  <button
                    type="button"
                    onClick={() => setShippingDone(false)}
                    className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold mt-2 cursor-pointer transition"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <form onSubmit={handleShippingSubmit} className="space-y-3">
                  {savedAddress && (
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setUsingSavedAddress(true)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition cursor-pointer ${
                          usingSavedAddress
                            ? "bg-violet-500/10 border-violet-500/40 text-violet-400"
                            : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/70"
                        }`}
                      >
                        Saved Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setUsingSavedAddress(false)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition cursor-pointer ${
                          !usingSavedAddress
                            ? "bg-violet-500/10 border-violet-500/40 text-violet-400"
                            : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/70"
                        }`}
                      >
                        New Address
                      </button>
                    </div>
                  )}
                  <Field label="Full Name">
                    <Input
                      type="text"
                      placeholder="Ayush Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Street Address">
                    <Input
                      type="text"
                      placeholder="123 Glow Street, Block 4"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className={inputCls}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="City">
                      <Input
                        type="text"
                        placeholder="New Delhi"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className={inputCls}
                      />
                    </Field>
                    <Field label="PIN Code">
                      <Input
                        type="text"
                        placeholder="110001"
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        required
                        maxLength={6}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="State">
                    <Input
                      type="text"
                      placeholder="Delhi"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Phone Number">
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      maxLength={10}
                      className={inputCls}
                    />
                  </Field>
                  <button
                    type="submit"
                    className="w-full h-10 rounded-xl text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
                    style={{ background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)" }}
                  >
                    Continue to Payment
                    <ChevronRight size={14} />
                  </button>
                </form>
              )}
            </Section>

            {/* ── STEP 3: PAYMENT ── */}
            <Section
              step={3}
              title="Payment Method"
              icon={<CreditCard size={14} />}
              done={false}
              locked={!shippingDone}
            >
              <div id="payment-section" className="space-y-3">
                {/* COD Option */}
                <PaymentOption
                  selected={paymentMethod === "cod"}
                  onClick={() => setPaymentMethod("cod")}
                  icon="🚚"
                  label="Cash on Delivery"
                  description="Pay in cash when your order arrives. No extra charges."
                  badge={null}
                />

                {/* UPI Option */}
                <PaymentOption
                  selected={paymentMethod === "upi"}
                  onClick={() => setPaymentMethod("upi")}
                  icon="📲"
                  label="UPI Payment"
                  description="Pay instantly via any UPI app — GPay, PhonePe, Paytm."
                  badge={null}
                />

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || !shippingDone}
                  className="w-full h-12 rounded-xl text-sm font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer transition-all mt-4 shadow-[0_4px_20px_rgba(124,58,237,0.3)] disabled:opacity-40 disabled:pointer-events-none"
                  style={{ background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)" }}
                >
                  {placingOrder ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>{paymentMethod === "cod" ? "Place Order" : "Pay Now"}</>
                  )}
                </button>

                <p className="text-[10px] text-white/25 text-center">
                  By placing your order you agree to our terms & conditions.
                </p>
              </div>
            </Section>
          </div>

          {/* RIGHT COLUMN — Sticky Order Total */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0f0f18] to-[#090910] p-5 space-y-4">
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">
                Price Details
              </h3>
              <div className="space-y-2.5 text-xs">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between text-white/60">
                    <span className="truncate max-w-[180px]">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold text-white/80 shrink-0 ml-2">
                      ₹{formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/[0.06] pt-3 flex justify-between items-center">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Delivery
                </span>
                <span className="text-xs font-bold text-emerald-400">FREE</span>
              </div>
              {/* Promo Code section */}
              <div className="border-t border-white/[0.06] pt-4 pb-1">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
                  Promo / Coupon Code
                </p>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-violet-500/10 border border-violet-500/30 rounded-xl px-3 py-2 text-xs">
                    <div className="flex items-center gap-1.5 text-violet-400 font-bold">
                      <Tag size={12} className="shrink-0" />
                      <span>{appliedCoupon.code}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[10px] text-white/40 hover:text-white/80 cursor-pointer font-bold uppercase transition"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTER CODE"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError(null);
                      }}
                      className="flex-1 bg-white/[0.02] border border-white/[0.06] focus:border-violet-500/50 text-white rounded-xl placeholder:text-white/20 h-9 px-3 md:text-xs uppercase font-semibold focus:outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCode.trim()}
                      className="h-9 px-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-[10px] font-bold uppercase tracking-wider hover:bg-white/[0.08] text-white shrink-0 cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center"
                    >
                      {couponLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[10px] text-red-400 mt-1.5 font-medium pl-1">
                    {couponError}
                  </p>
                )}
              </div>
              {discount > 0 && (
                <div className="border-t border-white/[0.06] pt-3 flex justify-between items-center text-xs">
                  <span className="font-semibold text-violet-400">Coupon Discount</span>
                  <span className="font-bold text-violet-400">- ₹{formatPrice(discount)}</span>
                </div>
              )}
              <div className="border-t border-white/[0.06] pt-3 flex justify-between items-center">
                <span className="text-sm font-bold text-white/90 uppercase tracking-wider">
                  Total
                </span>
                <span className="text-lg font-extrabold text-white/90">
                  ₹{formatPrice(finalTotal)}
                </span>
              </div>
              {paymentMethod === "cod" && (
                <div className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 px-3 py-2.5">
                  <p className="text-[10px] text-emerald-400 font-semibold">
                    🚚 Cash on Delivery selected — pay when delivered.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

// ── SHARED STYLE ────────────────────────────────────────────────────────────
const inputCls =
  "bg-white/[0.02] border-white/[0.06] focus:border-violet-500/50 text-white rounded-xl placeholder:text-white/20 h-10 px-3 md:text-xs";

// ── HELPER COMPONENTS ───────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
        {label}
      </label>
      {children}
    </div>
  );
}

function Section({
  step,
  title,
  icon,
  done,
  locked,
  children,
}: {
  step: number;
  title: string;
  icon: React.ReactNode;
  done: boolean;
  locked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
        locked
          ? "border-white/[0.04] bg-white/[0.01] opacity-40 pointer-events-none select-none"
          : done
            ? "border-emerald-500/20 bg-emerald-500/[0.03]"
            : "border-white/[0.08] bg-gradient-to-b from-[#0f0f18]/80 to-[#090910]/80"
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border shrink-0 ${
            done
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-violet-500/10 border-violet-500/30 text-violet-400"
          }`}
        >
          {done ? <Check size={13} /> : step}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={done ? "text-emerald-400" : "text-white/50"}>{icon}</span>
          <h2 className="text-sm font-bold text-white/90 tracking-tight">{title}</h2>
        </div>
      </div>
      {children}
    </div>
  );
}

function PaymentOption({
  selected,
  onClick,
  icon,
  label,
  description,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  description: string;
  badge: string | null;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
        selected
          ? "border-violet-500/40 bg-violet-500/[0.06] shadow-[0_0_20px_rgba(124,58,237,0.08)]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
      }`}
    >
      {/* Radio */}
      <div
        className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
          selected ? "border-violet-400" : "border-white/20"
        }`}
      >
        {selected && <div className="w-2 h-2 rounded-full bg-violet-400 animate-in zoom-in-50 duration-150" />}
      </div>

      {/* Icon */}
      <span className="text-xl mt-0.5 shrink-0">{icon}</span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white/90">{label}</span>
          {badge && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/25 text-amber-400">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </button>
  );
}
