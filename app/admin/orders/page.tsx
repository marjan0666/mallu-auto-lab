import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

const statuses: OrderStatus[] = [
  "pending",
  "paid",
  "failed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createClient();
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }

  const { data: orders } = await query;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900">Orders</h1>
        <a
          href={`/admin/orders/export${searchParams.status ? `?status=${searchParams.status}` : ""}`}
          className="btn-secondary text-sm"
        >
          Export CSV
        </a>
      </div>

      <form method="get" className="mt-4 flex gap-2">
        <select name="status" defaultValue={searchParams.status ?? ""} className="input max-w-xs">
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-secondary">
          Filter
        </button>
      </form>

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
          <p className="p-4 text-sm text-zinc-500">No orders found.</p>
        )}
      </div>
    </div>
  );
}
