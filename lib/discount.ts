import type { SupabaseClient } from "@supabase/supabase-js";
import type { DiscountCode } from "@/lib/types";

export interface DiscountResult {
  valid: boolean;
  message: string;
  amount: number;
  code?: string;
}

// Shared by /api/checkout/validate-discount (live preview at checkout) and
// /api/checkout/create-order (authoritative check before charging) so the
// two can never disagree about whether a code applies.
export async function validateDiscountCode(
  admin: SupabaseClient,
  rawCode: string,
  subtotal: number
): Promise<DiscountResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, message: "Enter a discount code.", amount: 0 };
  }

  const { data } = await admin
    .from("discount_codes")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .maybeSingle();

  const discount = data as DiscountCode | null;

  if (!discount) {
    return { valid: false, message: "Invalid or expired code.", amount: 0 };
  }

  if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
    return { valid: false, message: "This code has expired.", amount: 0 };
  }

  const amount =
    discount.discount_type === "percent"
      ? Math.round(((subtotal * discount.discount_value) / 100) * 100) / 100
      : Math.min(discount.discount_value, subtotal);

  return {
    valid: true,
    message: `Code applied: ${
      discount.discount_type === "percent"
        ? `${discount.discount_value}% off`
        : `₹${discount.discount_value} off`
    }`,
    amount,
    code,
  };
}
