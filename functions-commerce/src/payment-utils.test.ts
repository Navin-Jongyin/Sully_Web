import assert from 'node:assert/strict';
import test from 'node:test';
import {
  checkoutEventStatus,
  isConfiguredStripeProduct,
  isConfiguredStripePrice,
  normalizeOrigin,
  paymentIntentId,
  purchaseDocumentId,
} from './payment-utils.js';

test('rejects placeholder and malformed Stripe price IDs', () => {
  assert.equal(isConfiguredStripePrice('STRIPE_PRICE_ID_PLACEHOLDER'), false);
  assert.equal(isConfiguredStripePrice('prod_example'), false);
  assert.equal(isConfiguredStripePrice('price_example'), true);
  assert.equal(isConfiguredStripeProduct('STRIPE_PRODUCT_ID_PLACEHOLDER'), false);
  assert.equal(isConfiguredStripeProduct('prod_example'), true);
});

test('creates a stable purchase identity and rejects path injection', () => {
  assert.equal(purchaseDocumentId('user-1', 'course-1'), 'user-1_course-1');
  assert.throws(() => purchaseDocumentId('user/1', 'course-1'));
});

test('normalizes payment intent and application origins', () => {
  assert.equal(paymentIntentId('pi_123'), 'pi_123');
  assert.equal(paymentIntentId({ id: 'pi_456' }), 'pi_456');
  assert.equal(paymentIntentId(null), null);
  assert.equal(normalizeOrigin('https://academy.example/path'), 'https://academy.example');
});

test('maps Checkout webhook transitions without trusting an unpaid completion', () => {
  assert.equal(checkoutEventStatus('checkout.session.completed', 'paid'), 'paid');
  assert.equal(checkoutEventStatus('checkout.session.completed', 'unpaid'), null);
  assert.equal(checkoutEventStatus('checkout.session.async_payment_succeeded', 'paid'), 'paid');
  assert.equal(checkoutEventStatus('checkout.session.async_payment_failed', 'unpaid'), 'failed');
  assert.equal(checkoutEventStatus('checkout.session.expired', 'unpaid'), 'cancelled');
});
