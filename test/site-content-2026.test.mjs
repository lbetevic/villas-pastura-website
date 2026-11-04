import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('homepage location preview is first-party and opens the approved Google Maps coordinates', async () => {
  const html = await read('index.html');
  assert.match(html, /assets\/img\/villas-pastura-map-preview\.svg/);
  assert.match(html, /44\.5876799%2C14\.8505757/);
  assert.doesNotMatch(html, /maps\.googleapis\.com\/maps\/api\/js/);
});

test('homepage features three POIs and preserves the full guide in an accessible dialog', async () => {
  const html = await read('index.html');
  assert.match(html, /id="poi-preview"/);
  assert.match(html, /id="poi-dialog"/);
  assert.match(html, /data-poi-open/);
  assert.match(html, /data-poi-close/);
  assert.match(html, /id="poi-grid"/);
  assert.ok(html.indexOf('id="poi-preview"') > html.indexOf('id="faq"'), 'POI section follows FAQ');
  const js = await read('assets/js/app.js');
  for (const id of ['beach-terra', 'novalja-centre', 'zadar-airport']) assert.ok(js.includes(id));
  for (const lang of ['en', 'de', 'hr', 'it']) assert.ok(js.includes('Object.assign(translations.' + lang));
});

test('Ventus attribution and separate WhatsApp number are present on all applicable pages', async () => {
  const pages = ['index.html', 'faq.html', 'gallery.html', 'reviews.html', 'privacy.html', 'cookies.html', 'availability.html', 'booking.html'];
  for (const path of pages) {
    const html = await read(path);
    assert.match(html, /wa\.me\/385916081364/);
    assert.match(html, /ventus\.travel\.novalja/);
    assert.match(html, /facebook\.com\/ventustravelnovalja/);
  }
  const styles = await read('assets/css/contact-widgets.css');
  assert.match(styles, /max-width: 699px/);
  assert.match(styles, /\.wa-chat-label \{ display: none; \}/);
});

test('GTM specification exists but Google tags are not installed by this iteration', async () => {
  const spec = await read('docs/gtm-tracking-spec.md');
  assert.match(spec, /Consent Mode v2/);
  assert.match(spec, /vp_booking_request_result/);
  assert.match(spec, /purchase/);
  const html = await read('index.html');
  assert.doesNotMatch(html, /googletagmanager\.com\/gtm\.js/);
});
