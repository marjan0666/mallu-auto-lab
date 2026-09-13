import Razorpay from "razorpay";
import crypto from "crypto";

export function getRazorpayClient() {
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

// Verifies the signature returned by Razorpay Checkout after a successful
// payment (order_id + payment_id, signed with the key secret).
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");

  return expected === params.signature;
}

// Verifies the signature Razorpay sends on webhook requests
// (X-Razorpay-Signature header), signed with the separate webhook secret.
export function verifyWebhookSignature(body: string, signature: string) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  return expected === signature;
}
