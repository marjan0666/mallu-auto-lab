import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { deleteProduct } from "./actions";
import type { Product } from "@/lib/types";

export default async function AdminProductsPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">
          + New product
        </Link>
      </div>

      <div className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200">
        {((products ?? []) as Product[]).map((product) => (
          <div key={product.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium">{product.title}</p>
              <p className="text-xs text-zinc-500">
                {formatPrice(product.price)} · stock {product.stock}{" "}
                {!product.is_active && "· hidden"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/products/${product.id}`}
                className="text-sm font-medium text-brand-600"
              >
                Edit
              </Link>
              <form action={deleteProduct}>
                <input type="hidden" name="id" value={product.id} />
                <button className="text-sm font-medium text-red-600">Delete</button>
              </form>
            </div>
          </div>
        ))}
        {(!products || products.length === 0) && (
          <p className="p-4 text-sm text-zinc-500">No products yet.</p>
        )}
      </div>
    </div>
  );
}
