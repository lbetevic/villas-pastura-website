import { build } from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const client = resolve(dist, "client");
const server = resolve(dist, "server");

const presentation = JSON.parse(await readFile(resolve(root, "config/booking-presentation.json"), "utf8"));
const directOffer = presentation?.properties?.["25532"]?.offers?.pasturaDirect;
if (!directOffer) throw new Error("The Villas Pastura direct-booking presentation is missing.");
const configuredPerks = new Map([
  ...Object.entries(directOffer.serviceOverrides || {}).map(([id, value]) => [id, { id, labels: value.labels }]),
  ...(directOffer.additionalPerks || []).map((value) => [value.id, { id: value.id, labels: value.labels }]),
]);
const publicBenefits = {
  schemaVersion: 1,
  offerId: "pasturaDirect",
  offerLabels: directOffer.labels,
  items: (directOffer.perkOrder || []).map((id) => configuredPerks.get(id)).filter(Boolean),
};
await mkdir(resolve(root, "assets/data"), { recursive: true });
await writeFile(resolve(root, "assets/data/direct-booking-benefits.json"), `${JSON.stringify(publicBenefits, null, 2)}\n`);

const publicEntries = [
  "_headers",
  "favicon.ico",
  "index.html",
  "availability.html",
  "booking.html",
  "booking-terms.html",
  "gallery.html",
  "reviews.html",
  "faq.html",
  "privacy.html",
  "cookies.html",
  "faq-content.json",
  "gallery-manifest.json",
  "assets",
];

await rm(dist, { recursive: true, force: true });
await mkdir(client, { recursive: true });
await mkdir(server, { recursive: true });

for (const entry of publicEntries) {
  await cp(resolve(root, entry), resolve(client, entry), { recursive: true });
}

await build({
  entryPoints: [resolve(root, "worker/index.js")],
  outfile: resolve(server, "index.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  legalComments: "none",
  minify: false,
});

console.log(`Built Villas Pastura v1.25.0 to ${dist}`);
