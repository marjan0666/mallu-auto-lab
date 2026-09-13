import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminProductForm } from "@/components/AdminProductForm";
import { saveProduct } from "../actions";
import type { Collection, Product, ProductVariant } from "@/lib/types";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [{ data: product }, { data: variants }, { data: collections }] = await Promise.all([
    supabase.from("products").select("*").eq("id", params.id).single(),
    supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", params.id)
      .order("sort_order"),
    supabase.from("collections").select("*").order("sort_order"),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">Edit product</h1>
      <div className="mt-6">
        <AdminProductForm
          product={product as Product}
          variants={(variants ?? []) as ProductVariant[]}
          collections={(collections ?? []) as Collection[]}
          action={saveProduct}
        />
      </div>
    </div>
  );
}
