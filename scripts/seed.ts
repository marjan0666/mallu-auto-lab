/**
 * One-time migration script: pulls the live product/collection catalog and
 * images from the existing Shopify store's public JSON endpoints and loads
 * them into Supabase (Storage + Postgres).
 *
 * Usage:
 *   1. Fill in .env.local with your real Supabase project values
 *      (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) and run the
 *      migrations in supabase/migrations first.
 *   2. In the Supabase dashboard, create a Storage bucket named "products"
 *      (public) if migration 0002 hasn't already created it.
 *   3. npm run seed
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";

config({ path: ".env.local" });

const SOURCE = process.env.SOURCE_STORE_URL ?? "https://malluautolab.com";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local first."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface ShopifyImage {
  src: string;
}

interface ShopifyVariant {
  id: number;
  title: string;
  price: string;
  compare_at_price: string | null;
  available: boolean;
  option1: string | null;
  option2: string | null;
}

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string | null;
  product_type: string;
  tags: string[];
  variants: ShopifyVariant[];
  images: ShopifyImage[];
}

interface ShopifyCollection {
  id: number;
  handle: string;
  title: string;
  body_html: string | null;
  image: { src: string } | null;
}

function stripHtml(html: string | null | undefined) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${SOURCE}${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

async function uploadImage(url: string, folder: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const filename = `${folder}/${randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(filename, buffer, { contentType, upsert: false });

    if (error) {
      console.error(`  ! upload failed for ${url}:`, error.message);
      return null;
    }

    const { data } = supabase.storage.from("products").getPublicUrl(filename);
    return data.publicUrl;
  } catch (err) {
    console.error(`  ! fetch failed for ${url}:`, err);
    return null;
  }
}

async function seedCollections() {
  console.log("Fetching collections…");
  const { collections } = await fetchJson<{ collections: ShopifyCollection[] }>(
    "/collections.json?limit=250"
  );

  const handleToId = new Map<string, string>();

  for (const [index, sc] of collections.entries()) {
    console.log(`  collection: ${sc.title}`);
    const imageUrl = sc.image ? await uploadImage(sc.image.src, "collections") : null;

    const { data, error } = await supabase
      .from("collections")
      .upsert(
        {
          title: sc.title,
          slug: sc.handle,
          description: stripHtml(sc.body_html) || null,
          image_url: imageUrl,
          sort_order: index,
          is_active: true,
        },
        { onConflict: "slug" }
      )
      .select("id, slug")
      .single();

    if (error) {
      console.error(`  ! failed to upsert collection ${sc.title}:`, error.message);
      continue;
    }

    handleToId.set(sc.handle, data.id);
  }

  return handleToId;
}

async function fetchCollectionProductHandles(handle: string): Promise<Set<string>> {
  try {
    const { products } = await fetchJson<{ products: { handle: string }[] }>(
      `/collections/${handle}/products.json?limit=250`
    );
    return new Set(products.map((p) => p.handle));
  } catch {
    return new Set();
  }
}

async function seedProducts(handleToCollectionId: Map<string, string>) {
  console.log("Fetching products…");
  const { products } = await fetchJson<{ products: ShopifyProduct[] }>(
    "/products.json?limit=250"
  );

  // Map product handle -> collection handle by checking membership per collection.
  const productToCollectionHandle = new Map<string, string>();
  for (const handle of handleToCollectionId.keys()) {
    const members = await fetchCollectionProductHandles(handle);
    for (const productHandle of members) {
      if (!productToCollectionHandle.has(productHandle)) {
        productToCollectionHandle.set(productHandle, handle);
      }
    }
  }

  for (const sp of products) {
    console.log(`  product: ${sp.title}`);

    const images: string[] = [];
    for (const img of sp.images) {
      const uploaded = await uploadImage(img.src, "products");
      if (uploaded) images.push(uploaded);
    }

    const hasRealVariants =
      sp.variants.length > 1 || sp.variants[0]?.title !== "Default Title";
    const basePrice = Math.min(...sp.variants.map((v) => Number(v.price)));
    const compareAt = sp.variants[0]?.compare_at_price
      ? Number(sp.variants[0].compare_at_price)
      : null;

    const collectionHandle = productToCollectionHandle.get(sp.handle);
    const collectionId = collectionHandle
      ? handleToCollectionId.get(collectionHandle)
      : null;

    const { data: product, error } = await supabase
      .from("products")
      .upsert(
        {
          title: sp.title,
          slug: sp.handle,
          description: stripHtml(sp.body_html) || null,
          product_type: sp.product_type || null,
          tags: sp.tags,
          images,
          price: basePrice,
          compare_at_price: compareAt && compareAt > basePrice ? compareAt : null,
          // Shopify's public JSON only exposes an `available` boolean, not a
          // real inventory count — default to 20 units for in-stock items
          // and adjust real counts later from the admin panel.
          stock: sp.variants.some((v) => v.available) ? 20 : 0,
          collection_id: collectionId ?? null,
          is_active: true,
          is_featured: false,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (error || !product) {
      console.error(`  ! failed to upsert product ${sp.title}:`, error?.message);
      continue;
    }

    if (hasRealVariants) {
      await supabase.from("product_variants").delete().eq("product_id", product.id);

      const variantRows = sp.variants.map((v, index) => ({
        product_id: product.id,
        name: v.title,
        price_override: Number(v.price) !== basePrice ? Number(v.price) : null,
        stock: v.available ? 20 : 0,
        is_available: v.available,
        sort_order: index,
      }));

      const { error: variantError } = await supabase
        .from("product_variants")
        .insert(variantRows);

      if (variantError) {
        console.error(`  ! failed to insert variants for ${sp.title}:`, variantError.message);
      }
    }
  }
}

async function main() {
  const handleToCollectionId = await seedCollections();
  await seedProducts(handleToCollectionId);

  // Feature the first 8 products so the homepage isn't empty.
  const { data: firstProducts } = await supabase
    .from("products")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(8);

  if (firstProducts?.length) {
    await supabase
      .from("products")
      .update({ is_featured: true })
      .in("id", firstProducts.map((p) => p.id));
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
