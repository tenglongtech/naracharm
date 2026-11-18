import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { listAccountOrders } from '@/lib/account-orders';
import { storefrontHeaders, storefrontPreflight, unsupportedOrigin } from '@/lib/checkout-origin';

export const OPTIONS = storefrontPreflight;

export async function GET(request: Request) {
  const headers = storefrontHeaders(request);
  headers.set('Cache-Control', 'private, no-store');
  if (unsupportedOrigin(request, headers)) return NextResponse.json({ error: 'Origin is not allowed.' }, { headers, status: 403 });
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return NextResponse.json({ error: 'Sign in to view your orders.' }, { headers, status: 401 });

    const pageParam = new URL(request.url).searchParams.get('page') ?? '1';
    const page = Number(pageParam);
    if (!/^[0-9]+$/.test(pageParam) || !Number.isSafeInteger(page) || page < 1 || page > 1000) {
      return NextResponse.json({ error: 'Invalid orders page.' }, { headers, status: 400 });
    }
    return NextResponse.json(await listAccountOrders(session.user.id, page), { headers });
  } catch (error) {
    console.error('Account orders unavailable', error instanceof Error ? error.name : 'Unknown error');
    return NextResponse.json({ error: 'Could not load your orders. Please try again.' }, { headers, status: 503 });
  }
}
