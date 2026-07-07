// Zentrale Messe-Konfiguration. Eine neue Messe = neues Verzeichnis unter
// src/config/fairs/ + Assets unter public/fairs/ — null Komponenten-Aenderungen.
export const fairConfig = {
  fairId: 'default',

  messe: {
    name: 'Messe 2026',
    ort: '',
    stand: 'Stand A1',
  },

  kontakt: {
    name: 'Florian Robbe',
    firma: 'Robbe Sales & AI Consulting',
    telefon: '+49 156 79659650',
    email: 'florian.robbe@robbe-consulting.de',
  },

  // Inaktivitaets-Kaskade (ms). Werte auf der Messe via Admin-Overlay justierbar.
  idle: {
    warnDefaultMs: 45_000,   // Module ohne Eingabe: "Noch da?" nach 45 s
    warnInputMs: 90_000,     // Chat/Formular: Leute lesen & denken — 90 s
    countdownMs: 15_000,     // "Noch da?"-Countdown
    hubToAttractMs: 60_000,  // Hub ohne Touch → Attract-Mode
    attractToResetMs: 30_000,// Attract laeuft 30 s → kompletter Session-Reset
  },

  openwebui: {
    baseUrl: import.meta.env.VITE_OPENWEBUI_URL || 'https://ki.robbe-consulting.de',
    apiKey: import.meta.env.VITE_OWUI_KIOSK_KEY || '',
    model: import.meta.env.VITE_OWUI_MODEL || 'robbe-unternehmenswissen', // TODO: echte Workspace-Modell-ID
  },

  webhooks: {
    messeBot: import.meta.env.VITE_N8N_MESSE_BOT_URL || 'https://n8n.srv1047901.hstgr.cloud/webhook/messe-bot',
    websiteBot: import.meta.env.VITE_N8N_WEBSITE_BOT_URL || 'https://n8n.srv1047901.hstgr.cloud/webhook/robbe-chatbot',
    lead: import.meta.env.VITE_N8N_LEAD_URL || 'https://n8n.srv1047901.hstgr.cloud/webhook/messe-lead',
  },

  urls: {
    website: 'https://robbe-consulting.de/',
    termin: 'https://calendar.app.google/CfdmPcBowRim2uJe7', // Google-Terminplanung (wie Website)
    datenschutz: 'https://robbe-consulting.de/datenschutz',
  },

  // Statische QR-Codes (offlinefaehig) — public/fairs/<fairId>/
  // qr-termin.png = Google-Terminbuchung, qr-vcard.png = vCard Florian.
  qr: {
    termin: '/fairs/default/qr-termin.png',
    vcard: '/fairs/default/qr-vcard.png',
  },

  // DSGVO-Einwilligung in Klartext (versioniert — Wortlaut geht mit ins Lead-Payload).
  consentText:
    'Florian Robbe darf mich einmalig zu meiner Anfrage kontaktieren. ' +
    'Meine Daten werden dafür gespeichert und nicht weitergegeben.',
  consentVersion: '2026-07-v1',

  adminPin: import.meta.env.VITE_ADMIN_PIN || '2468',
  nightlyReloadHour: 4, // Memory-Leak-Prophylaxe im Dauerbetrieb

  // Lead-Einladung des Bots nach dem n-ten besuchten Modul (genau 1× pro Session).
  leadInviteAfterModules: 3,
}
