type Progress = { status: string; paymentStatus: string; fulfillmentStatus: string };

export function orderProgress(order: Progress) {
  if (order.status === 'cancelled') return 'Cancelled';
  if (order.status === 'refunded' || order.paymentStatus === 'refunded') return 'Refunded';
  if (order.paymentStatus === 'partially_refunded') return 'Partially refunded';
  if (order.paymentStatus === 'unpaid') return 'Awaiting payment';
  if (order.fulfillmentStatus === 'fulfilled') return 'Shipped';
  if (order.fulfillmentStatus === 'partial') return 'Partially shipped';
  return 'Paid';
}

export function trackingLink(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
