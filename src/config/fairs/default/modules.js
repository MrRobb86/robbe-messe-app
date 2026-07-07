// Die 7 Satelliten des Robbeversums. hubPosition in Buehnen-Koordinaten
// (Design-Flaeche 1920×1080, Karte ~400×270, Position = linke obere Ecke,
// rot = feste leichte Verdrehung in Grad). Positionen sind handgesetzt —
// bewusst kein Physik-Layout.
//
// kind-Registry: iframe | kioskChat | demoScript | contentCards | team | lead
export const modules = [
  {
    id: 'website',
    kind: 'iframe',
    eyebrow: '01 — LIVE',
    title: 'Unsere Website',
    teaser: 'robbe-consulting.de — live und zum Durchblättern.',
    hubPosition: { x: 120, y: 96, rot: -1.6 },
    botTeaser: 'Frag mich, was Robbe Consulting eigentlich macht.',
    payload: { urlKey: 'website', frameLabel: 'robbe-consulting.de — LIVE' },
  },
  {
    id: 'wissenski',
    kind: 'kioskChat',
    eyebrow: '02 — LIVE-DEMO',
    title: 'Unternehmens-KI',
    teaser: 'Frag einfach unser Firmenwissen — sie antwortet sofort.',
    hubPosition: { x: 1400, y: 110, rot: 1.8 },
    botTeaser: 'Soll ich dir zeigen, was eine eigene Unternehmens-KI kann?',
    payload: {
      backend: 'openwebui',
      suggestions: [
        'Wie läuft ein KI-Strategie-Workshop ab?',
        'Was kostet eine eigene Unternehmens-KI?',
        'Welche Schulungen bietet ihr an?',
        'Wie startet mein Unternehmen mit KI?',
      ],
      greeting:
        'Hallo! Ich bin die Unternehmens-KI von Robbe Sales & AI Consulting — ' +
        'gefüttert mit unserem kompletten Firmenwissen. Frag mich einfach.',
    },
  },
  {
    id: 'copilot',
    kind: 'demoScript',
    eyebrow: '03 — PRODUKT',
    title: 'RoboAI Copilot',
    teaser: 'Das KI-Portal für dein Team — eine kurze Tour.',
    hubPosition: { x: 210, y: 620, rot: 1.2 },
    botTeaser: 'Frag mich, wie der RoboAI Copilot in deinem Team arbeitet.',
    payload: {
      // Geführte Tour: Screens/Storyline. tryUrl = Live-Instanz (ai.tool.center
      // sendet keine frame-ancestors-Header → einbettbar). Offen: Demo-User
      // ohne Login, sonst sehen Besucher nur den Login-Screen.
      tryUrl: 'https://robbe-consulting.ai.tool.center/library/apps',
      steps: [
        {
          title: 'Ein Portal, alle KI-Agenten',
          text: 'Deine Mitarbeiter arbeiten mit fertigen KI-Agenten — Angebote, E-Mails, Recherche. Ohne Prompt-Wissen, im eigenen Firmen-Design.',
          image: '/fairs/default/copilot-1.png',
        },
        {
          title: 'Firmenwissen eingebaut',
          text: 'Jeder Agent kennt eure Dokumente, Prozesse und Produkte. Antworten kommen aus DEINEM Unternehmen, nicht aus dem Internet.',
          image: '/fairs/default/copilot-2.png',
        },
        {
          title: 'DSGVO-konform gehostet',
          text: 'Self-hosted in der EU. Keine Daten an US-Clouds, volle Kontrolle, klare Rollen.',
          image: '/fairs/default/copilot-3.png',
        },
      ],
    },
  },
  {
    id: 'websitebot',
    kind: 'kioskChat',
    eyebrow: '04 — IM EINSATZ',
    title: 'Chatbot im Einsatz',
    teaser: 'So arbeitet unser Website-Chatbot — gerade jetzt, live.',
    hubPosition: { x: 760, y: 140, rot: -0.8 },
    botTeaser: 'Frag mich, was so ein Chatbot für deine Website kostet.',
    payload: {
      backend: 'n8n',
      webhookKey: 'websiteBot',
      suggestions: [
        'Was bietet Robbe Consulting an?',
        'Wie schnell ist so ein Chatbot eingerichtet?',
        'Kann der Bot auch Termine vereinbaren?',
      ],
      greeting:
        'Hallo! Ich bin der Chatbot von robbe-consulting.de — genau so, wie ' +
        'Website-Besucher mich erleben. Stell mir eine Frage!',
    },
  },
  {
    id: 'arbeit',
    kind: 'contentCards',
    eyebrow: '05 — SO ARBEITEN WIR',
    title: 'Wie wir arbeiten',
    teaser: 'Von der Strategie bis zur laufenden Automatisierung.',
    hubPosition: { x: 1330, y: 590, rot: -1.4 },
    botTeaser: 'Frag mich, wie ein Strategie-Workshop bei euch ablaufen würde.',
    payload: {
      cards: [
        {
          eyebrow: 'SCHRITT 1',
          title: 'Strategie-Workshop',
          text: 'Ein Tag, dein Team, alle Prozesse auf dem Tisch. Am Ende: eine priorisierte KI-Roadmap mit Quick Wins.',
        },
        {
          eyebrow: 'SCHRITT 2',
          title: 'Schulung & Befähigung',
          text: 'Deine Mitarbeiter lernen, mit KI zu arbeiten — praxisnah, an euren echten Aufgaben. Keine Folienschlacht.',
        },
        {
          eyebrow: 'SCHRITT 3',
          title: 'Umsetzung & Automatisierung',
          text: 'Wir bauen: Automatisierungen, Chatbots, Unternehmens-KI. Angebunden an eure Systeme, betrieben in der EU.',
        },
        {
          eyebrow: 'LAUFEND',
          title: 'Begleitung',
          text: 'KI ist kein Projekt mit Enddatum. Wir bleiben dran — neue Anwendungsfälle, neue Modelle, dein Vorsprung.',
        },
      ],
    },
  },
  {
    id: 'team',
    kind: 'team',
    eyebrow: '06 — MENSCHEN',
    title: 'Das Team',
    teaser: 'Menschen, keine Buzzwords.',
    hubPosition: { x: 800, y: 660, rot: 0.9 },
    botTeaser: 'Frag mich, wer hinter Robbe Consulting steckt.',
    payload: {
      members: [
        {
          name: 'Florian Robbe',
          role: 'Gründer · KI-Beratung & Vertrieb',
          text: 'Vertriebsprofi und KI-Berater — bringt KI dorthin, wo sie Umsatz macht.',
          image: '/fairs/default/team-florian.jpg',
        },
        // Weitere Team-Mitglieder hier ergaenzen (Bild nach public/fairs/default/)
      ],
    },
  },
  {
    id: 'kontakt',
    kind: 'lead',
    eyebrow: 'TERMIN & KONTAKT',
    title: 'Sprechen wir!',
    teaser: 'Termin buchen oder Kontakt dalassen — 30 Sekunden.',
    hubPosition: { x: 1470, y: 350, rot: 0 },
    accentDot: true, // einzige Karte mit permanentem Puls-Punkt
    botTeaser: null, // im Kontakt-Modul schweigt der Bot
    payload: {},
  },
]
