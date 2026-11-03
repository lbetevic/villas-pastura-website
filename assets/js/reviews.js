const translations = {
  en: { navVilla: 'The villa', navGallery: 'Gallery', navReviews: 'Reviews', navLocation: 'Location', skip: 'Skip to reviews', kicker: 'Verified guest reviews', heading: 'What guests say after staying at Pool Villas Pastura.', intro: 'These are genuine, approved reviews from completed stays. The original guest wording is shown in English.', score: 'out of 10', count: '4 verified reviews', verified: 'Verified guest review', ctaKicker: 'Your stay', ctaTitle: 'Check your preferred dates.', ctaCopy: 'See live availability, complete prices and booking conditions.', ctaButton: 'Check availability' },
  de: { navVilla: 'Die Villa', navGallery: 'Galerie', navReviews: 'Bewertungen', navLocation: 'Lage', skip: 'Zu den Bewertungen', kicker: 'Verifizierte Gästebewertungen', heading: 'Was Gäste nach ihrem Aufenthalt in Pool Villas Pastura sagen.', intro: 'Dies sind echte, freigegebene Bewertungen abgeschlossener Aufenthalte. Der ursprüngliche Gästetext wird auf Englisch angezeigt.', score: 'von 10', count: '4 verifizierte Bewertungen', verified: 'Verifizierte Gästebewertung', ctaKicker: 'Ihr Aufenthalt', ctaTitle: 'Prüfen Sie Ihre Wunschdaten.', ctaCopy: 'Live-Verfügbarkeit, Gesamtpreise und Buchungsbedingungen ansehen.', ctaButton: 'Verfügbarkeit prüfen' },
  hr: { navVilla: 'Vila', navGallery: 'Galerija', navReviews: 'Recenzije', navLocation: 'Lokacija', skip: 'Prijeđi na recenzije', kicker: 'Provjerene recenzije gostiju', heading: 'Što gosti kažu nakon boravka u Pool Villas Pastura.', intro: 'Ovo su stvarne, odobrene recenzije završenih boravaka. Izvorni tekst gostiju prikazan je na engleskom jeziku.', score: 'od 10', count: '4 provjerene recenzije', verified: 'Provjerena recenzija gosta', ctaKicker: 'Vaš boravak', ctaTitle: 'Provjerite željene datume.', ctaCopy: 'Pogledajte live raspoloživost, potpune cijene i uvjete rezervacije.', ctaButton: 'Provjeri raspoloživost' },
  it: { navVilla: 'La villa', navGallery: 'Galleria', navReviews: 'Recensioni', navLocation: 'Posizione', skip: 'Vai alle recensioni', kicker: 'Recensioni verificate', heading: 'Cosa dicono gli ospiti dopo il soggiorno a Pool Villas Pastura.', intro: 'Queste sono recensioni autentiche e approvate di soggiorni completati. Il testo originale degli ospiti è mostrato in inglese.', score: 'su 10', count: '4 recensioni verificate', verified: 'Recensione verificata', ctaKicker: 'Il tuo soggiorno', ctaTitle: 'Controlla le date preferite.', ctaCopy: 'Vedi disponibilità live, prezzi completi e condizioni di prenotazione.', ctaButton: 'Controlla disponibilità' }
};

const menuToggle = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-nav]');
const languageSelect = document.querySelector('#language-select');
let currentLanguage = localStorage.getItem('villa-lang') || 'en';
if (!translations[currentLanguage]) currentLanguage = 'en';

document.querySelector('#year').textContent = new Date().getFullYear();
languageSelect.value = currentLanguage;
applyLanguage(currentLanguage);

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

function applyLanguage(language) {
  const dictionary = translations[language] || translations.en;
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = dictionary[element.dataset.i18n];
    if (value) element.textContent = value;
  });
  document.querySelectorAll('[data-review-date]').forEach((time) => {
    const date = new Date(`${time.dataset.reviewDate}T12:00:00Z`);
    time.textContent = new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
  });
}
