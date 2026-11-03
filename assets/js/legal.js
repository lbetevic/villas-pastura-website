const common = {
  en: {
    navVilla: 'The villa', navGallery: 'Gallery', navReviews: 'Reviews', navLocation: 'Location',
    skip: 'Skip to legal information', menu: 'Open menu', language: 'Choose language',
    draft: 'Development notice', updated: 'Last updated: 17 September 2026',
    footerPrivacy: 'Privacy', footerCookies: 'Cookies', footerSettings: 'Cookie settings'
  },
  de: {
    navVilla: 'Die Villa', navGallery: 'Galerie', navReviews: 'Bewertungen', navLocation: 'Lage',
    skip: 'Zu den rechtlichen Informationen', menu: 'Menü öffnen', language: 'Sprache wählen',
    draft: 'Hinweis zur Entwicklungsversion', updated: 'Zuletzt aktualisiert: 17. September 2026',
    footerPrivacy: 'Datenschutz', footerCookies: 'Cookies', footerSettings: 'Cookie-Einstellungen'
  },
  hr: {
    navVilla: 'Vila', navGallery: 'Galerija', navReviews: 'Recenzije', navLocation: 'Lokacija',
    skip: 'Prijeđi na pravne informacije', menu: 'Otvori izbornik', language: 'Odaberi jezik',
    draft: 'Napomena za razvojnu verziju', updated: 'Posljednje ažuriranje: 17. rujna 2026.',
    footerPrivacy: 'Privatnost', footerCookies: 'Kolačići', footerSettings: 'Postavke kolačića'
  },
  it: {
    navVilla: 'La villa', navGallery: 'Galleria', navReviews: 'Recensioni', navLocation: 'Posizione',
    skip: 'Vai alle informazioni legali', menu: 'Apri menu', language: 'Scegli lingua',
    draft: 'Avviso per la versione di sviluppo', updated: 'Ultimo aggiornamento: 17 settembre 2026',
    footerPrivacy: 'Privacy', footerCookies: 'Cookie', footerSettings: 'Impostazioni cookie'
  }
};

const pages = {
  cookies: {
    en: {
      title: 'Cookie Policy | Villas Pastura', meta: 'How the Villas Pastura website uses necessary browser storage and manages optional consent.',
      kicker: 'Browser storage', heading: 'Cookie Policy', intro: 'This policy describes the storage this project actually uses and the optional technologies its consent controls can support.',
      status: 'No analytics, advertising or third-party embed ID is configured in v1.14. Accepting an optional category therefore sends no tracking request in this development version.',
      s1: 'Storage currently used', languageTitle: 'Language preference', languageText: 'The localStorage key “villa-lang” remembers the language selected by the visitor. It remains until browser storage is cleared.',
      consentTitle: 'Privacy choice', consentText: 'The localStorage key “vp_consent_v1” stores the three optional category choices, policy version, decision source and decision time. It expires after six months or when the policy version changes.',
      s2: 'Consent categories', necessaryTitle: 'Necessary', necessaryText: 'Language and consent storage keep the requested experience and remember the privacy choice. They do not activate behavioural measurement or advertising.',
      analyticsTitle: 'Analytics', analyticsText: 'Audience and website-performance measurement such as Google Analytics may be enabled only after analytics consent and only after a valid configuration is supplied.',
      marketingTitle: 'Marketing', marketingText: 'Advertising measurement such as Google Ads or Meta may be enabled only after marketing consent and valid configuration.',
      functionalTitle: 'Functional', functionalText: 'Optional external maps, video or chat may load only after functional consent. No such embed is present in v1.14.',
      s3: 'Default behaviour', behaviour: 'All optional categories default to denied. Optional tracking scripts are not requested before consent. Rejecting is available on the first layer, rejected events are not queued, and a saved choice is applied across the website.',
      s4: 'Change or withdraw your choice', change: 'Use the button below or “Cookie settings” in any page footer. Withdrawing consent updates future storage and tag behaviour; it does not affect processing already completed lawfully.',
      open: 'Open cookie settings', s5: 'Contact', contact: 'Questions about this policy can be sent to info@ventustravel.eu. The final production policy must identify the legal website operator and all configured providers.'
    },
    de: {
      title: 'Cookie-Richtlinie | Villas Pastura', meta: 'Notwendiger Browserspeicher und Verwaltung optionaler Einwilligungen auf der Villas-Pastura-Website.',
      kicker: 'Browserspeicher', heading: 'Cookie-Richtlinie', intro: 'Diese Richtlinie beschreibt die tatsächlich verwendete Speicherung und die optionalen Technologien, die die Einwilligungssteuerung unterstützen kann.',
      status: 'In v1.14 ist keine Analyse-, Werbe- oder Drittanbieter-ID konfiguriert. Die Zustimmung zu einer optionalen Kategorie sendet in dieser Entwicklungsversion daher keine Tracking-Anfrage.',
      s1: 'Derzeit verwendete Speicherung', languageTitle: 'Sprachauswahl', languageText: 'Der localStorage-Schlüssel „villa-lang“ merkt sich die gewählte Sprache, bis der Browserspeicher gelöscht wird.',
      consentTitle: 'Datenschutzauswahl', consentText: '„vp_consent_v1“ speichert optionale Kategorien, Richtlinienversion, Entscheidungsquelle und Zeitpunkt. Die Auswahl verfällt nach sechs Monaten oder bei Änderung der Richtlinienversion.',
      s2: 'Einwilligungskategorien', necessaryTitle: 'Notwendig', necessaryText: 'Sprache und Einwilligungsspeicher ermöglichen die gewünschte Nutzung und merken sich die Auswahl. Sie aktivieren weder Verhaltensmessung noch Werbung.',
      analyticsTitle: 'Analyse', analyticsText: 'Reichweiten- und Leistungsmessung wie Google Analytics darf erst nach Einwilligung und gültiger Konfiguration aktiviert werden.',
      marketingTitle: 'Marketing', marketingText: 'Werbemessung wie Google Ads oder Meta darf erst nach Marketing-Einwilligung und gültiger Konfiguration aktiviert werden.',
      functionalTitle: 'Funktional', functionalText: 'Optionale externe Karten, Videos oder Chats dürfen erst nach funktionaler Einwilligung laden. v1.14 enthält keine solche Einbettung.',
      s3: 'Standardverhalten', behaviour: 'Alle optionalen Kategorien sind standardmäßig abgelehnt. Vor der Einwilligung wird kein optionales Tracking-Skript angefordert. Ablehnen ist auf der ersten Ebene möglich und abgelehnte Ereignisse werden nicht gespeichert.',
      s4: 'Auswahl ändern oder widerrufen', change: 'Nutzen Sie die Schaltfläche unten oder „Cookie-Einstellungen“ in jeder Fußzeile. Der Widerruf ändert zukünftiges Verhalten, nicht bereits rechtmäßig erfolgte Verarbeitung.',
      open: 'Cookie-Einstellungen öffnen', s5: 'Kontakt', contact: 'Fragen bitte an info@ventustravel.eu. Vor Veröffentlichung müssen der rechtliche Betreiber und alle eingesetzten Anbieter ergänzt werden.'
    },
    hr: {
      title: 'Politika kolačića | Villas Pastura', meta: 'Kako web-stranica Villas Pastura koristi nužnu pohranu i upravlja neobveznim privolama.',
      kicker: 'Pohrana u pregledniku', heading: 'Politika kolačića', intro: 'Ova politika opisuje pohranu koju projekt stvarno koristi i neobvezne tehnologije koje sustav privole može podržati.',
      status: 'U v1.14 nije konfiguriran nijedan ID za analitiku, oglašavanje ili vanjski sadržaj. Prihvaćanje neobvezne kategorije zato u ovoj razvojnoj verziji ne šalje zahtjev za praćenje.',
      s1: 'Pohrana koja se trenutačno koristi', languageTitle: 'Odabir jezika', languageText: 'LocalStorage ključ „villa-lang“ pamti jezik koji je posjetitelj odabrao. Ostaje pohranjen dok se ne obrišu podaci preglednika.',
      consentTitle: 'Izbor privatnosti', consentText: 'LocalStorage ključ „vp_consent_v1“ pohranjuje izbore triju neobveznih kategorija, verziju politike, izvor i vrijeme odluke. Istječe nakon šest mjeseci ili promjene verzije politike.',
      s2: 'Kategorije privole', necessaryTitle: 'Nužni', necessaryText: 'Pohrana jezika i privole omogućuje traženo iskustvo te pamti izbor privatnosti. Ne aktivira bihevioralno mjerenje ni oglašavanje.',
      analyticsTitle: 'Analitički', analyticsText: 'Mjerenje posjećenosti i performansi, primjerice Google Analytics, može se uključiti tek nakon analitičke privole i unosa valjane konfiguracije.',
      marketingTitle: 'Marketinški', marketingText: 'Mjerenje oglašavanja, primjerice Google Ads ili Meta, može se uključiti tek nakon marketinške privole i valjane konfiguracije.',
      functionalTitle: 'Funkcionalni', functionalText: 'Neobvezne vanjske karte, video ili chat mogu se učitati tek nakon funkcionalne privole. U v1.14 nema takvih sadržaja.',
      s3: 'Zadano ponašanje', behaviour: 'Sve su neobvezne kategorije zadano odbijene. Prije privole ne traži se nijedna neobvezna tracking skripta. Odbijanje je dostupno u prvom sloju, odbijeni događaji ne čekaju naknadno slanje, a spremljeni izbor vrijedi na cijelom siteu.',
      s4: 'Promjena ili povlačenje izbora', change: 'Upotrijebite tipku ispod ili „Postavke kolačića“ u podnožju bilo koje stranice. Povlačenje mijenja buduće ponašanje pohrane i tagova, ali ne utječe na raniju zakonitu obradu.',
      open: 'Otvori postavke kolačića', s5: 'Kontakt', contact: 'Pitanja možete poslati na info@ventustravel.eu. Prije produkcije u konačnoj politici treba navesti pravnog operatora web-stranice i sve konfigurirane pružatelje usluga.'
    },
    it: {
      title: 'Cookie Policy | Villas Pastura', meta: 'Come il sito Villas Pastura usa la memoria necessaria del browser e gestisce i consensi facoltativi.',
      kicker: 'Memoria del browser', heading: 'Cookie Policy', intro: 'Questa informativa descrive la memoria realmente usata e le tecnologie facoltative supportate dai controlli del consenso.',
      status: 'Nella v1.14 non è configurato alcun ID analitico, pubblicitario o di contenuti esterni. Accettare una categoria facoltativa non invia quindi richieste di tracciamento.',
      s1: 'Memoria attualmente utilizzata', languageTitle: 'Preferenza linguistica', languageText: 'La chiave localStorage “villa-lang” ricorda la lingua selezionata fino alla cancellazione dei dati del browser.',
      consentTitle: 'Scelta sulla privacy', consentText: '“vp_consent_v1” memorizza le tre categorie facoltative, la versione della policy, la fonte e l’ora della decisione. Scade dopo sei mesi o al cambio di versione.',
      s2: 'Categorie di consenso', necessaryTitle: 'Necessari', necessaryText: 'Lingua e consenso mantengono l’esperienza richiesta e ricordano la scelta. Non attivano analisi comportamentali o pubblicità.',
      analyticsTitle: 'Analitici', analyticsText: 'Misurazioni come Google Analytics possono essere attivate solo dopo il consenso analitico e con una configurazione valida.',
      marketingTitle: 'Marketing', marketingText: 'Misurazioni come Google Ads o Meta possono essere attivate solo dopo il consenso marketing e con una configurazione valida.',
      functionalTitle: 'Funzionali', functionalText: 'Mappe, video o chat esterni possono caricarsi solo dopo il consenso funzionale. La v1.14 non contiene tali elementi.',
      s3: 'Comportamento predefinito', behaviour: 'Tutte le categorie facoltative sono negate per impostazione predefinita. Nessuno script di tracciamento facoltativo viene richiesto prima del consenso e gli eventi rifiutati non vengono accodati.',
      s4: 'Modificare o revocare la scelta', change: 'Usa il pulsante sotto o “Impostazioni cookie” nel piè di pagina. La revoca modifica il comportamento futuro e non incide sui trattamenti precedenti leciti.',
      open: 'Apri impostazioni cookie', s5: 'Contatto', contact: 'Scrivi a info@ventustravel.eu. Prima della pubblicazione vanno identificati l’operatore legale e tutti i fornitori configurati.'
    }
  },
  privacy: {
    en: {
      title: 'Privacy Policy Draft | Villas Pastura', meta: 'Development privacy information for the Villas Pastura direct-booking website.',
      kicker: 'Privacy', heading: 'Privacy Policy', intro: 'How this development version handles information during live availability searches, guest-detail review and direct contact.',
      status: 'Before production launch, replace this notice with the full legal name, address and contact details of the confirmed data controller and name the final hosting and booking processors.',
      s1: 'Controller and contact', controller: 'The final controller identity is awaiting confirmation. Privacy enquiries may currently be sent to info@ventustravel.eu.',
      s2: 'Availability and price search', quote: 'Stay dates, guest count and selected rate identifiers are sent through the website server to Nokumo to retrieve live availability, prices and booking conditions. The public browser never receives the Nokumo API credential. Search data contains no guest name or contact details.',
      s3: 'Guest details and booking', contactData: 'In v1.15, guest details entered on the booking page remain only in the current browser page for review. CreateReservation is deliberately disabled, so those details are not sent to Nokumo or stored by this prototype. Before reservations are enabled, this section must identify the lawful basis, required fields, booking processor, recipients and retention periods.',
      s4: 'Website delivery and security', logs: 'The final hosting provider may process technical request logs such as IP address, time, requested URL and browser information for delivery, security and abuse prevention. The provider and retention period must be added before launch.',
      s5: 'Optional measurement', optional: 'Analytics, marketing and functional third-party technologies default to blocked. They can be activated only for the chosen category and only when the site operator supplies a valid service configuration.',
      s6: 'Retention and recipients', retention: 'Personal data should be kept only for the period needed to answer an enquiry, administer a booking and comply with accounting, tax or other legal duties. The final policy must identify processors, international-transfer safeguards and concrete retention periods.',
      s7: 'Your rights', rights: 'Depending on the circumstances, you may request access, correction, deletion, restriction, portability or objection, and withdraw consent at any time. You may also complain to the Croatian Personal Data Protection Agency (AZOP).',
      s8: 'Cookie choices', choices: 'See the Cookie Policy for current browser storage and use Cookie settings to change optional consent.'
    },
    de: {
      title: 'Entwurf Datenschutzerklärung | Villas Pastura', meta: 'Datenschutzhinweise der Entwicklungsversion für die Villas-Pastura-Website.',
      kicker: 'Datenschutz', heading: 'Datenschutzerklärung', intro: 'Umgang dieser Entwicklungsversion mit Informationen bei Live-Verfügbarkeitssuchen, Gästedatenprüfung und Kontaktaufnahme.',
      status: 'Vor Veröffentlichung müssen vollständiger Name, Anschrift und Kontaktdaten des bestätigten Verantwortlichen sowie Hosting- und Buchungsdienstleister ergänzt werden.',
      s1: 'Verantwortlicher und Kontakt', controller: 'Die endgültige Identität des Verantwortlichen ist noch zu bestätigen. Anfragen derzeit an info@ventustravel.eu.',
      s2: 'Verfügbarkeit und Preissuche', quote: 'Reisedaten, Gästezahl und Tarifkennungen werden über den Website-Server an Nokumo gesendet, um Live-Verfügbarkeit, Preise und Bedingungen abzurufen. Der Browser erhält niemals den Nokumo-API-Schlüssel. Die Suche enthält keine Namen oder Kontaktdaten.',
      s3: 'Gästedaten und Buchung', contactData: 'In v1.15 bleiben eingegebene Gästedaten nur zur Prüfung in der aktuellen Browserseite. CreateReservation ist absichtlich deaktiviert; die Daten werden weder an Nokumo gesendet noch gespeichert. Vor Aktivierung sind Rechtsgrundlage, Pflichtfelder, Auftragsverarbeiter, Empfänger und Fristen zu ergänzen.',
      s4: 'Bereitstellung und Sicherheit', logs: 'Der endgültige Hosting-Anbieter kann technische Protokolle wie IP-Adresse, Zeit, URL und Browserdaten für Auslieferung und Sicherheit verarbeiten. Anbieter und Aufbewahrungsfrist sind vor dem Start zu ergänzen.',
      s5: 'Optionale Messung', optional: 'Analyse-, Marketing- und funktionale Dritttechnologien sind standardmäßig blockiert und dürfen nur nach Auswahl der Kategorie und gültiger Konfiguration aktiviert werden.',
      s6: 'Aufbewahrung und Empfänger', retention: 'Daten sollen nur so lange gespeichert werden, wie es für Anfrage, Buchung und gesetzliche Pflichten nötig ist. Die endgültige Fassung muss Auftragsverarbeiter, Transfersicherungen und Fristen nennen.',
      s7: 'Ihre Rechte', rights: 'Je nach Umständen bestehen Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Übertragbarkeit oder Widerspruch sowie Widerruf einer Einwilligung. Beschwerden sind bei der kroatischen Datenschutzbehörde AZOP möglich.',
      s8: 'Cookie-Auswahl', choices: 'Die Cookie-Richtlinie beschreibt die aktuelle Speicherung. Über Cookie-Einstellungen lässt sich die optionale Einwilligung ändern.'
    },
    hr: {
      title: 'Nacrt politike privatnosti | Villas Pastura', meta: 'Razvojne informacije o privatnosti za web-stranicu direktne rezervacije Villas Pastura.',
      kicker: 'Privatnost', heading: 'Politika privatnosti', intro: 'Kako ova razvojna verzija postupa s informacijama tijekom live pretrage raspoloživosti, pregleda podataka gosta i izravnog kontakta.',
      status: 'Prije produkcije ovu napomenu treba zamijeniti punim pravnim nazivom, adresom i kontaktom potvrđenog voditelja obrade te navesti konačne pružatelje hostinga i booking obrade.',
      s1: 'Voditelj obrade i kontakt', controller: 'Konačni identitet voditelja obrade još treba potvrditi. Upite o privatnosti trenutačno možete poslati na info@ventustravel.eu.',
      s2: 'Pretraga raspoloživosti i cijene', quote: 'Datumi boravka, broj gostiju i oznake odabrane cijene šalju se kroz poslužitelj web-stranice prema Nokumu radi dohvata live raspoloživosti, cijena i uvjeta. Javni preglednik nikada ne dobiva Nokumo API ključ. Pretraga ne sadrži ime ni kontakt gosta.',
      s3: 'Podaci gosta i rezervacija', contactData: 'U v1.15 podaci gosta uneseni na booking stranici ostaju samo u trenutačnoj stranici preglednika radi pregleda. CreateReservation je namjerno isključen pa se podaci ne šalju Nokumu niti ih prototip pohranjuje. Prije uključivanja rezervacija treba navesti pravnu osnovu, obvezna polja, izvršitelja obrade, primatelje i rokove čuvanja.',
      s4: 'Isporuka i sigurnost web-stranice', logs: 'Konačni hosting provider može obrađivati tehničke zapise poput IP adrese, vremena, URL-a i podataka o pregledniku radi isporuke, sigurnosti i sprečavanja zlouporabe. Provider i rok čuvanja moraju se dodati prije produkcije.',
      s5: 'Neobvezno mjerenje', optional: 'Analitičke, marketinške i funkcionalne tehnologije trećih strana zadano su blokirane. Mogu se aktivirati samo za odabranu kategoriju i nakon unosa valjane konfiguracije.',
      s6: 'Čuvanje i primatelji', retention: 'Osobne podatke treba čuvati samo koliko je potrebno za odgovor, administriranje rezervacije te računovodstvene, porezne ili druge pravne obveze. Konačna politika mora navesti izvršitelje obrade, zaštitu međunarodnih prijenosa i konkretne rokove.',
      s7: 'Vaša prava', rights: 'Ovisno o okolnostima možete tražiti pristup, ispravak, brisanje, ograničenje, prenosivost ili uložiti prigovor te povući privolu. Možete se obratiti i Agenciji za zaštitu osobnih podataka (AZOP).',
      s8: 'Izbor kolačića', choices: 'Politika kolačića opisuje trenutačnu pohranu, a Postavke kolačića omogućuju promjenu neobvezne privole.'
    },
    it: {
      title: 'Bozza informativa privacy | Villas Pastura', meta: 'Informazioni privacy di sviluppo per il sito di prenotazione diretta Villas Pastura.',
      kicker: 'Privacy', heading: 'Informativa sulla privacy', intro: 'Come questa versione gestisce le informazioni durante la ricerca live, il riepilogo dei dati ospite e il contatto diretto.',
      status: 'Prima della pubblicazione vanno inseriti nome legale, indirizzo e contatti del titolare confermato, oltre ai fornitori finali di hosting e prenotazione.',
      s1: 'Titolare e contatto', controller: 'L’identità definitiva del titolare è in attesa di conferma. Le richieste possono essere inviate a info@ventustravel.eu.',
      s2: 'Ricerca disponibilità e prezzi', quote: 'Date, numero di ospiti e identificativi della tariffa vengono inviati tramite il server del sito a Nokumo per ottenere disponibilità, prezzi e condizioni live. Il browser non riceve mai la chiave API Nokumo. La ricerca non contiene nome o contatti dell’ospite.',
      s3: 'Dati ospite e prenotazione', contactData: 'Nella v1.15 i dati inseriti restano soltanto nella pagina corrente del browser per il riepilogo. CreateReservation è disattivato, quindi i dati non vengono inviati a Nokumo né salvati. Prima dell’attivazione vanno indicati base giuridica, campi obbligatori, responsabili, destinatari e tempi di conservazione.',
      s4: 'Erogazione e sicurezza', logs: 'Il fornitore hosting finale può elaborare log tecnici come IP, ora, URL e browser per erogazione e sicurezza. Fornitore e periodo di conservazione vanno aggiunti prima del lancio.',
      s5: 'Misurazione facoltativa', optional: 'Tecnologie analitiche, marketing e funzionali di terzi sono bloccate per impostazione predefinita e attivabili solo dopo la scelta e una configurazione valida.',
      s6: 'Conservazione e destinatari', retention: 'I dati vanno conservati solo quanto necessario per richiesta, prenotazione e obblighi legali. La versione finale deve indicare responsabili, garanzie dei trasferimenti e tempi concreti.',
      s7: 'I tuoi diritti', rights: 'Secondo le circostanze puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità o opposizione e revocare il consenso. Puoi anche rivolgerti all’autorità croata AZOP.',
      s8: 'Scelte cookie', choices: 'La Cookie Policy descrive la memoria attuale; usa Impostazioni cookie per modificare il consenso facoltativo.'
    }
  }
};

const page = document.body.dataset.legalPage;
const languageSelect = document.querySelector('#language-select');
const menuToggle = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-nav]');
const metaDescription = document.querySelector('meta[name="description"]');
let language = localStorage.getItem('villa-lang') || 'en';
if (!common[language]) language = 'en';

function applyLanguage(nextLanguage) {
  const dictionary = { ...common[nextLanguage], ...pages[page][nextLanguage] };
  document.documentElement.lang = nextLanguage;
  document.title = dictionary.title;
  metaDescription?.setAttribute('content', dictionary.meta);
  document.querySelectorAll('[data-legal]').forEach((element) => {
    const value = dictionary[element.dataset.legal];
    if (value) element.textContent = value;
  });
  document.querySelector('.skip-link').textContent = dictionary.skip;
  menuToggle?.querySelector('.sr-only')?.replaceChildren(dictionary.menu);
  languageSelect?.setAttribute('aria-label', dictionary.language);
  languageSelect?.closest('label')?.querySelector('.sr-only')?.replaceChildren(dictionary.language);
}

document.querySelector('#year').textContent = new Date().getFullYear();
languageSelect.value = language;
applyLanguage(language);

menuToggle?.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

navigation?.addEventListener('click', (event) => {
  if (!event.target.closest('a')) return;
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
});

languageSelect?.addEventListener('change', (event) => {
  language = event.target.value;
  localStorage.setItem('villa-lang', language);
  applyLanguage(language);
});
