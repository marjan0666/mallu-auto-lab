"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type { OrderStatus } from "@/lib/types";

const validStatuses: OrderStatus[] = [
  "pending",
  "paid",
  "failed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();

  const id = formData.get("id") as string;
  const status = formData.get("status") as OrderStatus;

  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status");
  }

  await supabase.from("orders").update({ status }).eq("id", id);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
