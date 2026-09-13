import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { deleteProduct } from "./actions";
import type { Product } from "@/lib/types";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createClient();
  let query = supabase.from("products").select("*").order("created_at", { ascending: false });

  if (searchParams.q) {
    query = query.ilike("title", `%${searchParams.q}%`);
  }

  const { data: products } = await query;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900">Products</h1>
        <div className="flex items-center gap-3">
          <a href="/admin/products/export" className="btn-secondary text-sm">
            Export CSV
          </a>
          <Link href="/admin/products/new" className="btn-primary">
            + New product
          </Link>
        </div>
      </div>

      <form method="get" className="mt-4">
        <input
          type="search"
          name="q"
          placeholder="Search products…"
          defaultValue={searchParams.q}
          className="input max-w-xs"
        />
      </form>

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
          <p className="p-4 text-sm text-zinc-500">No products found.</p>
        )}
      </div>
    </div>
  );
}
