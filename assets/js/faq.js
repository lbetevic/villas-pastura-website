const faqTranslations = {
  en: {
    navVilla: 'The villa', navGallery: 'Gallery', navReviews: 'Reviews', navLocation: 'Location',
    faqKicker: 'Official Villas Pastura information', faqHeading: 'Questions answered by your hosts in Novalja.',
    faqIntro: 'Practical answers about booking, the villa, arrival and local life on Pag.',
    prototypeBadge: 'Content prototype', prototypeTitle: 'Layout and interactions are ready for testing.',
    prototypeCopy: 'Questions and answers are placeholders. This page is excluded from search indexing until the final content is reviewed.',
    sourceLabel: 'Source', sourceValue: 'Official Villas Pastura website', reviewLabel: 'Final review', reviewValue: 'Owners and local host team', updatedLabel: 'Prototype updated',
    ctaKicker: 'Your stay', ctaTitle: 'Ready to check your dates?', ctaCopy: 'Return to the villa page for live availability, complete prices and conditions.', ctaButton: 'Check availability',
    pageTitle: 'FAQ Prototype | Villas Pastura Novalja', metaDescription: 'Prototype frequently asked questions page for Villas Pastura in Novalja.',
    skipLink: 'Skip to questions', menuLabel: 'Open menu', languageLabel: 'Choose language'
  },
  de: {
    navVilla: 'Die Villa', navGallery: 'Galerie', navReviews: 'Bewertungen', navLocation: 'Lage',
    faqKicker: 'Offizielle Informationen der Villas Pastura', faqHeading: 'Fragen, beantwortet von Ihren Gastgebern in Novalja.',
    faqIntro: 'Praktische Antworten zu Buchung, Villa, Anreise und dem Leben auf Pag.',
    prototypeBadge: 'Inhaltsprototyp', prototypeTitle: 'Layout und Interaktionen können getestet werden.',
    prototypeCopy: 'Fragen und Antworten sind Platzhalter. Diese Seite bleibt von der Indexierung ausgeschlossen, bis alle Inhalte geprüft sind.',
    sourceLabel: 'Quelle', sourceValue: 'Offizielle Website der Villas Pastura', reviewLabel: 'Endprüfung', reviewValue: 'Eigentümer und lokales Gastgeberteam', updatedLabel: 'Prototyp aktualisiert',
    ctaKicker: 'Ihr Aufenthalt', ctaTitle: 'Möchten Sie Ihre Daten prüfen?', ctaCopy: 'Zur Villa-Seite für Live-Verfügbarkeit, Gesamtpreise und Bedingungen.', ctaButton: 'Verfügbarkeit prüfen',
    pageTitle: 'FAQ-Prototyp | Villas Pastura Novalja', metaDescription: 'Prototyp der häufig gestellten Fragen für Villas Pastura in Novalja.',
    skipLink: 'Zu den Fragen springen', menuLabel: 'Menü öffnen', languageLabel: 'Sprache wählen'
  },
  hr: {
    navVilla: 'Vila', navGallery: 'Galerija', navReviews: 'Recenzije', navLocation: 'Lokacija',
    faqKicker: 'Službene informacije Villas Pastura', faqHeading: 'Pitanja na koja odgovaraju vaši domaćini u Novalji.',
    faqIntro: 'Praktični odgovori o rezervaciji, vili, dolasku i lokalnom životu na Pagu.',
    prototypeBadge: 'Prototip sadržaja', prototypeTitle: 'Layout i interakcije spremni su za testiranje.',
    prototypeCopy: 'Pitanja i odgovori privremeni su. Stranica je isključena iz indeksiranja dok se ne provjeri konačni sadržaj.',
    sourceLabel: 'Izvor', sourceValue: 'Službena web-stranica Villas Pastura', reviewLabel: 'Konačna provjera', reviewValue: 'Vlasnici i lokalni host tim', updatedLabel: 'Prototip ažuriran',
    ctaKicker: 'Vaš boravak', ctaTitle: 'Spremni za provjeru datuma?', ctaCopy: 'Vratite se na stranicu vile za live raspoloživost, potpune cijene i uvjete.', ctaButton: 'Provjeri raspoloživost',
    pageTitle: 'FAQ prototip | Villas Pastura Novalja', metaDescription: 'Prototip često postavljanih pitanja za Villas Pastura u Novalji.',
    skipLink: 'Prijeđi na pitanja', menuLabel: 'Otvori izbornik', languageLabel: 'Odaberi jezik'
  },
  it: {
    navVilla: 'La villa', navGallery: 'Galleria', navReviews: 'Recensioni', navLocation: 'Posizione',
    faqKicker: 'Informazioni ufficiali Villas Pastura', faqHeading: 'Domande con risposte dei vostri host a Novalja.',
    faqIntro: 'Risposte pratiche su prenotazione, villa, arrivo e vita locale a Pag.',
    prototypeBadge: 'Prototipo dei contenuti', prototypeTitle: 'Layout e interazioni sono pronti per il test.',
    prototypeCopy: 'Domande e risposte sono provvisorie. La pagina non sarà indicizzata finché i contenuti finali non saranno verificati.',
    sourceLabel: 'Fonte', sourceValue: 'Sito ufficiale di Villas Pastura', reviewLabel: 'Verifica finale', reviewValue: 'Proprietari e team locale', updatedLabel: 'Prototipo aggiornato',
    ctaKicker: 'Il tuo soggiorno', ctaTitle: 'Vuoi controllare le date?', ctaCopy: 'Torna alla villa per disponibilità live, prezzi completi e condizioni.', ctaButton: 'Controlla disponibilità',
    pageTitle: 'Prototipo FAQ | Villas Pastura Novalja', metaDescription: 'Prototipo delle domande frequenti per Villas Pastura a Novalja.',
    skipLink: 'Vai alle domande', menuLabel: 'Apri menu', languageLabel: 'Scegli lingua'
  }
};

const dataElement = document.querySelector('#faq-data');
let faqData = { categories: [], items: [], lastModified: '2026-09-05' };

try {
  faqData = JSON.parse(dataElement?.textContent || '{"categories":[],"items":[]}');
} catch (error) {
  console.error('FAQ data could not be parsed.', error);
}

const itemById = new Map(faqData.items.map((item) => [item.id, item]));
const categoryById = new Map(faqData.categories.map((category) => [category.id, category]));
const menuToggle = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-nav]');
const languageSelect = document.querySelector('#language-select');
const metaDescription = document.querySelector('meta[name="description"]');
const updatedTime = document.querySelector('.faq-owner time');
let currentLanguage = localStorage.getItem('villa-lang') || 'en';

if (!faqTranslations[currentLanguage]) currentLanguage = 'en';

document.querySelector('#year').textContent = new Date().getFullYear();
languageSelect.value = currentLanguage;
applyLanguage(currentLanguage);
openQuestionFromHash(false);

menuToggle.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

navigation.addEventListener('click', (event) => {
  if (!event.target.closest('a')) return;
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
});

languageSelect.addEventListener('change', (event) => {
  currentLanguage = event.target.value;
  localStorage.setItem('villa-lang', currentLanguage);
  applyLanguage(currentLanguage);
});

window.addEventListener('hashchange', () => openQuestionFromHash(true));

function localized(values, language) {
  return values?.[language] || values?.en || '';
}

function applyLanguage(language) {
  const dictionary = faqTranslations[language] || faqTranslations.en;
  document.documentElement.lang = language;
  document.title = dictionary.pageTitle;
  metaDescription.setAttribute('content', dictionary.metaDescription);

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = dictionary[element.dataset.i18n];
    if (value) element.textContent = value;
  });

  document.querySelector('.skip-link').textContent = dictionary.skipLink;
  menuToggle.querySelector('.sr-only').textContent = dictionary.menuLabel;
  languageSelect.setAttribute('aria-label', dictionary.languageLabel);
  languageSelect.closest('label').querySelector('.sr-only').textContent = dictionary.languageLabel;

  document.querySelectorAll('[data-category-link]').forEach((link) => {
    const category = categoryById.get(link.dataset.categoryLink);
    if (category) link.textContent = localized(category.title, language);
  });

  document.querySelectorAll('[data-faq-category]').forEach((section) => {
    const category = categoryById.get(section.dataset.faqCategory);
    if (!category) return;
    section.querySelector('[data-faq-category-title]').textContent = localized(category.title, language);
    section.querySelector('[data-faq-category-intro]').textContent = localized(category.intro, language);
  });

  document.querySelectorAll('[data-faq-id]').forEach((details) => {
    const item = itemById.get(details.dataset.faqId);
    if (!item) return;
    details.querySelector('[data-faq-question]').textContent = localized(item.question, language);
    details.querySelector('[data-faq-answer]').textContent = localized(item.answer, language);
    const tipLabel = details.querySelector('[data-faq-tip-label]');
    const tip = details.querySelector('[data-faq-tip]');
    if (tipLabel) tipLabel.textContent = localized(faqData.tipLabels, language);
    if (tip) tip.textContent = localized(item.tip, language);
  });

  if (updatedTime && faqData.lastModified) {
    const date = new Date(`${faqData.lastModified}T12:00:00Z`);
    updatedTime.textContent = new Intl.DateTimeFormat(language, { dateStyle: 'long', timeZone: 'UTC' }).format(date);
  }
}

function openQuestionFromHash(shouldScroll) {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;
  const target = document.getElementById(id);
  if (!(target instanceof HTMLDetailsElement)) return;
  target.open = true;
  if (shouldScroll) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
