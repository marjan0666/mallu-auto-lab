import { AdminDiscountForm } from "@/components/AdminDiscountForm";
import { saveDiscountCode } from "../actions";

export default function NewDiscountPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">New discount code</h1>
      <div className="mt-6">
        <AdminDiscountForm action={saveDiscountCode} />
      </div>
    </div>
  );
}
