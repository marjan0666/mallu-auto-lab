import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

const columns = [
  "id",
  "title",
  "slug",
  "price",
  "compare_at_price",
  "stock",
  "product_type",
  "is_active",
  "is_featured",
  "created_at",
];

export async function GET() {
  await requireAdmin();
  const supabase = createClient();

  const { data: products } = await supabase
    .from("products")
    .select(columns.join(","))
    .order("created_at", { ascending: false });

  const csv = toCsv((products ?? []) as unknown as Record<string, unknown>[], columns);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="products-${Date.now()}.csv"`,
    },
  });
}
