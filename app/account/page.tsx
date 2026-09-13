import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { SignOutButton } from "@/components/SignOutButton";
import type { Order } from "@/lib/types";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const supabase = createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container-page py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My account</h1>
          <p className="mt-1 text-sm text-zinc-600">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <h2 className="mt-8 text-lg font-semibold text-zinc-900">Order history</h2>

      {!orders || orders.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          No orders yet.{" "}
          <Link href="/shop" className="text-brand-600">
            Start shopping →
          </Link>
        </p>
      ) : (
        <div className="mt-4 divide-y divide-zinc-200 rounded-lg border border-zinc-200">
          {(orders as Order[]).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-xs text-zinc-500">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    dateStyle: "medium",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {formatPrice(order.total, order.currency)}
                </p>
                <p className="text-xs capitalize text-zinc-500">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
