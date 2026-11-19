type ProductInquiryRequest = { type: 'photo' } | { type: 'measurements'; measurements: string };

export function inquiryPath(piece?: string, sku?: string, variantName?: string, request?: ProductInquiryRequest) {
  const params = new URLSearchParams({ topic: 'product' });
  if (piece) params.set('piece', piece);
  if (sku) {
    const variant = variantName && !/^(default|standard)$/i.test(variantName) ? `${variantName}, SKU ${sku}` : `SKU ${sku}`;
    const message = request?.type === 'photo'
      ? `Could you share a photo of the actual piece for ${variant}?`
      : request?.type === 'measurements'
        ? `Could you confirm ${request.measurements} for ${variant}?`
        : `I'd like to ask about availability for ${variant}.`;
    params.set('message', message);
  }
  return `/contact?${params}`;
}
