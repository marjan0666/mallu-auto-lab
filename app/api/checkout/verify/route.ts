import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } from "@/lib/resend";
import type { Order, OrderItem } from "@/lib/types";

const bodySchema = z.object({
  orderId: z.string().uuid(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    parsed.data;

  const valid = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!valid) {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("razorpay_order_id", razorpay_order_id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Already processed (e.g. webhook beat us to it) — avoid double stock decrement/emails.
  if (order.status === "paid") {
    return NextResponse.json({ ok: true, orderId: order.id });
  }

  const { data: items } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  await admin
    .from("orders")
    .update({
      status: "paid",
      razorpay_payment_id,
      razorpay_signature,
    })
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

  return NextResponse.json({ ok: true, orderId: order.id });
}
