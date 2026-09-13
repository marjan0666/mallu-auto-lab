import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminDiscountForm } from "@/components/AdminDiscountForm";
import { saveDiscountCode } from "../actions";
import type { DiscountCode } from "@/lib/types";

export default async function EditDiscountPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: discount } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!discount) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">Edit discount code</h1>
      <div className="mt-6">
        <AdminDiscountForm discount={discount as DiscountCode} action={saveDiscountCode} />
      </div>
    </div>
  );
}
