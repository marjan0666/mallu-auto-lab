import { createClient } from "@/lib/supabase/server";
import { AdminProductForm } from "@/components/AdminProductForm";
import { saveProduct } from "../actions";
import type { Collection } from "@/lib/types";

export default async function NewProductPage() {
  const supabase = createClient();
  const { data: collections } = await supabase
    .from("collections")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">New product</h1>
      <div className="mt-6">
        <AdminProductForm
          collections={(collections ?? []) as Collection[]}
          action={saveProduct}
        />
      </div>
    </div>
  );
}
