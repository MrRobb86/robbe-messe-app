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
    kind: 'portal',
    eyebrow: '03 — PRODUKT',
    title: 'Robbe AI-Copilot',
    teaser: 'Das KI-Portal für dein Team — ausprobieren erlaubt.',
    hubPosition: { x: 230, y: 720, rot: 1.2 },
    botTeaser: 'Frag mich, wie der Robbe AI-Copilot in deinem Team arbeitet.',
    payload: {
      // Ausfuehrliche Portal-Beschreibung + "Zum Portal"-Button.
      // portalUrl: ai.tool.center sendet keine frame-ancestors-Header →
      // einbettbar. Offen: Demo-User ohne Login (aven8 fragen), sonst sehen
      // Besucher den Login-Screen.
      portalUrl: 'https://robbe-consulting.ai.tool.center/library/apps',
      frameLabel: 'ROBBE AI-COPILOT — LIVE',
      intro:
        'Der Robbe AI-Copilot ist das KI-Portal für dein ganzes Team: ' +
        'fertige KI-Agenten für Angebote, E-Mails, Recherche und eure ' +
        'Alltagsprozesse — ohne Prompt-Wissen, im eigenen Firmen-Design.',
      features: [
        {
          eyebrow: 'AGENTEN',
          title: 'Ein Portal, alle KI-Agenten',
          text: 'Deine Mitarbeiter wählen den passenden Agenten und legen los — Angebot schreiben, E-Mail beantworten, Markt recherchieren. Kein Prompt-Studium nötig.',
        },
        {
          eyebrow: 'WISSEN',
          title: 'Firmenwissen eingebaut',
          text: 'Jeder Agent kennt eure Dokumente, Prozesse und Produkte. Antworten kommen aus DEINEM Unternehmen, nicht aus dem Internet.',
        },
        {
          eyebrow: 'DATENSCHUTZ',
          title: 'DSGVO-konform gehostet',
          text: 'Gehostet in der EU. Keine Daten an US-Clouds, volle Kontrolle, klare Rollen und Rechte.',
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
    hubPosition: { x: 760, y: 90, rot: -0.8 },
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
    teaser: 'Unser 12-Schritte-Plan — von der Analyse bis zur Verankerung.',
    hubPosition: { x: 1330, y: 730, rot: -1.4 },
    botTeaser: 'Frag mich, wie unser 12-Schritte-Plan bei euch ablaufen würde.',
    payload: {
      // Der 12-Schritte-Plan von robbe-consulting.de/ki-beratung (Stand 07/2026).
      cards: [
        { eyebrow: 'SCHRITT 01', title: 'Grundlagen-Workshop', text: 'Was ist KI, was kann sie — und was nicht? Gemeinsames Verständnis im Führungsteam schaffen.' },
        { eyebrow: 'SCHRITT 02', title: 'Analysen', text: 'Outside-in durch den Berater + Inside-out mit der Geschäftsführung. Prozesse, Potenziale und Risiken werden sichtbar.' },
        { eyebrow: 'SCHRITT 03', title: 'Kick-Off Geschäftsführung', text: 'Analyse-Ergebnisse, erste Handlungsfelder, Commitment der Führungsebene für die Transformation.' },
        { eyebrow: 'SCHRITT 04', title: 'Kick-Off Projektteam', text: 'Das interne Team wird eingebunden, Rollen verteilt und der Fahrplan gemeinsam beschlossen.' },
        { eyebrow: 'SCHRITT 05', title: 'AI Champions', text: 'Interne Multiplikatoren werden identifiziert und befähigt — sie tragen die KI in die Abteilungen.' },
        { eyebrow: 'SCHRITT 06', title: 'Schulungen', text: 'Mindestens 8 Einheiten à 90 Minuten — praxisnah, branchenspezifisch, mit echten Anwendungsfällen.' },
        { eyebrow: 'SCHRITT 07', title: 'Strategie-Workshop', text: 'Vision, Anwendungsfälle und Roadmap für die ersten 100 Tage — gemeinsam erarbeitet und dokumentiert.' },
        { eyebrow: 'SCHRITT 08', title: 'Umsetzung der Roadmap', text: 'Schritt für Schritt — priorisiert, messbar und mit klaren Verantwortlichkeiten.' },
        { eyebrow: 'SCHRITT 09', title: 'Unternehmens-KI einführen', text: 'Sichere, DSGVO-konforme KI-Plattform — Serverstandort Deutschland, alle relevanten Modelle.' },
        { eyebrow: 'SCHRITT 10', title: 'Umsetzung & Test', text: 'AI Champions treiben Pilotprojekte voran. Erste Automationen und Agenten gehen live.' },
        { eyebrow: 'SCHRITT 11', title: 'Change Management', text: 'Mitarbeiter aktiv durch den Wandel begleiten — Widerstände abbauen, Akzeptanz aufbauen.' },
        { eyebrow: 'SCHRITT 12', title: 'Verankern', text: 'KI-Richtlinien, laufende Schulung und Sparringspartnerschaft sichern den Erfolg dauerhaft.' },
      ],
    },
  },
  {
    id: 'angebote',
    kind: 'contentCards',
    eyebrow: '06 — LEISTUNGEN',
    title: 'Was wir anbieten',
    teaser: 'Von KI-Beratung bis Telefonagent — acht Wege zu deinem Vorsprung.',
    hubPosition: { x: 110, y: 410, rot: 1.4 },
    botTeaser: 'Frag mich, welches Angebot zu deinem Unternehmen passt.',
    payload: {
      // Leistungen von robbe-consulting.de (Stand 07/2026).
      cards: [
        { eyebrow: 'BERATUNG', title: 'KI-Beratung', text: 'Strategische KI-Integration in 12 Schritten — EU-AI-Act-konform, DSGVO-sicher. Done-with-you, nicht Done-for-you.' },
        { eyebrow: 'SCHULUNG', title: 'KI-Schulungen', text: 'Von KI-Grundlagen bis Agenten und Automatisierungen — praxisnah, verständlich, sofort umsetzbar.' },
        { eyebrow: 'SCHULUNG', title: 'Vertriebsschulungen', text: 'Für Jungverkäufer bis Vertriebsleiter — 18 Jahre B2B-Direktvertrieb, praxisnah und branchenspezifisch.' },
        { eyebrow: 'COACHING', title: 'Vertriebscoaching', text: 'Echtes Mitreisen im Vertriebsalltag, Einzel- und Team-Formate — plus KI als Verstärker.' },
        { eyebrow: 'UMSETZUNG', title: 'KI-Workflows & Automatisierung', text: 'Prozesse analysieren, digitalisieren, automatisieren — maßgeschneiderte Agenten in wenigen Wochen startklar.' },
        { eyebrow: 'PRODUKT', title: 'Fonio — KI-Telefonagent', text: 'Nimmt Anrufe an wie ein Mitarbeiter: 24/7, auf Deutsch, DSGVO-konform. Wir sind Gold-Partner.' },
        { eyebrow: 'PROGRAMM', title: 'KI-Führerschein', text: '90-Tage-Lernprogramm mit Online-Prüfung und Zertifikat — auch als kompakte Light-Variante.' },
        { eyebrow: 'RECHT', title: 'EU AI Act & KI-Richtlinien', text: 'Seit 08/2025 verpflichtend — wir machen dein Unternehmen rechtssicher, verständlich und praxisnah.' },
      ],
    },
  },
  {
    id: 'team',
    kind: 'team',
    eyebrow: '07 — MENSCHEN',
    title: 'Das Team',
    teaser: 'Menschen, keine Buzzwords.',
    hubPosition: { x: 790, y: 700, rot: 0.9 },
    botTeaser: 'Frag mich, wer hinter Robbe Consulting steckt.',
    payload: {
      members: [
        {
          name: 'Florian Robbe',
          role: 'Inhaber · KI-Manager & Vertriebsberater',
          text: '18 Jahre B2B-Direktvertrieb (Würth, Baumaschinenhandel), TÜV-SÜD-zertifizierter KI-Manager. Praktiker, kein Theoretiker: Done-with-you, nicht Done-for-you.',
          image: '/fairs/default/team-florian.png',
        },
        {
          name: 'Ghiath',
          role: 'KI-Workflow-Spezialist & Consultant',
          text: 'Master IT-Ingenieurwesen mit Machine-Learning-Spezialisierung (KIT Karlsruhe). Entwickelt KI-Workflows und setzt sie gemeinsam mit Kunden um.',
          image: '/fairs/default/team-ghiath.png',
        },
      ],
    },
  },
  {
    id: 'kontakt',
    kind: 'lead',
    eyebrow: 'TERMIN & KONTAKT',
    title: 'Sprechen wir!',
    teaser: 'Termin buchen oder Kontakt dalassen — 30 Sekunden.',
    hubPosition: { x: 1480, y: 420, rot: 0 },
    accentDot: true, // einzige Karte mit permanentem Puls-Punkt
    botTeaser: null, // im Kontakt-Modul schweigt der Bot
    payload: {},
  },
]
