import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/format";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

interface DailyRevenueRow {
  day: string;
  revenue: number;
  order_count: number;
}

interface TopProductRow {
  product_id: string;
  title: string;
  quantity_sold: number;
  revenue: number;
}

interface StatusCountRow {
  status: string;
  count: number;
}

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const admin = createAdminClient();

  const [
    { count: productCount },
    { count: orderCount },
    { data: recentOrders },
    { data: dailyRevenue },
    { data: topProducts },
    { data: statusCounts },
    { data: lowStockProducts },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
    admin.rpc("get_daily_revenue", { days: 30 }),
    admin.rpc("get_top_products", { limit_count: 5 }),
    admin.rpc("get_order_status_counts"),
    supabase
      .from("products")
      .select("id, title, stock")
      .eq("is_active", true)
      .lte("stock", LOW_STOCK_THRESHOLD)
      .order("stock", { ascending: true })
      .limit(20),
  ]);

  const revenueRows = (dailyRevenue ?? []) as DailyRevenueRow[];
  const totalRevenue30d = revenueRows.reduce((sum, r) => sum + Number(r.revenue), 0);
  const maxRevenue = Math.max(...revenueRows.map((r) => Number(r.revenue)), 1);

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
          <p className="text-sm text-zinc-500">Revenue (last 30 days)</p>
          <p className="mt-1 text-2xl font-bold">{formatPrice(totalRevenue30d)}</p>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">Revenue, last 30 days</h2>
      {revenueRows.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">No paid orders yet.</p>
      ) : (
        <div className="mt-4 flex h-32 items-end gap-1 rounded-lg border border-zinc-200 p-4">
          {revenueRows.map((row) => (
            <div
              key={row.day}
              className="group relative flex-1 rounded-t bg-brand-500"
              style={{ height: `${Math.max((Number(row.revenue) / maxRevenue) * 100, 4)}%` }}
              title={`${new Date(row.day).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}: ${formatPrice(Number(row.revenue))} (${row.order_count} orders)`}
            />
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Top products</h2>
          <div className="mt-4 divide-y divide-zinc-200 rounded-lg border border-zinc-200">
            {((topProducts ?? []) as TopProductRow[]).map((p) => (
              <div key={p.product_id} className="flex items-center justify-between p-3 text-sm">
                <span className="truncate pr-2">{p.title}</span>
                <span className="shrink-0 text-zinc-500">{p.quantity_sold} sold</span>
              </div>
            ))}
            {(!topProducts || topProducts.length === 0) && (
              <p className="p-3 text-sm text-zinc-500">No paid orders yet.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Orders by status</h2>
          <div className="mt-4 divide-y divide-zinc-200 rounded-lg border border-zinc-200">
            {((statusCounts ?? []) as StatusCountRow[]).map((s) => (
              <div key={s.status} className="flex items-center justify-between p-3 text-sm">
                <span className="capitalize">{s.status}</span>
                <span className="font-semibold">{s.count}</span>
              </div>
            ))}
            {(!statusCounts || statusCounts.length === 0) && (
              <p className="p-3 text-sm text-zinc-500">No orders yet.</p>
            )}
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">Low stock</h2>
      <div className="mt-4 divide-y divide-zinc-200 rounded-lg border border-zinc-200">
        {(lowStockProducts ?? []).map((p) => (
          <Link
            key={p.id}
            href={`/admin/products/${p.id}`}
            className="flex items-center justify-between p-3 text-sm hover:bg-zinc-50"
          >
            <span>{p.title}</span>
            <span className={p.stock === 0 ? "font-semibold text-red-600" : "text-amber-600"}>
              {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
            </span>
          </Link>
        ))}
        {(!lowStockProducts || lowStockProducts.length === 0) && (
          <p className="p-3 text-sm text-zinc-500">Nothing low on stock.</p>
        )}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">Recent orders</h2>
      <div className="mt-4 divide-y divide-zinc-200 rounded-lg border border-zinc-200">
        {(recentOrders ?? []).map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="flex items-center justify-between p-4 text-sm hover:bg-zinc-50"
          >
            <span>#{order.id.slice(0, 8).toUpperCase()}</span>
            <span>{order.contact_email}</span>
            <span className="capitalize">{order.status}</span>
            <span className="font-semibold">{formatPrice(order.total, order.currency)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
