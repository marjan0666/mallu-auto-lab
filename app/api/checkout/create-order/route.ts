import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayClient } from "@/lib/razorpay";
import { validateDiscountCode } from "@/lib/discount";
import type { CartLine } from "@/lib/types";

const lineSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable(),
  title: z.string(),
  variantName: z.string().nullable(),
  price: z.number().positive(),
  image: z.string().nullable(),
  quantity: z.number().int().positive(),
  stock: z.number().int(),
});

const bodySchema = z.object({
  lines: z.array(lineSchema).min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(6),
  discountCode: z.string().nullable().optional(),
  shippingAddress: z.object({
    full_name: z.string().min(1),
    phone: z.string().min(6),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postal_code: z.string().min(1),
    country: z.string().min(1),
  }),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { lines, contactEmail, contactPhone, shippingAddress, discountCode } = parsed.data;

  const admin = createAdminClient();

  // Re-check live prices/stock server-side rather than trusting the client cart.
  const productIds = [...new Set(lines.map((l) => l.productId))];
  const { data: products, error: productsError } = await admin
    .from("products")
    .select("id, price, stock, title, is_active")
    .in("id", productIds);

  if (productsError || !products) {
    return NextResponse.json({ error: "Could not load products" }, { status: 500 });
  }

  const variantIds = lines
    .map((l) => l.variantId)
    .filter((id): id is string => !!id);
  const { data: variants } = variantIds.length
    ? await admin
        .from("product_variants")
        .select("id, price_override, stock, is_available, name")
        .in("id", variantIds)
    : { data: [] as { id: string; price_override: number | null; stock: number; is_available: boolean; name: string }[] };

  let subtotal = 0;
  const orderItems: {
    product_id: string;
    variant_id: string | null;
    title: string;
    variant_name: string | null;
    quantity: number;
    unit_price: number;
    image_url: string | null;
  }[] = [];

  for (const line of lines as (CartLine & { quantity: number })[]) {
    const product = products.find((p) => p.id === line.productId);
    if (!product || !product.is_active) {
      return NextResponse.json(
        { error: `Product unavailable: ${line.title}` },
        { status: 400 }
      );
    }

    const variant = line.variantId
      ? variants?.find((v) => v.id === line.variantId)
      : null;

    const unitPrice = variant?.price_override ?? product.price;
    const availableStock = variant ? variant.stock : product.stock;

    if (variant && !variant.is_available) {
      return NextResponse.json(
        { error: `Option unavailable: ${line.title}` },
        { status: 400 }
      );
    }

    if (line.quantity > availableStock) {
      return NextResponse.json(
        { error: `Insufficient stock for ${line.title}` },
        { status: 400 }
      );
    }

    subtotal += unitPrice * line.quantity;
    orderItems.push({
      product_id: line.productId,
      variant_id: line.variantId,
      title: product.title,
      variant_name: variant?.name ?? null,
      quantity: line.quantity,
      unit_price: unitPrice,
      image_url: line.image,
    });
  }

  let discountAmount = 0;
  let appliedDiscountCode: string | null = null;

  if (discountCode) {
    const result = await validateDiscountCode(admin, discountCode, subtotal);
    if (!result.valid) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    discountAmount = result.amount;
    appliedDiscountCode = result.code ?? null;
  }

  const total = Math.max(subtotal - discountAmount, 0); // extend here if shipping/tax rules are added later

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      status: "pending",
      subtotal,
      total,
      currency: "INR",
      contact_email: contactEmail,
      contact_phone: contactPhone,
      shipping_address: shippingAddress,
      discount_code: appliedDiscountCode,
      discount_amount: discountAmount,
    })
    .select("*")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }

  await admin.from("order_items").insert(
    orderItems.map((item) => ({ ...item, order_id: order.id }))
  );

  const razorpay = getRazorpayClient();
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(total * 100),
    currency: "INR",
    receipt: order.id,
  });

  await admin
    .from("orders")
    .update({ razorpay_order_id: razorpayOrder.id })
    .eq("id", order.id);

  return NextResponse.json({
    orderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}
