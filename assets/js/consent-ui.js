const consentCopy = {
  en: {
    closeReject: 'Close and reject optional cookies', title: 'Your privacy choices',
    description: 'Necessary browser storage remembers your language and privacy choice. Analytics, marketing and optional embeds stay blocked unless you allow them.',
    cookies: 'Cookie Policy', privacy: 'Privacy Policy', accept: 'Accept all', reject: 'Reject optional', customize: 'Customise',
    settings: 'Cookie settings', settingsNote: 'Change or withdraw your choice at any time.', closeSettings: 'Close cookie settings',
    necessary: 'Necessary', necessaryText: 'Stores your privacy decision and chosen language. These functions do not activate advertising or behavioural analytics.', always: 'Always on',
    analytics: 'Analytics', analyticsText: 'Audience and performance measurement such as GA4. No analytics service is configured in this project version.',
    marketing: 'Marketing', marketingText: 'Advertising measurement such as Google Ads or Meta. Blocked by default and currently not configured.',
    functional: 'Functional', functionalText: 'Optional third-party maps, video or chat. This project version does not load any such embed.',
    save: 'Save my choices'
  },
  de: {
    closeReject: 'Schließen und optionale Cookies ablehnen', title: 'Ihre Datenschutzauswahl',
    description: 'Notwendiger Browserspeicher merkt sich Sprache und Datenschutzauswahl. Analyse, Marketing und optionale Einbettungen bleiben ohne Einwilligung blockiert.',
    cookies: 'Cookie-Richtlinie', privacy: 'Datenschutzerklärung', accept: 'Alle akzeptieren', reject: 'Optionale ablehnen', customize: 'Anpassen',
    settings: 'Cookie-Einstellungen', settingsNote: 'Sie können Ihre Auswahl jederzeit ändern oder widerrufen.', closeSettings: 'Cookie-Einstellungen schließen',
    necessary: 'Notwendig', necessaryText: 'Speichert Ihre Datenschutzauswahl und Sprache. Dadurch werden weder Werbung noch Verhaltensanalysen aktiviert.', always: 'Immer aktiv',
    analytics: 'Analyse', analyticsText: 'Reichweiten- und Leistungsmessung wie GA4. In dieser Projektversion ist kein Analysedienst konfiguriert.',
    marketing: 'Marketing', marketingText: 'Werbemessung wie Google Ads oder Meta. Standardmäßig blockiert und derzeit nicht konfiguriert.',
    functional: 'Funktional', functionalText: 'Optionale Karten, Videos oder Chats von Drittanbietern. Diese Projektversion lädt keine solche Einbettung.',
    save: 'Auswahl speichern'
  },
  hr: {
    closeReject: 'Zatvori i odbij neobvezne kolačiće', title: 'Vaše postavke privatnosti',
    description: 'Nužna pohrana u pregledniku pamti odabrani jezik i postavke privatnosti. Analitika, marketing i neobvezni vanjski sadržaji ostaju blokirani dok ih ne dopustite.',
    cookies: 'Politika kolačića', privacy: 'Politika privatnosti', accept: 'Prihvati sve', reject: 'Odbij neobvezne', customize: 'Prilagodi',
    settings: 'Postavke kolačića', settingsNote: 'Izbor možete promijeniti ili povući u svakom trenutku.', closeSettings: 'Zatvori postavke kolačića',
    necessary: 'Nužni', necessaryText: 'Pohranjuju vaš izbor privatnosti i jezika. Ne aktiviraju oglašavanje ni bihevioralnu analitiku.', always: 'Uvijek aktivni',
    analytics: 'Analitički', analyticsText: 'Mjerenje posjećenosti i performansi, primjerice GA4. U ovoj verziji projekta nije konfigurirana nijedna analitička usluga.',
    marketing: 'Marketinški', marketingText: 'Mjerenje oglašavanja, primjerice Google Ads ili Meta. Zadano je blokirano i trenutačno nije konfigurirano.',
    functional: 'Funkcionalni', functionalText: 'Neobvezne vanjske karte, video ili chat. Ova verzija projekta ne učitava takve sadržaje.',
    save: 'Spremi moj izbor'
  },
  it: {
    closeReject: 'Chiudi e rifiuta i cookie facoltativi', title: 'Le tue scelte sulla privacy',
    description: 'La memoria necessaria del browser ricorda lingua e scelta sulla privacy. Analisi, marketing e contenuti esterni facoltativi restano bloccati senza consenso.',
    cookies: 'Cookie Policy', privacy: 'Informativa sulla privacy', accept: 'Accetta tutto', reject: 'Rifiuta facoltativi', customize: 'Personalizza',
    settings: 'Impostazioni cookie', settingsNote: 'Puoi modificare o revocare la scelta in qualsiasi momento.', closeSettings: 'Chiudi impostazioni cookie',
    necessary: 'Necessari', necessaryText: 'Memorizzano la scelta sulla privacy e la lingua. Non attivano pubblicità né analisi comportamentale.', always: 'Sempre attivi',
    analytics: 'Analitici', analyticsText: 'Misurazione del pubblico e delle prestazioni, come GA4. In questa versione non è configurato alcun servizio analitico.',
    marketing: 'Marketing', marketingText: 'Misurazione pubblicitaria, come Google Ads o Meta. Bloccata per impostazione predefinita e non configurata.',
    functional: 'Funzionali', functionalText: 'Mappe, video o chat di terze parti facoltativi. Questa versione non carica tali contenuti.',
    save: 'Salva le mie scelte'
  }
};

function currentLanguage() {
  let language = document.documentElement.lang?.toLowerCase().split('-')[0];
  try {
    const storedLanguage = localStorage.getItem('villa-lang');
    if (consentCopy[storedLanguage]) language = storedLanguage;
  } catch {}
  return consentCopy[language] ? language : 'en';
}

function updateConsentUi() {
  const copy = consentCopy[currentLanguage()];
  document.querySelectorAll('[data-consent-copy]').forEach((element) => {
    const value = copy[element.dataset.consentCopy];
    if (value) element.textContent = value;
  });
  document.querySelector('[data-banner-close]')?.setAttribute('aria-label', copy.closeReject);
  document.querySelector('[data-dialog-close]')?.setAttribute('aria-label', copy.closeSettings);
  document.querySelectorAll('[data-consent-footer]').forEach((element) => {
    const key = element.dataset.consentFooter;
    const value = key === 'settings' ? copy.settings : copy[key];
    if (value) element.textContent = value;
  });
}

export function ensureConsentUi() {
  if (document.querySelector('[data-consent-banner]')) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <aside class="consent-banner" aria-labelledby="consent-title" aria-live="polite" data-consent-banner hidden>
      <button class="consent-close" type="button" data-banner-close>×</button>
      <h2 id="consent-title" data-consent-copy="title"></h2>
      <p><span data-consent-copy="description"></span> <a href="cookies.html" data-consent-copy="cookies"></a> · <a href="privacy.html" data-consent-copy="privacy"></a>.</p>
      <div class="consent-actions">
        <button class="consent-button" type="button" data-consent-accept-all data-consent-copy="accept"></button>
        <button class="consent-button" type="button" data-consent-reject-all data-consent-copy="reject"></button>
        <button class="consent-button consent-button-secondary" type="button" data-consent-customize data-consent-copy="customize"></button>
      </div>
    </aside>
    <dialog class="consent-dialog" aria-labelledby="consent-settings-title" data-consent-settings>
      <div class="consent-dialog-shell">
        <header class="consent-dialog-heading">
          <div><h2 id="consent-settings-title" data-consent-copy="settings"></h2><p data-consent-copy="settingsNote"></p></div>
          <button class="consent-dialog-close" type="button" data-dialog-close>×</button>
        </header>
        <div class="consent-option"><div><strong data-consent-copy="necessary"></strong><p data-consent-copy="necessaryText"></p></div><span class="consent-always" data-consent-copy="always"></span></div>
        <label class="consent-option"><span><strong data-consent-copy="analytics"></strong><span data-consent-copy="analyticsText"></span></span><input type="checkbox" name="consent-analytics" /></label>
        <label class="consent-option"><span><strong data-consent-copy="marketing"></strong><span data-consent-copy="marketingText"></span></span><input type="checkbox" name="consent-marketing" /></label>
        <label class="consent-option"><span><strong data-consent-copy="functional"></strong><span data-consent-copy="functionalText"></span></span><input type="checkbox" name="consent-functional" /></label>
        <footer class="consent-dialog-actions">
          <button class="consent-button" type="button" data-consent-save data-consent-copy="save"></button>
          <button class="consent-button" type="button" data-consent-reject-all data-consent-copy="reject"></button>
        </footer>
      </div>
    </dialog>`;

  document.body.append(...wrapper.children);
  updateConsentUi();

  new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.attributeName === 'lang')) updateConsentUi();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
}
