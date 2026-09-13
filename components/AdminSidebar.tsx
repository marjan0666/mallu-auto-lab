"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/discounts", label: "Discount codes" },
  { href: "/admin/content", label: "Homepage content" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-48 flex-shrink-0 space-y-1">
      {links.map((link) => {
        const active =
          link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "block rounded-md px-3 py-2 text-sm font-medium",
              active ? "bg-brand-600 text-white" : "text-zinc-700 hover:bg-zinc-100"
            )}
          >
            {link.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="mt-4 block rounded-md px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100"
      >
        ← Back to store
      </Link>
    </nav>
  );
}
