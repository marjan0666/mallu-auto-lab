"use client";

import Script from "next/script";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import type { ShippingAddress } from "@/lib/types";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "Mallu Auto Lab";

export function RazorpayButton({
  contactEmail,
  contactPhone,
  shippingAddress,
  discountCode,
  disabled,
}: {
  contactEmail: string;
  contactPhone: string;
  shippingAddress: ShippingAddress;
  discountCode: string | null;
  disabled: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { lines, clear } = useCartStore();
  const router = useRouter();

  async function handlePay() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          contactEmail,
          contactPhone,
          shippingAddress,
          discountCode,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: storeName,
        description: "Order payment",
        order_id: data.razorpayOrderId,
        prefill: {
          email: contactEmail,
          contact: contactPhone,
          name: shippingAddress.full_name,
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.orderId,
              ...response,
            }),
          });

          if (verifyRes.ok) {
            clear();
            router.push(`/checkout/success?order=${data.orderId}`);
          } else {
            setError("Payment succeeded but verification failed. Contact support.");
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        theme: { color: "#1a58f2" },
      });

      razorpay.open();
    } catch {
      setError("Could not start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <button
        type="button"
        disabled={disabled || loading}
        onClick={handlePay}
        className="btn-primary w-full"
      >
        {loading ? "Processing…" : "Pay now"}
      </button>
    </div>
  );
}
