import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDate } from '../assets/js/booking-api.js';

test('formats Nokumo policy timestamps and date-only stay values', () => {
  assert.match(formatDate('2027-03-24T00:00:00', 'en'), /Mar 24, 2027/);
  assert.match(formatDate('2027-05-23', 'en'), /May 23, 2027/);
  assert.equal(formatDate(null, 'en'), '—');
  assert.equal(formatDate('not-a-date', 'en'), '—');
});
