"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";

export async function saveCollection(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();

  const id = formData.get("id") as string | null;
  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") || title));
  const description = String(formData.get("description") ?? "");
  const imageUrl = (formData.get("image_url") as string) || null;
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const isActive = formData.get("is_active") === "on";

  const payload = {
    title,
    slug,
    description,
    image_url: imageUrl,
    sort_order: sortOrder,
    is_active: isActive,
  };

  if (id) {
    const { error } = await supabase.from("collections").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("collections").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/collections");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/collections");
}

export async function deleteCollection(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();
  const id = formData.get("id") as string;

  await supabase.from("collections").delete().eq("id", id);

  revalidatePath("/admin/collections");
}
