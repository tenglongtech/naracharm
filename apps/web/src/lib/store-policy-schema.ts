import { absoluteUrl, merchantReturnPolicyId, shippingServiceId, storeOrganization } from './seo';
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  STANDARD_SHIPPING_CENTS,
  shippingCountryCodes,
  shippingPreparationDays,
  shippingTransitDays,
} from './store-policies';

function servicePeriod({ min, max }: { min: number; max: number }) {
  return {
    '@type': 'ServicePeriod',
    duration: { '@type': 'QuantitativeValue', minValue: min, maxValue: max, unitCode: 'DAY' },
  };
}

export function shippingPolicySchema() {
  const conditions = {
    '@type': 'ShippingConditions',
    shippingDestination: shippingCountryCodes.map((addressCountry) => ({ '@type': 'DefinedRegion', addressCountry })),
    transitTime: servicePeriod(shippingTransitDays),
  };
  return {
    ...storeOrganization,
    hasShippingService: {
      '@type': 'ShippingService',
      '@id': shippingServiceId,
      name: 'Standard shipping',
      fulfillmentType: 'https://schema.org/FulfillmentTypeDelivery',
      handlingTime: servicePeriod(shippingPreparationDays),
      shippingConditions: [
        {
          ...conditions,
          orderValue: { '@type': 'MonetaryAmount', minValue: 0.01, maxValue: (FREE_SHIPPING_THRESHOLD_CENTS - 1) / 100, currency: 'USD' },
          shippingRate: { '@type': 'MonetaryAmount', value: STANDARD_SHIPPING_CENTS / 100, currency: 'USD' },
        },
        {
          ...conditions,
          orderValue: { '@type': 'MonetaryAmount', minValue: FREE_SHIPPING_THRESHOLD_CENTS / 100, currency: 'USD' },
          shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
        },
      ],
    },
  };
}

export function returnsPolicySchema() {
  return {
    ...storeOrganization,
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      '@id': merchantReturnPolicyId,
      merchantReturnLink: absoluteUrl('/returns'),
    },
  };
}
