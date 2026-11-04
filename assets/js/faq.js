const faqTranslations = {
  en: {
    navVilla: 'The villa', navGallery: 'Gallery', navReviews: 'Reviews', navLocation: 'Location',
    faqKicker: 'Official Villas Pastura information', faqHeading: 'Questions answered by your hosts in Novalja.',
    faqIntro: 'Practical answers about booking, the villa, arrival and local life on Pag.',
    ctaKicker: 'Your stay', ctaTitle: 'Ready to check your dates?', ctaCopy: 'Return to the villa page for live availability, complete prices and conditions.', ctaButton: 'Check availability',
    pageTitle: 'FAQ | Villas Pastura Novalja', metaDescription: 'Official answers about booking, heated private pools, arrival and local advice for Villas Pastura in Novalja.',
    skipLink: 'Skip to questions', menuLabel: 'Open menu', languageLabel: 'Choose language'
  },
  de: {
    navVilla: 'Die Villa', navGallery: 'Galerie', navReviews: 'Bewertungen', navLocation: 'Lage',
    faqKicker: 'Offizielle Informationen der Villas Pastura', faqHeading: 'Fragen, beantwortet von Ihren Gastgebern in Novalja.',
    faqIntro: 'Praktische Antworten zu Buchung, Villa, Anreise und dem Leben auf Pag.',
    ctaKicker: 'Ihr Aufenthalt', ctaTitle: 'Möchten Sie Ihre Daten prüfen?', ctaCopy: 'Zur Villa-Seite für Live-Verfügbarkeit, Gesamtpreise und Bedingungen.', ctaButton: 'Verfügbarkeit prüfen',
    pageTitle: 'FAQ | Villas Pastura Novalja', metaDescription: 'Offizielle Antworten zu Buchung, privaten beheizten Pools, Anreise und lokalen Tipps für Villas Pastura in Novalja.',
    skipLink: 'Zu den Fragen springen', menuLabel: 'Menü öffnen', languageLabel: 'Sprache wählen'
  },
  hr: {
    navVilla: 'Vila', navGallery: 'Galerija', navReviews: 'Recenzije', navLocation: 'Lokacija',
    faqKicker: 'Službene informacije Villas Pastura', faqHeading: 'Pitanja na koja odgovaraju vaši domaćini u Novalji.',
    faqIntro: 'Praktični odgovori o rezervaciji, vili, dolasku i lokalnom životu na Pagu.',
    ctaKicker: 'Vaš boravak', ctaTitle: 'Spremni za provjeru datuma?', ctaCopy: 'Vratite se na stranicu vile za live raspoloživost, potpune cijene i uvjete.', ctaButton: 'Provjeri raspoloživost',
    pageTitle: 'Česta pitanja | Villas Pastura Novalja', metaDescription: 'Odgovori na pitanja o rezervaciji, privatnim grijanim bazenima, dolasku i lokalnim savjetima za Villas Pastura u Novalji.',
    skipLink: 'Prijeđi na pitanja', menuLabel: 'Otvori izbornik', languageLabel: 'Odaberi jezik'
  },
  it: {
    navVilla: 'La villa', navGallery: 'Galleria', navReviews: 'Recensioni', navLocation: 'Posizione',
    faqKicker: 'Informazioni ufficiali Villas Pastura', faqHeading: 'Domande con risposte dei vostri host a Novalja.',
    faqIntro: 'Risposte pratiche su prenotazione, villa, arrivo e vita locale a Pag.',
    ctaKicker: 'Il tuo soggiorno', ctaTitle: 'Vuoi controllare le date?', ctaCopy: 'Torna alla villa per disponibilità live, prezzi completi e condizioni.', ctaButton: 'Controlla disponibilità',
    pageTitle: 'Domande frequenti | Villas Pastura Novalja', metaDescription: 'Risposte ufficiali su prenotazioni, piscine private riscaldate, arrivo e consigli locali per Villas Pastura a Novalja.',
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
