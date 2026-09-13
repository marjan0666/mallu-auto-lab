import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { updateOrderStatus } from "../actions";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";

const statuses: OrderStatus[] = [
  "pending",
  "paid",
  "failed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", params.id).single(),
    supabase.from("order_items").select("*").eq("order_id", params.id),
  ]);

  if (!order) notFound();

  const typedOrder = order as Order;
  const address = typedOrder.shipping_address;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-900">
        Order #{typedOrder.id.slice(0, 8).toUpperCase()}
      </h1>

      <div className="mt-6 flex items-center gap-3">
        <form action={updateOrderStatus} className="flex items-center gap-2">
          <input type="hidden" name="id" value={typedOrder.id} />
          <select name="status" defaultValue={typedOrder.status} className="input w-40">
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-secondary">
            Update status
          </button>
        </form>
      </div>

      <div className="mt-8 rounded-lg border border-zinc-200">
        <div className="divide-y divide-zinc-200">
          {((items ?? []) as OrderItem[]).map((item) => (
            <div key={item.id} className="flex justify-between p-4 text-sm">
              <span>
                {item.title}
                {item.variant_name ? ` (${item.variant_name})` : ""} × {item.quantity}
              </span>
              <span>{formatPrice(item.unit_price * item.quantity, typedOrder.currency)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-zinc-200 p-4 text-sm font-semibold">
          <span>Total</span>
          <span>{formatPrice(typedOrder.total, typedOrder.currency)}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Contact</h2>
          <p className="mt-1 text-sm text-zinc-600">{typedOrder.contact_email}</p>
          <p className="text-sm text-zinc-600">{typedOrder.contact_phone}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Shipping address</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {address.full_name}
            <br />
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}
            <br />
            {address.city}, {address.state} {address.postal_code}
            <br />
            {address.country}
          </p>
        </div>
      </div>
    </div>
  );
}
