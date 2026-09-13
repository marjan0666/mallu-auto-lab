import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } from "@/lib/resend";
import type { Order, OrderItem } from "@/lib/types";

// Backstop for the client-driven /api/checkout/verify flow: if the browser
// tab closes right after payment, this webhook still marks the order paid.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event !== "payment.captured") {
    return NextResponse.json({ ok: true });
  }

  const payment = event.payload.payment.entity;
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", payment.order_id)
    .single();

  if (!order || order.status === "paid") {
    return NextResponse.json({ ok: true });
  }

  const { data: items } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  await admin
    .from("orders")
    .update({ status: "paid", razorpay_payment_id: payment.id })
    .eq("id", order.id);

  for (const item of (items ?? []) as OrderItem[]) {
    if (item.variant_id) {
      await admin.rpc("decrement_variant_stock", {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity,
      });
    } else if (item.product_id) {
      await admin.rpc("decrement_product_stock", {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      });
    }
  }

  const paidOrder = { ...order, status: "paid" } as Order;
  try {
    await sendOrderConfirmationEmail(paidOrder, (items ?? []) as OrderItem[]);
    await sendAdminOrderNotificationEmail(paidOrder, (items ?? []) as OrderItem[]);
  } catch (err) {
    console.error("Failed to send order emails", err);
  }

  return NextResponse.json({ ok: true });
}
