import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";

export default async function AdminOrdersPage() {
  const supabase = createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">Orders</h1>

      <div className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200">
        {((orders ?? []) as Order[]).map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="flex items-center justify-between p-4 text-sm hover:bg-zinc-50"
          >
            <span className="font-medium">#{order.id.slice(0, 8).toUpperCase()}</span>
            <span className="text-zinc-500">{order.contact_email}</span>
            <span className="capitalize">{order.status}</span>
            <span className="font-semibold">{formatPrice(order.total, order.currency)}</span>
          </Link>
        ))}
        {(!orders || orders.length === 0) && (
          <p className="p-4 text-sm text-zinc-500">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
