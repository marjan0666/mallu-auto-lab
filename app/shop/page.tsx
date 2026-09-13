import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/ProductGrid";
import type { Collection, Product } from "@/lib/types";
import Link from "next/link";
import clsx from "clsx";

export const revalidate = 60;

interface ShopSearchParams {
  collection?: string;
  q?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: ShopSearchParams;
}) {
  const supabase = createClient();

  const { data: collections } = await supabase
    .from("collections")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  let query = supabase.from("products").select("*").eq("is_active", true);

  if (searchParams.collection) {
    const match = (collections ?? []).find(
      (c) => c.slug === searchParams.collection
    );
    if (match) query = query.eq("collection_id", match.id);
  }

  if (searchParams.q) {
    query = query.ilike("title", `%${searchParams.q}%`);
  }

  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : null;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : null;
  if (minPrice !== null && !Number.isNaN(minPrice)) query = query.gte("price", minPrice);
  if (maxPrice !== null && !Number.isNaN(maxPrice)) query = query.lte("price", maxPrice);

  if (searchParams.sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (searchParams.sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: products } = await query;

  return (
    <div className="container-page py-12">
      <h1 className="text-2xl font-bold text-zinc-900">
        {searchParams.q ? `Search results for "${searchParams.q}"` : "Shop"}
      </h1>

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

      <form
        method="get"
        className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 p-3"
      >
        {searchParams.collection && (
          <input type="hidden" name="collection" value={searchParams.collection} />
        )}
        {searchParams.q && <input type="hidden" name="q" value={searchParams.q} />}

        <div>
          <label className="label mb-1 text-xs">Sort by</label>
          <select name="sort" defaultValue={searchParams.sort ?? "newest"} className="input">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
        <div>
          <label className="label mb-1 text-xs">Min price</label>
          <input
            type="number"
            name="minPrice"
            defaultValue={searchParams.minPrice}
            className="input w-28"
          />
        </div>
        <div>
          <label className="label mb-1 text-xs">Max price</label>
          <input
            type="number"
            name="maxPrice"
            defaultValue={searchParams.maxPrice}
            className="input w-28"
          />
        </div>
        <button type="submit" className="btn-secondary">
          Apply
        </button>
      </form>

      <div className="mt-8">
        <ProductGrid products={(products as Product[]) ?? []} />
      </div>
    </div>
  );
}
