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
    id: 'wissenski',
    type: 'chatDemo',
    focusModule: 'wissenski',
    durationMs: 16000,
    headline: 'Frag einfach unser Firmenwissen.',
    // Vorproduziertes Skript — kein Live-API-Call im Leerlauf.
    script: {
      question: 'Wie läuft ein KI-Strategie-Workshop ab?',
      answer:
        'Ein Tag bei euch im Haus: Wir nehmen eure Prozesse auseinander, ' +
        'priorisieren die besten KI-Anwendungsfälle in einer 2x2-Matrix und ' +
        'ihr geht mit einer konkreten Roadmap raus — inklusive Quick Wins, ' +
        'die sich in Wochen rechnen.',
    },
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
    id: 'team',
    type: 'team',
    focusModule: 'team',
    durationMs: 10000,
    headline: 'Menschen, keine Buzzwords.',
  },
  {
    id: 'cta',
    type: 'cta',
    focusModule: 'overview', // Zoom-Out auf die Gesamtkonstellation
    durationMs: 10000,
    headline: 'Berühr den Bildschirm —',
    sub: 'und flieg selbst durchs RobbeVersum.',
  },
]
