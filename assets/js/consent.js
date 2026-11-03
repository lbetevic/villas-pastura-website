import { PRIVACY_CONFIG } from './privacy-config.js?v=1.16.2';

const MAX_AGE_MS = PRIVACY_CONFIG.consentMaxAgeDays * 24 * 60 * 60 * 1000;
const listeners = new Set();

const defaultConsent = Object.freeze({
  analytics: false,
  marketing: false,
  functional: false,
  policyVersion: PRIVACY_CONFIG.consentPolicyVersion,
  decidedAt: null,
  source: null
});

function loadConsent() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PRIVACY_CONFIG.consentStorageKey) || 'null');
    const decisionTime = Date.parse(parsed?.decidedAt || '');
    const isCurrent = parsed?.policyVersion === PRIVACY_CONFIG.consentPolicyVersion;
    const isFresh = Number.isFinite(decisionTime) && Date.now() - decisionTime < MAX_AGE_MS;

    if (isCurrent && isFresh) {
      return {
        analytics: parsed.analytics === true,
        marketing: parsed.marketing === true,
        functional: parsed.functional === true,
        policyVersion: parsed.policyVersion,
        decidedAt: parsed.decidedAt,
        source: typeof parsed.source === 'string' ? parsed.source : null
      };
    }
  } catch {}

  return { ...defaultConsent };
}

let currentConsent = loadConsent();

function saveConsent(next, source) {
  currentConsent = {
    analytics: next.analytics === true,
    marketing: next.marketing === true,
    functional: next.functional === true,
    policyVersion: PRIVACY_CONFIG.consentPolicyVersion,
    decidedAt: new Date().toISOString(),
    source
  };

  try {
    localStorage.setItem(PRIVACY_CONFIG.consentStorageKey, JSON.stringify(currentConsent));
  } catch {}

  document.documentElement.dataset.consentDecided = 'true';
  listeners.forEach((listener) => listener(getConsent()));
}

export function getConsent() {
  return { ...currentConsent };
}

export function onConsentChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setVisible(element, visible) {
  if (element) element.hidden = !visible;
}

export function initializeConsent() {
  const banner = document.querySelector('[data-consent-banner]');
  const settings = document.querySelector('[data-consent-settings]');
  const analytics = settings?.querySelector('[name="consent-analytics"]');
  const marketing = settings?.querySelector('[name="consent-marketing"]');
  const functional = settings?.querySelector('[name="consent-functional"]');

  if (currentConsent.decidedAt) document.documentElement.dataset.consentDecided = 'true';
  setVisible(banner, !currentConsent.decidedAt);

  function closeSettings() {
    if (settings?.open) settings.close();
  }

  function decide(next, source) {
    saveConsent(next, source);
    setVisible(banner, false);
    closeSettings();
  }

  document.querySelectorAll('[data-consent-accept-all]').forEach((button) => {
    button.addEventListener('click', () => {
      decide({ analytics: true, marketing: true, functional: true }, 'accept_all');
    });
  });

  document.querySelectorAll('[data-consent-reject-all]').forEach((button) => {
    button.addEventListener('click', () => {
      decide({ analytics: false, marketing: false, functional: false }, 'reject_all');
    });
  });

  document.querySelectorAll('[data-consent-customize]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!settings || !analytics || !marketing || !functional) return;
      analytics.checked = currentConsent.analytics;
      marketing.checked = currentConsent.marketing;
      functional.checked = currentConsent.functional;
      settings.showModal();
    });
  });

  settings?.querySelector('[data-consent-save]')?.addEventListener('click', () => {
    decide({
      analytics: analytics?.checked,
      marketing: marketing?.checked,
      functional: functional?.checked
    }, 'custom');
  });

  settings?.querySelector('[data-dialog-close]')?.addEventListener('click', closeSettings);
  settings?.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeSettings();
  });

  banner?.querySelector('[data-banner-close]')?.addEventListener('click', () => {
    decide({ analytics: false, marketing: false, functional: false }, 'closed_as_reject');
  });
}
