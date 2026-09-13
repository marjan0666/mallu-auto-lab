import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminCollectionForm } from "@/components/AdminCollectionForm";
import { saveCollection } from "../actions";
import type { Collection } from "@/lib/types";

export default async function EditCollectionPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: collection } = await supabase
    .from("collections")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!collection) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">Edit collection</h1>
      <div className="mt-6">
        <AdminCollectionForm collection={collection as Collection} action={saveCollection} />
      </div>
    </div>
  );
}
