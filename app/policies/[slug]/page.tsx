import { notFound } from "next/navigation";

const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "Mallu Auto Lab";

const policies: Record<string, { title: string; body: string }> = {
  "privacy-policy": {
    title: "Privacy Policy",
    body: `${storeName} collects only the information needed to process your order — name, address, phone, email — and never sells it to third parties. Payment details are handled entirely by Razorpay and are never stored on our servers.`,
  },
  "refund-policy": {
    title: "Refund Policy",
    body: `If an item arrives damaged or incorrect, contact us within 48 hours of delivery with photos and we'll arrange a replacement or refund. Custom/personalised items (e.g. name-and-number keychains) cannot be returned unless defective.`,
  },
  "terms-of-service": {
    title: "Terms of Service",
    body: `By placing an order with ${storeName} you agree to provide accurate shipping information and to pay the listed price at checkout. Product images are representative; minor variations in colour or finish may occur.`,
  },
  "shipping-policy": {
    title: "Shipping Policy",
    body: `Orders are dispatched within 2-4 business days and typically arrive within 5-10 business days depending on your location within India.`,
  },
  "contact-us": {
    title: "Contact Us",
    body: `Questions about an order or a bulk/custom request? Use the WhatsApp button on this site, or email us and we'll get back to you within one business day.`,
  },
};

export default function PolicyPage({ params }: { params: { slug: string } }) {
  const policy = policies[params.slug];
  if (!policy) notFound();

  return (
    <div className="container-page max-w-2xl py-16">
      <h1 className="text-2xl font-bold text-zinc-900">{policy.title}</h1>
      <p className="mt-4 whitespace-pre-line text-zinc-600">{policy.body}</p>
    </div>
  );
}
