import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { groupEquivalentRates, normalizeOffer, signQuote, validateStay, verifyQuote } from '../worker/index.js';

const secret = 'test-secret-that-is-longer-than-thirty-two-characters';

function rate(overrides = {}) {
  return {
    ratePlanId: 7,
    ratePlansAccomodationUnitTypeId: 255949,
    ratePlanName: 'Standard rate',
    totalPrice: 6650,
    currencyId: 1,
    dayPrices: Array.from({ length: 7 }, () => 950),
    cancellationPolicies: [{ effectiveFrom: '2027-06-04', amount: 950, currencyCode: 'EUR' }],
    prepaymentPolicies: [{ dueDate: '2026-09-17', amount: 950, currencyCode: 'EUR' }],
    specialOfferServices: [],
    ...overrides,
  };
}

function availability() {
  return {
    result: [
      { accommodationUnitTypeId: 8482, numberOfAvailableUnits: 1, rates: [rate({ ratePlansAccomodationUnitTypeId: 255955 })] },
      { accommodationUnitTypeId: 8481, numberOfAvailableUnits: 1, rates: [rate(), rate({ ratePlanId: 9, ratePlansAccomodationUnitTypeId: 300001, ratePlanName: 'Spring special', totalPrice: 6100, specialOfferId: 42 })] },
    ],
  };
}

class FakeD1 {
  constructor() { this.sessions = new Map(); this.requests = new Map(); }
  prepare(sql) {
    const db = this;
    return {
      args: [],
      bind(...args) { this.args = args; return this; },
      async run() {
        if (sql.includes('INSERT INTO checkout_sessions')) {
          const [id, quotePayload, language, tracking, createdAt, expiresAt] = this.args;
          db.sessions.set(id, { id, quote_payload_json: quotePayload, language, status: 'open', tracking_json: tracking, created_at: createdAt, expires_at: expiresAt, submitted_at: null });
        }
        if (sql.includes('INSERT INTO booking_requests')) {
          const [id, checkoutId, idempotencyKey, guestJson, stayJson, offerJson, paymentMethod, termsVersion, privacyVersion, marketingAccepted, consentedAt, createdAt] = this.args;
          db.requests.set(id, { id, checkout_id: checkoutId, idempotency_key: idempotencyKey, guest_json: guestJson, stay_json: stayJson, offer_json: offerJson, payment_method: paymentMethod, terms_version: termsVersion, privacy_version: privacyVersion, marketing_accepted: marketingAccepted, consented_at: consentedAt, email_status: 'pending', created_at: createdAt });
        }
        if (sql.includes("UPDATE checkout_sessions SET status = 'submitted'")) {
          const [submittedAt, id] = this.args; const row = db.sessions.get(id); if (row) Object.assign(row, { status: 'submitted', submitted_at: submittedAt });
        }
        if (sql.includes('UPDATE booking_requests SET email_status')) {
          const [emailStatus, emailUpdatedAt, id] = this.args; const row = db.requests.get(id); if (row) Object.assign(row, { email_status: emailStatus, email_updated_at: emailUpdatedAt });
        }
        return { success: true };
      },
      async first() {
        if (sql.includes('FROM checkout_sessions')) return db.sessions.get(this.args[0]) || null;
        if (sql.includes('FROM booking_requests')) return [...db.requests.values()].find((row) => row.idempotency_key === this.args[0]) || null;
        return null;
      },
    };
  }
  async batch(statements) { return Promise.all(statements.map((statement) => statement.run())); }
}

test('validates dates and the 1–8 guest boundary', () => {
  assert.deepEqual(validateStay({ arrivalDate: '2027-07-04', departureDate: '2027-07-11', guests: 2, culture: 'hr' }), {
    arrivalDate: '2027-07-04', departureDate: '2027-07-11', guests: 2, numberOfAdults: 2, children0To11: 0,
    children12To17: 0, numberOfChildren: 0, culture: 'hr', nights: 7,
  });
  assert.equal(validateStay({ arrivalDate: '2027-07-04', departureDate: '2027-07-11', numberOfAdults: 2, children0To11: 2, children12To17: 1 })?.guests, 5);
  assert.equal(validateStay({ arrivalDate: '2027-07-04', departureDate: '2027-07-11', numberOfAdults: 2, children0To11: 1, children12To17: 1 })?.numberOfChildren, 2);
  assert.equal(validateStay({ arrivalDate: '2027-07-11', departureDate: '2027-07-04', guests: 2 }), null);
  assert.equal(validateStay({ arrivalDate: '2027-07-04', departureDate: '2027-07-11', guests: 9 }), null);
});

test('calendar uses property inventory rather than booking-engine publication', async () => {
  const calls = [];
  const fetchMock = async (url) => {
    calls.push(url);
    return Response.json({
      result: [
        { date: '2027-04-29T00:00:00', quantity: 2, price: 297.5 },
        { date: '2027-04-30T00:00:00', quantity: 1, price: 297.5 },
      ],
    });
  };
  const env = { NOKUMO_API_KEY: 'server-only-secret', QUOTE_SIGNING_SECRET: secret, ASSETS: { fetch: () => new Response('asset') } };
  const request = new Request('https://pastura.test/api/v1/availability/calendar?from=2027-04-28&to=2027-05-01');
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fetchMock;
  try {
    const response = await worker.fetch(request, env);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.match(calls[0], /IsForBookingEngine=false/);
    assert.deepEqual(body.days.map(({ date, available, remaining }) => ({ date, available, remaining })), [
      { date: '2027-04-28', available: false, remaining: 0 },
      { date: '2027-04-29', available: true, remaining: 2 },
      { date: '2027-04-30', available: true, remaining: 1 },
      { date: '2027-05-01', available: false, remaining: 0 },
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('deduplicates equivalent villas, keeps distinct offers and prefers lower unit ID', () => {
  const groups = groupEquivalentRates(availability());
  assert.equal(groups.length, 2);
  assert.deepEqual(groups[0].candidates.map((item) => item.accommodationUnitTypeId), [8481, 8482]);
  assert.equal(groups[1].rate.ratePlanName, 'Spring special');
});

test('quote tokens are signed, expire and cannot be tampered with', async () => {
  const payload = {
    v: 2,
    exp: Math.floor(Date.now() / 1000) + 60,
    stay: { arrivalDate: '2027-07-04', departureDate: '2027-07-11', guests: 2, culture: 'en', nights: 7 },
    candidates: [{ accommodationUnitTypeId: 8481, ratePlanId: 7, ratePlanAccommodationUnitTypeId: 255949, specialOfferId: null }],
  };
  const token = await signQuote(payload, secret);
  assert.equal((await verifyQuote(token, secret)).stay.nights, 7);
  assert.equal(await verifyQuote(`${token.slice(0, -1)}x`, secret), null);
});

test('search returns separate live offers and never exposes server credentials', async () => {
  const calls = [];
  const fetchMock = async (url, init = {}) => {
    calls.push({ url, init });
    if (url.includes('/Reservations/FindAvailability')) return Response.json(availability());
    if (url.endsWith('/Reservations/ShoppingCart')) {
      const body = JSON.parse(init.body);
      const special = body.units[0].ratePlanAccomodationUnitTypeId === 300001;
      return Response.json({
        currencyCode: 'EUR', totalPrice: special ? 6272.4 : 6822.4,
        units: [{
          ratePlanId: special ? 9 : 7, ratePlanName: special ? 'Spring special' : 'Standard rate',
          accomodationPrice: special ? 6100 : 6650, servicesPrice: 172.4, damageDeposit: 1000,
          services: [
            { id: 1, name: 'Final cleaning', quantity: 1, totalPrice: 150, currencyCode: 'EUR', isAddedAutomatically: true, guestCanChangeQuantity: false },
            { id: 2, name: 'City tax', quantity: 14, totalPrice: 22.4, currencyCode: 'EUR', isCityTax: true, isAddedAutomatically: true, guestCanChangeQuantity: false },
          ],
        }],
        cancellationPolicies: [{ effectiveFrom: '2027-06-04', amount: 950, currencyCode: 'EUR' }],
        prepaymentPolicies: [{ dueDate: '2026-09-17', amount: 950, currencyCode: 'EUR' }],
      });
    }
    throw new Error(`Unexpected URL ${url}`);
  };
  const env = { NOKUMO_API_KEY: 'server-only-secret', QUOTE_SIGNING_SECRET: secret, ASSETS: { fetch: () => new Response('asset') } };
  const request = new Request('https://pastura.test/api/v1/offers/search', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://pastura.test' },
    body: JSON.stringify({ arrivalDate: '2027-07-04', departureDate: '2027-07-11', guests: 2, culture: 'en' }),
  });

  const originalFetch = globalThis.fetch;
  globalThis.fetch = fetchMock;
  try {
    const response = await worker.fetch(request, env);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.offers.length, 2);
    assert.equal(body.offers[0].name, 'Spring special');
    assert.equal(body.offers[1].totalPrice, 6822.4);
    assert.equal(body.offers[1].mandatoryCharges.length, 2);
    assert.equal(JSON.stringify(body).includes('server-only-secret'), false);
    assert.equal(calls.filter((call) => call.url.endsWith('/Reservations/ShoppingCart')).length, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('uses age-band representatives for Nokumo pricing without collecting exact child ages', async () => {
  const cartBodies = [];
  const fetchMock = async (url, init = {}) => {
    if (url.includes('/Reservations/FindAvailability')) return Response.json({ result: [availability().result[1]] });
    if (url.endsWith('/Reservations/ShoppingCart')) {
      cartBodies.push(JSON.parse(init.body));
      return Response.json({
        currencyCode: 'EUR', totalPrice: 1000,
        units: [{ ratePlanId: 7, ratePlanName: 'Standard rate', accomodationPrice: 1000, servicesPrice: 0, services: [] }],
        cancellationPolicies: [], prepaymentPolicies: [],
      });
    }
    throw new Error(`Unexpected URL ${url}`);
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fetchMock;
  try {
    const response = await worker.fetch(new Request('https://pastura.test/api/v1/offers/search', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://pastura.test' },
      body: JSON.stringify({ arrivalDate: '2027-07-04', departureDate: '2027-07-11', numberOfAdults: 2, children0To11: 1, children12To17: 1, culture: 'en' }),
    }), { NOKUMO_API_KEY: 'server-only-secret', QUOTE_SIGNING_SECRET: secret });
    assert.equal(response.status, 200);
    assert.deepEqual(cartBodies[0].childrenAges, [6, 15]);
    assert.deepEqual(cartBodies[0].units[0].childrenAges, [6, 15]);
    assert.equal(Object.hasOwn((await response.json()).stay, 'childrenAges'), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('applies property-specific rate and perk presentation without changing API charges', () => {
  const offer = normalizeOffer({
    currencyCode: 'EUR', totalPrice: 3434.8,
    units: [{
      ratePlanId: 3007, ratePlanName: 'Swim Into Summer Savings – Exclusive Direct Booking Offer',
      accomodationPrice: 3240, servicesPrice: 194.8,
      services: [
        { id: 4166, name: 'Paws stay free (in properties where pets are allowed)', quantity: 1, totalPrice: 0, currencyCode: 'EUR', isIncludedInPrice: true, isSpecialOfferService: true },
        { id: 28, name: 'Cleaning fee - Villa 150', quantity: 1, totalPrice: 150, currencyCode: 'EUR', isAddedAutomatically: true, guestCanChangeQuantity: false },
      ],
    }],
    cancellationPolicies: [], prepaymentPolicies: [],
  }, { rate: { ratePlanId: 3007, ratePlanName: 'Original API name', specialOfferId: 3007 } }, 'token', { nights: 7, numberOfChildren: 0 });
  assert.equal(offer.displayName.en, 'Exclusive Direct Booking Offer');
  assert.equal(offer.includedServices.find((item) => item.id === 4166).displayName.en, 'Pets stay free');
  assert.equal(offer.includedServices.some((item) => item.id === 'local:free-ev-charging' && item.displayOnly), true);
  assert.equal(offer.mandatoryCharges[0].name, 'Cleaning fee - Villa 150');
  assert.equal(offer.totalPrice, 3434.8);
});

test('creates an opaque D1 checkout URL and refreshes it without exposing personal data', async () => {
  const db = new FakeD1();
  const payload = {
    v: 2,
    exp: Math.floor(Date.now() / 1000) + 60,
    stay: { arrivalDate: '2027-07-04', departureDate: '2027-07-11', numberOfAdults: 2, children0To11: 1, children12To17: 0, culture: 'en' },
    candidates: [{ accommodationUnitTypeId: 8481, ratePlanId: 7, ratePlanAccommodationUnitTypeId: 255949, specialOfferId: null }],
  };
  const quoteToken = await signQuote(payload, secret);
  const env = { DB: db, NOKUMO_API_KEY: 'server-only-secret', QUOTE_SIGNING_SECRET: secret, ASSETS: { fetch: () => new Response('asset') } };
  const create = await worker.fetch(new Request('https://pastura.test/api/v1/checkout-sessions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://pastura.test' },
    body: JSON.stringify({ quoteToken, language: 'en', tracking: { source: 'test' } }),
  }), env);
  const created = await create.json();
  assert.equal(create.status, 201);
  assert.match(created.checkoutUrl, /^\/checkout\/[0-9a-f-]{36}$/);
  assert.equal(JSON.stringify(db.sessions).includes('guest@example.com'), false);

  const fetchMock = async (url, init = {}) => {
    if (url.includes('/Reservations/FindAvailability')) return Response.json(availability());
    if (url.endsWith('/Reservations/ShoppingCart')) return Response.json({
      currencyCode: 'EUR', totalPrice: 6822.4,
      units: [{ ratePlanId: 7, ratePlanName: 'Standard rate', accomodationPrice: 6650, servicesPrice: 172.4, services: [] }],
      cancellationPolicies: [], prepaymentPolicies: [],
    });
    throw new Error(`Unexpected URL ${url} ${init.method || 'GET'}`);
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fetchMock;
  try {
    const response = await worker.fetch(new Request(`https://pastura.test/api/v1/checkout-sessions/${created.checkoutId}`), env);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.requiresChildAges, undefined);
    assert.equal(body.stay.children0To11, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('serves the booking page internally without redirecting away from the opaque checkout URL', async () => {
  const checkoutId = '8ef7a232-abed-446f-a854-aad9a060bf26';
  const assetRequests = [];
  const env = {
    ASSETS: {
      async fetch(request) {
        assetRequests.push(request.url);
        return new Response('<!doctype html><title>Booking</title>', {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      },
    },
  };

  const response = await worker.fetch(
    new Request(`https://pastura.test/checkout/${checkoutId}?lang=en`),
    env,
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Location'), null);
  assert.equal(new URL(assetRequests[0]).pathname, '/booking');
  assert.match(await response.text(), /<title>Booking<\/title>/);
});

test('stores one idempotent booking request and sends internal and guest emails', async () => {
  const db = new FakeD1();
  const sent = [];
  const payload = {
    v: 2, exp: Math.floor(Date.now() / 1000) + 60,
    stay: { arrivalDate: '2027-07-04', departureDate: '2027-07-11', numberOfAdults: 2, children0To11: 0, children12To17: 0, culture: 'en' },
    candidates: [{ accommodationUnitTypeId: 8481, ratePlanId: 7, ratePlanAccommodationUnitTypeId: 255949, specialOfferId: null }],
  };
  const env = {
    DB: db, NOKUMO_API_KEY: 'server-only-secret', QUOTE_SIGNING_SECRET: secret, APP_ENVIRONMENT: 'development',
    BOOKING_EMAIL_FROM: 'booking@pastura.test', BOOKING_NOTIFICATION_EMAIL: 'info@ventustravel.eu',
    EMAIL: { async send(message) { sent.push(message); return { messageId: crypto.randomUUID() }; } },
    ASSETS: { fetch: () => new Response('asset') },
  };
  const quoteToken = await signQuote(payload, secret);
  const create = await worker.fetch(new Request('https://pastura.test/api/v1/checkout-sessions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://pastura.test' },
    body: JSON.stringify({ quoteToken, language: 'en' }),
  }), env);
  const { checkoutId } = await create.json();
  const fetchMock = async (url) => {
    if (url.includes('/Reservations/FindAvailability')) return Response.json(availability());
    if (url.endsWith('/Reservations/ShoppingCart')) return Response.json({
      currencyCode: 'EUR', totalPrice: 6822.4,
      units: [{ ratePlanId: 7, ratePlanName: 'Standard rate', accomodationPrice: 6650, servicesPrice: 172.4, services: [] }],
      cancellationPolicies: [], prepaymentPolicies: [],
    });
    throw new Error(`Unexpected URL ${url}`);
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fetchMock;
  const idempotencyKey = crypto.randomUUID();
  const requestBody = {
    checkoutId, idempotencyKey,
    guest: { firstName: 'Ana', lastName: 'Horvat', email: 'ana@example.com', phoneCountryCode: '+385', phoneNumber: '91 123 4567', notes: '' },
    paymentMethod: 'bank_transfer', termsAccepted: true, privacyAccepted: true, marketingAccepted: false,
  };
  try {
    const response = await worker.fetch(new Request('https://pastura.test/api/v1/booking-requests', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://pastura.test' }, body: JSON.stringify(requestBody),
    }), env);
    const body = await response.json();
    assert.equal(response.status, 201);
    assert.equal(body.emailStatus, 'sent');
    assert.equal(db.requests.size, 1);
    assert.deepEqual(sent.map((message) => message.to), ['info@ventustravel.eu', 'ana@example.com']);

    const retry = await worker.fetch(new Request('https://pastura.test/api/v1/booking-requests', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://pastura.test' }, body: JSON.stringify(requestBody),
    }), env);
    assert.equal(retry.status, 200);
    assert.equal((await retry.json()).duplicate, true);
    assert.equal(sent.length, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
