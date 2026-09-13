import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/Hero";
import { CollectionCard } from "@/components/CollectionCard";
import { ProductGrid } from "@/components/ProductGrid";
import type { Collection, HeroContent, Product } from "@/lib/types";

export const revalidate = 60;

async function getHomeData() {
  const supabase = createClient();

  const [{ data: heroRow }, { data: featuredSlugsRow }, { data: featuredProducts }] =
    await Promise.all([
      supabase.from("site_content").select("value").eq("key", "hero").single(),
      supabase
        .from("site_content")
        .select("value")
        .eq("key", "featured_collection_slugs")
        .single(),
      supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const featuredSlugs = (featuredSlugsRow?.value as string[]) ?? [];

  const { data: collections } = await supabase
    .from("collections")
    .select("*")
    .eq("is_active", true)
    .in("slug", featuredSlugs.length ? featuredSlugs : ["__none__"]);

  return {
    hero: heroRow?.value as HeroContent | undefined,
    collections: (collections ?? []) as Collection[],
    featuredProducts: (featuredProducts ?? []) as Product[],
  };
}

export default async function HomePage() {
  const { hero, collections, featuredProducts } = await getHomeData();

  return (
    <div>
      {hero && <Hero hero={hero} />}

      {collections.length > 0 && (
        <section className="container-page py-12">
          <h2 className="text-xl font-bold text-zinc-900">Shop by category</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </section>
      )}

      <section className="container-page py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900">Popular right now</h2>
          <a href="/shop" className="text-sm font-medium text-brand-600">
            View all →
          </a>
        </div>
        <div className="mt-6">
          <ProductGrid products={featuredProducts} />
        </div>
      </section>
    </div>
  );
}
