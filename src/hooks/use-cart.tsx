import React, { createContext, useContext, useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  doc,
  onSnapshot,
  setDoc,
  collection,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  getDoc,
  runTransaction,
  increment,
} from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { getProductImage } from "@/utils/product";
import { resolveProductImage } from "@/lib/utils";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: Omit<CartItem, "quantity"> & { stock?: number }) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  placeOrder: (
    shippingDetails: {
      name: string;
      address: string;
      city: string;
      state: string;
      pinCode: string;
      phone: string;
    },
    discount?: number,
    couponCode?: string,
    couponId?: string,
    paymentStatus?: string
  ) => Promise<string | undefined>;
  addMultipleToCart: (items: CartItem[]) => Promise<void>;
  reserveStockAndGetTotal: () => Promise<{ fetchedItems: any[]; totalAmount: number }>;

  releaseStock: (fetchedItems: any[]) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Listen to Firestore cart subcollection in real-time or fall back to localStorage
  useEffect(() => {
    if (!user) {
      // Guest User cart loading from local storage
      try {
        const local = localStorage.getItem("vurlo_local_cart");
        if (local) {
          const parsed = JSON.parse(local);
          setCartItems(parsed);
          // Nudge guest users to log in to save cart
          const hasNudged = sessionStorage.getItem("vurlo_cart_nudge");
          if (!hasNudged && parsed.length > 0) {
            sessionStorage.setItem("vurlo_cart_nudge", "1");
            setTimeout(() => {
              toast("Log in to save your cart permanently", {
                duration: 4000,
              });
            }, 2000);
          }
        } else {
          setCartItems([]);
        }
      } catch (e) {
        console.error("Error parsing local cart:", e);
        setCartItems([]);
      }
      return;
    }

    // Merging local cart on login
    const performMerge = async () => {
      const localStr = localStorage.getItem("vurlo_local_cart");
      if (!localStr) return;
      try {
        const localItems: CartItem[] = JSON.parse(localStr);
        if (localItems.length > 0) {
          const batch = writeBatch(db);
          for (const item of localItems) {
            // Get product stock
            const productRef = doc(db, "products", item.productId);
            const productSnap = await getDoc(productRef);
            let stock = 10;
            if (productSnap.exists()) {
              stock = productSnap.data().stock !== undefined ? productSnap.data().stock : 10;
            }

            const itemRef = doc(db, "users", user.uid, "cart", item.productId);
            const itemSnap = await getDoc(itemRef);
            if (itemSnap.exists()) {
              const dbQty = itemSnap.data().quantity ?? 0;
              const mergedQty = Math.min(stock, dbQty + item.quantity);
              batch.set(
                itemRef,
                {
                  name: item.name,
                  price: item.price,
                  image: item.image,
                  quantity: mergedQty,
                },
                { merge: true },
              );
            } else {
              const mergedQty = Math.min(stock, item.quantity);
              batch.set(itemRef, {
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: mergedQty,
              });
            }
          }
          await batch.commit();
          localStorage.removeItem("vurlo_local_cart");
          toast.success("Merged guest items with your account bag!");
        }
      } catch (error) {
        console.error("Error merging cart on login:", error);
        localStorage.removeItem("vurlo_local_cart"); // prevent infinite retry
        toast.error("Could not merge guest cart. Please re-add items.");
      }
    };

    performMerge();

    // Setup real-time listener for Firestore cart
    const cartColRef = collection(db, "users", user.uid, "cart");
    const unsubscribe = onSnapshot(
      cartColRef,
      (querySnapshot) => {
        const items: CartItem[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            productId: docSnap.id,
            name: data.name || "",
            price: data.price ?? 0,
            image: getProductImage(data),
            quantity: data.quantity ?? 1,
          });
        });
        setCartItems(items);
      },
      (error) => {
        console.error("Error listening to cart subcollection snapshot:", error);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const addToCart = async (product: Omit<CartItem, "quantity"> & { stock?: number }) => {
    const MAX_QTY = 10;
    if (!product.productId) {
      console.error("addToCart: productId is required");
      return;
    }

    // Capture previous state in case we need to roll back
    const previousItems = [...cartItems];

    // Optimistically update local cartItems state immediately
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.productId === product.productId);
      if (existingIdx !== -1) {
        const updated = [...prev];
        const newQty = Math.min(MAX_QTY, updated[existingIdx].quantity + 1);
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
        return updated;
      } else {
        return [
          ...prev,
          {
            ...product,
            image: resolveProductImage(product.image, product.name),
            quantity: 1,
          },
        ];
      }
    });

    // Optimistically trigger toast feedback immediately
    const toastId = toast.success(`${product.name} added to bag`, {
      description: "Review details in your shopping bag.",
      duration: 2500,
    });

    // Optimistically track the event
    trackEvent("add_to_cart", {
      currency: "INR",
      value: Number(product.price),
      items: [
        {
          item_id: product.productId,
          item_name: product.name,
          price: Number(product.price),
          quantity: 1,
        },
      ],
    });

    // Pre-create database references
    const productDocRef = doc(db, "products", product.productId);
    const itemDocRef = user ? doc(db, "users", user.uid, "cart", product.productId) : null;

    // Parallelize the database checks
    const stockPromise = product.stock !== undefined
      ? Promise.resolve(product.stock)
      : getDoc(productDocRef)
          .then((snap) => (snap.exists() ? Number(snap.data().stock ?? 10) : 10))
          .catch(() => 10);

    const cartItemPromise = itemDocRef ? getDoc(itemDocRef) : Promise.resolve(null);

    try {
      const [stock, itemSnap] = await Promise.all([stockPromise, cartItemPromise]);

      if (stock <= 0) {
        toast.dismiss(toastId);
        toast.error(`${product.name} is Sold Out.`);
        setCartItems(previousItems); // Rollback
        return;
      }

      // Guest User Flow
      if (!user) {
        try {
          const local = localStorage.getItem("vurlo_local_cart");
          let items: CartItem[] = local ? JSON.parse(local) : [];
          const existingItem = items.find((i) => i.productId === product.productId);

          if (existingItem) {
            const newQty = existingItem.quantity + 1;
            if (newQty > MAX_QTY || newQty > stock) {
              toast.dismiss(toastId);
              if (newQty > MAX_QTY) {
                toast.error(`Cannot add more. Maximum quantity per product is ${MAX_QTY}.`);
              } else {
                toast.error(`Cannot add more. Only ${stock} items available in stock.`);
              }
              setCartItems(previousItems); // Rollback
              return;
            }
            existingItem.quantity = newQty;
          } else {
            items.push({
              ...product,
              image: resolveProductImage(product.image, product.name),
              quantity: 1,
            });
          }
          localStorage.setItem("vurlo_local_cart", JSON.stringify(items));
          // State is already optimistically set, but write it to localStorage
        } catch (e) {
          console.error("Error writing guest cart to localStorage:", e);
          setCartItems(previousItems); // Rollback
          toast.error("Failed to update guest bag.");
        }
        return;
      }

      // Logged-in User Flow (Firestore Write)
      if (itemSnap && itemSnap.exists()) {
        const currentQty = itemSnap.data().quantity ?? 0;
        const newQty = currentQty + 1;
        if (newQty > MAX_QTY || newQty > stock) {
          toast.dismiss(toastId);
          if (newQty > MAX_QTY) {
            toast.error(`Cannot add more. Maximum quantity per product is ${MAX_QTY}.`);
          } else {
            toast.error(`Cannot add more. Only ${stock} items available in stock.`);
          }
          setCartItems(previousItems); // Rollback
          return;
        }
        await setDoc(itemDocRef!, { quantity: newQty }, { merge: true });
      } else {
        await setDoc(itemDocRef!, {
          name: product.name,
          price: product.price,
          image: resolveProductImage(product.image, product.name),
          quantity: 1,
        });
      }
    } catch (error) {
      console.error("Error in addToCart write operation:", error);
      toast.dismiss(toastId);
      toast.error(`Failed to add ${product.name} to bag. Please try again.`);
      setCartItems(previousItems); // Rollback
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    const MAX_QTY = 10;
    // 1. Guest flow
    if (!user) {
      try {
        const local = localStorage.getItem("vurlo_local_cart");
        if (!local) return;
        const items: CartItem[] = JSON.parse(local);
        const itemIdx = items.findIndex((i) => i.productId === productId);
        if (itemIdx === -1) return;

        if (quantity <= 0) {
          items.splice(itemIdx, 1);
        } else {
          // Check stock
          const productRef = doc(db, "products", productId);
          const productSnap = await getDoc(productRef);
          let stock = 10;
          if (productSnap.exists()) {
            stock = productSnap.data().stock !== undefined ? Number(productSnap.data().stock) : 10;
          }

          if (quantity > MAX_QTY) {
            toast.error(`Maximum quantity per product is ${MAX_QTY}.`);
            items[itemIdx].quantity = Math.min(stock, MAX_QTY);
          } else if (quantity > stock) {
            toast.error(`Cannot update. Only ${stock} items available in stock.`);
            items[itemIdx].quantity = stock;
          } else {
            items[itemIdx].quantity = quantity;
          }
        }

        localStorage.setItem("vurlo_local_cart", JSON.stringify(items));
        setCartItems(items);
      } catch (e) {
        console.error("Error updating local cart quantity:", e);
      }
      return;
    }

    // 2. Logged-in Firestore flow
    try {
      const itemDocRef = doc(db, "users", user.uid, "cart", productId);
      if (quantity <= 0) {
        await deleteDoc(itemDocRef);
      } else {
        // Check stock
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);
        let stock = 10;
        if (productSnap.exists()) {
          stock = productSnap.data().stock !== undefined ? Number(productSnap.data().stock) : 10;
        }

        if (quantity > MAX_QTY) {
          toast.error(`Maximum quantity per product is ${MAX_QTY}.`);
          await setDoc(
            itemDocRef,
            {
              quantity: Math.min(stock, MAX_QTY),
            },
            { merge: true },
          );
        } else if (quantity > stock) {
          toast.error(`Cannot update. Only ${stock} items available in stock.`);
          await setDoc(
            itemDocRef,
            {
              quantity: stock,
            },
            { merge: true },
          );
        } else {
          await setDoc(
            itemDocRef,
            {
              quantity,
            },
            { merge: true },
          );
        }
      }
    } catch (error) {
      console.error("Error updating cart item quantity in Firestore:", error);
    }
  };

  const removeFromCart = async (productId: string) => {
    const item = cartItems.find((i) => i.productId === productId);
    const name = item ? item.name : "Item";

    if (!user) {
      try {
        const local = localStorage.getItem("vurlo_local_cart");
        if (local) {
          let items: CartItem[] = JSON.parse(local);
          items = items.filter((i) => i.productId !== productId);
          localStorage.setItem("vurlo_local_cart", JSON.stringify(items));
          setCartItems(items);
          toast.info(`${name} removed from bag`, { duration: 2000 });
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }

    try {
      const itemDocRef = doc(db, "users", user.uid, "cart", productId);
      await deleteDoc(itemDocRef);
      toast.info(`${name} removed from bag`, {
        duration: 2000,
      });
    } catch (error) {
      console.error("Error removing item from Firestore cart:", error);
    }
  };

  const placeOrder = async (
    shippingDetails: {
      name: string;
      address: string;
      city: string;
      state: string;
      pinCode: string;
      phone: string;
    },
    discount?: number,
    couponCode?: string,
    couponId?: string,
    paymentStatus?: string
  ): Promise<string | undefined> => {
    if (!user || cartItems.length === 0) return;

    const updatedProducts: { productId: string; quantity: number }[] = [];
    const fetchedItems: {
      productId: string;
      name: string;
      price: number;
      image: string;
      quantity: number;
    }[] = [];

    try {
      // 1. Sequentially run a Firestore transaction per product to decrement stock safely
      for (const item of cartItems) {
        const freshItem = await runTransaction(db, async (transaction) => {
          const productRef = doc(db, "products", item.productId);
          const productSnap = await transaction.get(productRef);
          if (!productSnap.exists()) {
            throw new Error(`Product "${item.name}" was not found in our catalog.`);
          }
          const productData = productSnap.data();
          const freshPrice = productData.price ?? 0;
          const stock = productData.stock !== undefined ? Number(productData.stock) : 10;

          if (stock < item.quantity) {
            throw new Error(`Product "${item.name}" only has ${stock} items left in stock.`);
          }

          transaction.update(productRef, {
            stock: stock - item.quantity,
          });

          return {
            productId: item.productId,
            name: productData.name || item.name,
            price: freshPrice,
            image: getProductImage(productData) || item.image,
            quantity: item.quantity,
          };
        });

        fetchedItems.push(freshItem);
        updatedProducts.push({ productId: item.productId, quantity: item.quantity });
      }

      const baseTotal = fetchedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const totalAmount = Math.max(0, baseTotal - (discount ?? 0));

      // Perform batch writes
      const batch = writeBatch(db);

      // Create new order doc ID
      const orderColRef = collection(db, "orders");
      const orderDocRef = doc(orderColRef);

      batch.set(orderDocRef, {
        userId: user.uid,
        userEmail: user.email || "",
        items: fetchedItems,
        totalAmount,
        discount: discount ?? 0,
        couponCode: couponCode || null,
        status: "pending",
        paymentStatus: paymentStatus || "cod",
        shippingDetails,
        createdAt: serverTimestamp(),
      });

      // Increment coupon usage count if couponId was passed
      if (couponId) {
        const couponRef = doc(db, "coupons", couponId);
        batch.update(couponRef, {
          usageCount: increment(1),
        });
      }

      // Clear cart items
      cartItems.forEach((item) => {
        const itemRef = doc(db, "users", user.uid, "cart", item.productId);
        batch.delete(itemRef);
      });

      // Add Order Placement Notification
      if (!paymentStatus || paymentStatus === "cod") {
        const notifColRef = collection(db, "notifications");
        const notifDocRef = doc(notifColRef);
        batch.set(notifDocRef, {
          userId: user.uid,
          message: `Your order #${orderDocRef.id.slice(0, 8).toUpperCase()} has been placed successfully!`,
          type: "order",
          read: false,
          timestamp: serverTimestamp(),
          link: "/orders",
        });
      }

      await batch.commit();

      // Trigger Resend Order Confirmation email in the background (non-blocking)
      if (!paymentStatus || paymentStatus === "cod") {
        try {
          const idToken = await user.getIdToken();
          fetch("/api/send-order-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-firebase-token": idToken,
            },
            body: JSON.stringify({
              orderId: orderDocRef.id,
              customerName: shippingDetails.name,
              customerEmail: user.email || "",
              products: fetchedItems.map((item) => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              })),
              totalAmount,
              deliveryAddress: `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.pinCode}`,
              estimatedDelivery: "3-5 business days",
            }),
          })
            .then(async (res) => {
              if (!res.ok) throw new Error("API failed");
              let data: any = null;
              try {
                data = await res.json();
              } catch {}
              if (!data?.success) throw new Error("API failed");
            })
            .catch((err) => console.error("Order confirmation dispatch failed:", err));
        } catch (err) {
          console.error("Order email call failed:", err);
        }
      }

      if (!paymentStatus || paymentStatus === "cod") {
        toast.success("Order placed successfully!", {
          description: "Thank you for your purchase.",
          duration: 3000,
        });
      }

      return orderDocRef.id;
    } catch (error) {
      console.error("Error placing order:", error);

      // Compensation rollbacks for completed stock updates
      for (const updated of updatedProducts) {
        try {
          await runTransaction(db, async (transaction) => {
            const productRef = doc(db, "products", updated.productId);
            const productSnap = await transaction.get(productRef);
            if (productSnap.exists()) {
              const currentStock =
                productSnap.data().stock !== undefined ? Number(productSnap.data().stock) : 10;
              transaction.update(productRef, {
                stock: currentStock + updated.quantity,
              });
            }
          });
        } catch (rollbackError) {
          console.error(`Rollback failed for product ${updated.productId}:`, rollbackError);
        }
      }

      const message =
        error instanceof Error ? error.message : "Failed to place order. Please try again.";
      toast.error(message);
      throw error;
    }
  };

  const reserveStockAndGetTotal = async (): Promise<{
    fetchedItems: any[];
    totalAmount: number;
  }> => {
    if (!user || cartItems.length === 0) {
      throw new Error("No user or cart items");
    }

    const updatedProducts: { productId: string; quantity: number }[] = [];
    const fetchedItems: any[] = [];

    try {
      for (const item of cartItems) {
        const freshItem = await runTransaction(db, async (transaction) => {
          const productRef = doc(db, "products", item.productId);
          const productSnap = await transaction.get(productRef);
          if (!productSnap.exists()) {
            throw new Error(`Product "${item.name}" was not found in our catalog.`);
          }
          const productData = productSnap.data();
          const freshPrice = productData.price ?? 0;
          const stock = productData.stock !== undefined ? Number(productData.stock) : 10;

          if (stock < item.quantity) {
            throw new Error(`Product "${item.name}" only has ${stock} items left in stock.`);
          }

          transaction.update(productRef, {
            stock: stock - item.quantity,
          });

          return {
            productId: item.productId,
            name: productData.name || item.name,
            price: freshPrice,
            image: getProductImage(productData) || item.image,
            quantity: item.quantity,
          };
        });

        fetchedItems.push(freshItem);
        updatedProducts.push({ productId: item.productId, quantity: item.quantity });
      }

      const baseTotal = fetchedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      return { fetchedItems, totalAmount: baseTotal };
    } catch (error) {
      console.error("Error reserving stock:", error);
      // Rollback stock reserved in this call
      for (const updated of updatedProducts) {
        try {
          await runTransaction(db, async (transaction) => {
            const productRef = doc(db, "products", updated.productId);
            const productSnap = await transaction.get(productRef);
            if (productSnap.exists()) {
              const currentStock =
                productSnap.data().stock !== undefined ? Number(productSnap.data().stock) : 10;
              transaction.update(productRef, {
                stock: currentStock + updated.quantity,
              });
            }
          });
        } catch (rollbackError) {
          console.error(`Rollback failed for product ${updated.productId}:`, rollbackError);
        }
      }
      const message =
        error instanceof Error ? error.message : "Failed to reserve items. Please try again.";
      toast.error(message);
      throw error;
    }
  };



  const releaseStock = async (fetchedItems: any[]): Promise<void> => {
    for (const item of fetchedItems) {
      try {
        await runTransaction(db, async (transaction) => {
          const productRef = doc(db, "products", item.productId);
          const productSnap = await transaction.get(productRef);
          if (productSnap.exists()) {
            const currentStock =
              productSnap.data().stock !== undefined ? Number(productSnap.data().stock) : 10;
            transaction.update(productRef, {
              stock: currentStock + item.quantity,
            });
          }
        });
      } catch (rollbackError) {
        console.error(`Rollback failed for product ${item.productId}:`, rollbackError);
      }
    }
  };

  const addMultipleToCart = async (items: CartItem[]) => {
    if (!user) {
      // Guest User cart loading from local storage
      try {
        const local = localStorage.getItem("vurlo_local_cart");
        let cart: CartItem[] = local ? JSON.parse(local) : [];

        for (const item of items) {
          const existing = cart.find((i) => i.productId === item.productId);
          if (existing) {
            existing.quantity = Math.min(10, existing.quantity + item.quantity);
          } else {
            cart.push({
              productId: item.productId,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: Math.min(10, item.quantity),
            });
          }
        }

        localStorage.setItem("vurlo_local_cart", JSON.stringify(cart));
        setCartItems(cart);
        toast.success("Added items from order to your bag!");
      } catch (e) {
        console.error("Error adding multiple to local cart:", e);
        toast.error("Failed to add items to bag.");
      }
      return;
    }

    // Logged-in Firestore flow
    try {
      const batch = writeBatch(db);
      for (const item of items) {
        const itemDocRef = doc(db, "users", user.uid, "cart", item.productId);
        const itemSnap = await getDoc(itemDocRef);
        const existingQty = itemSnap.exists() ? (itemSnap.data().quantity ?? 0) : 0;
        const newQty = Math.min(10, existingQty + item.quantity);
        batch.set(
          itemDocRef,
          {
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: newQty,
          },
          { merge: true },
        );
      }
      await batch.commit();
      toast.success("Added items from order to your bag!");
    } catch (error) {
      console.error("Error adding multiple items to Firestore cart:", error);
      toast.error("Failed to add items to bag.");
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        placeOrder,
        addMultipleToCart,
        reserveStockAndGetTotal,

        releaseStock,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
