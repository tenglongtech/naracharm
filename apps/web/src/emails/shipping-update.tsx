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
  orderStatusUrl,
}: {
  orderNumber: string;
  customerName?: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
  orderStatusUrl?: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Shipping update for order {orderNumber}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>Nara Charm</Heading>
          <Text style={text}>Hi {customerName || 'there'},</Text>
          <Text style={text}>
            A package for order <strong>{orderNumber}</strong> is on its way.
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

          {orderStatusUrl && <Button href={orderStatusUrl} style={button}>View all shipments</Button>}
          <Text style={{ ...text, fontSize: 13, color: '#6b6358' }}>Check the carrier’s tracking information for the latest delivery estimate.</Text>

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
