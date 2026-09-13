"use client";

import { AdminSingleImageUploader } from "@/components/AdminSingleImageUploader";
import type { Collection } from "@/lib/types";

export function AdminCollectionForm({
  collection,
  action,
}: {
  collection?: Collection;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="max-w-xl space-y-6">
      {collection && <input type="hidden" name="id" value={collection.id} />}

      <div>
        <label className="label">Title</label>
        <input name="title" required defaultValue={collection?.title} className="input" />
      </div>

      <div>
        <label className="label">Slug (leave blank to auto-generate)</label>
        <input name="slug" defaultValue={collection?.slug} className="input" />
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={collection?.description ?? ""}
          className="input"
        />
      </div>

      <div>
        <label className="label">Cover image</label>
        <AdminSingleImageUploader
          name="image_url"
          initialImage={collection?.image_url ?? ""}
        />
      </div>

      <div>
        <label className="label">Sort order</label>
        <input
          name="sort_order"
          type="number"
          defaultValue={collection?.sort_order ?? 0}
          className="input w-32"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={collection?.is_active ?? true} />
        Visible in store
      </label>

      <button type="submit" className="btn-primary">
        Save collection
      </button>
    </form>
  );
}
