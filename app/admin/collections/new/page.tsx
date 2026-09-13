import { AdminCollectionForm } from "@/components/AdminCollectionForm";
import { saveCollection } from "../actions";

export default function NewCollectionPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">New collection</h1>
      <div className="mt-6">
        <AdminCollectionForm action={saveCollection} />
      </div>
    </div>
  );
}
