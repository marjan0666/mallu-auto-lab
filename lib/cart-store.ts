"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";

interface CartState {
  lines: CartLine[];
  addLine: (line: CartLine) => void;
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  removeLine: (productId: string, variantId: string | null) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
}

function sameLine(a: CartLine, productId: string, variantId: string | null) {
  return a.productId === productId && a.variantId === variantId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addLine: (line) =>
        set((state) => {
          const existing = state.lines.find((l) =>
            sameLine(l, line.productId, line.variantId)
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                sameLine(l, line.productId, line.variantId)
                  ? {
                      ...l,
                      quantity: Math.min(l.quantity + line.quantity, l.stock),
                    }
                  : l
              ),
            };
          }
          return { lines: [...state.lines, line] };
        }),
      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              sameLine(l, productId, variantId) ? { ...l, quantity } : l
            )
            .filter((l) => l.quantity > 0),
        })),
      removeLine: (productId, variantId) =>
        set((state) => ({
          lines: state.lines.filter((l) => !sameLine(l, productId, variantId)),
        })),
      clear: () => set({ lines: [] }),
      subtotal: () =>
        get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
      count: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    }),
    { name: "mal-cart" }
  )
);
