import Link from "next/link";

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  return (
    <div className="container-page py-20 text-center">
      <p className="text-3xl">🎉</p>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">Order confirmed!</h1>
      <p className="mt-2 text-zinc-600">
        {searchParams.order && (
          <>Order #{searchParams.order.slice(0, 8).toUpperCase()} — </>
        )}
        A confirmation email is on its way to you.
      </p>
      <Link href="/shop" className="btn-primary mt-8 inline-flex">
        Continue shopping
      </Link>
    </div>
  );
}
