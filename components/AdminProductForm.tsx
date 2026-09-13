"use client";

import { useState } from "react";
import { AdminImageUploader } from "@/components/AdminImageUploader";
import type { Collection, Product, ProductVariant } from "@/lib/types";

interface VariantDraft {
  name: string;
  price_override: string;
  stock: string;
}

export function AdminProductForm({
  product,
  variants,
  collections,
  action,
}: {
  product?: Product;
  variants?: ProductVariant[];
  collections: Collection[];
  action: (formData: FormData) => void;
}) {
  const [variantDrafts, setVariantDrafts] = useState<VariantDraft[]>(
    variants && variants.length > 0
      ? variants.map((v) => ({
          name: v.name,
          price_override: v.price_override?.toString() ?? "",
          stock: v.stock.toString(),
        }))
      : []
  );

  function addVariant() {
    setVariantDrafts((prev) => [...prev, { name: "", price_override: "", stock: "0" }]);
  }

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariantDrafts((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...patch } : v))
    );
  }

  function removeVariant(index: number) {
    setVariantDrafts((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={action} className="max-w-2xl space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div>
        <label className="label">Title</label>
        <input name="title" required defaultValue={product?.title} className="input" />
      </div>

      <div>
        <label className="label">Slug (leave blank to auto-generate)</label>
        <input name="slug" defaultValue={product?.slug} className="input" />
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          className="input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Price (₹)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            required
            defaultValue={product?.price}
            className="input"
          />
        </div>
        <div>
          <label className="label">Compare-at price (₹)</label>
          <input
            name="compare_at_price"
            type="number"
            step="0.01"
            defaultValue={product?.compare_at_price ?? ""}
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Stock</label>
          <input
            name="stock"
            type="number"
            defaultValue={product?.stock ?? 0}
            className="input"
          />
        </div>
        <div>
          <label className="label">Collection</label>
          <select
            name="collection_id"
            defaultValue={product?.collection_id ?? ""}
            className="input"
          >
            <option value="">None</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Tags (comma separated)</label>
        <input
          name="tags"
          defaultValue={product?.tags?.join(", ")}
          className="input"
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} />
          Visible in store
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured} />
          Featured on homepage
        </label>
      </div>

      <div>
        <label className="label">Images</label>
        <AdminImageUploader name="images" initialImages={product?.images ?? []} />
      </div>

      <div>
        <label className="label">Variants (e.g. team, size, colour)</label>
        <div className="space-y-2">
          {variantDrafts.map((v, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="Name"
                value={v.name}
                onChange={(e) => updateVariant(i, { name: e.target.value })}
                className="input"
              />
              <input
                placeholder="Price override"
                type="number"
                step="0.01"
                value={v.price_override}
                onChange={(e) => updateVariant(i, { price_override: e.target.value })}
                className="input w-32"
              />
              <input
                placeholder="Stock"
                type="number"
                value={v.stock}
                onChange={(e) => updateVariant(i, { stock: e.target.value })}
                className="input w-24"
              />
              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="text-sm text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addVariant} className="btn-secondary mt-2 text-sm">
          + Add variant
        </button>
        <input type="hidden" name="variants" value={JSON.stringify(variantDrafts)} />
      </div>

      <button type="submit" className="btn-primary">
        Save product
      </button>
    </form>
  );
}
