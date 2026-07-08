// Attract-Mode: 6 Szenen, Gesamtloop ~80 s. Jede Szene ist eine herangezoomte
// Station der Buehne (focusModule) oder eine Gesamtansicht — der Bildschirm-
// schoner IST die Karte, nur mit Autopilot-Kamera.
//
// type: brand | chatDemo | words | team | cta
export const attractScenes = [
  {
    id: 'opener',
    type: 'brand',
    focusModule: null, // Zentrum der Konstellation
    durationMs: 8000,
    headline: 'Willkommen',
    sub: 'KI, die im Mittelstand ankommt.',
  },
  {
    // Die 8 Angebote fliegen als ROTE Kaesten nacheinander rein und raus
    // (Kundenwunsch 07/2026). Inhalte kommen aus modules.js → angebote.cards
    // (eine Quelle, keine Doppelpflege). perItemMs = Dauer pro Angebot.
    id: 'angebote',
    type: 'angebote',
    focusModule: 'angebote',
    perItemMs: 5500,
    durationMs: 8 * 5500,
    headline: 'Was wir anbieten',
  },
  {
    id: 'arbeit',
    type: 'words',
    focusModule: 'arbeit',
    durationMs: 12000,
    headline: null,
    // Die 4 Worte wechseln gross durch (je 3 s), darunter je ein Satz.
    words: [
      { word: 'Strategie.', line: 'Ein Workshop-Tag. Eine priorisierte KI-Roadmap.' },
      { word: 'Schulung.', line: 'Dein Team lernt KI — an euren echten Aufgaben.' },
      { word: 'Befähigung.', line: 'Ihr arbeitet selbstständig mit KI. Wir machen euch stark.' },
      { word: 'Umsetzung.', line: 'Automatisierung & Programmierung. Bis es läuft.' },
    ],
  },
  {
    id: 'websitebot',
    type: 'chatDemo',
    focusModule: 'websitebot',
    durationMs: 12000,
    headline: 'Dieser Chatbot arbeitet gerade jetzt für einen Kunden.',
    script: {
      question: 'Habt ihr Whisky-Tastings im Angebot?',
      answer:
        'Ja! Bei VOM FASS Freudenstadt gibt es regelmäßig Tastings — ' +
        'aktuelle Termine und Anmeldung findest du direkt im Shop. ' +
        'Soll ich dir die Übersicht schicken?',
    },
  },
  {
    id: 'cta',
    type: 'cta',
    focusModule: 'overview', // Zoom-Out auf die Gesamtkonstellation
    durationMs: 8000,
    headline: 'Berühr den Bildschirm —',
    sub: 'und flieg selbst durchs RobbeVersum.',
  },
]
