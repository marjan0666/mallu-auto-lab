"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { createClient } from "@/lib/supabase/client";

const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "Mallu Auto Lab";

export function Header() {
  const count = useCartStore((s) => s.count());
  const [hydrated, setHydrated] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsSignedIn(!!data.user));
  }, []);

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {storeName}
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-700 md:flex">
          <Link href="/" className="hover:text-brand-600">
            Home
          </Link>
          <Link href="/shop" className="hover:text-brand-600">
            Shop
          </Link>
          <Link href="/about" className="hover:text-brand-600">
            About
          </Link>
        </nav>

        <form action="/shop" method="get" className="hidden max-w-[200px] flex-1 md:block">
          <input
            type="search"
            name="q"
            placeholder="Search products…"
            className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </form>

        <div className="flex items-center gap-4">
          <Link
            href={isSignedIn ? "/account" : "/login"}
            className="text-sm font-medium text-zinc-700 hover:text-brand-600"
          >
            {isSignedIn ? "Account" : "Sign in"}
          </Link>
          <Link href="/cart" className="relative text-sm font-medium">
            <span aria-hidden>🛒</span>
            {hydrated && count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      <nav className="flex items-center gap-6 border-t border-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 md:hidden">
        <Link href="/">Home</Link>
        <Link href="/shop">Shop</Link>
        <Link href="/about">About</Link>
      </nav>

      <form action="/shop" method="get" className="border-t border-zinc-100 px-4 py-2 md:hidden">
        <input
          type="search"
          name="q"
          placeholder="Search products…"
          className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </form>
    </header>
  );
}
