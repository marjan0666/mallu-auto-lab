import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [{ count: productCount }, { count: orderCount }, { data: recentOrders }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const revenue = (recentOrders ?? [])
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 p-5">
          <p className="text-sm text-zinc-500">Products</p>
          <p className="mt-1 text-2xl font-bold">{productCount ?? 0}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-5">
          <p className="text-sm text-zinc-500">Orders</p>
          <p className="mt-1 text-2xl font-bold">{orderCount ?? 0}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-5">
          <p className="text-sm text-zinc-500">Recent revenue (paid)</p>
          <p className="mt-1 text-2xl font-bold">{formatPrice(revenue)}</p>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">Recent orders</h2>
      <div className="mt-4 divide-y divide-zinc-200 rounded-lg border border-zinc-200">
        {(recentOrders ?? []).map((order) => (
          <div key={order.id} className="flex items-center justify-between p-4 text-sm">
            <span>#{order.id.slice(0, 8).toUpperCase()}</span>
            <span>{order.contact_email}</span>
            <span className="capitalize">{order.status}</span>
            <span className="font-semibold">{formatPrice(order.total, order.currency)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
