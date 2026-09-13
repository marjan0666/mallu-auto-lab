"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { lines, updateQuantity, removeLine, subtotal } = useCartStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

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

  return (
    <div className="container-page py-12">
      <h1 className="text-2xl font-bold text-zinc-900">Your cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {lines.map((line) => (
            <div
              key={`${line.productId}-${line.variantId}`}
              className="flex gap-4 rounded-lg border border-zinc-200 p-4"
            >
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100">
                {line.image && (
                  <Image src={line.image} alt={line.title} fill className="object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{line.title}</p>
                  {line.variantName && (
                    <p className="text-xs text-zinc-500">{line.variantName}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-md border border-zinc-300">
                    <button
                      className="px-2 py-1 text-sm"
                      onClick={() =>
                        updateQuantity(line.productId, line.variantId, line.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{line.quantity}</span>
                    <button
                      className="px-2 py-1 text-sm"
                      onClick={() =>
                        updateQuantity(
                          line.productId,
                          line.variantId,
                          Math.min(line.stock, line.quantity + 1)
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatPrice(line.price * line.quantity)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeLine(line.productId, line.variantId)}
                className="self-start text-xs text-zinc-400 hover:text-red-500"
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-lg border border-zinc-200 p-6">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">{formatPrice(subtotal())}</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Shipping and taxes calculated at checkout.
          </p>
          <Link href="/checkout" className="btn-primary mt-6 w-full">
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
