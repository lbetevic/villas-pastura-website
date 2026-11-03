const galleryTranslations = {
  en: {
    navVilla: 'The villa', navGallery: 'Gallery', navReviews: 'Reviews', navLocation: 'Location',
    galleryKicker: 'Villa gallery', galleryHeading: 'See the spaces before you choose your dates.',
    galleryIntro: 'Explore the private heated pool, sea-view terraces and contemporary interiors designed for relaxed stays with family and friends.',
    galleryGridTitle: 'Villa photographs', filterAll: 'All photos', filterPool: 'Pool', filterTerrace: 'Terrace', filterExterior: 'Exterior', filterInterior: 'Interior', filterBedrooms: 'Bedrooms', filterDetails: 'Details',
    ctaKicker: 'Your stay', ctaTitle: 'Like what you see?', ctaCopy: 'Choose your dates to see live availability, complete prices and booking conditions.', ctaButton: 'Check availability',
    pageTitle: 'Villas Pastura Photo Gallery | Private Pool Villa in Novalja',
    metaDescription: 'Explore the private heated pool, sea-view terraces and contemporary interiors at Villas Pastura in Novalja on Pag Island.',
    photoCount: 'Photo {current} of {total}', filterLabel: 'Filter gallery', close: 'Close photo viewer', previous: 'Previous photo', next: 'Next photo'
  },
  de: {
    navVilla: 'Die Villa', navGallery: 'Galerie', navReviews: 'Bewertungen', navLocation: 'Lage',
    galleryKicker: 'Villa-Galerie', galleryHeading: 'Entdecken Sie die Räume, bevor Sie Ihre Reisedaten wählen.',
    galleryIntro: 'Entdecken Sie den privaten beheizten Pool, die Meerblick-Terrassen und die modernen Innenräume für entspannte Aufenthalte mit Familie und Freunden.',
    galleryGridTitle: 'Fotos der Villa', filterAll: 'Alle Fotos', filterPool: 'Pool', filterTerrace: 'Terrasse', filterExterior: 'Außenbereich', filterInterior: 'Innenbereich', filterBedrooms: 'Schlafzimmer', filterDetails: 'Details',
    ctaKicker: 'Ihr Aufenthalt', ctaTitle: 'Gefällt Ihnen, was Sie sehen?', ctaCopy: 'Wählen Sie Daten für Live-Verfügbarkeit, Gesamtpreise und Bedingungen.', ctaButton: 'Verfügbarkeit prüfen',
    pageTitle: 'Villas Pastura Fotogalerie | Private Poolvilla in Novalja',
    metaDescription: 'Entdecken Sie den privaten beheizten Pool, die Meerblick-Terrassen und die modernen Innenräume der Villas Pastura in Novalja auf Pag.',
    photoCount: 'Foto {current} von {total}', filterLabel: 'Galerie filtern', close: 'Fotoansicht schließen', previous: 'Vorheriges Foto', next: 'Nächstes Foto'
  },
  hr: {
    navVilla: 'Vila', navGallery: 'Galerija', navReviews: 'Recenzije', navLocation: 'Lokacija',
    galleryKicker: 'Galerija vile', galleryHeading: 'Pogledajte prostor prije nego odaberete datume.',
    galleryIntro: 'Istražite privatni grijani bazen, terase s pogledom na more i suvremene interijere za opušten boravak s obitelji i prijateljima.',
    galleryGridTitle: 'Fotografije vile', filterAll: 'Sve fotografije', filterPool: 'Bazen', filterTerrace: 'Terasa', filterExterior: 'Eksterijer', filterInterior: 'Interijer', filterBedrooms: 'Spavaće sobe', filterDetails: 'Detalji',
    ctaKicker: 'Vaš boravak', ctaTitle: 'Sviđa vam se što vidite?', ctaCopy: 'Odaberite datume za live raspoloživost, potpune cijene i uvjete.', ctaButton: 'Provjeri raspoloživost',
    pageTitle: 'Galerija Villas Pastura | Vila s privatnim bazenom u Novalji',
    metaDescription: 'Pogledajte privatni grijani bazen, terase s pogledom na more i suvremene interijere Villas Pastura u Novalji na otoku Pagu.',
    photoCount: 'Fotografija {current} od {total}', filterLabel: 'Filtriraj galeriju', close: 'Zatvori pregled fotografije', previous: 'Prethodna fotografija', next: 'Sljedeća fotografija'
  },
  it: {
    navVilla: 'La villa', navGallery: 'Galleria', navReviews: 'Recensioni', navLocation: 'Posizione',
    galleryKicker: 'Galleria della villa', galleryHeading: 'Scopri gli spazi prima di scegliere le date.',
    galleryIntro: 'Esplora la piscina privata riscaldata, le terrazze vista mare e gli interni contemporanei pensati per soggiorni rilassanti con famiglia e amici.',
    galleryGridTitle: 'Fotografie della villa', filterAll: 'Tutte le foto', filterPool: 'Piscina', filterTerrace: 'Terrazza', filterExterior: 'Esterni', filterInterior: 'Interni', filterBedrooms: 'Camere da letto', filterDetails: 'Dettagli',
    ctaKicker: 'Il tuo soggiorno', ctaTitle: 'Ti piace quello che vedi?', ctaCopy: 'Scegli le date per disponibilità live, prezzi completi e condizioni.', ctaButton: 'Controlla disponibilità',
    pageTitle: 'Galleria Villas Pastura | Villa con piscina privata a Novalja',
    metaDescription: 'Esplora la piscina privata riscaldata, le terrazze vista mare e gli interni contemporanei di Villas Pastura a Novalja, sull’isola di Pag.',
    photoCount: 'Foto {current} di {total}', filterLabel: 'Filtra la galleria', close: 'Chiudi visualizzatore', previous: 'Foto precedente', next: 'Foto successiva'
  }
};

const galleryImageDataElement = document.querySelector('#gallery-image-data');
let galleryImageData = { images: [] };
try {
  galleryImageData = JSON.parse(galleryImageDataElement?.textContent || '{"images":[]}');
} catch (error) {
  console.error('Gallery image data could not be parsed.', error);
}
const galleryImageById = new Map(
  galleryImageData.images.map((image) => [image.sourceId, image])
);

const menuToggle = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-nav]');
const languageSelect = document.querySelector('#language-select');
const filterToolbar = document.querySelector('[data-gallery-filter]');
const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
const galleryOpeners = Array.from(document.querySelectorAll('[data-gallery-index]'));
const lightbox = document.querySelector('[data-lightbox]');
const lightboxImage = document.querySelector('[data-lightbox-image]');
const lightboxMobileSource = document.querySelector('[data-lightbox-mobile-source]');
const lightboxCaption = document.querySelector('[data-lightbox-caption]');
const lightboxCounter = document.querySelector('[data-lightbox-counter]');
const lightboxStage = document.querySelector('[data-lightbox-stage]');
const closeButton = document.querySelector('[data-lightbox-close]');
const previousButton = document.querySelector('[data-lightbox-prev]');
const nextButton = document.querySelector('[data-lightbox-next]');
const metaDescription = document.querySelector('meta[name="description"]');

let currentLanguage = localStorage.getItem('villa-lang') || 'en';
let currentIndex = 0;
let activeFilter = 'all';
let lastOpener = null;
let touchStartX = 0;
let touchStartY = 0;

if (!galleryTranslations[currentLanguage]) currentLanguage = 'en';

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

filterToolbar.addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  setFilter(button.dataset.filter);
});

galleryOpeners.forEach((opener) => {
  opener.addEventListener('click', () => {
    lastOpener = opener;
    openLightbox(Number(opener.dataset.galleryIndex));
  });
});

closeButton.addEventListener('click', closeLightbox);
previousButton.addEventListener('click', () => showRelativePhoto(-1));
nextButton.addEventListener('click', () => showRelativePhoto(1));

lightbox.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeLightbox();
});

lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (event) => {
  if (!lightbox.open) return;
  if (event.key === 'ArrowLeft') showRelativePhoto(-1);
  if (event.key === 'ArrowRight') showRelativePhoto(1);
});

lightboxStage.addEventListener('touchstart', (event) => {
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });

lightboxStage.addEventListener('touchend', (event) => {
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  if (Math.abs(deltaX) < 55 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
  showRelativePhoto(deltaX > 0 ? -1 : 1);
}, { passive: true });

lightboxImage.addEventListener('load', () => {
  lightboxImage.classList.add('is-loaded');
  deferAdjacentPreload();
});

window.addEventListener('hashchange', openPhotoFromHash);
openPhotoFromHash();

function applyLanguage(language) {
  const dictionary = galleryTranslations[language] || galleryTranslations.en;
  document.documentElement.lang = language;
  document.title = dictionary.pageTitle;
  metaDescription.setAttribute('content', dictionary.metaDescription);
  filterToolbar.setAttribute('aria-label', dictionary.filterLabel);
  closeButton.setAttribute('aria-label', dictionary.close);
  previousButton.setAttribute('aria-label', dictionary.previous);
  nextButton.setAttribute('aria-label', dictionary.next);

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n;
    if (dictionary[key]) element.textContent = dictionary[key];
  });

  galleryOpeners.forEach((opener) => {
    const imageRecord = galleryImageById.get(opener.dataset.imageId);
    const caption = imageRecord?.captions?.[language] || imageRecord?.captions?.en;
    if (!caption) return;
    opener.dataset.alt = caption;
    opener.querySelector('img').alt = opener.dataset.alt;
    const visibleCaption = opener.closest('.gallery-item')?.querySelector('[data-image-caption]');
    if (visibleCaption) visibleCaption.textContent = caption;
  });

  if (lightbox.open) renderLightboxPhoto(currentIndex);
}

function setFilter(filter) {
  activeFilter = filter;
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  galleryItems.forEach((item) => {
    const categories = item.dataset.category.split(' ');
    item.hidden = filter !== 'all' && !categories.includes(filter);
  });
}

function openLightbox(index) {
  currentIndex = index;
  renderLightboxPhoto(currentIndex);
  if (!lightbox.open) lightbox.showModal();
  updatePhotoHash();
}

function closeLightbox() {
  if (!lightbox.open) return;
  lightbox.close();
  lightboxMobileSource.removeAttribute('srcset');
  lightboxImage.removeAttribute('srcset');
  lightboxImage.src = '';
  lightboxImage.classList.remove('is-loaded');
  if (location.hash.startsWith('#photo-')) history.replaceState(null, '', `${location.pathname}${location.search}`);
  lastOpener?.focus();
}

function renderLightboxPhoto(index) {
  const opener = galleryOpeners[index];
  const dictionary = galleryTranslations[currentLanguage] || galleryTranslations.en;
  const imageRecord = galleryImageById.get(opener.dataset.imageId);
  const caption = imageRecord?.captions?.[currentLanguage]
    || imageRecord?.captions?.en
    || opener.dataset.alt;
  lightboxImage.classList.remove('is-loaded');
  lightboxImage.alt = opener.dataset.alt;
  lightboxMobileSource.srcset = opener.dataset.mobileFullSrcset;
  lightboxMobileSource.sizes = '100vw';
  lightboxImage.srcset = opener.dataset.fullSrcset;
  lightboxImage.sizes = '100vw';
  lightboxImage.src = opener.dataset.fullSrc;
  lightboxCaption.textContent = caption;
  lightboxCounter.textContent = dictionary.photoCount
    .replace('{current}', String(index + 1))
    .replace('{total}', String(galleryOpeners.length));
}

function showRelativePhoto(direction) {
  const visibleIndexes = galleryOpeners
    .filter((opener) => !opener.closest('.gallery-item').hidden)
    .map((opener) => Number(opener.dataset.galleryIndex));
  const position = Math.max(0, visibleIndexes.indexOf(currentIndex));
  const nextPosition = (position + direction + visibleIndexes.length) % visibleIndexes.length;
  currentIndex = visibleIndexes[nextPosition];
  renderLightboxPhoto(currentIndex);
  updatePhotoHash();
}

function updatePhotoHash() {
  history.replaceState(null, '', `#photo-${String(currentIndex + 1).padStart(2, '0')}`);
}

function openPhotoFromHash() {
  const match = location.hash.match(/^#photo-(\d{2})$/);
  if (!match) return;
  const index = Number(match[1]) - 1;
  if (index < 0 || index >= galleryOpeners.length) return;
  lastOpener = galleryOpeners[index];
  openLightbox(index);
}

function deferAdjacentPreload() {
  const preload = () => {
    [-1, 1].forEach((direction) => {
      const index = (currentIndex + direction + galleryOpeners.length) % galleryOpeners.length;
      const image = new Image();
      const opener = galleryOpeners[index];
      image.src = window.matchMedia('(max-width: 699px)').matches
        ? opener.dataset.mobileFullSrc
        : opener.dataset.fullSrc;
    });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preload, { timeout: 1200 });
  } else {
    window.setTimeout(preload, 250);
  }
}
