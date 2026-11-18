export function stripePublishableKey(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const key = value.trim();
  return /^pk_(?:test|live)_[A-Za-z0-9]+$/.test(key) && !/^pk_(?:test|live)_(?:placeholder|xxx)$/i.test(key) ? key : undefined;
}
