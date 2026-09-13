"use client";

import type { DiscountCode } from "@/lib/types";

export function AdminDiscountForm({
  discount,
  action,
}: {
  discount?: DiscountCode;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="max-w-md space-y-6">
      {discount && <input type="hidden" name="id" value={discount.id} />}

      <div>
        <label className="label">Code</label>
        <input
          name="code"
          required
          defaultValue={discount?.code}
          placeholder="WELCOME10"
          className="input uppercase"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Type</label>
          <select
            name="discount_type"
            defaultValue={discount?.discount_type ?? "percent"}
            className="input"
          >
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed amount off (₹)</option>
          </select>
        </div>
        <div>
          <label className="label">Value</label>
          <input
            name="discount_value"
            type="number"
            step="0.01"
            required
            defaultValue={discount?.discount_value}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label">Expires on (optional)</label>
        <input
          name="expires_at"
          type="date"
          defaultValue={discount?.expires_at ? discount.expires_at.slice(0, 10) : ""}
          className="input"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={discount?.is_active ?? true} />
        Active
      </label>

      <button type="submit" className="btn-primary">
        Save discount code
      </button>
    </form>
  );
}
