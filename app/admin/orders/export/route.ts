import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

const columns = [
  "id",
  "status",
  "subtotal",
  "discount_amount",
  "total",
  "currency",
  "contact_email",
  "contact_phone",
  "discount_code",
  "razorpay_payment_id",
  "created_at",
];

export async function GET(request: Request) {
  await requireAdmin();
  const supabase = createClient();

  const status = new URL(request.url).searchParams.get("status");
  let query = supabase
    .from("orders")
    .select(columns.join(","))
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: orders } = await query;

  const csv = toCsv((orders ?? []) as unknown as Record<string, unknown>[], columns);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="orders-${Date.now()}.csv"`,
    },
  });
}
