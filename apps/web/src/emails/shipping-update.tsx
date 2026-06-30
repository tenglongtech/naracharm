import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Button } from '@react-email/components';

/**
 * 发货通知邮件
 */
export function ShippingUpdateEmail({
  orderNumber,
  customerName,
  carrier,
  trackingNumber,
  trackingUrl,
}: {
  orderNumber: string;
  customerName?: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Your order {orderNumber} is on the way 📦</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>🪷 Nara Charm</Heading>
          <Text style={text}>Hi {customerName || 'there'},</Text>
          <Text style={text}>
            Good news — your order <strong>{orderNumber}</strong> is on its way.
            Each piece was made by hand, and now it's traveling to find you.
          </Text>

          <Section style={{ marginTop: 24, marginBottom: 24, backgroundColor: '#f3ede2', padding: 20, borderRadius: 6 }}>
            <Text style={{ ...text, margin: 0 }}>Carrier: <strong>{carrier}</strong></Text>
            <Text style={{ ...text, margin: '8px 0 0' }}>
              Tracking number:{' '}
              <code style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: 3, fontSize: 13 }}>
                {trackingNumber}
              </code>
            </Text>
            {trackingUrl && (
              <div style={{ marginTop: 16 }}>
                <Button style={button} href={trackingUrl}>
                  Track My Order →
                </Button>
              </div>
            )}
          </Section>

          <Text style={{ ...text, fontSize: 13, color: '#6b6358' }}>
            Estimated delivery: 7–15 business days from today.
            Thank you for carrying our story with you.
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
const button: React.CSSProperties = { backgroundColor: '#c4745a', color: '#fff', padding: '10px 20px', borderRadius: 4, textDecoration: 'none', fontWeight: 500 };
