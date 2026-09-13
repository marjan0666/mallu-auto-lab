import Link from "next/link";

const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "Mallu Auto Lab";

const policyLinks = [
  { label: "Privacy Policy", href: "/policies/privacy-policy" },
  { label: "Refund Policy", href: "/policies/refund-policy" },
  { label: "Terms of Service", href: "/policies/terms-of-service" },
  { label: "Shipping Policy", href: "/policies/shipping-policy" },
  { label: "Contact Us", href: "/policies/contact-us" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-zinc-50">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <p className="text-base font-bold">{storeName}</p>
          <p className="mt-2 max-w-xs text-sm text-zinc-600">
            Hot Wheels display stands, jersey display frames, dashboard
            buddies and custom keychains for car and football fans.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-zinc-900">Shop</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            <li>
              <Link href="/shop" className="hover:text-brand-600">
                All products
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-brand-600">
                About us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-zinc-900">Policies</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            {policyLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-brand-600">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} {storeName}. All rights reserved.
      </div>
    </footer>
  );
}
