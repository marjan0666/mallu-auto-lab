import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/ProductGrid";
import type { Product } from "@/lib/types";

export const revalidate = 60;

export default async function CollectionPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: collection } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single();

  if (!collection) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("collection_id", collection.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="container-page py-12">
      <h1 className="text-2xl font-bold text-zinc-900">{collection.title}</h1>
      {collection.description && (
        <p className="mt-2 max-w-2xl text-zinc-600">{collection.description}</p>
      )}
      <div className="mt-8">
        <ProductGrid products={(products as Product[]) ?? []} />
      </div>
    </div>
  );
}
