# Villas Pastura direct-booking website — v1.25.0

A mobile-first, multilingual website plus a Cloudflare Worker that integrates
server-to-server with Nokumo. Version 1.25.0 refines two targeted brand and
contrast details without changing the established page layouts.

## v1.25.0 targeted colour and contrast refinements

- Primary gold buttons now use the brand's dark navy text instead of the previous near-black brown. The combination retains a WCAG contrast ratio of approximately 6.48:1.
- The Reviews page header now uses a solid dark-navy background, giving the white villa name, location and desktop navigation a stable high-contrast surface.
- Mobile navigation remains a white panel with dark links; the language control and menu button retain their existing high-contrast treatment.

## v1.24.0 multilingual local guide

- Thirteen curated POIs are organized into four guest-oriented groups: beaches, food and drink, everyday and arrival, and exploring Pag.
- Names, short descriptions, approximate travel information and map actions are translated into EN, DE, HR and IT in `assets/data/poi-content.json`.
- Every item opens a targeted Google Maps search in a new tab; approximate distances and travel times are explicitly labelled because traffic and seasonal routes can change.
- Beach Terra, Babe, Planjka, Starac i More, Konoba Galia, Boškinac, the nearest supermarket, Novalja centre, Zadar Airport, Talijanova buža, the Olive Gardens of Lun, Cape Lun and the Life on Mars Trail are included.
- The inherited 1 km distance for Konoba Galia is not reused because the restaurant's waterfront address is inconsistent with that figure; the guide uses a conservative approximate route from the villa.
- Boškinac and Talijanova buža add one distinctive dining experience and one local cultural landmark without diluting the guide with a long generic attraction list.

## v1.23.0 multilingual amenities catalogue

- The complete amenity catalogue is deduplicated and organized into six guest-oriented groups: pool and outdoor living, space and comfort, kitchen and dining, entertainment and work, parking and guest services, and safety.
- Amenity labels and group titles are translated into EN, DE, HR and IT in `assets/data/amenities-content.json`; the modal renders from that file and retains an English HTML fallback.
- Pool descriptions now consistently state that the pools are heated. Brand names, headings, subheadings and authentic review quotations remain unchanged.
- Low-value microitems such as toilet paper, trash cans, sofas and closets are intentionally not listed separately; closely related essentials are combined into concise entries.
- The concrete safety features are shown, while “24-hour security” is omitted because it could incorrectly imply an on-site guard or reception.

## v1.22.0 streamlined checkout and direct-booking value

- The availability summary now reads **Stay dates | Nights | Guests** and removes redundant live-price helper copy.
- Returning with the browser Back button re-enables a previously selected rate instead of leaving its action disabled.
- The redundant final guest-details review has been removed. The personal-data form now ends with the accurate **Send booking request** action and preserves entered data after a failed API attempt.
- The homepage direct-booking section uses **Our best direct-booking terms**, priority local support, Email, Call and Share actions, and the verified phone number `+385 95 7328 532`.
- Five direct-booking perks are shown prominently on the homepage and checkout. `npm run build` generates `assets/data/direct-booking-benefits.json` from `config/booking-presentation.json`, keeping their order and translations synchronized.

## v1.21.0 offer presentation and simplified child age bands

- The direct offer is displayed as **Exclusive Direct Booking Offer** in EN, DE, HR and IT without changing the Nokumo rate-plan name.
- The generic pet disclaimer is replaced with a Villas Pastura-specific label, and **Free EV charging · 22 kW** is added as a display-only local perk.
- Included perks are shown before the price breakdown so free direct-booking value is visible without reducing fee transparency.
- Property-specific labels, translations, additional perks and ordering live in `config/booking-presentation.json`, keyed by stable Nokumo IDs rather than names.
- Guest categories now follow Croatian tourist-tax boundaries: adults 18+, children 0–11 and young guests 12–17.
- Nokumo `ShoppingCart` receives representative ages from those bands solely for pricing; checkout no longer asks for or stores each child's exact age.
- `/checkout/<uuid>` retains the previous routing hotfix and continues to preserve the opaque checkout ID.

## v1.20.0 checkout, property content and booking requests

- The home page uses an Airbnb-style guest picker with separate counters for adults 18+, children 0–11 and young guests 12–17; total capacity remains eight.
- Each selected offer creates an opaque `/checkout/<uuid>` URL backed by Cloudflare D1. No guest name, email, phone or price is placed in the URL.
- Checkout shows the refreshed price, mandatory charges, prepayment, cancellation and damage-deposit conditions before the personal-data form.
- The form collects the reservation holder's name, email, international phone number, optional notes and one required payment preference: pay by link (3-D Secure) or bank transfer.
- Required booking-terms and privacy consents are separate from the optional marketing consent and are stored with policy-version timestamps.
- Final submit rechecks availability and price, prevents duplicate submissions with an idempotency key, stores the request in D1 and prepares one internal and one guest email.
- Confirmation copy explicitly states that this is a request: dates are not held or confirmed until Ventus Travel sends a separate confirmation.
- The date picker opens on May 2027 by default, on the selected month when dates exist, and never opens in the past after May 2027.
- Offer and checkout pages use one clear heading, without technical live-check copy above the stay summary.
- “Change dates or guests” returns to the booking card with the existing dates and guest composition prefilled.
- Included rate perks are shown as a prominent scannable checklist.
- `npm run dev` applies pending local D1 migrations automatically before starting Wrangler, preventing checkout-session errors on a new local setup.
- The homepage capacity is corrected to eight and the villa facts now highlight four ensuite bathrooms, a private pool and four bedrooms.
- Property amenities, direct-booking trust reasons and POI placeholders are separated into distinct sections. The complete amenities list opens in an accessible modal without losing booking state.

`CreateReservation` remains intentionally out of scope. Version 1.20.0 creates a durable booking request and sends notifications; it does not block inventory in Nokumo.

### v1.19.1 date-picker hotfix

Confirming a complete date range no longer calls the removed legacy quote panel. The `Done` action now commits both dates, closes the modal and reveals the remaining booking controls without a JavaScript exception.

### v1.20.0 Nokumo policy-date hotfix

The shared date formatter now accepts both date-only values and Nokumo policy timestamps such as `2027-03-24T00:00:00`. Rate cards can therefore render prepayment and cancellation schedules without falling into the generic live-data error state.

## v1.18.0 mobile hero and progressive booking

- Mobile header uses the one-line `Villas Pastura` brand; the location line and hero eyebrow are hidden below 700 px.
- Mobile hero copy is purpose-built for the narrow viewport: `Private pool villas in Novalja, made for time together.`
- The mobile proof line uses `4 bedrooms · private pool · sea-view terrace · local support`.
- A shared mobile gradient replaces the separate subtitle panel, while desktop keeps its established composition.
- The compact mobile booking card initially exposes the date control; guest count and the final availability CTA appear after dates are confirmed.
- Desktop hero copy now prioritizes the private pool rather than pool heating.
- The approved statement about each villa's entrance, fenced terrace, private pool and non-shared outdoor facilities is included in the villa section and the generated multilingual FAQ/JSON-LD.

## v1.17.0 gallery, reviews and booking-control polish

- The gallery lightbox is locked to the viewport so desktop and mobile never produce a second scrollbar.
- Gallery filters remain above the photo grid and scroll away naturally instead of covering photographs.
- Lightbox previous, next and close controls use centered SVG icons.
- The visual live-availability status row and its legend were removed from the date picker; unavailable dates remain crossed out.
- The guest dropdown is replaced by an accessible 1–8 stepper. Because the value is not a text field, mobile keyboards cannot open.
- A dedicated `reviews.html` page contains four approved reviews for Pool Villas Pastura and accurate 9.9/10 aggregate structured data.

`CreateReservation` is intentionally **not implemented** in this version.

## Nokumo integration and Cloudflare setup

The browser calls only same-origin `/api/v1/*` endpoints. `worker/index.js`
keeps the Nokumo credential on the server and exposes:

- `GET /api/v1/availability/calendar` for calendar guidance;
- `POST /api/v1/offers/search` for the authoritative full-stay check and offers;
- `POST /api/v1/quotes/refresh` to revalidate the chosen offer before guest data.

The two identical Villas Pastura unit types are abstracted into one guest-facing
product. A unit must be available for the full stay. Equivalent offers are
deduplicated; when both villas can fulfil the same offer, the lower unit-type ID
is preferred. Distinct rate plans and special offers remain separate.

### Property-specific offer presentation

Edit `config/booking-presentation.json` to change guest-facing labels without
touching application code. Each offer override declares matching
`specialOfferIds` and `ratePlanIds`, while service labels use stable Nokumo
service IDs. Locally added perks must use a `local:` ID. The Worker marks them `displayOnly`, keeps
them out of Nokumo service arrays and will not include them in a future
reservation payload. Unknown or removed IDs safely fall back to the original
Nokumo label. `config/booking-presentation.schema.json` provides editor
validation for all supported fields and translations.

Set runtime secrets locally by copying `.dev.vars.example` to `.dev.vars`:

```text
NOKUMO_API_KEY=replace-with-current-key
QUOTE_SIGNING_SECRET=use-a-random-secret-at-least-32-characters-long
TURNSTILE_SECRET_KEY=
TURNSTILE_SITE_KEY=
BOOKING_EMAIL_FROM=
```

Never put real values in source control. For deployed Cloudflare Workers use:

```text
npx wrangler secret put NOKUMO_API_KEY
npx wrangler secret put QUOTE_SIGNING_SECRET
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put TURNSTILE_SITE_KEY
npx wrangler secret put BOOKING_EMAIL_FROM
```

Run locally with Node 20+:

```text
npm install
npm run dev
```

`npm run dev` runs `db:local` automatically. Use `npm run db:local` separately only when you want to apply migrations without starting the development server.

Open the Wrangler URL, not `index.html` through `file://` or Live Server: the
booking pages require the Worker API. Run `npm run check` before deployment.

### D1 and transactional email production setup

1. The Cloudflare D1 database `villas-pastura-booking` is already linked in `wrangler.jsonc` with binding `DB`. Create a different database and replace its ID only when deploying to another Cloudflare account or environment.
2. Run `npm run db:remote` once before the first deployment.
3. Change `APP_ENVIRONMENT` to `production` in `wrangler.jsonc`.
4. After purchasing the domain and moving its DNS to Cloudflare, onboard it in Cloudflare Email Service and add a `send_email` binding named `EMAIL`.
5. Set `BOOKING_EMAIL_FROM` to an authenticated sender on that domain; internal notifications default to `info@ventustravel.eu`.
6. Create separate Turnstile widgets for local/staging and production, restrict the production hostname, and configure both keys.

Without the email binding, development submissions remain safely stored in D1 with `email_status=pending_configuration`; the UI never claims that the stay is held.

### Production checklist still required

- rotate the API key that was shared during development;
- add the confirmed production domain and Cloudflare security/rate-limit rules;
- complete and obtain legal approval for `booking-terms.html` and `privacy.html`;
- confirm the legal controller, Nokumo processor role and concrete retention;
- configure an operational retry/alert process for any request whose email status is `partial`, `failed` or `pending_configuration`;
- implement `CreateReservation` only after the final field mapping and HOLD rules are approved.

The included `_headers` file adds baseline browser security headers and cache
rules for static assets. API responses are always `no-store`. Availability and
offer search are intentionally checked live in this prototype; add edge/WAF
rate limiting before exposing the endpoints publicly.

The villa capacity copy is standardized to **4 bedrooms** in the English,
German, Croatian and Italian versions.

## Consent and privacy controls

Version 1.14 adapts the consent architecture from the supplied WattsUp.Zone
project for the Villas Pastura static website. It is active on `index.html`,
`gallery.html`, `faq.html`, `cookies.html` and `privacy.html`.

The implementation provides:

- optional categories denied by default;
- equally accessible Accept all and Reject optional actions on the first layer;
- granular Analytics, Marketing and Functional choices;
- a Necessary category that cannot be disabled;
- a six-month, versioned consent decision in `localStorage`;
- a persistent Cookie settings action in every footer;
- EN, DE, HR and IT consent UI that follows the site language;
- Google Consent Mode defaults set to denied before any optional GTM load;
- no optional network request while the GTM ID remains blank.

Public configuration is in `assets/js/privacy-config.js`. To activate GTM later,
set `gtmContainerId` to a valid `GTM-...` value. Every tag inside GTM must also
have the appropriate built-in consent requirement. An Analytics or Marketing
selection may load the container, but the container must still prevent each
individual tag from firing without its required category.

Current browser storage is documented in `cookies.html`:

- `villa-lang` stores the language selected by the visitor;
- `vp_consent_v1` stores the optional consent choices, policy version and time.

The legal pages intentionally remain `noindex, nofollow` and visibly marked as
development material. Before production launch, confirm and insert the full
legal identity and address of the data controller, hosting and booking
processors, concrete retention periods, international-transfer safeguards and
all actually configured third-party services. A consent banner is only one
part of GDPR/ePrivacy compliance and does not replace that legal review.

## FAQ prototype and content workflow

Version 1.13 adds six FAQ preview questions to the homepage and a dedicated
`faq.html` page with 20 placeholder questions in four sections:

- Booking & price;
- The villa & pool;
- Arrival & location;
- Local host advice.

The FAQ page uses native `<details>` accordions, stable deep-link IDs, a sticky
category navigation, multilingual UI, keyboard-accessible interactions and
local-host-tip callouts. The dedicated page is deliberately marked
`noindex, nofollow` while placeholder copy remains. The homepage preview uses
`data-nosnippet`, so prototype answers are not suitable search snippets.

Edit FAQ topics, order and future approved answers in `faq-content.json`, then
double-click `tools/build-faq.bat`. It regenerates the static homepage preview,
the complete FAQ page, embedded multilingual runtime data and matching
`FAQPage` JSON-LD from the same source. This prevents visible answers and
structured data from drifting apart.

Before production launch:

1. Replace every placeholder question and answer with owner-reviewed content.
2. Replace the placeholder local tips with verified first-hand recommendations.
3. Set the final domain in structured data.
4. Remove the prototype notice and change the FAQ robots directive to
   `index, follow`.
5. Run `tools/build-faq.bat` and validate the final HTML and JSON-LD.

## Gallery page and automated image workflow

`gallery.html` is a dedicated, mobile-first photo gallery with:

- responsive WebP thumbnails selected by the browser with `srcset` and `sizes`;
- native lazy loading for every image below the first gallery photo;
- full-screen lightbox with keyboard arrows, Escape, touch swipe, captions and
  a photo counter;
- deferred loading of 1800/2400 px lightbox files only after a photo is opened;
- category filters, stable image dimensions to prevent layout shift and
  reduced-motion support;
- page-specific title, description, crawl directives, descriptive alt text and
  `ImageGallery`/`VacationRental` structured data.

The gallery now contains 20 final, manually composed portrait and landscape
scenes supplied for Villas Pastura. Public derivatives use normalized,
descriptive SEO filenames and live in `assets/img/gallery/`.

### Where photos go and how the gallery finds them

Put the manually composed source files in `gallery-masters/portrait/` and
`gallery-masters/landscape/`. A shared three-digit filename prefix pairs the two
crops, even when the descriptive parts of their names differ.

The page does not scan the output folder at runtime. Instead,
`tools/build_gallery_images.py` reads `gallery-manifest.json` and generates the
WebP files plus static `<figure>` markup, translated image captions and JSON-LD.
This preserves deterministic order, no-JavaScript content and strong image SEO
without requiring repetitive HTML editing.

### Required art direction and derivatives for each scene

Prepare two manual master crops from the same scene:

```text
portrait master     4:5   at least 1280 × 1600 px
landscape master    3:2   at least 2400 × 1600 px
```

Then export seven WebP files. Replace `scene-description` with a short,
accurate English SEO slug:

```text
villas-pastura-scene-description-portrait-480x600.webp       480 × 600
villas-pastura-scene-description-portrait-960x1200.webp     960 × 1200
villas-pastura-scene-description-portrait-1280x1600.webp   1280 × 1600

villas-pastura-scene-description-landscape-480x320.webp     480 × 320
villas-pastura-scene-description-landscape-960x640.webp     960 × 640
villas-pastura-scene-description-landscape-1800x1200.webp  1800 × 1200
villas-pastura-scene-description-landscape-2400x1600.webp  2400 × 1600
```

All portrait files share the manual 4:5 composition and all landscape files
share the manual 3:2 composition. Integer-rounding differences in the supplied
1334 × 1667 and 2500 × 1667 masters are accepted. The builder converts to sRGB,
strips EXIF/GPS, uses WebP quality 80–86 and never upscales.

The grid uses 4:5 on screens up to 699 px and 3:2 from 700 px upward. The
lightbox uses the same art direction: 4:5 portrait files on phones and 3:2
landscape files on larger screens. CSS reserves the matching aspect ratio and
does not create an additional visual crop.

### Automatic WebP builder

Version 1.12 pairs masters by their three-digit source ID:

```text
gallery-masters/portrait/200_private-pool-sea-view-dusk.jpg
gallery-masters/landscape/200_private-pool-sea-view-dusk.jpg
```

Put the pairs in `gallery-masters/`. On Windows, run
`tools/setup-image-tools.bat` once and then double-click
`tools/build-gallery-images.bat` whenever masters change. The builder:

- validates every pair, manifest record, aspect ratio and requested resolution;
- refuses to make a compositional crop or upscale;
- applies EXIF orientation, converts embedded profiles to sRGB and strips
  EXIF/GPS metadata;
- uses Lanczos resampling and seven size-specific WebP quality settings;
- writes through temporary files and atomically replaces completed derivatives;
- reports each resulting file size and warns when a recommended weight is exceeded;
- rebuilds static gallery markup, multilingual captions and JSON-LD;
- keeps public filenames and order independent from the original filenames.

Run `py tools\build_gallery_images.py --help` for custom portrait/landscape
widths, output folders, collision protection and check-only validation.

For an unrelated folder, `tools/resize_image_folder.py` accepts explicit output
sizes and creates a `generated` subfolder. Example:

```text
py tools\resize_image_folder.py "C:\photos\portrait" --sizes 480x600 960x1200 1280x1600
```

## How to run in Visual Studio Code on Windows 11

1. Install Node.js 20 or newer, unzip the project and open it in VS Code.
2. Copy `.dev.vars.example` to `.dev.vars` and insert development secrets.
3. In the VS Code terminal run `npm install` and then `npm run dev`.
4. Open the local URL printed by Wrangler.

VS Code Live Server can still preview content-only pages, but it cannot run the
server-to-server booking integration. Use Wrangler for all booking tests.

## Structure

```text
index.html
gallery.html
faq.html
cookies.html
privacy.html
faq-content.json
assets/css/styles.css
assets/css/gallery.css
assets/css/faq.css
assets/css/consent.css
assets/js/app.js
assets/js/gallery.js
assets/js/faq.js
assets/js/privacy.js
assets/js/privacy-config.js
assets/js/consent.js
assets/js/consent-ui.js
assets/js/analytics.js
assets/js/legal.js
assets/js/booking-api.js
assets/js/availability.js
assets/js/booking.js
assets/img/*.webp
assets/img/gallery/*.webp
gallery-manifest.json
gallery-masters/portrait/*.jpg
gallery-masters/landscape/*.jpg
gallery-masters/README.md
tools/build_gallery_images.py
tools/resize_image_folder.py
tools/build_faq.py
tools/setup-image-tools.bat
tools/build-gallery-images.bat
tools/build-faq.bat
tools/requirements-image-tools.txt
```

## Responsive hero images

The hero now uses semantic `<picture>` and `<img>` markup with separate art
direction for portrait and landscape screens. Replace the demo WebP files with
your final property photos while keeping the filenames:

```text
assets/img/hero-portrait-480.webp    480 × 640 px
assets/img/hero-portrait-768.webp    768 × 1024 px
assets/img/hero-portrait-1200.webp   1200 × 1600 px
assets/img/hero-landscape-1280.webp  1280 × 720 px
assets/img/hero-landscape-1920.webp  1920 × 1080 px
assets/img/hero-landscape-2500.webp  2500 × 1406 px
```

The portrait and landscape groups may use completely different crops or even
different source photos. The browser selects an appropriate file using the
`media`, `srcset` and `sizes` rules in `index.html`.

For final CRO tuning, adjust these three CSS variables near the top of
`assets/css/styles.css`:

```css
--hero-focus-mobile-portrait: 58% 50%;
--hero-focus-tablet-portrait: 56% 48%;
--hero-focus-landscape: 52% 48%;
```

They control `object-position` independently, so the key person, pool, view or
other conversion-relevant focal point remains visible after `object-fit: cover`.
For the best result, first prepare an intentional crop for each orientation and
then use these values only for fine positioning.

## Responsive secondary images

The villa detail image now has its own portrait and landscape source sets. The
included WebP files are temporary derivatives of the supplied hero photo so the
markup works immediately. Replace them one-for-one with the final detail photo
crops while keeping these filenames:

```text
assets/img/villa-terrace-portrait-480.webp     480 × 640 px
assets/img/villa-terrace-portrait-768.webp     768 × 1024 px
assets/img/villa-terrace-portrait-1200.webp   1200 × 1600 px
assets/img/villa-terrace-landscape-720.webp    720 × 540 px
assets/img/villa-terrace-landscape-1280.webp  1280 × 960 px
assets/img/villa-terrace-landscape-1920.webp  1920 × 1440 px
```

Use the same `<picture>` pattern for future editorial photographs that need
different crops by orientation. For image slots where art direction is not
important, prepare three square files at 480 × 480, 800 × 800 and 1200 × 1200
and use a single `srcset` with `1:1` crops.

### Best photo for the villa-detail slot

This image should add evidence instead of repeating the hero. Use a bright
daylight or warm golden-hour photograph that shows one concrete high-value
relationship: the pool and terrace connected to the villa, the summer kitchen
and dining area ready for a group, or a principal bedroom opening toward the
view. A pool-and-terrace overview is the strongest default for this slot.

Keep the subject near the centre so both crops remain useful. Landscape files
use 4:3 and should show spatial context; portrait files use 3:4 and should keep
one clear focal point without cutting furniture, doors, the pool edge or the
view at the frame boundary. Avoid another dark, wide dusk exterior similar to
the hero, extreme wide-angle distortion, empty rooms, cars, people and overly
processed HDR.

## v1.2 layout changes

- The desktop navigation is an overlay over the hero image; tablet and mobile
  keep the solid sticky header for readability and menu behavior.
- The blue CSS treatment over the hero photo has been removed.
- The booking controls are 64 px high and share a common baseline from 700 px
  upward.
- On desktop the booking module is compacted into one horizontal CTA card and
  pulled into the first viewport.
- The initials badge was removed because the property has no logo.

## v1.3 hero and booking changes

- Removed the redundant **Check dates** item from the primary navigation.
- Removed both hero buttons because the booking controls are already visible in
  the first viewport.
- The guest selector now offers every whole number from 1 through 8.
- Replaced the development placeholder copy in the booking bar with concise
  guest-facing instructions in English, German, Croatian and Italian.
- Added translucent neutral-grey contrast pills behind the hero eyebrow and
  supporting copy without applying a colour treatment to the full photograph.
- Desktop date selection in v1.3 committed automatically after the second
  date; v1.4 replaces that behavior with explicit **Done** confirmation.

## v1.4 date confirmation

- Desktop and mobile now use the same predictable interaction: selecting a
  complete range keeps the date picker open.
- The user may select a new start and end date as many times as needed.
- **Done** becomes enabled only after both dates are selected, then commits the
  draft range and closes the picker.
- Closing with ×, Escape or the backdrop discards unconfirmed draft changes and
  preserves the last confirmed dates.

## v1.5 desktop polish

- The guest selector now defaults to 2 guests while still offering every whole
  number from 1 through 8.
- The three direct-booking benefits have moved from the hero photo into the
  white booking card, with stronger green checkmarks for faster scanning.
- The desktop space between the booking card and the villa section is reduced
  by 28 px. The hero title, title shadow and subtitle pill are unchanged pending
  the next copy decision.

## v1.6 navigation and content cleanup

- Simplified the main navigation to **The villa**, **Gallery**, **Reviews** and
  **Location**. The existing responsive villa image is the current gallery
  preview anchor; expand it when the final photo set is supplied.
- Added an honest reviews placeholder instead of invented ratings or quotes.
- Centered all three trust signals below the booking controls.
- Removed every remaining legacy property-name placeholder and standardized the
  translations, map copy, API examples and booking-request subject on Villas
  Pastura.
- Confirmed that the villa-detail image supports independent portrait and
  landscape source sets at three responsive sizes each.

## v1.16 date-picker polish and site icon

- Replaced three competing date instructions with one dynamic dialog title:
  check-in, check-out, then review.
- Moved the previous/next controls into the same row as the two month names on
  desktop.
- Replaced font glyphs with centered SVG icons for previous, next and close.
- Every month is padded to a six-week calendar grid, preventing dialog height
  shifts while paging between months.
- Added SVG, ICO, Apple touch and web-app favicon assets to every HTML page.

## v1.16.1 browser-cache fix

- Versioned every first-party CSS and JavaScript URL, including ES-module
  imports, so a new HTML document cannot execute a stale cached script from an
  earlier release.
- This specifically prevents the removed `#selection-hint` element from being
  referenced by the v1.15 date-picker script after a version upgrade.

## v1.16.2 inventory calendar correction

- The lightweight date-picker calendar calls Nokumo `GetAvailability` with
  `IsForBookingEngine=false`, matching the property inventory calendar rather
  than the publication state of booking-engine rates.
- Missing dates remain unavailable; returned dates are available when
  `quantity` is greater than zero. The complete-stay offer search still uses
  booking-engine availability and remains the authoritative validation.
- The favicon is now a plain circle in the exact Ventus yellow `#FDD641`, with
  versioned icon URLs so browsers cannot retain the previous P icon.

## Date-range picker

Both dates are selected inside one custom date-range picker:

- Desktop initially shows the current and following month side by side.
- Mobile renders 13 months vertically in one smooth scrolling surface.
- Past dates are disabled in the browser's local timezone.
- Live Nokumo calendar data marks unavailable nights; a first unavailable night
  after the arrival remains selectable only as the departure date.
- If the calendar service is temporarily unavailable, date selection remains
  possible and the next step performs the authoritative full-stay check.
- On desktop and mobile, the picker stays open after the departure date is
  selected. The **Done** button confirms the range and closes the picker.
- Hidden `checkin` and `checkout` fields use `YYYY-MM-DD`; submit opens the
  live offer page rather than calculating an indicative browser-side quote.

## Booking API boundary

The Nokumo integration is implemented in `worker/index.js`; browser code never
calls Nokumo directly. `assets/js/booking-api.js` is the shared same-origin
client. The only deliberately missing write operation is reservation creation.
Add it as a new server endpoint only after the final Nokumo payload, HOLD rules,
legal texts and idempotency strategy are approved.

## Performance notes

- No heavy framework.
- No client-side third-party booking JavaScript.
- Responsive WebP hero placeholders with an SVG fallback.
- Mobile-first CSS.
- Accessible skip link, semantic sections, keyboard-friendly modal date picker,
  labels and ARIA live booking states.
- Respects `prefers-reduced-motion`.

Before launch, replace SVG placeholders with optimized AVIF/WebP photos and keep hero image weight as low as possible.
