import { NextResponse } from 'next/server';
import { storefrontHeaders, storefrontPreflight, unsupportedOrigin } from '@/lib/checkout-origin';
import { orderIdForTrackingToken } from '@/lib/order-tracking-token';
import { getTrackedOrder } from '@/lib/tracked-order';

export const OPTIONS = storefrontPreflight;

export async function POST(request: Request) {
  const headers = storefrontHeaders(request);
  headers.set('Cache-Control', 'private, no-store');
  if (unsupportedOrigin(request, headers)) return NextResponse.json({ error: 'Origin is not allowed.' }, { headers, status: 403 });
  const input = await request.json().catch(() => null);
  const id = typeof input?.token === 'string' ? orderIdForTrackingToken(input.token) : undefined;
  const unavailable = () => NextResponse.json({ error: 'This order link is invalid or has expired.' }, { headers, status: 404 });
  if (!id) return unavailable();

  try {
    const order = await getTrackedOrder(id);
    return order ? NextResponse.json(order, { headers }) : unavailable();
  } catch (error) {
    console.error('Order tracking unavailable', error instanceof Error ? error.name : 'Unknown error');
    return NextResponse.json({ error: 'Order tracking is temporarily unavailable.' }, { headers, status: 503 });
  }
}
