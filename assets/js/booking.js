import { apiRequest, currentLanguage, differenceInNights, formatDate, formatMoney, setLanguage } from './booking-api.js?v=1.22.0';

const copy = {
  en: {
    back: 'Back to rates', kicker: 'Secure booking request', title: 'Review and send your booking request', intro: 'Review the live price and conditions before entering personal details.', loading: 'Refreshing your selected rate…',
    guestHeading: 'Reservation holder', firstName: 'First name', lastName: 'Last name', email: 'Email', phone: 'Mobile phone', remarks: 'Notes or additional requests (optional)',
    paymentHeading: 'Preferred payment method', payByLink: 'Pay by link (3-D Secure)', payByLinkHelp: 'Ventus Travel will email the secure payment link after reviewing your request.', bankTransfer: 'Bank transfer', bankTransferHelp: 'Ventus Travel will email the bank details and payment reference.',
    termsConsent: 'I have read and accept the <a href="booking-terms.html" target="_blank" rel="noopener">booking terms</a>, including the displayed cancellation and prepayment policy.', privacyConsent: 'I have read the <a href="privacy.html" target="_blank" rel="noopener">privacy policy</a> and agree that my data may be processed to manage this request.', marketingConsent: 'I would like to receive occasional offers (optional).',
    requestNotice: 'This sends a booking request, not a confirmed reservation. Your dates are not held until Ventus Travel confirms them.', confirmButton: 'Send booking request', summaryHeading: 'Review your stay',
    dates: 'Dates', guests: 'Guests', nights: 'Nights', rate: 'Rate', total: 'Total', prepayment: 'Prepayment', cancellation: 'Cancellation', deposit: 'Refundable damage deposit', due: 'due', from: 'from', adults: 'adults', children: 'children 0–11', teenagers: 'young guests 12–17',
    missing: 'This checkout link is missing or has expired. Return to availability and choose a rate again.', unavailable: 'The selected offer is no longer available.', returnRates: 'Return to availability', required: 'Please complete all required fields and accept the booking terms and privacy policy.', turnstileRequired: 'Please complete the security check before sending your request.', submitError: 'The request could not be sent. Your dates have not been held. Please try again.',
    marketingYes: 'Yes', marketingNo: 'No', marketing: 'Marketing consent', contact: 'Contact', guest: 'Guest', payment: 'Payment preference', confirmationHeading: 'Request received', confirmationCopy: 'Your reservation is not yet confirmed or held. Ventus Travel will review the request and email payment instructions.', emailPending: 'Your request was saved, but the confirmation email is still pending delivery.', reference: 'Reference', returnHome: 'Return to Villas Pastura',
  },
  de: {
    back: 'Zurück zu Preisen', kicker: 'Sichere Buchungsanfrage', title: 'Buchungsanfrage prüfen und senden', intro: 'Prüfen Sie Live-Preis und Bedingungen vor Eingabe persönlicher Daten.', loading: 'Gewählter Preis wird aktualisiert…',
    guestHeading: 'Buchungsinhaber', firstName: 'Vorname', lastName: 'Nachname', email: 'E-Mail', phone: 'Mobiltelefon', remarks: 'Hinweise oder Wünsche (optional)', paymentHeading: 'Bevorzugte Zahlungsart', payByLink: 'Zahlungslink (3-D Secure)', payByLinkHelp: 'Ventus Travel sendet den sicheren Zahlungslink nach Prüfung per E-Mail.', bankTransfer: 'Banküberweisung', bankTransferHelp: 'Ventus Travel sendet Bankdaten und Zahlungsreferenz per E-Mail.',
    termsConsent: 'Ich akzeptiere die <a href="booking-terms.html" target="_blank" rel="noopener">Buchungsbedingungen</a> einschließlich Storno- und Vorauszahlungsbedingungen.', privacyConsent: 'Ich habe die <a href="privacy.html" target="_blank" rel="noopener">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung zur Bearbeitung dieser Anfrage zu.', marketingConsent: 'Ich möchte gelegentliche Angebote erhalten (optional).', requestNotice: 'Dies ist eine Buchungsanfrage, keine bestätigte Reservierung. Die Daten werden erst nach Bestätigung durch Ventus Travel blockiert.', confirmButton: 'Buchungsanfrage senden', summaryHeading: 'Aufenthalt prüfen',
    dates: 'Daten', guests: 'Gäste', nights: 'Nächte', rate: 'Tarif', total: 'Gesamt', prepayment: 'Vorauszahlung', cancellation: 'Stornierung', deposit: 'Erstattbare Kaution', due: 'fällig', from: 'ab', adults: 'Erwachsene', children: 'Kinder 0–11', teenagers: 'junge Gäste 12–17', missing: 'Dieser Checkout-Link fehlt oder ist abgelaufen.', unavailable: 'Das gewählte Angebot ist nicht mehr verfügbar.', returnRates: 'Zurück zur Verfügbarkeit', required: 'Bitte Pflichtfelder ausfüllen und Bedingungen sowie Datenschutz akzeptieren.', turnstileRequired: 'Bitte schließen Sie die Sicherheitsprüfung ab, bevor Sie die Anfrage senden.', submitError: 'Die Anfrage konnte nicht gesendet werden. Die Daten sind nicht blockiert. Bitte erneut versuchen.', marketingYes: 'Ja', marketingNo: 'Nein', marketing: 'Marketing-Einwilligung', contact: 'Kontakt', guest: 'Gast', payment: 'Zahlungswunsch', confirmationHeading: 'Anfrage erhalten', confirmationCopy: 'Die Reservierung ist noch nicht bestätigt oder blockiert. Ventus Travel prüft die Anfrage und sendet Zahlungsanweisungen.', emailPending: 'Die Anfrage wurde gespeichert, die Bestätigungs-E-Mail wartet jedoch noch auf den Versand.', reference: 'Referenz', returnHome: 'Zurück zu Villas Pastura',
  },
  hr: {
    back: 'Natrag na cijene', kicker: 'Siguran zahtjev za rezervaciju', title: 'Pregledajte i pošaljite zahtjev', intro: 'Pregledajte live cijenu i uvjete prije unosa osobnih podataka.', loading: 'Ponovno provjeravamo odabranu cijenu…',
    guestHeading: 'Nositelj rezervacije', firstName: 'Ime', lastName: 'Prezime', email: 'E-mail', phone: 'Mobitel', remarks: 'Napomene ili dodatni zahtjevi (neobvezno)', paymentHeading: 'Preferirani način plaćanja', payByLink: 'Pay by link (3-D Secure)', payByLinkHelp: 'Ventus Travel će nakon pregleda zahtjeva e-mailom poslati sigurnu poveznicu za plaćanje.', bankTransfer: 'Bankovna doznaka', bankTransferHelp: 'Ventus Travel će e-mailom poslati podatke za uplatu i poziv na broj.',
    termsConsent: 'Pročitao/la sam i prihvaćam <a href="booking-terms.html" target="_blank" rel="noopener">uvjete rezervacije</a>, uključujući prikazanu politiku otkaza i predujma.', privacyConsent: 'Pročitao/la sam <a href="privacy.html" target="_blank" rel="noopener">politiku privatnosti</a> i prihvaćam obradu podataka radi obrade ovog zahtjeva.', marketingConsent: 'Želim povremeno primati ponude (neobvezno).', requestNotice: 'Ovim šaljete zahtjev, a ne potvrđenu rezervaciju. Termin nije blokiran dok ga Ventus Travel ne potvrdi.', confirmButton: 'Pošalji zahtjev za rezervaciju', summaryHeading: 'Pregled boravka',
    dates: 'Datumi', guests: 'Gosti', nights: 'Noćenja', rate: 'Cijena', total: 'Ukupno', prepayment: 'Predujam', cancellation: 'Otkazivanje', deposit: 'Povratni sigurnosni polog', due: 'dospijeva', from: 'od', adults: 'odraslih', children: 'djece 0–11', teenagers: 'mladih gostiju 12–17', missing: 'Checkout poveznica nedostaje ili je istekla. Vratite se na raspoloživost i ponovno odaberite ponudu.', unavailable: 'Odabrana ponuda više nije raspoloživa.', returnRates: 'Natrag na raspoloživost', required: 'Ispunite obvezna polja te prihvatite uvjete i politiku privatnosti.', turnstileRequired: 'Dovršite sigurnosnu provjeru prije slanja zahtjeva.', submitError: 'Zahtjev nije moguće poslati. Termin nije blokiran. Pokušajte ponovno.', marketingYes: 'Da', marketingNo: 'Ne', marketing: 'Privola za marketing', contact: 'Kontakt', guest: 'Gost', payment: 'Način plaćanja', confirmationHeading: 'Zahtjev je zaprimljen', confirmationCopy: 'Rezervacija još nije potvrđena niti je termin blokiran. Ventus Travel će pregledati zahtjev i poslati upute za plaćanje.', emailPending: 'Zahtjev je sigurno spremljen, ali slanje potvrdnog e-maila još je na čekanju.', reference: 'Referenca', returnHome: 'Natrag na Villas Pastura',
  },
  it: {
    back: 'Torna alle tariffe', kicker: 'Richiesta sicura', title: 'Controlla e invia la richiesta', intro: 'Controlla prezzo e condizioni prima di inserire i dati personali.', loading: 'Aggiornamento della tariffa…',
    guestHeading: 'Intestatario', firstName: 'Nome', lastName: 'Cognome', email: 'E-mail', phone: 'Cellulare', remarks: 'Note o richieste aggiuntive (facoltativo)', paymentHeading: 'Metodo di pagamento preferito', payByLink: 'Link di pagamento (3-D Secure)', payByLinkHelp: 'Ventus Travel invierà il link sicuro dopo aver verificato la richiesta.', bankTransfer: 'Bonifico bancario', bankTransferHelp: 'Ventus Travel invierà coordinate bancarie e riferimento di pagamento.', termsConsent: 'Ho letto e accetto le <a href="booking-terms.html" target="_blank" rel="noopener">condizioni</a>, incluse le politiche di cancellazione e pagamento.', privacyConsent: 'Ho letto l’<a href="privacy.html" target="_blank" rel="noopener">informativa privacy</a> e acconsento al trattamento per gestire la richiesta.', marketingConsent: 'Desidero ricevere offerte occasionali (facoltativo).', requestNotice: 'Questa è una richiesta, non una prenotazione confermata. Le date non sono bloccate finché Ventus Travel non le conferma.', confirmButton: 'Invia richiesta', summaryHeading: 'Controlla il soggiorno',
    dates: 'Date', guests: 'Ospiti', nights: 'Notti', rate: 'Tariffa', total: 'Totale', prepayment: 'Pagamento anticipato', cancellation: 'Cancellazione', deposit: 'Deposito rimborsabile', due: 'scade', from: 'dal', adults: 'adulti', children: 'bambini 0–11', teenagers: 'ospiti giovani 12–17', missing: 'Il link di checkout manca o è scaduto.', unavailable: 'L’offerta selezionata non è più disponibile.', returnRates: 'Torna alla disponibilità', required: 'Completa i campi obbligatori e accetta condizioni e privacy.', turnstileRequired: 'Completa il controllo di sicurezza prima di inviare la richiesta.', submitError: 'Impossibile inviare la richiesta. Le date non sono bloccate. Riprova.', marketingYes: 'Sì', marketingNo: 'No', marketing: 'Consenso marketing', contact: 'Contatto', guest: 'Ospite', payment: 'Pagamento preferito', confirmationHeading: 'Richiesta ricevuta', confirmationCopy: 'La prenotazione non è ancora confermata né bloccata. Ventus Travel verificherà la richiesta e invierà le istruzioni di pagamento.', emailPending: 'La richiesta è stata salvata, ma l’e-mail di conferma è ancora in attesa di invio.', reference: 'Riferimento', returnHome: 'Torna a Villas Pastura',
  },
};

Object.assign(copy.en, { title: 'Complete your booking request', back: 'Back to rates', change: 'Change dates or guests' });
Object.assign(copy.de, { title: 'Buchungsanfrage abschließen', back: 'Zurück zu den Preisen', change: 'Daten oder Gäste ändern' });
Object.assign(copy.hr, { title: 'Dovršite zahtjev za rezervaciju', back: 'Natrag na cijene', change: 'Promijeni datume ili goste' });
Object.assign(copy.it, { title: 'Completa la richiesta di prenotazione', back: 'Torna alle tariffe', change: 'Modifica date o ospiti' });

const checkoutId = location.pathname.match(/^\/checkout\/([0-9a-f-]+)$/i)?.[1] || '';
let language = setLanguage(new URLSearchParams(location.search).get('lang') || currentLanguage());
let currentQuote = null;
let idempotencyKey = crypto.randomUUID();
let turnstileToken = '';
let turnstileRendered = false;
let turnstileRequired = false;

const languageSelect = document.querySelector('#language-select');
const status = document.querySelector('#quote-status');
const layout = document.querySelector('#booking-layout');
const form = document.querySelector('#guest-form');
const confirmation = document.querySelector('#confirmation-panel');
const summary = document.querySelector('#booking-summary');

document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelector('#back-to-rates').addEventListener('click', () => {
  location.assign(currentQuote ? availabilityUrl(currentQuote.stay) : 'index.html#booking');
});
languageSelect.value = language;
languageSelect.addEventListener('change', () => {
  language = setLanguage(languageSelect.value);
  history.replaceState(null, '', `${location.pathname}?lang=${language}`);
  applyCopy();
  if (currentQuote) {
    renderSummary();
  }
});

function t(key) { return copy[language]?.[key] || copy.en[key] || key; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]); }
function displayLabel(item) { return item?.displayName?.[language] || item?.displayName?.en || item?.name || ''; }
function applyCopy() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-copy]').forEach((node) => { node.textContent = t(node.dataset.copy); });
  document.querySelectorAll('[data-copy-html]').forEach((node) => { node.innerHTML = t(node.dataset.copyHtml); });
  document.title = `${t('title')} | Villas Pastura`;
}
function policies(items, dateKey, prefix) {
  if (!items?.length) return '—';
  return items.map((item) => `${formatMoney(item.amount, item.currencyCode, language)} · ${prefix} ${formatDate(item[dateKey], language)}`).join('<br>');
}
function partyText(stay) {
  return `${stay.numberOfAdults} ${t('adults')}${stay.children0To11 ? ` · ${stay.children0To11} ${t('children')}` : ''}${stay.children12To17 ? ` · ${stay.children12To17} ${t('teenagers')}` : ''}`;
}
function stayQuery(stay) {
  return new URLSearchParams({
    arrival: stay.arrivalDate,
    departure: stay.departureDate,
    adults: String(stay.numberOfAdults),
    children0To11: String(stay.children0To11 || 0),
    children12To17: String(stay.children12To17 || 0),
    lang: language,
  });
}
function availabilityUrl(stay) { return `/availability.html?${stayQuery(stay)}`; }
function changeStayUrl(stay) { return `/index.html?${stayQuery(stay)}#booking`; }
function renderSummary() {
  const { stay, offer } = currentQuote;
  summary.innerHTML = `<h2>${t('summaryHeading')}</h2><div class="review-panel">
    <div class="review-row"><span>${t('dates')}</span><strong>${formatDate(stay.arrivalDate, language)} – ${formatDate(stay.departureDate, language)}</strong></div>
    <div class="review-row"><span>${t('nights')}</span><strong>${differenceInNights(stay.arrivalDate, stay.departureDate)}</strong></div>
    <div class="review-row"><span>${t('guests')}</span><strong>${escapeHtml(partyText(stay))}</strong></div>
    <div class="review-row"><span>${t('rate')}</span><strong>${escapeHtml(displayLabel(offer))}</strong></div>
    <div class="review-row"><span>${t('total')}</span><strong>${formatMoney(offer.totalPrice, offer.currencyCode, language)}</strong></div>
    <div class="review-row"><span>${t('prepayment')}</span><strong>${policies(offer.prepaymentPolicies, 'dueDate', t('due'))}</strong></div>
    <div class="review-row"><span>${t('cancellation')}</span><strong>${policies(offer.cancellationPolicies, 'effectiveFrom', t('from'))}</strong></div>
    ${offer.damageDeposit ? `<div class="review-row"><span>${t('deposit')}</span><strong>${formatMoney(offer.damageDeposit, offer.damageDepositCurrencyCode, language)}</strong></div>` : ''}
  </div><a class="button button-secondary summary-change" href="${changeStayUrl(stay)}">${t('change')}</a>`;
}
function showFatal(message) {
  layout.hidden = true; status.hidden = false; status.className = 'flow-status is-error';
  status.innerHTML = `<h2>${message}</h2><a class="button button-secondary" href="index.html#booking">${t('returnRates')}</a>`;
}
async function loadCheckout() {
  if (!checkoutId) { showFatal(t('missing')); return; }
  try {
    currentQuote = await apiRequest(`/checkout-sessions/${checkoutId}`);
    status.hidden = true; layout.hidden = false; renderSummary(); form.hidden = false; renderTurnstile();
  } catch { showFatal(t('unavailable')); }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault(); const error = document.querySelector('#form-error');
  if (!form.checkValidity()) { error.textContent = t('required'); form.reportValidity(); return; }
  if (turnstileRequired && !turnstileToken) { error.textContent = t('turnstileRequired'); return; }
  const formData = new FormData(form);
  const button = document.querySelector('#submit-request');
  button.disabled = true; error.textContent = '';
  try {
    const result = await apiRequest('/booking-requests', { method: 'POST', body: JSON.stringify({
      checkoutId, idempotencyKey, turnstileToken,
      guest: { firstName: formData.get('firstName'), lastName: formData.get('lastName'), email: formData.get('email'), phoneCountryCode: formData.get('phoneCountryCode'), phoneNumber: formData.get('phoneNumber'), notes: formData.get('notes') },
      paymentMethod: formData.get('paymentMethod'), termsAccepted: Boolean(formData.get('termsAccepted')), privacyAccepted: Boolean(formData.get('privacyAccepted')), marketingAccepted: Boolean(formData.get('marketingAccepted')),
    }) });
    form.hidden = true; confirmation.hidden = false; document.querySelector('#request-reference').textContent = result.requestId;
    document.querySelector('#email-delivery-note').hidden = result.emailStatus === 'sent';
    confirmation.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch {
    error.textContent = t('submitError'); button.disabled = false; turnstileToken = '';
    if (window.turnstile && turnstileRendered) window.turnstile.reset();
  }
});

async function renderTurnstile() {
  if (turnstileRendered) return;
  try {
    const config = await apiRequest('/runtime-config');
    if (!config.turnstileSiteKey) return;
    turnstileRequired = true;
    await new Promise((resolve, reject) => {
      const script = document.createElement('script'); script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async = true; script.defer = true; script.onload = resolve; script.onerror = reject; document.head.append(script);
    });
    window.turnstile.render('#turnstile-container', { sitekey: config.turnstileSiteKey, callback: (token) => { turnstileToken = token; }, 'expired-callback': () => { turnstileToken = ''; } });
    turnstileRendered = true;
  } catch { /* Production submit still fails closed if Turnstile is unavailable. */ }
}

applyCopy();
loadCheckout();
