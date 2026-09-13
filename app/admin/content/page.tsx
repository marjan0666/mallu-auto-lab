import { createClient } from "@/lib/supabase/server";
import { AdminSingleImageUploader } from "@/components/AdminSingleImageUploader";
import { saveHero, saveFeaturedCollections } from "./actions";
import type { Collection, HeroContent } from "@/lib/types";

export default async function AdminContentPage() {
  const supabase = createClient();

  const [{ data: heroRow }, { data: featuredRow }, { data: collections }] =
    await Promise.all([
      supabase.from("site_content").select("value").eq("key", "hero").single(),
      supabase
        .from("site_content")
        .select("value")
        .eq("key", "featured_collection_slugs")
        .single(),
      supabase.from("collections").select("*").order("sort_order"),
    ]);

  const hero = heroRow?.value as HeroContent | undefined;
  const featuredSlugs = (featuredRow?.value as string[] | undefined) ?? [];

  return (
    <div className="max-w-xl space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Homepage content</h1>

        <form action={saveHero} className="mt-6 space-y-5">
          <div>
            <label className="label">Hero heading</label>
            <input name="heading" defaultValue={hero?.heading} className="input" />
          </div>
          <div>
            <label className="label">Hero subheading</label>
            <textarea
              name="subheading"
              rows={2}
              defaultValue={hero?.subheading}
              className="input"
            />
          </div>
          <div>
            <label className="label">Hero background image</label>
            <AdminSingleImageUploader name="image_url" initialImage={hero?.image_url ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Button label</label>
              <input name="cta_label" defaultValue={hero?.cta_label} className="input" />
            </div>
            <div>
              <label className="label">Button link</label>
              <input name="cta_href" defaultValue={hero?.cta_href} className="input" />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            Save hero
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Featured collections</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Available slugs: {(collections as Collection[] | null)?.map((c) => c.slug).join(", ")}
        </p>
        <form action={saveFeaturedCollections} className="mt-4 space-y-4">
          <input
            name="slugs"
            defaultValue={featuredSlugs.join(", ")}
            placeholder="hot-wheels, popular"
            className="input"
          />
          <button type="submit" className="btn-primary">
            Save featured collections
          </button>
        </form>
      </div>
    </div>
  );
}
