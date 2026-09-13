import Image from "next/image";
import Link from "next/link";
import type { HeroContent } from "@/lib/types";

export function Hero({ hero }: { hero: HeroContent }) {
  return (
    <section className="relative overflow-hidden bg-zinc-900">
      {hero.image_url && (
        <Image
          src={hero.image_url}
          alt=""
          fill
          priority
          className="object-cover opacity-50"
        />
      )}
      <div className="container-page relative py-24 text-center sm:py-32">
        <h1 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          {hero.heading}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-zinc-200">
          {hero.subheading}
        </p>
        <Link href={hero.cta_href} className="btn-primary mt-8">
          {hero.cta_label}
        </Link>
      </div>
    </section>
  );
}
