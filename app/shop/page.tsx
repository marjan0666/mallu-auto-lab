import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/ProductGrid";
import type { Collection, Product } from "@/lib/types";
import Link from "next/link";
import clsx from "clsx";

export const revalidate = 60;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { collection?: string };
}) {
  const supabase = createClient();

  const { data: collections } = await supabase
    .from("collections")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (searchParams.collection) {
    const match = (collections ?? []).find(
      (c) => c.slug === searchParams.collection
    );
    if (match) query = query.eq("collection_id", match.id);
  }

  const { data: products } = await query;

  return (
    <div className="container-page py-12">
      <h1 className="text-2xl font-bold text-zinc-900">Shop</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/shop"
          className={clsx(
            "rounded-full border px-4 py-1.5 text-sm font-medium",
            !searchParams.collection
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
          )}
        >
          All
        </Link>
        {(collections as Collection[] | null)?.map((c) => (
          <Link
            key={c.id}
            href={`/shop?collection=${c.slug}`}
            className={clsx(
              "rounded-full border px-4 py-1.5 text-sm font-medium",
              searchParams.collection === c.slug
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
            )}
          >
            {c.title}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <ProductGrid products={(products as Product[]) ?? []} />
      </div>
    </div>
  );
}
