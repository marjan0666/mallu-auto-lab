const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export function WhatsAppButton() {
  if (!number) return null;

  return (
    <a
      href={`https://wa.me/${number}?text=${encodeURIComponent(
        "Hi! I'd like to place a bulk order."
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl text-white shadow-lg transition hover:bg-green-600"
      aria-label="Chat on WhatsApp for bulk orders"
    >
      <span aria-hidden>💬</span>
    </a>
  );
}
