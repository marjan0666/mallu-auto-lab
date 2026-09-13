import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/lib/types";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group relative block overflow-hidden rounded-lg"
    >
      <div className="relative aspect-[4/3] bg-zinc-200">
        {collection.image_url ? (
          <Image
            src={collection.image_url}
            alt={collection.title}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/30" />
        <p className="absolute bottom-4 left-4 text-lg font-bold text-white">
          {collection.title}
        </p>
      </div>
    </Link>
  );
}
