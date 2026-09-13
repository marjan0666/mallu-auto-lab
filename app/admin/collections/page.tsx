import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteCollection } from "./actions";
import type { Collection } from "@/lib/types";

export default async function AdminCollectionsPage() {
  const supabase = createClient();
  const { data: collections } = await supabase
    .from("collections")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Collections</h1>
        <Link href="/admin/collections/new" className="btn-primary">
          + New collection
        </Link>
      </div>

      <div className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200">
        {((collections ?? []) as Collection[]).map((collection) => (
          <div key={collection.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium">{collection.title}</p>
              <p className="text-xs text-zinc-500">
                /{collection.slug} {!collection.is_active && "· hidden"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/collections/${collection.id}`}
                className="text-sm font-medium text-brand-600"
              >
                Edit
              </Link>
              <form action={deleteCollection}>
                <input type="hidden" name="id" value={collection.id} />
                <button className="text-sm font-medium text-red-600">Delete</button>
              </form>
            </div>
          </div>
        ))}
        {(!collections || collections.length === 0) && (
          <p className="p-4 text-sm text-zinc-500">No collections yet.</p>
        )}
      </div>
    </div>
  );
}
