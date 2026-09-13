"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";

function parseVariants(raw: string) {
  return (JSON.parse(raw || "[]") as { name: string; price_override: string; stock: string }[])
    .filter((v) => v.name.trim())
    .map((v, index) => ({
      name: v.name.trim(),
      price_override: v.price_override ? Number(v.price_override) : null,
      stock: Number(v.stock) || 0,
      sort_order: index,
    }));
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();

  const id = formData.get("id") as string | null;
  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") || title));
  const description = String(formData.get("description") ?? "");
  const price = Number(formData.get("price"));
  const compareAtPriceRaw = formData.get("compare_at_price");
  const compareAtPrice = compareAtPriceRaw ? Number(compareAtPriceRaw) : null;
  const stock = Number(formData.get("stock") ?? 0);
  const collectionId = (formData.get("collection_id") as string) || null;
  const isActive = formData.get("is_active") === "on";
  const isFeatured = formData.get("is_featured") === "on";
  const images = JSON.parse(String(formData.get("images") || "[]")) as string[];
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const variants = parseVariants(String(formData.get("variants") || "[]"));

  const payload = {
    title,
    slug,
    description,
    price,
    compare_at_price: compareAtPrice,
    stock,
    collection_id: collectionId,
    is_active: isActive,
    is_featured: isFeatured,
    images,
    tags,
  };

  let productId = id;

  if (id) {
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    productId = data.id;
  }

  await supabase.from("product_variants").delete().eq("product_id", productId!);
  if (variants.length > 0) {
    await supabase
      .from("product_variants")
      .insert(variants.map((v) => ({ ...v, product_id: productId })));
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/products/${slug}`);
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();
  const id = formData.get("id") as string;

  await supabase.from("products").delete().eq("id", id);

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}
