import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type { Order, OrderItem } from "@/lib/types";
import { formatPrice } from "@/lib/format";

interface Props {
  order: Order;
  items: OrderItem[];
}

export function AdminOrderNotificationEmail({ order, items }: Props) {
  const orderNumber = order.id.slice(0, 8).toUpperCase();

  return (
    <Html>
      <Head />
      <Preview>New order #{orderNumber} — {formatPrice(order.total, order.currency)}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f4f4f5" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            padding: "32px",
            borderRadius: "8px",
            maxWidth: "480px",
          }}
        >
          <Heading style={{ fontSize: "20px" }}>
            New order #{orderNumber}
          </Heading>
          <Text>
            {order.contact_email} · {order.contact_phone ?? "no phone"}
          </Text>

          <Section style={{ marginTop: "16px" }}>
            {items.map((item) => (
              <Row key={item.id} style={{ marginBottom: "8px" }}>
                <Column>
                  <Text style={{ margin: 0 }}>
                    {item.title}
                    {item.variant_name ? ` — ${item.variant_name}` : ""} ×{" "}
                    {item.quantity}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={{ margin: 0 }}>
                    {formatPrice(item.unit_price * item.quantity, order.currency)}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          {order.discount_amount > 0 && (
            <Row>
              <Column>
                <Text style={{ margin: 0, color: "#16a34a" }}>
                  Discount {order.discount_code ? `(${order.discount_code})` : ""}
                </Text>
              </Column>
              <Column align="right">
                <Text style={{ margin: 0, color: "#16a34a" }}>
                  −{formatPrice(order.discount_amount, order.currency)}
                </Text>
              </Column>
            </Row>
          )}

          <Row style={{ borderTop: "1px solid #e4e4e7", paddingTop: "12px" }}>
            <Column>
              <Text style={{ fontWeight: 700 }}>Total</Text>
            </Column>
            <Column align="right">
              <Text style={{ fontWeight: 700 }}>
                {formatPrice(order.total, order.currency)}
              </Text>
            </Column>
          </Row>

          <Section style={{ marginTop: "24px" }}>
            <Text style={{ fontWeight: 700, marginBottom: 4 }}>
              Ship to
            </Text>
            <Text style={{ margin: 0 }}>
              {order.shipping_address.full_name}
              <br />
              {order.shipping_address.line1}
              {order.shipping_address.line2
                ? `, ${order.shipping_address.line2}`
                : ""}
              <br />
              {order.shipping_address.city}, {order.shipping_address.state}{" "}
              {order.shipping_address.postal_code}
              <br />
              {order.shipping_address.country}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default AdminOrderNotificationEmail;
