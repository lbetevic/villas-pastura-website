import { ensureConsentUi } from './consent-ui.js?v=1.16.2';
import { initializeConsent } from './consent.js?v=1.16.2';
import { initializeAnalytics } from './analytics.js?v=1.16.2';

ensureConsentUi();
initializeAnalytics();
initializeConsent();
