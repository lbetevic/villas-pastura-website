export const BOOKING_API = '/api/v1';

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${BOOKING_API}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    // The caller receives a stable error even if the upstream response is not JSON.
  }
  if (!response.ok) {
    const error = new Error(data.error || 'BOOKING_SERVICE_UNAVAILABLE');
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
}

export function formatMoney(value, currencyCode = 'EUR', language = 'en') {
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: Number(value) % 1 === 0 ? 0 : 2,
  }).format(Number(value || 0));
}

export function formatDate(value, language = 'en', options = {}) {
  const datePart = String(value ?? '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return '—';
  const date = new Date(`${datePart}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
    ...options,
  }).format(date);
}

export function currentLanguage() {
  const stored = localStorage.getItem('villa-lang');
  return ['en', 'de', 'hr', 'it'].includes(stored) ? stored : 'en';
}

export function setLanguage(language) {
  const next = ['en', 'de', 'hr', 'it'].includes(language) ? language : 'en';
  localStorage.setItem('villa-lang', next);
  document.documentElement.lang = next;
  return next;
}

export function differenceInNights(arrival, departure) {
  return Math.round((new Date(`${departure}T00:00:00Z`) - new Date(`${arrival}T00:00:00Z`)) / 86_400_000);
}
