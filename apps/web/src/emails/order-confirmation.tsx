import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components';

/**
 * 订单确认邮件
 *
 * 用法:
 *   await sendEmail({ to, subject: 'Your Nara Charm Order', react: <OrderConfirmationEmail ... /> })
 */
export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  totalCents,
  currency = 'usd',
}: {
  orderNumber: string;
  customerName?: string;
  items: { name: string; quantity: number; priceCents: number }[];
  totalCents: number;
  currency?: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Thank you for your order — {orderNumber}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>🪷 Nara Charm</Heading>
          <Text style={text}>Hi {customerName || 'there'},</Text>
          <Text style={text}>
            Thank you for your order. Every piece carries a story, and we're handcrafting yours now.
            We'll email you again with tracking once it ships.
          </Text>

          <Section style={{ marginTop: 24 }}>
            <Text style={{ ...text, fontWeight: 600 }}>Order {orderNumber}</Text>
            <Hr />
            {items.map((it, i) => (
              <div key={i} style={{ ...row, display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  {it.quantity}× {it.name}
                </span>
                <span style={tabular}>
                  ${(it.priceCents / 100).toFixed(2)}
                </span>
              </div>
            ))}
            <Hr />
            <div style={{ ...row, display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
              <span>Total</span>
              <span style={tabular}>${(totalCents / 100).toFixed(2)} {currency.toUpperCase()}</span>
            </div>
          </Section>

          <Text style={{ ...text, marginTop: 24, fontSize: 13, color: '#6b6358' }}>
            Processing: 1–3 business days · Shipping: 7–15 business days worldwide.
            Questions? Reply to this email.
          </Text>

          <Hr />
          <Text style={{ ...text, fontSize: 12, color: '#6b6358' }}>
            Nara Charm · Jewelry with Spirit · Stories in Every Piece
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = { backgroundColor: '#faf7f1', margin: 0, padding: 24, fontFamily: 'Inter, system-ui, sans-serif' };
const container: React.CSSProperties = { backgroundColor: '#ffffff', borderRadius: 8, padding: 32, maxWidth: 560 };
const h1: React.CSSProperties = { color: '#c4745a', fontSize: 28, margin: '0 0 16px' };
const text: React.CSSProperties = { color: '#3a2e2b', fontSize: 15, lineHeight: 1.6 };
const row: React.CSSProperties = { padding: '8px 0', color: '#3a2e2b', fontSize: 14 };
const tabular: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };
