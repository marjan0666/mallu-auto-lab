import { Resend } from "resend";
import { OrderConfirmationEmail } from "@/emails/order-confirmation";
import { AdminOrderNotificationEmail } from "@/emails/admin-notification";
import type { Order, OrderItem } from "@/lib/types";

let client: Resend | null = null;

function getResendClient() {
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

export async function sendOrderConfirmationEmail(
  order: Order,
  items: OrderItem[]
) {
  const resend = getResendClient();

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: order.contact_email,
    subject: `Order confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
    react: OrderConfirmationEmail({ order, items }),
  });
}

export async function sendAdminOrderNotificationEmail(
  order: Order,
  items: OrderItem[]
) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return;

  const resend = getResendClient();

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: adminEmail,
    subject: `New order — #${order.id.slice(0, 8).toUpperCase()} (${order.total} ${order.currency})`,
    react: AdminOrderNotificationEmail({ order, items }),
  });
}
