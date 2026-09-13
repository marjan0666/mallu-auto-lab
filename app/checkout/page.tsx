"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { RazorpayButton } from "@/components/RazorpayButton";
import type { ShippingAddress } from "@/lib/types";

const emptyAddress: ShippingAddress = {
  full_name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
};

export default function CheckoutPage() {
  const { lines, subtotal } = useCartStore();
  const [hydrated, setHydrated] = useState(false);
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [discountInput, setDiscountInput] = useState("");
  const [applying, setApplying] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
    message: string;
  } | null>(null);

  useEffect(() => setHydrated(true), []);

  async function handleApplyDiscount() {
    setApplying(true);
    setDiscountError(null);
    try {
      const res = await fetch("/api/checkout/validate-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountInput, subtotal: subtotal() }),
      });
      const data = await res.json();
      if (!data.valid) {
        setDiscountError(data.message ?? "Invalid code.");
        setAppliedDiscount(null);
        return;
      }
      setAppliedDiscount({ code: data.code, amount: data.amount, message: data.message });
    } catch {
      setDiscountError("Could not check that code. Please try again.");
    } finally {
      setApplying(false);
    }
  }

  if (!hydrated) return null;

  if (lines.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-lg font-medium text-zinc-900">Your cart is empty</p>
        <Link href="/shop" className="btn-primary mt-6 inline-flex">
          Continue shopping
        </Link>
      </div>
    );
  }

  const formValid =
    email.includes("@") &&
    address.full_name &&
    address.phone &&
    address.line1 &&
    address.city &&
    address.state &&
    address.postal_code &&
    address.country;

  return (
    <div className="container-page py-12">
      <h1 className="text-2xl font-bold text-zinc-900">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Full name</label>
              <input
                className="input"
                value={address.full_name}
                onChange={(e) => setAddress({ ...address, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Address line 1</label>
            <input
              className="input"
              value={address.line1}
              onChange={(e) => setAddress({ ...address, line1: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Address line 2 (optional)</label>
            <input
              className="input"
              value={address.line2}
              onChange={(e) => setAddress({ ...address, line2: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">City</label>
              <input
                className="input"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
            </div>
            <div>
              <label className="label">State</label>
              <input
                className="input"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
              />
            </div>
            <div>
              <label className="label">PIN code</label>
              <input
                className="input"
                value={address.postal_code}
                onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="h-fit space-y-4 rounded-lg border border-zinc-200 p-6">
          {lines.map((line) => (
            <div
              key={`${line.productId}-${line.variantId}`}
              className="flex justify-between text-sm"
            >
              <span>
                {line.title}
                {line.variantName ? ` (${line.variantName})` : ""} × {line.quantity}
              </span>
              <span>{formatPrice(line.price * line.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-zinc-200 pt-4">
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="Discount code"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                disabled={!!appliedDiscount}
              />
              {appliedDiscount ? (
                <button
                  type="button"
                  className="btn-secondary shrink-0"
                  onClick={() => {
                    setAppliedDiscount(null);
                    setDiscountInput("");
                    setDiscountError(null);
                  }}
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-secondary shrink-0"
                  disabled={applying || !discountInput}
                  onClick={handleApplyDiscount}
                >
                  {applying ? "Checking…" : "Apply"}
                </button>
              )}
            </div>
            {discountError && <p className="mt-1 text-xs text-red-600">{discountError}</p>}
            {appliedDiscount && (
              <p className="mt-1 text-xs text-green-600">{appliedDiscount.message}</p>
            )}
          </div>

          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal())}</span>
          </div>
          {appliedDiscount && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount ({appliedDiscount.code})</span>
              <span>−{formatPrice(appliedDiscount.amount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-zinc-200 pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(Math.max(subtotal() - (appliedDiscount?.amount ?? 0), 0))}</span>
          </div>

          <RazorpayButton
            contactEmail={email}
            contactPhone={address.phone}
            shippingAddress={address}
            discountCode={appliedDiscount?.code ?? null}
            disabled={!formValid}
          />
        </div>
      </div>
    </div>
  );
}
