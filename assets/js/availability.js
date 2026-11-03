import { apiRequest, currentLanguage, differenceInNights, formatDate, formatMoney, setLanguage } from './booking-api.js?v=1.22.0';

const copy = {
  en: {
    back: 'Change dates', kicker: 'Official direct booking', title: 'Available rates for your stay',
    intro: 'Availability, the complete price and booking conditions are checked live before offers are shown.',
    loading: 'Checking the latest availability and prices…', dates: 'Stay dates', guests: 'Guests', nights: 'Nights', adults: 'adults', children: 'children 0–11', teenagers: 'young guests 12–17',
    noOffers: 'These dates are no longer available.', noOffersHelp: 'Try another date range. Availability is checked across one complete villa for the whole stay.',
    invalid: 'Please return and choose valid stay dates.', unavailable: 'Live booking information could not be loaded right now.', retry: 'Try again',
    available: 'Available', total: 'Total stay price', accommodation: 'Accommodation', additional: 'Mandatory charges', included: 'Included at no extra cost',
    prepayment: 'Prepayment', cancellation: 'Cancellation', deposit: 'Refundable damage deposit', conditions: 'Booking conditions',
    noPrepayment: 'No prepayment schedule was returned for this rate.', noCancellation: 'No cancellation charge schedule was returned for this rate.',
    due: 'due', from: 'from', book: 'Book now', perNight: 'average per night', checkoutError: 'The secure checkout could not be created. Please try again.',
  },
  de: {
    back: 'Daten ändern', kicker: 'Offizielle Direktbuchung', title: 'Verfügbare Preise für Ihren Aufenthalt',
    intro: 'Verfügbarkeit, Gesamtpreis und Buchungsbedingungen werden live geprüft, bevor Angebote erscheinen.',
    loading: 'Aktuelle Verfügbarkeit und Preise werden geprüft…', dates: 'Reisedaten', guests: 'Gäste', nights: 'Nächte', adults: 'Erwachsene', children: 'Kinder 0–11', teenagers: 'junge Gäste 12–17',
    noOffers: 'Diese Daten sind nicht mehr verfügbar.', noOffersHelp: 'Bitte wählen Sie andere Daten. Für den gesamten Aufenthalt wird dieselbe Villa geprüft.',
    invalid: 'Bitte kehren Sie zurück und wählen Sie gültige Reisedaten.', unavailable: 'Live-Buchungsdaten konnten nicht geladen werden.', retry: 'Erneut versuchen',
    available: 'Verfügbar', total: 'Gesamtpreis', accommodation: 'Unterkunft', additional: 'Pflichtgebühren', included: 'Ohne Aufpreis enthalten',
    prepayment: 'Vorauszahlung', cancellation: 'Stornierung', deposit: 'Erstattbare Kaution', conditions: 'Buchungsbedingungen',
    noPrepayment: 'Für diesen Tarif wurde kein Vorauszahlungsplan geliefert.', noCancellation: 'Für diesen Tarif wurde kein Stornierungsplan geliefert.',
    due: 'fällig', from: 'ab', book: 'Jetzt buchen', perNight: 'durchschnittlich pro Nacht', checkoutError: 'Der sichere Checkout konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
  },
  hr: {
    back: 'Promijeni datume', kicker: 'Službena direktna rezervacija', title: 'Raspoložive cijene za vaš boravak',
    intro: 'Raspoloživost, potpuna cijena i uvjeti rezervacije provjeravaju se uživo prije prikaza ponuda.',
    loading: 'Provjeravamo aktualnu raspoloživost i cijene…', dates: 'Datumi boravka', guests: 'Gosti', nights: 'Noćenja', adults: 'odraslih', children: 'djece 0–11', teenagers: 'mladih gostiju 12–17',
    noOffers: 'Ovi datumi više nisu raspoloživi.', noOffersHelp: 'Pokušajte s drugim rasponom. Ista vila mora biti raspoloživa tijekom cijelog boravka.',
    invalid: 'Vratite se i odaberite ispravne datume boravka.', unavailable: 'Trenutačno nije moguće učitati live podatke rezervacije.', retry: 'Pokušaj ponovno',
    available: 'Raspoloživo', total: 'Ukupna cijena boravka', accommodation: 'Smještaj', additional: 'Obvezne naknade', included: 'Uključeno bez nadoplate',
    prepayment: 'Predujam', cancellation: 'Otkazivanje', deposit: 'Povratni sigurnosni polog', conditions: 'Uvjeti rezervacije',
    noPrepayment: 'Za ovu cijenu nije vraćen raspored predujma.', noCancellation: 'Za ovu cijenu nije vraćen raspored troškova otkaza.',
    due: 'dospijeva', from: 'od', book: 'Rezerviraj', perNight: 'prosječno po noćenju', checkoutError: 'Sigurni checkout trenutačno nije moguće otvoriti. Pokušajte ponovno.',
  },
  it: {
    back: 'Cambia date', kicker: 'Prenotazione diretta ufficiale', title: 'Tariffe disponibili per il soggiorno',
    intro: 'Disponibilità, prezzo completo e condizioni vengono verificati in tempo reale prima di mostrare le offerte.',
    loading: 'Verifica di disponibilità e prezzi…', dates: 'Date del soggiorno', guests: 'Ospiti', nights: 'Notti', adults: 'adulti', children: 'bambini 0–11', teenagers: 'ospiti giovani 12–17',
    noOffers: 'Queste date non sono più disponibili.', noOffersHelp: 'Prova altre date. La stessa villa deve essere disponibile per l’intero soggiorno.',
    invalid: 'Torna indietro e scegli date valide.', unavailable: 'I dati di prenotazione live non sono disponibili al momento.', retry: 'Riprova',
    available: 'Disponibile', total: 'Prezzo totale', accommodation: 'Alloggio', additional: 'Costi obbligatori', included: 'Incluso senza supplemento',
    prepayment: 'Pagamento anticipato', cancellation: 'Cancellazione', deposit: 'Deposito cauzionale rimborsabile', conditions: 'Condizioni di prenotazione',
    noPrepayment: 'Nessun piano di pagamento anticipato restituito per questa tariffa.', noCancellation: 'Nessun piano di cancellazione restituito per questa tariffa.',
    due: 'scade', from: 'dal', book: 'Prenota ora', perNight: 'media per notte', checkoutError: 'Non è stato possibile creare il checkout sicuro. Riprova.',
  },
};

Object.assign(copy.en, {
  change: 'Change dates or guests',
  title: 'Review and complete your booking',
  included: 'Included at no extra cost',
  checkoutSetupError: 'Local booking storage is not ready. Stop the server and start it again with npm run dev.',
});
Object.assign(copy.de, {
  change: 'Daten oder Gäste ändern',
  title: 'Buchung prüfen und abschließen',
  included: 'Ohne Aufpreis enthalten',
  checkoutSetupError: 'Der lokale Buchungsspeicher ist nicht bereit. Stoppen Sie den Server und starten Sie ihn erneut mit npm run dev.',
});
Object.assign(copy.hr, {
  change: 'Promijeni datume ili goste',
  title: 'Pregledajte i dovršite rezervaciju',
  included: 'Uključeno bez nadoplate',
  checkoutSetupError: 'Lokalna pohrana rezervacija nije spremna. Zaustavite server i ponovno ga pokrenite naredbom npm run dev.',
});
Object.assign(copy.it, {
  change: 'Modifica date o ospiti',
  title: 'Controlla e completa la prenotazione',
  included: 'Incluso senza supplemento',
  checkoutSetupError: 'L’archivio locale delle prenotazioni non è pronto. Arresta il server e riavvialo con npm run dev.',
});

const params = new URLSearchParams(location.search);
const search = {
  arrivalDate: params.get('arrival') || '',
  departureDate: params.get('departure') || '',
  numberOfAdults: Number(params.get('adults') || params.get('guests')),
  children0To11: Number(params.get('children0To11') || 0),
  children12To17: Number(params.get('children12To17') || 0),
};
let language = setLanguage(params.get('lang') || currentLanguage());
const languageSelect = document.querySelector('#language-select');
const status = document.querySelector('#search-status');
const offerList = document.querySelector('#offer-list');
const staySummary = document.querySelector('#stay-summary');

document.querySelector('#year').textContent = new Date().getFullYear();
languageSelect.value = language;
languageSelect.addEventListener('change', () => {
  language = setLanguage(languageSelect.value);
  params.set('lang', language);
  history.replaceState(null, '', `${location.pathname}?${params}`);
  applyCopy();
  renderStaySummary();
  document.querySelectorAll('[data-change-stay]').forEach((link) => { link.href = changeStayUrl(); });
  searchOffers();
});

function t(key) { return copy[language]?.[key] || copy.en[key] || key; }

function applyCopy() {
  document.querySelectorAll('[data-copy]').forEach((node) => { node.textContent = t(node.dataset.copy); });
  document.title = `${t('title')} | Villas Pastura`;
}

function validSearch() {
  const totalGuests = search.numberOfAdults + search.children0To11 + search.children12To17;
  return /^\d{4}-\d{2}-\d{2}$/.test(search.arrivalDate)
    && /^\d{4}-\d{2}-\d{2}$/.test(search.departureDate)
    && differenceInNights(search.arrivalDate, search.departureDate) > 0
    && Number.isInteger(search.numberOfAdults) && search.numberOfAdults >= 1
    && Number.isInteger(search.children0To11) && search.children0To11 >= 0
    && Number.isInteger(search.children12To17) && search.children12To17 >= 0
    && totalGuests <= 8;
}

function renderStaySummary() {
  if (!validSearch()) return;
  const nights = differenceInNights(search.arrivalDate, search.departureDate);
  staySummary.hidden = false;
  staySummary.innerHTML = `
    <div><span>${t('dates')}</span><strong>${formatDate(search.arrivalDate, language)} – ${formatDate(search.departureDate, language)}</strong></div>
    <div><span>${t('nights')}</span><strong>${nights}</strong></div>
    <div><span>${t('guests')}</span><strong>${search.numberOfAdults} ${t('adults')}${search.children0To11 ? ` · ${search.children0To11} ${t('children')}` : ''}${search.children12To17 ? ` · ${search.children12To17} ${t('teenagers')}` : ''}</strong></div>
    <a class="stay-change" href="${changeStayUrl()}">${t('change')}</a>`;
}

function changeStayUrl() {
  const query = new URLSearchParams({
    arrival: search.arrivalDate,
    departure: search.departureDate,
    adults: String(search.numberOfAdults),
    children0To11: String(search.children0To11),
    children12To17: String(search.children12To17),
    lang: language,
  });
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => {
    const value = params.get(key);
    if (value) query.set(key, value.slice(0, 240));
  });
  return `/index.html?${query}#booking`;
}

function policyList(items, dateKey, emptyText) {
  if (!items?.length) return `<p>${emptyText}</p>`;
  return `<ul>${items.map((item) => `<li>${formatMoney(item.amount, item.currencyCode, language)} · ${t(dateKey === 'dueDate' ? 'due' : 'from')} ${formatDate(item[dateKey], language)}</li>`).join('')}</ul>`;
}

function displayLabel(item) {
  return item?.displayName?.[language] || item?.displayName?.en || item?.name || '';
}

function serviceRows(services) {
  return (services || []).map((service) => `
    <div class="price-row"><dt>${escapeHtml(displayLabel(service) || t('additional'))}${service.quantity > 1 ? ` × ${service.quantity}` : ''}</dt><dd>${formatMoney(service.totalPrice, service.currencyCode, language)}</dd></div>`).join('');
}

function renderOffer(offer, index) {
  const services = serviceRows(offer.mandatoryCharges);
  const included = (offer.includedServices || []).map(displayLabel).filter(Boolean);
  return `
    <article class="offer-card">
      <div class="offer-details">
        <span class="offer-badge">✓ ${t('available')}</span>
        <h2>${escapeHtml(displayLabel(offer))}</h2>
        ${included.length ? `<section class="perks-box"><h3>${t('included')}</h3><ul class="perk-list">${included.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>` : ''}
        <dl class="price-breakdown">
          <div class="price-row"><dt>${t('accommodation')}</dt><dd>${formatMoney(offer.accommodationPrice, offer.currencyCode, language)}</dd></div>
          ${services}
          <div class="price-row is-total"><dt>${t('total')}</dt><dd>${formatMoney(offer.totalPrice, offer.currencyCode, language)}</dd></div>
        </dl>
        <div class="policy-grid">
          <section class="policy-box"><h3>${t('prepayment')}</h3>${policyList(offer.prepaymentPolicies, 'dueDate', t('noPrepayment'))}</section>
          <section class="policy-box"><h3>${t('cancellation')}</h3>${policyList(offer.cancellationPolicies, 'effectiveFrom', t('noCancellation'))}</section>
          ${offer.damageDeposit ? `<section class="policy-box"><h3>${t('deposit')}</h3><p>${formatMoney(offer.damageDeposit, offer.damageDepositCurrencyCode, language)}</p></section>` : ''}
        </div>
      </div>
      <aside class="offer-action">
        <div class="offer-price"><strong>${formatMoney(offer.totalPrice, offer.currencyCode, language)}</strong><small>${formatMoney(offer.averagePricePerNight, offer.currencyCode, language)} ${t('perNight')}</small></div>
        <button class="button" type="button" data-book-index="${index}">${t('book')}</button>
      </aside>
    </article>`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function showError(title, help, retry = false) {
  status.hidden = false;
  status.classList.add('is-error');
  status.innerHTML = `<h2>${title}</h2><p>${help}</p>${retry ? `<button class="button button-secondary" id="retry-search" type="button">${t('retry')}</button>` : ''}`;
  document.querySelector('#retry-search')?.addEventListener('click', searchOffers);
}

async function searchOffers() {
  offerList.replaceChildren();
  status.hidden = false;
  status.className = 'flow-status';
  status.innerHTML = `<div class="loading-line"></div><div class="loading-line"></div><p>${t('loading')}</p>`;
  if (!validSearch()) {
    showError(t('invalid'), t('noOffersHelp'));
    return;
  }
  try {
    const result = await apiRequest('/offers/search', {
      method: 'POST',
      body: JSON.stringify({ ...search, culture: language }),
    });
    if (!result.available || !result.offers?.length) {
      showError(t('noOffers'), t('noOffersHelp'));
      return;
    }
    status.hidden = true;
    offerList.innerHTML = result.offers.map(renderOffer).join('');
    offerList.querySelectorAll('[data-book-index]').forEach((button) => {
      button.addEventListener('click', async () => {
        const offer = result.offers[Number(button.dataset.bookIndex)];
        button.disabled = true;
        try {
          const checkout = await apiRequest('/checkout-sessions', {
            method: 'POST',
            body: JSON.stringify({
              quoteToken: offer.quoteToken,
              language,
              tracking: {
                source: params.get('utm_source'), medium: params.get('utm_medium'), campaign: params.get('utm_campaign'),
                content: params.get('utm_content'), term: params.get('utm_term'), referrer: document.referrer,
              },
            }),
          });
          location.href = `${checkout.checkoutUrl}?lang=${encodeURIComponent(language)}`;
        } catch (error) {
          button.disabled = false;
          console.error('Checkout session could not be created.', { code: error?.message, status: error?.status });
          const localSetupFailure = location.hostname === '127.0.0.1' || location.hostname === 'localhost';
          const message = localSetupFailure && ['BOOKING_STORAGE_NOT_INITIALIZED', 'UNEXPECTED_ERROR'].includes(error?.message)
            ? t('checkoutSetupError')
            : t('checkoutError');
          showError(t('checkoutError'), message);
        }
      });
    });
  } catch (error) {
    console.error('Offer search or rendering failed.', { code: error?.message, status: error?.status });
    showError(t('unavailable'), t('noOffersHelp'), true);
  }
}

applyCopy();
document.querySelectorAll('[data-change-stay]').forEach((link) => { link.href = changeStayUrl(); });
renderStaySummary();
searchOffers();

window.addEventListener('pageshow', () => {
  document.querySelectorAll('[data-book-index]').forEach((button) => { button.disabled = false; });
});
