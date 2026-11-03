import { access, readFile, readdir } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const required = [
  'index.html', 'availability.html', 'booking.html', 'booking-terms.html', 'reviews.html',
  'favicon.ico', 'assets/icons/favicon.svg', 'assets/icons/site.webmanifest',
  'worker/index.js', 'wrangler.jsonc', '.dev.vars.example',
  'config/booking-presentation.json', 'config/booking-presentation.schema.json',
  'migrations/0001_booking_checkout.sql',
  'assets/js/app.js', 'assets/js/availability.js', 'assets/js/booking.js',
];
for (const file of required) await access(join(root, file));

const forbidden = [
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\|[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i,
];
const ignoredDirectories = new Set(['node_modules', 'dist', '.git', '.wrangler', '.wrangler-dry-run']);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

const textExtensions = new Set(['.html', '.js', '.mjs', '.json', '.jsonc', '.md', '.css', '.txt', '.example']);
for (const file of await walk(root)) {
  if (!textExtensions.has(extname(file)) && !file.endsWith('.dev.vars.example')) continue;
  const contents = await readFile(file, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(contents)) throw new Error(`A development credential leaked into ${file}`);
  }
}

const worker = await readFile(join(root, 'worker/index.js'), 'utf8');
if (/CreateReservation/i.test(worker)) throw new Error('CreateReservation must remain absent from v1.22.0.');
if (!worker.includes('NOKUMO_API_KEY') || !worker.includes('QUOTE_SIGNING_SECRET')) throw new Error('Worker secret bindings are missing.');
if (!worker.includes('/booking-requests') || !worker.includes('/checkout-sessions')) throw new Error('Booking-request endpoints are missing.');

const app = await readFile(join(root, 'assets/js/app.js'), 'utf8');
if (!app.includes('while (daysGrid.children.length < 42)')) throw new Error('Calendar months must keep a fixed six-week grid.');
if (/querySelector\(['"]#quote-panel['"]\)/.test(app)) throw new Error('Legacy quote-panel access can break date confirmation.');
const homepage = await readFile(join(root, 'index.html'), 'utf8');
if (/date-picker-kicker|selection-hint|date-picker-toolbar/.test(homepage)) throw new Error('Redundant date-picker instructions remain in index.html.');
if (!homepage.includes('hero-title-mobile') || !homepage.includes('booking-progressive')) throw new Error('Mobile hero or progressive booking markup is missing.');
if (!homepage.includes('children0To11') || !homepage.includes('children12To17')) throw new Error('Guest age-band controls are missing.');
if (!homepage.includes('Each villa offers complete privacy')) throw new Error('Approved villa privacy statement is missing.');
if (!homepage.includes('<dd>8</dd>') || !homepage.includes('factBathrooms')) throw new Error('Correct capacity or ensuite-bathroom fact is missing.');
if (!homepage.includes('amenities-dialog') || !homepage.includes('poiDistancePlaceholder')) throw new Error('Amenities modal or POI placeholders are missing.');

const availabilityPage = await readFile(join(root, 'availability.html'), 'utf8');
const availabilityClient = await readFile(join(root, 'assets/js/availability.js'), 'utf8');
if (availabilityPage.includes('flow-kicker') || availabilityPage.includes('flow-intro')) throw new Error('Redundant availability-page heading copy remains.');
if (!availabilityClient.includes('perk-list') || !availabilityClient.includes('changeStayUrl')) throw new Error('Rate perks or change-stay flow is missing.');
if (/Live price checked just now|finalNote|verified/.test(availabilityClient)) throw new Error('Removed booking-review helper copy remains.');
if (!availabilityClient.includes("window.addEventListener('pageshow'") || !availabilityClient.includes("button.disabled = false")) throw new Error('BFCache booking-button recovery is missing.');
const datesPosition = availabilityClient.indexOf("<span>${t('dates')}</span>");
const nightsPosition = availabilityClient.indexOf("<span>${t('nights')}</span>");
const guestsPosition = availabilityClient.indexOf("<span>${t('guests')}</span>");
if (!(datesPosition >= 0 && datesPosition < nightsPosition && nightsPosition < guestsPosition)) throw new Error('Stay summary must render Stay dates, Nights, Guests.');
if (!app.includes('restoreBookingSelectionFromUrl')) throw new Error('Change-stay query restoration is missing.');

const bookingPage = await readFile(join(root, 'booking.html'), 'utf8');
const bookingClient = await readFile(join(root, 'assets/js/booking.js'), 'utf8');
if (/age-panel|guest-ages|requiresChildAges/.test(bookingPage + bookingClient + worker)) throw new Error('Exact child-age collection must remain removed.');
if (/id=["']review-panel["']|id=["']guest-review["']|id=["']edit-details["']|data-copy=["']reviewButton["']/.test(bookingPage + bookingClient)) throw new Error('The redundant final review step remains in checkout.');
if (!bookingPage.includes('id="submit-request"') || !bookingPage.includes('data-copy="confirmButton"')) throw new Error('Direct Send booking request action is missing.');

const presentation = JSON.parse(await readFile(join(root, 'config/booking-presentation.json'), 'utf8'));
const directOffer = presentation?.properties?.['25532']?.offers?.pasturaDirect;
if (presentation.schemaVersion !== 1 || !directOffer?.match?.specialOfferIds?.includes(3007) || !directOffer?.match?.ratePlanIds?.includes(3007) || !directOffer?.labels?.en || !directOffer?.serviceOverrides?.['4166']?.labels?.en) {
  throw new Error('Villas Pastura offer presentation configuration is invalid.');
}
if (!directOffer.additionalPerks?.some((perk) => perk.id === 'local:free-ev-charging' && perk.labels?.en)) {
  throw new Error('The local EV-charging perk is missing from booking presentation configuration.');
}
for (const id of ['4470', '4471', '4169', '4166']) {
  if (!directOffer.serviceOverrides?.[id]?.labels?.en) throw new Error(`Direct-booking perk ${id} is missing localized presentation labels.`);
}

const publicBenefits = JSON.parse(await readFile(join(root, 'assets/data/direct-booking-benefits.json'), 'utf8'));
if (publicBenefits.items?.length !== 5 || publicBenefits.items.map((item) => item.id).join(',') !== directOffer.perkOrder.join(',')) {
  throw new Error('Generated homepage direct-booking benefits do not match the offer presentation configuration.');
}
if (!homepage.includes('tel:+385957328532') || !homepage.includes('direct-perks-list') || !app.includes('Our best direct-booking terms.')) {
  throw new Error('Homepage direct-booking CRO content or call action is missing.');
}

const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
if (!packageJson.scripts.dev.includes('npm run db:local')) throw new Error('Local development must apply D1 migrations before Wrangler starts.');

for (const file of (await walk(root)).filter((path) => path.endsWith('.html'))) {
  const contents = await readFile(file, 'utf8');
  if (/(?:href|src)="assets\/(?:css|js)\/[^"]+\.(?:css|js)(?!\?v=\d+\.\d+\.\d+)/.test(contents)) {
    throw new Error(`Unversioned CSS or JavaScript asset remains in ${file}`);
  }
  if (!contents.includes('assets/icons/favicon.svg') || !contents.includes('favicon.ico')) {
    throw new Error(`Favicon links are missing from ${file}`);
  }
  if (contents.includes('+385 00 000 000') || contents.includes('tel:+385000000000')) {
    throw new Error(`Placeholder phone number remains in ${file}`);
  }
  for (const match of contents.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const reference = match[1].split('#')[0].split('?')[0];
    if (!reference || /^(?:https?:|mailto:|tel:|data:|\/)/.test(reference)) continue;
    await access(resolve(file, '..', reference));
  }
}

console.log('Validated v1.22.0 files, offer presentation, child age bands, Nokumo policy dates, D1 checkout routing, booking request, versioned assets, local links and credential hygiene.');
