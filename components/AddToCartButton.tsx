"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import type { Product, ProductVariant } from "@/lib/types";

export function AddToCartButton({
  product,
  variants,
}: {
  product: Product;
  variants: ProductVariant[];
}) {
  const [variantId, setVariantId] = useState<string | null>(
    variants[0]?.id ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addLine = useCartStore((s) => s.addLine);
  const router = useRouter();

  const selectedVariant = variants.find((v) => v.id === variantId) ?? null;
  const price = selectedVariant?.price_override ?? product.price;
  const stock = selectedVariant ? selectedVariant.stock : product.stock;
  const outOfStock = stock <= 0 || (selectedVariant && !selectedVariant.is_available);
  const lowStock = !outOfStock && stock <= LOW_STOCK_THRESHOLD;

  function handleAdd() {
    addLine({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      title: product.title,
      variantName: selectedVariant?.name ?? null,
      price,
      image: product.images[0] ?? null,
      quantity,
      stock,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <div className="space-y-4">
      {variants.length > 0 && (
        <div>
          <label className="label">Option</label>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={!v.is_available || v.stock <= 0}
                onClick={() => setVariantId(v.id)}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${
                  variantId === v.id
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="label mb-0">Qty</label>
        <div className="flex items-center rounded-md border border-zinc-300">
          <button
            type="button"
            className="px-3 py-1.5 text-sm"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            type="button"
            className="px-3 py-1.5 text-sm"
            onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))}
          >
            +
          </button>
        </div>
        {lowStock && (
          <span className="text-xs font-medium text-amber-600">
            Only {stock} left
          </span>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={!!outOfStock}
          onClick={handleAdd}
          className="btn-secondary flex-1"
        >
          {outOfStock ? "Out of stock" : justAdded ? "Added ✓" : "Add to cart"}
        </button>
        <button
          type="button"
          disabled={!!outOfStock}
          onClick={() => {
            handleAdd();
            router.push("/cart");
          }}
          className="btn-primary flex-1"
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
