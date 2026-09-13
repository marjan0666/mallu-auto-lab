"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export function AdminSingleImageUploader({
  initialImage,
  name,
}: {
  initialImage: string;
  name: string;
}) {
  const [image, setImage] = useState(initialImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();

    try {
      const path = `collections/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("products").getPublicUrl(path);
      setImage(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={image} />
      <div className="flex items-center gap-3">
        {image && (
          <div className="relative h-24 w-24 overflow-hidden rounded-md border border-zinc-200">
            <Image src={image} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => setImage("")}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
            >
              ✕
            </button>
          </div>
        )}
        <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-zinc-300 text-xs text-zinc-500 hover:bg-zinc-50">
          {uploading ? "Uploading…" : image ? "Replace" : "+ Add image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
