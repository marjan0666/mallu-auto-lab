"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function saveDiscountCode(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();

  const id = formData.get("id") as string | null;
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const discountType = formData.get("discount_type") as "percent" | "fixed";
  const discountValue = Number(formData.get("discount_value"));
  const isActive = formData.get("is_active") === "on";
  const expiresAtRaw = formData.get("expires_at") as string;
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw).toISOString() : null;

  const payload = {
    code,
    discount_type: discountType,
    discount_value: discountValue,
    is_active: isActive,
    expires_at: expiresAt,
  };

  if (id) {
    const { error } = await supabase.from("discount_codes").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("discount_codes").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/discounts");
  redirect("/admin/discounts");
}

export async function deleteDiscountCode(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();
  const id = formData.get("id") as string;

  await supabase.from("discount_codes").delete().eq("id", id);

  revalidatePath("/admin/discounts");
}
