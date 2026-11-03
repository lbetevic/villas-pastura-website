export const PRIVACY_CONFIG = Object.freeze({
  consentStorageKey: 'vp_consent_v1',
  consentPolicyVersion: '2026-09-v1',
  consentMaxAgeDays: 183,

  // Optional tracking stays completely disabled while this is blank.
  // Before adding an ID, configure every GTM tag with the matching built-in
  // consent requirement (analytics_storage or ad_storage/ad_user_data).
  gtmContainerId: '',
  taggingServerUrl: ''
});
