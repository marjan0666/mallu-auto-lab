import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  const onSale =
    product.compare_at_price && product.compare_at_price > product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-zinc-200 transition hover:shadow-md"
    >
      <div className="relative aspect-square bg-zinc-100">
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">
            No image
          </div>
        )}
        {onSale && (
          <span className="absolute left-2 top-2 rounded bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
            Sale
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-medium text-zinc-900">
          {product.title}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-900">
            {formatPrice(product.price)}
          </span>
          {onSale && (
            <span className="text-xs text-zinc-400 line-through">
              {formatPrice(product.compare_at_price!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
