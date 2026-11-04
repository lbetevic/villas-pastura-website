# Villas Pastura — GTM / GA4 implementation specification

Version: 1.0 (2026-11-04). **Specification only** — do not install GTM, GA4, marketing pixels or analytics instrumentation in this iteration.

## Project and measurement model

This is the official four-language (EN, DE, HR, IT) Villas Pastura direct-booking website. The browser communicates with the Cloudflare Worker via same-origin `/api/v1/*`; the Worker handles the Nokumo integration. The existing flow currently stores a booking request in D1. Before production, the approved future Nokumo CreateReservation flow will be implemented. **Events must distinguish** a search, an offer, a booking request, a Nokumo-held reservation, a Nokumo-confirmed reservation and an actual payment. Never emit `purchase` for a submitted request.

## Consent and privacy requirements

- Start with the existing consent manager as the authoritative source. Set Consent Mode v2 states before any Google tag: `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization` denied until lawful affirmative consent. Decide basic vs advanced consent mode only after legal review.
- No optional tracking, tags, analytics cookies or marketing pixels may run without the corresponding consent. Do not queue and retroactively send pre-consent behavior; never store queued events persistently.
- No PII: names, email, phone numbers, free-form messages, guest notes, checkout UUIDs, payment tokens, IPs, full URL/query strings, exact child ages, Nokumo keys, card data or signed quote payloads must reach the dataLayer.
- No attribution IDs in opaque checkout paths. Privacy and cookie policies must be approved before production. Verify revocation and cookie deletion.
- Every event schema change must be reviewed for cardinality and data-retention impact.

## Suggested common dataLayer fields

```js
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'vp_availability_search',
  event_schema_version: 1,
  page_type: 'home',              // home, offers, checkout, faq, reviews, legal
  site_language: 'en',            // en, de, hr, it
  interaction_location: 'booking_card',
  stay_nights: 7,
  guest_count: 4
});
```

Use controlled low-cardinality `snake_case` values. Create a small centralized first-party instrumentation module and avoid scattering GTM calls throughout the application. Define an explicit dictionary of allowed event fields, trigger and consent category. Use GA4 native device and acquisition dimensions where available.

## Event catalogue

| Event | Trigger / semantics | Recommended parameters |
| --- | --- | --- |
| `vp_datepicker_open` | Date picker opened | `interaction_location`, `has_existing_dates` |
| `vp_dates_confirmed` | Explicit Done confirms full stay | `stay_nights`, `days_until_arrival_bucket` |
| `vp_guest_selection_confirmed` | Guest selector committed | `guest_count`, optionally age-band counts |
| `vp_availability_search` | Valid search initiated | `stay_nights`, `guest_count`, `origin` |
| `vp_availability_result` | API response completed | `result_status` (offers/none/error), `offer_count_bucket` |
| `view_item_list` | Verified rates actually rendered | controlled rate IDs; accurate value/currency only |
| `select_item` | A rate selected | controlled rate ID, currency, value |
| `begin_checkout` | Valid checkout session displayed | `stay_nights`, `guest_count`, currency and value if verified |
| `vp_checkout_back` | Guest returns to change stay | `step` |
| `vp_payment_preference_selected` | Preference selected | `payment_method` (pay_by_link/bank_transfer) |
| `vp_booking_request_submit` | Final valid submit attempted | `payment_method` |
| `vp_booking_request_result` | Durable request API response | `status` accepted/rejected/error; `email_status` |
| `generate_lead` | Request successfully and durably accepted | one deduplicated lead per backend request |
| `vp_reservation_status` | Future authoritative Nokumo state update | `reservation_state` held/confirmed/declined, no PII |
| `purchase` | **Future only:** authoritative, deduplicated confirmed commercial transaction | GA4 ecommerce value, currency and approved non-PII transaction reference |
| `vp_contact_click` | Phone, email or WhatsApp outbound click | `contact_method`, `interaction_location` |
| `vp_social_click` | Instagram or Facebook outbound click | `network` |
| `vp_faq_expand` | FAQ answer opened | stable `faq_id`, `page_type` |
| `vp_poi_guide_open` | All points-of-interest dialog opened | `interaction_location` |
| `vp_poi_open_map` | Individual POI Google Maps opened | stable `poi_id`, `poi_category` |
| `vp_map_interaction` | Property location preview clicked | `interaction_type: open_external` |
| `vp_gallery_open` | Gallery opened | stable `image_id` |
| `vp_amenities_open` | Amenities dialog opened | `interaction_location` |
| `vp_language_change` | Guest switches language | `from_language`, `to_language` |
| `vp_form_error` | Client-visible form error | allowlisted `field_name`, `error_code` only |

## Conversion design

Define one primary lead key event from successfully persisted requests, avoiding duplicates on retries or browser Back. After the approved reservation workflow is live, evaluate whether confirmed reservations should replace or supplement that lead conversion. Keep request value, confirmed reservation value, received payment, and cancelled booking metrics distinct. Use secure backend-side reconciliation for Nokumo events; never expose reservation identifiers in browser URLs or analytics payloads.

## Data layer variables and GTM setup

Create Version 2 Data Layer Variables for: `page_type`, `site_language`, `interaction_location`, `stay_nights`, `guest_count`, `result_status`, `offer_count_bucket`, `payment_method`, `status`, `reservation_state`, `faq_id`, `poi_id`, `poi_category`, `network`, `contact_method`, `currency` and `value`. Register only business-relevant GA4 custom definitions and avoid high-cardinality dimensions.

In GTM, configure consent initialization, one Google tag and canonical event triggers; consider Google Ads primary/secondary conversions and cross-channel attribution only after the consent review. Do not copy unrelated tags from ventustravel.eu. Turn on preview/debug, verify no accidental second GA4 initialization, and verify all events on route changes and BFCache restoration.

## Suggested dashboards and KPIs

Acquisition and landing-page conversion; date-picker engagement; search-to-offer; offer-to-checkout; checkout-to-request; request acceptance/failure; future held-to-confirmed and confirmed-to-paid; booked revenue vs pending value; language/device funnel splits; contact channel mix; content engagement (FAQ and POI). Data may be incomplete for users without analytics consent; reconcile aggregated backend totals separately.

## Verification checklist before enabling

1. Obtain GTM container ID and GA4 stream ID, production domain and approved consent policy.
2. Verify EN/DE/HR/IT, desktop/mobile, consent accepted/denied/revoked, and ad-blocked sessions.
3. Test no availability, stale prices, checkout expiry, browser Back, request retries, pending emails and future Nokumo write errors.
4. Confirm zero PII or checkout-token leakage in dataLayer, GTM Preview, request payloads and GA4 DebugView.
5. Confirm no purchase on a request, and one conversion per authoritative transaction.
6. Check Lighthouse performance and accessibility budgets after tags are added.

This file is a technical design document; **no analytics scripts are installed by this PR**.
