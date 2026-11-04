/* Keep social attribution and WhatsApp labels in the selected site language. */
(() => {
  const messages = {
    en: { managed: 'Proudly managed by Ventus Travel', chat: 'Questions? Chat with us', whatsapp: 'Chat with Ventus Travel on WhatsApp' },
    de: { managed: 'Professionell betreut von Ventus Travel', chat: 'Fragen? Schreiben Sie uns', whatsapp: 'Ventus Travel über WhatsApp kontaktieren' },
    hr: { managed: 'S ponosom upravlja Ventus Travel', chat: 'Pitanja? Javite nam se', whatsapp: 'Razgovarajte s Ventus Travelom na WhatsAppu' },
    it: { managed: 'Gestite con orgoglio da Ventus Travel', chat: 'Domande? Scriveteci', whatsapp: 'Contatta Ventus Travel su WhatsApp' }
  };
  const render = () => {
    let language = document.documentElement.lang.toLowerCase().slice(0, 2);
    try { language = localStorage.getItem('villa-lang') || language; } catch { /* Storage can be unavailable. */ }
    const copy = messages[language] || messages.en;
    document.querySelectorAll('[data-contact-managed]').forEach((element) => { element.textContent = copy.managed; });
    document.querySelectorAll('[data-contact-chat]').forEach((element) => { element.textContent = copy.chat; });
    document.querySelectorAll('.wa-chat-link').forEach((element) => { element.setAttribute('aria-label', copy.whatsapp); });
  };
  render();
  document.addEventListener('change', (event) => { if (event.target?.matches('#language-select')) queueMicrotask(render); });
})();
