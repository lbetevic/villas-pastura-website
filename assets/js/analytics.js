import { PRIVACY_CONFIG } from './privacy-config.js?v=1.16.2';
import { getConsent, onConsentChange } from './consent.js?v=1.16.2';

let gtmLoaded = false;

window.dataLayer = window.dataLayer || [];

function gtag() {
  window.dataLayer.push(arguments);
}

function validGtmId(value) {
  return /^GTM-[A-Z0-9]+$/.test(value || '');
}

function taggingBaseUrl() {
  if (!PRIVACY_CONFIG.taggingServerUrl) return 'https://www.googletagmanager.com';
  try {
    const url = new URL(PRIVACY_CONFIG.taggingServerUrl);
    return url.protocol === 'https:' ? url.href.replace(/\/$/, '') : null;
  } catch {
    return null;
  }
}

function loadGtm() {
  if (gtmLoaded || !validGtmId(PRIVACY_CONFIG.gtmContainerId)) return;
  const endpoint = taggingBaseUrl();
  if (!endpoint) return;

  gtmLoaded = true;
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.async = true;
  script.src = `${endpoint}/gtm.js?id=${encodeURIComponent(PRIVACY_CONFIG.gtmContainerId)}`;
  script.dataset.optionalTracking = 'gtm';
  document.head.append(script);
}

function applyConsent(consent) {
  gtag('consent', 'update', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: consent.marketing ? 'granted' : 'denied',
    ad_user_data: consent.marketing ? 'granted' : 'denied',
    ad_personalization: consent.marketing ? 'granted' : 'denied',
    functionality_storage: consent.functional ? 'granted' : 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted'
  });

  if (consent.analytics || consent.marketing) loadGtm();
}

export function pushAnalyticsEvent(name, parameters = {}) {
  if (!getConsent().analytics) return false;
  window.dataLayer.push({ event: name, ...parameters });
  return true;
}

export function initializeAnalytics() {
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500
  });

  applyConsent(getConsent());
  onConsentChange(applyConsent);
}
