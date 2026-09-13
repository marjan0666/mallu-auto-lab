import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteDiscountCode } from "./actions";
import type { DiscountCode } from "@/lib/types";

export default async function AdminDiscountsPage() {
  const supabase = createClient();
  const { data: discounts } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Discount codes</h1>
        <Link href="/admin/discounts/new" className="btn-primary">
          + New code
        </Link>
      </div>

      <div className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200">
        {((discounts ?? []) as DiscountCode[]).map((discount) => (
          <div key={discount.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium">{discount.code}</p>
              <p className="text-xs text-zinc-500">
                {discount.discount_type === "percent"
                  ? `${discount.discount_value}% off`
                  : `₹${discount.discount_value} off`}
                {discount.expires_at &&
                  ` · expires ${new Date(discount.expires_at).toLocaleDateString("en-IN")}`}
                {!discount.is_active && " · inactive"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/discounts/${discount.id}`}
                className="text-sm font-medium text-brand-600"
              >
                Edit
              </Link>
              <form action={deleteDiscountCode}>
                <input type="hidden" name="id" value={discount.id} />
                <button className="text-sm font-medium text-red-600">Delete</button>
              </form>
            </div>
          </div>
        ))}
        {(!discounts || discounts.length === 0) && (
          <p className="p-4 text-sm text-zinc-500">No discount codes yet.</p>
        )}
      </div>
    </div>
  );
}
