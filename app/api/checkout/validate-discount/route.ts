import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateDiscountCode } from "@/lib/discount";

const bodySchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().positive(),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ valid: false, message: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();
  const result = await validateDiscountCode(admin, parsed.data.code, parsed.data.subtotal);

  return NextResponse.json(result);
}
