import bookingPresentation from "../config/booking-presentation.json" with { type: "json" };

const NOKUMO_BASE_URL = "https://api.nokumo.app/v2";
const PROPERTY_ID = 25532;
const ALLOWED_UNIT_TYPE_IDS = new Set([8481, 8482]);
const API_PREFIX = "/api/v1";
const MAX_BODY_BYTES = 16_384;
const MAX_STAY_NIGHTS = 60;
const MAX_OFFERS = 12;
const QUOTE_TTL_SECONDS = 15 * 60;
const CHECKOUT_TTL_SECONDS = 60 * 60;
const ALLOWED_CULTURES = new Set(["en", "de", "hr", "it"]);
const PAYMENT_METHODS = new Set(["pay_by_link", "bank_transfer"]);
const QUOTE_PAYLOAD_VERSION = 2;

function json(status, body, extraHeaders = {}) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}

function cleanText(value, maxLength = 100) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseIsoDate(value) {
  const text = cleanText(value, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const date = new Date(`${text}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text ? null : date;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function differenceInNights(start, end) {
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

function normalizeCulture(value) {
  const culture = cleanText(value, 5).toLowerCase().slice(0, 2);
  return ALLOWED_CULTURES.has(culture) ? culture : "en";
}

function toNokumoCulture(culture) {
  return ({ en: "en-US", de: "de-DE", hr: "hr-HR", it: "it-IT" })[culture] || "en-US";
}

function validateStay(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const arrival = parseIsoDate(input.arrivalDate);
  const departure = parseIsoDate(input.departureDate);
  const adults = Number(input.numberOfAdults ?? input.guests);
  const children0To11 = Number(input.children0To11 ?? 0);
  const children12To17 = Number(input.children12To17 ?? 0);
  const numberOfChildren = children0To11 + children12To17;
  const totalGuests = adults + numberOfChildren;
  const culture = normalizeCulture(input.culture);
  if (!arrival || !departure || departure <= arrival) return null;
  const nights = differenceInNights(arrival, departure);
  if (nights < 1 || nights > MAX_STAY_NIGHTS) return null;
  if (!Number.isInteger(adults) || adults < 1 || adults > 8) return null;
  if (!Number.isInteger(children0To11) || children0To11 < 0 || children0To11 > 7) return null;
  if (!Number.isInteger(children12To17) || children12To17 < 0 || children12To17 > 7) return null;
  if (totalGuests > 8) return null;

  return {
    arrivalDate: isoDate(arrival),
    departureDate: isoDate(departure),
    guests: totalGuests,
    numberOfAdults: adults,
    children0To11,
    children12To17,
    numberOfChildren,
    culture,
    nights,
  };
}

async function readJsonBody(request) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) throw new Error("PAYLOAD_TOO_LARGE");
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) throw new Error("PAYLOAD_TOO_LARGE");
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("INVALID_JSON");
  }
}

function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

async function nokumoFetch(path, env, init = {}, fetchImpl = fetch) {
  if (!env?.NOKUMO_API_KEY) throw new Error("NOKUMO_CONFIGURATION_MISSING");
  let response;
  try {
    response = await fetchImpl(`${NOKUMO_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ApiKey: env.NOKUMO_API_KEY,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers || {}),
      },
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    console.error(`Nokumo network failure for ${path}: ${error?.name || "unknown"}`);
    throw new Error("NOKUMO_UNAVAILABLE");
  }
  if (!response.ok) {
    const safeStatus = response.status;
    console.error(`Nokumo request failed for ${path}: status_${safeStatus}`);
    const error = new Error("NOKUMO_REQUEST_FAILED");
    error.status = safeStatus;
    throw error;
  }
  return response.json();
}

function buildAvailabilityPath(stay) {
  const params = new URLSearchParams({
    ArrivalDate: stay.arrivalDate,
    DepartureDate: stay.departureDate,
    PropertyId: String(PROPERTY_ID),
    NumberOfUnits: "1",
    NumberOfAdults: String(stay.numberOfAdults),
    NumberOfChildren: String(stay.numberOfChildren),
    IgnoreRestrictions: "false",
    IgnoreUnitTypeCount: "false",
    IsForBookingEngine: "true",
    IgnoreBookingEnginePriceOffset: "false",
    ExcludeRatesJson: "true",
    IncludePrepaymentAndCancellationPolicies: "true",
    Culture: toNokumoCulture(stay.culture),
    "$top": "100",
  });
  return `/Reservations/FindAvailability?${params}`;
}

function normalizePolicies(items, dateKey) {
  return (items || []).map((item) => ({
    [dateKey]: item[dateKey] || null,
    amount: Number(item.amount || 0),
    currencyCode: item.currencyCode || "EUR",
    textResourceKey: item.textResourceKey || null,
  }));
}

function normalizeSpecialOfferServices(items) {
  return (items || []).map((service) => ({
    id: service.addOnServiceId,
    name: service.name || "",
    quantity: Number(service.quantity || 0),
    grossUnitPrice: Number(service.grossUnitPrice || 0),
    isIncludedInPrice: service.isIncludedInPrice === true,
    isAddedAutomatically: service.isAddedAutomatically === true,
  }));
}

function rateSignature(rate) {
  return JSON.stringify({
    ratePlanId: rate.ratePlanId,
    specialOfferId: rate.specialOfferId ?? null,
    ratePlanName: rate.ratePlanName || "",
    isNonRefundable: rate.isNonRefundable === true,
    totalPrice: Number(rate.totalPrice || 0),
    originalTotalPrice: rate.originalTotalPrice == null ? null : Number(rate.originalTotalPrice),
    discountPercent: rate.discountPercent == null ? null : Number(rate.discountPercent),
    currencyId: rate.currencyId,
    minimumStay: Number(rate.minimumStay || 0),
    maximumStay: Number(rate.maximumStay || 0),
    minBookableBeforeCheckin: Number(rate.minBookableBeforeCheckin || 0),
    cancellationPolicies: normalizePolicies(rate.cancellationPolicies, "effectiveFrom"),
    prepaymentPolicies: normalizePolicies(rate.prepaymentPolicies, "dueDate"),
    specialOfferServices: normalizeSpecialOfferServices(rate.specialOfferServices),
  });
}

export function groupEquivalentRates(availability) {
  const groups = new Map();
  for (const unit of availability?.result || []) {
    if (!ALLOWED_UNIT_TYPE_IDS.has(unit.accommodationUnitTypeId)) continue;
    if (Number(unit.numberOfAvailableUnits || 0) < 1) continue;
    for (const rate of unit.rates || []) {
      const signature = rateSignature(rate);
      const candidate = {
        accommodationUnitTypeId: unit.accommodationUnitTypeId,
        ratePlanId: rate.ratePlanId,
        ratePlanAccommodationUnitTypeId: rate.ratePlansAccomodationUnitTypeId,
        specialOfferId: rate.specialOfferId ?? null,
      };
      if (!groups.has(signature)) groups.set(signature, { rate, candidates: [] });
      groups.get(signature).candidates.push(candidate);
    }
  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      candidates: group.candidates.sort((a, b) => a.accommodationUnitTypeId - b.accommodationUnitTypeId),
    }))
    .slice(0, MAX_OFFERS);
}

function shoppingCartBody(stay, mappingId) {
  // Nokumo requires an age per child for pricing. Villas Pastura prices by the
  // same two age bands used in the guest picker, so representative ages keep
  // the tax calculation exact without collecting unnecessary birth data.
  const pricingChildrenAges = [...Array(stay.children0To11).fill(6), ...Array(stay.children12To17).fill(15)];
  return {
    arrivalDate: stay.arrivalDate,
    departureDate: stay.departureDate,
    promoCode: null,
    numberOfAdults: stay.numberOfAdults,
    numberOfChildren: stay.numberOfChildren,
    childrenAges: pricingChildrenAges,
    numberOfPets: 0,
    units: [{
      ratePlanAccomodationUnitTypeId: mappingId,
      numberOfAdults: stay.numberOfAdults,
      numberOfChildren: stay.numberOfChildren,
      childrenAges: pricingChildrenAges,
      numberOfPets: 0,
      extraAddOnServices: [],
    }],
    isForBookingEngine: true,
    ignoreBookingEnginePriceOffset: false,
    culture: toNokumoCulture(stay.culture),
  };
}

async function calculateCart(stay, candidate, env, fetchImpl) {
  return nokumoFetch("/Reservations/ShoppingCart", env, {
    method: "POST",
    body: JSON.stringify(shoppingCartBody(stay, candidate.ratePlanAccommodationUnitTypeId)),
  }, fetchImpl);
}

function normalizeService(service) {
  return {
    id: service.id,
    name: service.name || "",
    quantity: Number(service.quantity || 0),
    unitPrice: Number(service.unitPriceDiscounted ?? service.unitPrice ?? 0),
    totalPrice: Number(service.totalPriceDiscounted ?? service.totalPrice ?? 0),
    currencyCode: service.currencyCode || "EUR",
    isCityTax: service.isCityTax === true,
    isBookingFee: service.isBookingFee === true,
    isIncludedInPrice: service.isIncludedInPrice === true,
    isAddedAutomatically: service.isAddedAutomatically === true,
    guestCanChangeQuantity: service.guestCanChangeQuantity === true,
    isExtraService: service.isExtraService === true,
    isSpecialOfferService: service.isSpecialOfferService === true,
  };
}

function getOfferPresentation(offer) {
  const property = bookingPresentation?.properties?.[String(PROPERTY_ID)];
  if (!property?.offers) return null;
  return Object.values(property.offers).find((item) =>
    item?.match?.specialOfferIds?.includes(offer.specialOfferId)
    || item?.match?.ratePlanIds?.includes(offer.ratePlanId),
  ) || null;
}

function applyOfferPresentation(offer) {
  const presentation = getOfferPresentation(offer);
  if (!presentation) return offer;
  const overrides = presentation.serviceOverrides || {};
  const includedServices = offer.includedServices.map((service) => {
    const override = overrides[String(service.id)];
    return override?.labels ? { ...service, displayName: override.labels } : service;
  });
  for (const perk of presentation.additionalPerks || []) {
    if (!perk?.id || !perk?.labels || includedServices.some((service) => String(service.id) === String(perk.id))) continue;
    includedServices.push({
      id: perk.id,
      name: perk.labels.en || "",
      displayName: perk.labels,
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      currencyCode: offer.currencyCode,
      isCityTax: false,
      isBookingFee: false,
      isIncludedInPrice: true,
      isAddedAutomatically: false,
      guestCanChangeQuantity: false,
      isExtraService: false,
      isSpecialOfferService: false,
      displayOnly: true,
      source: "property-presentation",
    });
  }
  const order = new Map((presentation.perkOrder || []).map((id, index) => [String(id), index]));
  includedServices.sort((a, b) => (order.get(String(a.id)) ?? Number.MAX_SAFE_INTEGER) - (order.get(String(b.id)) ?? Number.MAX_SAFE_INTEGER));
  return {
    ...offer,
    ...(presentation.labels ? { displayName: presentation.labels } : {}),
    includedServices,
  };
}

function quotePayload(stay, group) {
  return {
    v: QUOTE_PAYLOAD_VERSION,
    exp: Math.floor(Date.now() / 1000) + QUOTE_TTL_SECONDS,
    stay,
    candidates: group.candidates,
  };
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

async function signQuote(payload, secret) {
  if (!secret || secret.length < 32) throw new Error("QUOTE_CONFIGURATION_MISSING");
  const encoded = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = bytesToBase64Url(await hmac(encoded, secret));
  return `${encoded}.${signature}`;
}

function validateQuotePayload(payload, checkExpiry = true) {
  if (payload?.v !== QUOTE_PAYLOAD_VERSION || !Number.isInteger(payload.exp)) return null;
  if (checkExpiry && payload.exp < Math.floor(Date.now() / 1000)) return null;
  const stay = validateStay(payload.stay);
  if (!stay || !Array.isArray(payload.candidates) || payload.candidates.length < 1) return null;
  const candidates = payload.candidates.filter((candidate) =>
    ALLOWED_UNIT_TYPE_IDS.has(candidate.accommodationUnitTypeId)
    && Number.isInteger(candidate.ratePlanAccommodationUnitTypeId)
    && Number.isInteger(candidate.ratePlanId),
  );
  return candidates.length ? { ...payload, stay, candidates } : null;
}

async function verifyQuote(token, secret) {
  if (!secret || secret.length < 32 || typeof token !== "string") return null;
  const [encoded, suppliedSignature, extra] = token.split(".");
  if (!encoded || !suppliedSignature || extra) return null;
  const expectedSignature = bytesToBase64Url(await hmac(encoded, secret));
  if (expectedSignature.length !== suppliedSignature.length) return null;
  let mismatch = 0;
  for (let i = 0; i < expectedSignature.length; i += 1) mismatch |= expectedSignature.charCodeAt(i) ^ suppliedSignature.charCodeAt(i);
  if (mismatch !== 0) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(encoded)));
    return validateQuotePayload(payload, true);
  } catch {
    return null;
  }
}

function normalizeOffer(cart, group, quoteToken, stay) {
  const unit = cart.units?.[0] || {};
  const total = Number(cart.totalPriceDiscounted ?? cart.totalPrice ?? 0);
  const accommodation = Number(unit.accomodationPriceDiscounted ?? unit.accomodationPrice ?? 0);
  const services = (unit.services || []).map(normalizeService);
  const includedServices = services.filter((service) => service.isIncludedInPrice || service.isSpecialOfferService);
  const mandatoryCharges = services.filter((service) => !service.isIncludedInPrice && (service.isAddedAutomatically || !service.guestCanChangeQuantity));
  const offer = {
    quoteToken,
    ratePlanId: unit.ratePlanId ?? group.rate.ratePlanId,
    specialOfferId: group.rate.specialOfferId ?? null,
    name: unit.ratePlanName || group.rate.ratePlanName || "Available rate",
    isNonRefundable: group.rate.isNonRefundable === true,
    discountPercent: group.rate.discountPercent == null ? null : Number(group.rate.discountPercent),
    originalTotalPrice: group.rate.originalTotalPrice == null ? null : Number(group.rate.originalTotalPrice),
    currencyCode: cart.currencyCode || "EUR",
    totalPrice: total,
    accommodationPrice: accommodation,
    servicesPrice: Number(unit.servicesPriceDiscounted ?? unit.servicesPrice ?? 0),
    averagePricePerNight: total / Math.max(1, stay?.nights || group.rate.dayPrices?.length || 1),
    isTouristTaxEstimate: false,
    damageDeposit: unit.damageDeposit == null ? null : Number(unit.damageDeposit),
    damageDepositCurrencyCode: unit.damageDepositCurrencyCode || cart.currencyCode || "EUR",
    includedServices,
    mandatoryCharges,
    allServices: services,
    cancellationPolicies: normalizePolicies(cart.cancellationPolicies, "effectiveFrom"),
    prepaymentPolicies: normalizePolicies(cart.prepaymentPolicies, "dueDate"),
    restrictions: {
      minimumStay: Number(group.rate.minimumStay || 0),
      maximumStay: Number(group.rate.maximumStay || 0),
      minBookableBeforeCheckin: Number(group.rate.minBookableBeforeCheckin || 0),
    },
  };
  return applyOfferPresentation(offer);
}

async function buildOffers(stay, availability, env, fetchImpl = fetch) {
  const groups = groupEquivalentRates(availability);
  const offers = await Promise.all(groups.map(async (group) => {
    const preferredCandidate = group.candidates[0];
    const cart = await calculateCart(stay, preferredCandidate, env, fetchImpl);
    const token = await signQuote(quotePayload(stay, group), env.QUOTE_SIGNING_SECRET);
    return normalizeOffer(cart, group, token, stay);
  }));
  return offers.sort((a, b) => a.totalPrice - b.totalPrice);
}

function findMatchingGroup(availability, signedQuote) {
  const availableGroups = groupEquivalentRates(availability);
  const offeredCandidates = signedQuote.candidates;
  for (const group of availableGroups) {
    const matchingCandidates = group.candidates.filter((candidate) => offeredCandidates.some((offered) =>
      offered.accommodationUnitTypeId === candidate.accommodationUnitTypeId
      && offered.ratePlanId === candidate.ratePlanId
      && offered.ratePlanAccommodationUnitTypeId === candidate.ratePlanAccommodationUnitTypeId
      && (offered.specialOfferId ?? null) === (candidate.specialOfferId ?? null),
    ));
    if (matchingCandidates.length) return { ...group, candidates: matchingCandidates };
  }
  return null;
}

async function handleCalendar(request, env, fetchImpl = fetch) {
  if (request.method !== "GET") return json(405, { error: "METHOD_NOT_ALLOWED" }, { Allow: "GET" });
  const url = new URL(request.url);
  const from = parseIsoDate(url.searchParams.get("from"));
  const to = parseIsoDate(url.searchParams.get("to"));
  if (!from || !to || to <= from || differenceInNights(from, to) > 400) {
    return json(422, { error: "INVALID_DATE_RANGE" });
  }
  const params = new URLSearchParams({
    From: isoDate(from),
    To: isoDate(to),
    IsForBookingEngine: "false",
    "$top": "500",
  });
  const data = await nokumoFetch(`/Properties/${PROPERTY_ID}/GetAvailability?${params}`, env, {}, fetchImpl);
  const returnedDays = new Map((data.result || []).map((item) => [
    String(item.date || "").slice(0, 10),
    Math.max(0, Number(item.quantity || 0)),
  ]).filter(([date]) => date));
  const days = [];
  for (const cursor = new Date(from); cursor <= to; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const date = isoDate(cursor);
    const remaining = returnedDays.get(date) || 0;
    days.push({ date, available: remaining > 0, remaining });
  }
  return json(200, { from: isoDate(from), to: isoDate(to), days, retrievedAt: new Date().toISOString() });
}

async function handleOfferSearch(request, env, fetchImpl = fetch) {
  if (request.method !== "POST") return json(405, { error: "METHOD_NOT_ALLOWED" }, { Allow: "POST" });
  if (!isSameOrigin(request)) return json(403, { error: "REQUEST_NOT_ALLOWED" });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json(415, { error: "UNSUPPORTED_MEDIA_TYPE" });
  }
  let input;
  try {
    input = await readJsonBody(request);
  } catch (error) {
    return json(error.message === "PAYLOAD_TOO_LARGE" ? 413 : 400, { error: error.message });
  }
  const stay = validateStay(input);
  if (!stay) return json(422, { error: "INVALID_SEARCH" });
  const availability = await nokumoFetch(buildAvailabilityPath(stay), env, {}, fetchImpl);
  const offers = await buildOffers(stay, availability, env, fetchImpl);
  return json(200, { stay, available: offers.length > 0, offers, retrievedAt: new Date().toISOString() });
}

async function handleQuoteRefresh(request, env, fetchImpl = fetch) {
  if (request.method !== "POST") return json(405, { error: "METHOD_NOT_ALLOWED" }, { Allow: "POST" });
  if (!isSameOrigin(request)) return json(403, { error: "REQUEST_NOT_ALLOWED" });
  let input;
  try {
    input = await readJsonBody(request);
  } catch (error) {
    return json(error.message === "PAYLOAD_TOO_LARGE" ? 413 : 400, { error: error.message });
  }
  const signedQuote = await verifyQuote(input?.quoteToken, env.QUOTE_SIGNING_SECRET);
  if (!signedQuote) return json(422, { error: "QUOTE_INVALID_OR_EXPIRED" });
  const refreshed = await refreshQuotePayload(signedQuote, env, fetchImpl);
  if (!refreshed) return json(409, { error: "OFFER_NO_LONGER_AVAILABLE" });
  return json(200, {
    stay: refreshed.stay,
    offer: refreshed.offer,
    retrievedAt: new Date().toISOString(),
  });
}

async function refreshQuotePayload(signedQuote, env, fetchImpl = fetch) {
  const availability = await nokumoFetch(buildAvailabilityPath(signedQuote.stay), env, {}, fetchImpl);
  const group = findMatchingGroup(availability, signedQuote);
  if (!group) return null;
  const cart = await calculateCart(signedQuote.stay, group.candidates[0], env, fetchImpl);
  const refreshedPayload = quotePayload(signedQuote.stay, group);
  const newToken = await signQuote(refreshedPayload, env.QUOTE_SIGNING_SECRET);
  return {
    stay: signedQuote.stay,
    offer: normalizeOffer(cart, group, newToken, signedQuote.stay),
    quotePayload: refreshedPayload,
  };
}

function validUuid(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function requireBookingDatabase(env) {
  if (!env?.DB?.prepare) throw new Error("BOOKING_STORAGE_MISSING");
  return env.DB;
}

async function loadCheckoutSession(db, checkoutId) {
  if (!validUuid(checkoutId)) return null;
  const row = await db.prepare("SELECT * FROM checkout_sessions WHERE id = ? LIMIT 1").bind(checkoutId).first();
  if (!row || row.status !== "open" || new Date(row.expires_at).getTime() <= Date.now()) return null;
  let payload;
  try {
    payload = validateQuotePayload(JSON.parse(row.quote_payload_json), false);
  } catch {
    payload = null;
  }
  return payload ? { row, payload } : null;
}

function sanitizeTracking(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const allowed = ["source", "medium", "campaign", "content", "term", "referrer"];
  return Object.fromEntries(allowed
    .map((key) => [key, cleanText(value[key], 240)])
    .filter(([, item]) => item));
}

async function handleCheckoutCreate(request, env) {
  if (request.method !== "POST") return json(405, { error: "METHOD_NOT_ALLOWED" }, { Allow: "POST" });
  if (!isSameOrigin(request)) return json(403, { error: "REQUEST_NOT_ALLOWED" });
  let input;
  try {
    input = await readJsonBody(request);
  } catch (error) {
    return json(error.message === "PAYLOAD_TOO_LARGE" ? 413 : 400, { error: error.message });
  }
  const payload = await verifyQuote(input?.quoteToken, env.QUOTE_SIGNING_SECRET);
  if (!payload) return json(422, { error: "QUOTE_INVALID_OR_EXPIRED" });
  const db = requireBookingDatabase(env);
  const id = crypto.randomUUID();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + CHECKOUT_TTL_SECONDS * 1000);
  await db.prepare(`INSERT INTO checkout_sessions
    (id, quote_payload_json, language, status, tracking_json, created_at, expires_at)
    VALUES (?, ?, ?, 'open', ?, ?, ?)`)
    .bind(id, JSON.stringify(payload), normalizeCulture(input?.language), JSON.stringify(sanitizeTracking(input?.tracking)), createdAt.toISOString(), expiresAt.toISOString())
    .run();
  return json(201, { checkoutId: id, checkoutUrl: `/checkout/${id}`, expiresAt: expiresAt.toISOString() });
}

async function handleCheckoutGet(request, env, checkoutId, fetchImpl = fetch) {
  if (request.method !== "GET") return json(405, { error: "METHOD_NOT_ALLOWED" }, { Allow: "GET" });
  const session = await loadCheckoutSession(requireBookingDatabase(env), checkoutId);
  if (!session) return json(404, { error: "CHECKOUT_NOT_FOUND_OR_EXPIRED" });
  const refreshed = await refreshQuotePayload(session.payload, env, fetchImpl);
  if (!refreshed) return json(409, { error: "OFFER_NO_LONGER_AVAILABLE" });
  return json(200, {
    checkoutId,
    expiresAt: session.row.expires_at,
    stay: refreshed.stay,
    offer: refreshed.offer,
    retrievedAt: new Date().toISOString(),
  });
}

function validateGuest(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const firstName = cleanText(input.firstName, 80);
  const lastName = cleanText(input.lastName, 80);
  const email = cleanText(input.email, 160).toLowerCase();
  const phoneCountryCode = cleanText(input.phoneCountryCode, 8);
  const phoneNumber = cleanText(input.phoneNumber, 32);
  const notes = cleanText(input.notes, 1000);
  if (firstName.length < 2 || lastName.length < 2) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (!/^\+\d{1,4}$/.test(phoneCountryCode) || !/^[0-9 ()\-]{5,32}$/.test(phoneNumber)) return null;
  return { firstName, lastName, email, phoneCountryCode, phoneNumber, notes };
}

async function validateTurnstile(inputToken, request, env) {
  if (!env.TURNSTILE_SECRET_KEY) return env.APP_ENVIRONMENT !== "production";
  const body = new FormData();
  body.set("secret", env.TURNSTILE_SECRET_KEY);
  body.set("response", cleanText(inputToken, 2048));
  body.set("remoteip", request.headers.get("CF-Connecting-IP") || "");
  body.set("idempotency_key", crypto.randomUUID());
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, signal: AbortSignal.timeout(10_000) });
  if (!response.ok) return false;
  const result = await response.json();
  return result.success === true;
}

function escapeEmailHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function policyLines(items, dateKey) {
  return (items || []).map((item) => `${Number(item.amount).toFixed(2)} ${item.currencyCode} — ${item[dateKey] || "date not provided"}`).join("\n") || "Not returned by rate plan";
}

function bookingEmailContent(requestId, guest, stay, offer, paymentMethod, language) {
  const paymentLabel = paymentMethod === "pay_by_link" ? "Pay by link (3-D Secure)" : "Bank transfer";
  const subjectByLanguage = {
    en: "We received your Villas Pastura booking request",
    de: "Wir haben Ihre Buchungsanfrage für Villas Pastura erhalten",
    hr: "Zaprimili smo vaš zahtjev za rezervaciju Villas Pastura",
    it: "Abbiamo ricevuto la tua richiesta per Villas Pastura",
  };
  const introByLanguage = {
    en: "We have received your booking request. Availability and price were checked when the request was submitted. Your reservation is not yet confirmed or held. Ventus Travel will review it and email your confirmation and payment instructions.",
    de: "Wir haben Ihre Buchungsanfrage erhalten. Verfügbarkeit und Preis wurden beim Absenden geprüft. Die Reservierung ist noch nicht bestätigt oder blockiert. Ventus Travel sendet Ihnen nach der Prüfung die Bestätigung und Zahlungsanweisungen.",
    hr: "Zaprimili smo vaš zahtjev za rezervaciju. Raspoloživost i cijena provjereni su u trenutku slanja. Rezervacija još nije potvrđena niti je termin blokiran. Ventus Travel će pregledati zahtjev i poslati potvrdu te upute za plaćanje.",
    it: "Abbiamo ricevuto la tua richiesta. Disponibilità e prezzo sono stati verificati al momento dell'invio. La prenotazione non è ancora confermata né bloccata. Ventus Travel invierà la conferma e le istruzioni di pagamento.",
  };
  const locale = ALLOWED_CULTURES.has(language) ? language : "en";
  const stayText = `${stay.arrivalDate} – ${stay.departureDate} (${stay.nights} nights)`;
  const partyText = `${stay.numberOfAdults} adults, ${stay.children0To11} children 0–11, ${stay.children12To17} young guests 12–17`;
  const totalText = `${Number(offer.totalPrice).toFixed(2)} ${offer.currencyCode}`;
  const rateName = offer.displayName?.[locale] || offer.displayName?.en || offer.name;
  const guestText = `${introByLanguage[locale]}\n\nReference: ${requestId}\nStay: ${stayText}\nGuests: ${partyText}\nRate: ${rateName}\nTotal: ${totalText}\nPreferred payment: ${paymentLabel}`;
  const guestHtml = `<p>${escapeEmailHtml(introByLanguage[locale])}</p><p><strong>Reference:</strong> ${escapeEmailHtml(requestId)}<br><strong>Stay:</strong> ${escapeEmailHtml(stayText)}<br><strong>Guests:</strong> ${escapeEmailHtml(partyText)}<br><strong>Rate:</strong> ${escapeEmailHtml(rateName)}<br><strong>Total:</strong> ${escapeEmailHtml(totalText)}<br><strong>Preferred payment:</strong> ${escapeEmailHtml(paymentLabel)}</p>`;
  const internalText = `New Villas Pastura booking request\n\nReference: ${requestId}\nGuest: ${guest.firstName} ${guest.lastName}\nEmail: ${guest.email}\nPhone: ${guest.phoneCountryCode} ${guest.phoneNumber}\nStay: ${stayText}\nGuests: ${partyText}\nRate: ${rateName}\nTotal: ${totalText}\nPayment preference: ${paymentLabel}\n\nPrepayment:\n${policyLines(offer.prepaymentPolicies, "dueDate")}\n\nCancellation:\n${policyLines(offer.cancellationPolicies, "effectiveFrom")}\n\nNotes:\n${guest.notes || "—"}`;
  const internalHtml = `<h1>New Villas Pastura booking request</h1><p><strong>Reference:</strong> ${escapeEmailHtml(requestId)}<br><strong>Guest:</strong> ${escapeEmailHtml(`${guest.firstName} ${guest.lastName}`)}<br><strong>Email:</strong> ${escapeEmailHtml(guest.email)}<br><strong>Phone:</strong> ${escapeEmailHtml(`${guest.phoneCountryCode} ${guest.phoneNumber}`)}<br><strong>Stay:</strong> ${escapeEmailHtml(stayText)}<br><strong>Guests:</strong> ${escapeEmailHtml(partyText)}<br><strong>Rate:</strong> ${escapeEmailHtml(rateName)}<br><strong>Total:</strong> ${escapeEmailHtml(totalText)}<br><strong>Payment preference:</strong> ${escapeEmailHtml(paymentLabel)}</p><h2>Prepayment</h2><pre>${escapeEmailHtml(policyLines(offer.prepaymentPolicies, "dueDate"))}</pre><h2>Cancellation</h2><pre>${escapeEmailHtml(policyLines(offer.cancellationPolicies, "effectiveFrom"))}</pre><h2>Notes</h2><p>${escapeEmailHtml(guest.notes || "—")}</p>`;
  return { guestSubject: subjectByLanguage[locale], guestText, guestHtml, internalText, internalHtml };
}

async function sendBookingEmails(env, requestId, guest, stay, offer, paymentMethod, language) {
  if (!env.EMAIL?.send || !env.BOOKING_EMAIL_FROM) return "pending_configuration";
  const content = bookingEmailContent(requestId, guest, stay, offer, paymentMethod, language);
  const internalRecipient = env.BOOKING_NOTIFICATION_EMAIL || "info@ventustravel.eu";
  const results = await Promise.allSettled([
    env.EMAIL.send({ from: env.BOOKING_EMAIL_FROM, to: internalRecipient, subject: `Villas Pastura booking request ${requestId}`, text: content.internalText, html: content.internalHtml }),
    env.EMAIL.send({ from: env.BOOKING_EMAIL_FROM, to: guest.email, subject: content.guestSubject, text: content.guestText, html: content.guestHtml }),
  ]);
  const sentCount = results.filter((result) => result.status === "fulfilled").length;
  return sentCount === 2 ? "sent" : sentCount === 1 ? "partial" : "failed";
}

async function handleBookingRequest(request, env, fetchImpl = fetch) {
  if (request.method !== "POST") return json(405, { error: "METHOD_NOT_ALLOWED" }, { Allow: "POST" });
  if (!isSameOrigin(request)) return json(403, { error: "REQUEST_NOT_ALLOWED" });
  let input;
  try {
    input = await readJsonBody(request);
  } catch (error) {
    return json(error.message === "PAYLOAD_TOO_LARGE" ? 413 : 400, { error: error.message });
  }
  const guest = validateGuest(input?.guest);
  const checkoutId = input?.checkoutId;
  const idempotencyKey = input?.idempotencyKey;
  const paymentMethod = cleanText(input?.paymentMethod, 30);
  if (!guest || !validUuid(checkoutId) || !validUuid(idempotencyKey) || !PAYMENT_METHODS.has(paymentMethod)) return json(422, { error: "INVALID_BOOKING_REQUEST" });
  if (input?.termsAccepted !== true || input?.privacyAccepted !== true) return json(422, { error: "CONSENT_REQUIRED" });
  if (!await validateTurnstile(input?.turnstileToken, request, env)) return json(422, { error: "TURNSTILE_FAILED" });

  const db = requireBookingDatabase(env);
  const existing = await db.prepare("SELECT id, email_status FROM booking_requests WHERE idempotency_key = ? LIMIT 1").bind(idempotencyKey).first();
  if (existing) return json(200, { requestId: existing.id, status: "received", emailStatus: existing.email_status, duplicate: true });
  const session = await loadCheckoutSession(db, checkoutId);
  if (!session) return json(404, { error: "CHECKOUT_NOT_FOUND_OR_EXPIRED" });
  const refreshed = await refreshQuotePayload(session.payload, env, fetchImpl);
  if (!refreshed) return json(409, { error: "OFFER_NO_LONGER_AVAILABLE" });

  const requestId = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.batch([
    db.prepare(`INSERT INTO booking_requests
      (id, checkout_id, idempotency_key, status, guest_json, stay_json, offer_json, payment_method, terms_version, privacy_version, marketing_accepted, consented_at, email_status, created_at)
      VALUES (?, ?, ?, 'received', ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`)
      .bind(requestId, checkoutId, idempotencyKey, JSON.stringify(guest), JSON.stringify(refreshed.stay), JSON.stringify(refreshed.offer), paymentMethod, "2026-10-31", "2026-10-31", input?.marketingAccepted === true ? 1 : 0, now, now),
    db.prepare("UPDATE checkout_sessions SET status = 'submitted', submitted_at = ? WHERE id = ? AND status = 'open'").bind(now, checkoutId),
  ]);

  const emailStatus = await sendBookingEmails(env, requestId, guest, refreshed.stay, refreshed.offer, paymentMethod, session.row.language);
  await db.prepare("UPDATE booking_requests SET email_status = ?, email_updated_at = ? WHERE id = ?").bind(emailStatus, new Date().toISOString(), requestId).run();
  return json(emailStatus === "sent" ? 201 : 202, { requestId, status: "received", emailStatus });
}

function handleRuntimeConfig(request, env) {
  if (request.method !== "GET") return json(405, { error: "METHOD_NOT_ALLOWED" }, { Allow: "GET" });
  return json(200, { turnstileSiteKey: env.TURNSTILE_SITE_KEY || null });
}

function apiError(error) {
  const code = error?.message || "UNEXPECTED_ERROR";
  if (/no such table:\s*(?:main\.)?checkout_sessions/i.test(code)) {
    return json(503, { error: "BOOKING_STORAGE_NOT_INITIALIZED" });
  }
  if (code === "NOKUMO_CONFIGURATION_MISSING" || code === "QUOTE_CONFIGURATION_MISSING" || code === "BOOKING_STORAGE_MISSING") {
    return json(503, { error: "BOOKING_SERVICE_NOT_CONFIGURED" });
  }
  if (code === "NOKUMO_UNAVAILABLE" || code === "NOKUMO_REQUEST_FAILED") {
    return json(502, { error: "BOOKING_SERVICE_UNAVAILABLE" });
  }
  console.error(`Unexpected booking API error: ${code}`);
  return json(500, { error: "UNEXPECTED_ERROR" });
}

export default {
  async fetch(request, env = {}) {
    const url = new URL(request.url);
    try {
      if (url.pathname === `${API_PREFIX}/availability/calendar`) return await handleCalendar(request, env);
      if (url.pathname === `${API_PREFIX}/offers/search`) return await handleOfferSearch(request, env);
      if (url.pathname === `${API_PREFIX}/quotes/refresh`) return await handleQuoteRefresh(request, env);
      if (url.pathname === `${API_PREFIX}/runtime-config`) return handleRuntimeConfig(request, env);
      if (url.pathname === `${API_PREFIX}/checkout-sessions`) return await handleCheckoutCreate(request, env);
      const checkoutMatch = url.pathname.match(/^\/api\/v1\/checkout-sessions\/([0-9a-f-]+)$/i);
      if (checkoutMatch) return await handleCheckoutGet(request, env, checkoutMatch[1]);
      if (url.pathname === `${API_PREFIX}/booking-requests`) return await handleBookingRequest(request, env);
      if (url.pathname.startsWith("/api/")) return json(404, { error: "NOT_FOUND" });
      if (/^\/checkout\/[0-9a-f-]+$/i.test(url.pathname) && request.method === "GET") {
        // Request the canonical extensionless asset path. Asking Static Assets
        // for /booking.html produces a 307 redirect to /booking, which would
        // remove the opaque checkout ID from the visitor-facing URL.
        const assetUrl = new URL("/booking", url);
        return env.ASSETS?.fetch ? env.ASSETS.fetch(new Request(assetUrl, request)) : new Response("Not found", { status: 404 });
      }
      return env.ASSETS?.fetch ? env.ASSETS.fetch(request) : new Response("Not found", { status: 404 });
    } catch (error) {
      return apiError(error);
    }
  },
};

export {
  buildAvailabilityPath,
  handleCalendar,
  handleBookingRequest,
  handleCheckoutCreate,
  handleCheckoutGet,
  handleOfferSearch,
  handleQuoteRefresh,
  normalizeOffer,
  signQuote,
  validateStay,
  verifyQuote,
};
