const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "Mallu Auto Lab";

export default function AboutPage() {
  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="text-2xl font-bold text-zinc-900">About {storeName}</h1>
      <p className="mt-4 text-zinc-600">
        {storeName} is a home for car and football enthusiasts — Hot Wheels
        display stands, jersey display frames, dashboard buddies and custom
        keychains, made for collectors and fans who like to show off their
        favourite teams and rides.
      </p>
      <p className="mt-4 text-zinc-600">
        Need a bulk order for a team or event? Reach out to us on WhatsApp
        using the chat button in the corner of the screen.
      </p>
    </div>
  );
}
