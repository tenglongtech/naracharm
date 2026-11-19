import assert from 'node:assert/strict';
import { test } from 'node:test';
import { shippingPolicySchema, returnsPolicySchema } from '../src/lib/store-policy-schema';
import { standardShippingCents } from '../src/lib/cart-types';
import { getActiveProducts } from '../src/lib/storefront';
import { productSchema } from '../src/lib/seo';

const supported = ['AT', 'AU', 'BE', 'CA', 'CH', 'DE', 'DK', 'ES', 'FI', 'FR', 'GB', 'IE', 'IT', 'NL', 'NO', 'PL', 'PT', 'SE', 'US'];

test('shipping markup publishes the real destinations and the payable threshold boundaries', () => {
  const node = shippingPolicySchema();
  assert.equal(node['@id'], 'https://naracharm.com/#organization');
  const [standard, free] = node.hasShippingService.shippingConditions;
  for (const tier of [standard, free]) {
    assert.deepEqual(tier.shippingDestination.map((destination) => destination.addressCountry).sort(), supported);
    assert.equal(tier.shippingRate.currency, 'USD');
  }
  assert.equal(standard.orderValue.maxValue, 119.99);
  assert.equal(standard.shippingRate.value, standardShippingCents(11999) / 100);
  assert.equal(free.orderValue.minValue, 120);
  assert.equal(free.shippingRate.value, standardShippingCents(12000) / 100);
});

test('return markup points to the full policy for product and eligibility exceptions', () => {
  const node = returnsPolicySchema();
  assert.equal(node['@id'], 'https://naracharm.com/#organization');
  assert.deepEqual(node.hasMerchantReturnPolicy, {
    '@type': 'MerchantReturnPolicy',
    '@id': 'https://naracharm.com/returns#eligible-returns',
    merchantReturnLink: 'https://naracharm.com/returns',
  });
});

test('product offers link to the same policy definitions and selling organization', async () => {
  const product = (await getActiveProducts()).find(({ category, stock }) => category === 'earrings' && stock > 0);
  assert.ok(product);
  const markup = productSchema(product);
  const offers = markup['@type'] === 'Product' ? markup.offers : markup.hasVariant[0].offers;
  const shipping = shippingPolicySchema();
  const returns = returnsPolicySchema();
  assert.deepEqual(offers.seller, { '@id': 'https://naracharm.com/#organization' });
  assert.deepEqual(offers.shippingDetails, {
    '@type': 'OfferShippingDetails',
    hasShippingService: { '@id': shipping.hasShippingService['@id'] },
  });
  assert.deepEqual(offers.hasMerchantReturnPolicy, { '@id': returns.hasMerchantReturnPolicy['@id'] });
});
