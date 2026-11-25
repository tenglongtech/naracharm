export const STANDARD_SHIPPING_CENTS = 690;
export const FREE_SHIPPING_THRESHOLD_CENTS = 12000;
export const RETURN_WINDOW_DAYS = 30;
export const DAMAGE_REPORT_DAYS = 7;
export const REFUND_PROCESSING_DAYS = 5;

export const shippingPreparationDays = { min: 1, max: 3 };
export const shippingTransitDays = { min: 7, max: 15 };
export const standardShippingLabel = '$' + (STANDARD_SHIPPING_CENTS / 100).toFixed(2);
export const freeShippingFromLabel = '$' + FREE_SHIPPING_THRESHOLD_CENTS / 100;

export const shippingRegions = [
  {
    name: 'North America',
    countries: [
      { code: 'CA', name: 'Canada' },
      { code: 'US', name: 'United States' },
    ],
  },
  {
    name: 'Europe',
    countries: [
      { code: 'AT', name: 'Austria' },
      { code: 'BE', name: 'Belgium' },
      { code: 'DK', name: 'Denmark' },
      { code: 'FI', name: 'Finland' },
      { code: 'FR', name: 'France' },
      { code: 'DE', name: 'Germany' },
      { code: 'IE', name: 'Ireland' },
      { code: 'IT', name: 'Italy' },
      { code: 'NL', name: 'Netherlands' },
      { code: 'NO', name: 'Norway' },
      { code: 'PL', name: 'Poland' },
      { code: 'PT', name: 'Portugal' },
      { code: 'ES', name: 'Spain' },
      { code: 'SE', name: 'Sweden' },
      { code: 'CH', name: 'Switzerland' },
      { code: 'GB', name: 'United Kingdom' },
    ],
  },
  {
    name: 'Oceania',
    countries: [{ code: 'AU', name: 'Australia' }],
  },
] as const;

export const shippingCountryCodes = shippingRegions.flatMap((region) => region.countries.map((country) => country.code));

export const shippingDestinationsLabel = `Shipping to ${shippingCountryCodes.length} destinations`;

export function standardShippingCents(subtotalCents: number, freeShipping = false) {
  return subtotalCents === 0 || freeShipping || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
    ? 0
    : STANDARD_SHIPPING_CENTS;
}
