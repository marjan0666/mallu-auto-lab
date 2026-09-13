import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatPrice } from "@/lib/format";
import type { Product, ProductVariant } from "@/lib/types";

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", product.id)
    .order("sort_order");

  const typedProduct = product as Product;
  const typedVariants = (variants ?? []) as ProductVariant[];
  const onSale =
    typedProduct.compare_at_price &&
    typedProduct.compare_at_price > typedProduct.price;

  return (
    <div className="container-page grid gap-10 py-12 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
          {typedProduct.images[0] ? (
            <Image
              src={typedProduct.images[0]}
              alt={typedProduct.title}
              fill
              priority
              className="object-cover"
            />
          ) : null}
        </div>
        {typedProduct.images.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {typedProduct.images.slice(1).map((img) => (
              <div
                key={img}
                className="relative aspect-square overflow-hidden rounded-md bg-zinc-100"
              >
                <Image src={img} alt={typedProduct.title} fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{typedProduct.title}</h1>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-xl font-semibold text-zinc-900">
            {formatPrice(typedProduct.price)}
          </span>
          {onSale && (
            <span className="text-sm text-zinc-400 line-through">
              {formatPrice(typedProduct.compare_at_price!)}
            </span>
          )}
        </div>

        {typedProduct.description && (
          <p className="mt-4 whitespace-pre-line text-sm text-zinc-600">
            {typedProduct.description}
          </p>
        )}

        <div className="mt-6">
          <AddToCartButton product={typedProduct} variants={typedVariants} />
        </div>
      </div>
    </div>
  );
}
