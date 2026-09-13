"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function saveHero(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();

  const value = {
    heading: String(formData.get("heading") ?? ""),
    subheading: String(formData.get("subheading") ?? ""),
    image_url: String(formData.get("image_url") ?? ""),
    cta_label: String(formData.get("cta_label") ?? "Shop Now"),
    cta_href: String(formData.get("cta_href") ?? "/shop"),
  };

  await supabase
    .from("site_content")
    .update({ value })
    .eq("key", "hero");

  revalidatePath("/");
  revalidatePath("/admin/content");
}

export async function saveFeaturedCollections(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();

  const slugs = String(formData.get("slugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await supabase
    .from("site_content")
    .update({ value: slugs })
    .eq("key", "featured_collection_slugs");

  revalidatePath("/");
  revalidatePath("/admin/content");
}
