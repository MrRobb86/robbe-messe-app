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
    kind: 'iframe',
    eyebrow: '02 — LIVE-DEMO',
    title: 'Unternehmens-KI',
    teaser: 'Frag einfach unser Firmenwissen — sie antwortet sofort.',
    hubPosition: { x: 1400, y: 110, rot: 1.8 },
    botTeaser: 'Soll ich dir zeigen, was eine eigene Unternehmens-KI kann?',
    // Eingebettete OpenWebUI-Oberflaeche (ki.robbe-consulting.de). Morgen-Login
    // durch Florian, danach direkt nutzbar. Kein API-Key, kein eigener Chat.
    payload: { urlKey: 'wissensKi', frameLabel: 'UNTERNEHMENS-KI — ki.robbe-consulting.de' },
  },
  {
    id: 'copilot',
    kind: 'portal',
    eyebrow: '03 — PRODUKT',
    title: 'Robbe AI-Copilot',
    teaser: 'Das KI-Portal für dein Team — ausprobieren erlaubt.',
    hubPosition: { x: 60, y: 730, rot: 1.2 },
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
    hubPosition: { x: 1440, y: 730, rot: -1.4 },
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
      // Leistungen von robbe-consulting.de (Stand 07/2026). Jede Karte hat
      // eine Detailseite (detail) — Texte original von der Website.
      cards: [
        {
          eyebrow: 'BERATUNG',
          title: 'KI-Beratung',
          text: 'Strategische KI-Integration in 12 Schritten — EU-AI-Act-konform, DSGVO-sicher. Done-with-you, nicht Done-for-you.',
          detail: {
            intro:
              'Strategische Integration von KI in deine Unternehmensprozesse — in 12 Schritten, EU-AI-Act-konform, DSGVO-sicher. Ich berate nicht nur, ich setze gemeinsam mit dir um: von der ersten Analyse bis zur dauerhaften Verankerung.',
            punkte: [
              { title: 'Grundlagen-Workshop', text: 'Was ist KI, was kann sie — und was nicht? Gemeinsames Verständnis im Führungsteam schaffen.' },
              { title: 'Analysen', text: 'Outside-in durch den Berater + Inside-out mit der Geschäftsführung: Prozesse, Potenziale und Risiken werden sichtbar.' },
              { title: 'AI Champions', text: 'Interne Multiplikatoren werden identifiziert und befähigt — sie tragen die Transformation in die Abteilungen.' },
              { title: 'Strategie-Workshop', text: 'Vision, Anwendungsfälle und Roadmap für die ersten 100 Tage — gemeinsam erarbeitet und dokumentiert.' },
              { title: 'Unternehmens-KI', text: 'Aufbau einer sicheren, DSGVO-konformen KI-Plattform — Serverstandort Deutschland, alle relevanten Modelle.' },
              { title: 'Change Management & Verankern', text: 'Mitarbeiter aktiv begleiten, KI-Richtlinien erstellen, laufende Sparringspartnerschaft sichert den Erfolg.' },
            ],
            fakten: '12 Schritte · Done-with-you · EU-AI-Act-konform · DSGVO-sicher · Umsetzung in Wochen · 18 Jahre B2B-Vertriebserfahrung',
          },
        },
        {
          eyebrow: 'SCHULUNG',
          title: 'KI-Schulungen',
          text: 'Von KI-Grundlagen bis Agenten und Automatisierungen — praxisnah, verständlich, sofort umsetzbar.',
          detail: {
            intro:
              'Von KI-Grundlagen bis zu Agenten und Automatisierungen — für Mitarbeiter, Teams und Führungskräfte. Praxisnah, verständlich und sofort umsetzbar. Kein Seminar von der Stange: jede Schulung wird auf Branche und Erfahrungsstufe zugeschnitten.',
            punkte: [
              { title: 'KI-Grundlagen & LLMs', text: 'Was ist KI wirklich? ChatGPT, Claude & Gemini im Vergleich — live demonstriert und sofort anwendbar.' },
              { title: 'Prompting', text: 'Die Kunst, KI richtig anzusprechen: von Grundlagen bis Chain-of-Thought, Few-Shot und rollenbasiertem Prompting.' },
              { title: 'Agenten & GPTs', text: 'Eigene KI-Agenten und personalisierte GPTs aufbauen, Wissensdatenbanken strukturieren.' },
              { title: 'Automatisierungen & KI-Tools', text: 'Workflow-Automatisierung ohne Programmierkenntnisse — plus Überblick über das ganze Tool-Ökosystem.' },
              { title: 'Vibe Coding', text: 'Software und Automatisierungen erstellen — ohne klassische Programmierkenntnisse.' },
              { title: 'Datenschutz & EU AI Act', text: 'DSGVO, Risikoklassen und KI-Richtlinien — rechtssicher und fester Bestandteil jeder Schulung.' },
            ],
            fakten: 'Einheiten 90–180 Min · WissensGPT statt Handout · 90-Tage-Lernfahrplan · Präsenz oder online · keine Vorkenntnisse nötig',
          },
        },
        {
          eyebrow: 'SCHULUNG',
          title: 'Vertriebsschulungen',
          text: 'Für Jungverkäufer bis Vertriebsleiter — 18 Jahre B2B-Direktvertrieb, praxisnah und branchenspezifisch.',
          detail: {
            intro:
              '18 Jahre B2B-Direktvertrieb: praxisnah, branchenspezifisch und mit echtem Mitreisen im Außendienst. Keine Einheitsfolien — nur relevante Inhalte aus der Praxis, zugeschnitten auf dein Produktportfolio.',
            punkte: [
              { title: 'Jungverkäufer', text: 'Der perfekte Start: Grundlagen des erfolgreichen Verkaufs, Zeitmanagement, Akquise und Beziehungsaufbau.' },
              { title: 'Fortgeschrittene', text: 'Abschlussquote steigern: tiefe Kundenanalyse, die neuen Phasen im Verkaufsgespräch, Einwand- & Vorwandbehandlung.' },
              { title: 'Vertriebsleiter der Zukunft', text: 'Führung & Motivation, KI-First-Strategie, Vertriebscontrolling und Teams durch die digitale Transformation führen.' },
              { title: 'Akquise & Neukundengewinnung', text: 'Systematisch im B2B: Zielkunden definieren, Erstkontakt gestalten, Termine vereinbaren — analog und digital.' },
              { title: 'Einwand- & Vorwandbehandlung', text: 'Souverän reagieren — mit Rollenspielen und direktem Feedback.' },
              { title: 'Inhouse-Seminare', text: 'Direkt in deinem Unternehmen — mit Beispielen aus deinem Sortiment. Optimal 6–12 Teilnehmer.' },
            ],
            fakten: '18 Jahre B2B-Praxis · 6–12 Teilnehmer · WissensGPT statt Handout · 90-Tage-Fahrplan · inhouse oder online',
          },
        },
        {
          eyebrow: 'COACHING',
          title: 'Vertriebscoaching',
          text: 'Echtes Mitreisen im Vertriebsalltag, Einzel- und Team-Formate — plus KI als Verstärker.',
          detail: {
            intro:
              'Ziel: Verkäufer noch erfolgreicher machen. Mit 18 Jahren B2B-Erfahrung, echtem Mitreisen im Vertriebsalltag und KI-Integration — echte Kundengespräche, direktes Feedback, messbare Ergebnisse.',
            punkte: [
              { title: 'Analyse & Zieldefinition', text: 'Wo steht der Verkäufer heute? Konkrete, messbare Ziele für Umsatz, Abschlussquote und Kundenbindung.' },
              { title: 'Praktische Begleitung', text: 'Mitreisen im Vertriebsalltag: echte Kundengespräche, direktes Feedback, sofortige Anpassung der Methodik.' },
              { title: 'KI-Integration', text: 'KI-Tools im persönlichen Vertriebsprozess: Gesprächsvorbereitung, Nachbereitung, Analyse.' },
              { title: 'Einzel-Coaching', text: 'Intensives 1:1 für Verkäufer oder Führungskräfte — maximal individuell, maximal wirksam.' },
              { title: 'Team- & Hybrid-Coaching', text: 'Das ganze Vertriebsteam entwickeln — vor Ort und online kombiniert.' },
              { title: 'CoachingPass', text: 'Festes Kontingent an Einheiten pro Monat, monatlich kündbar — Kontinuität schlägt Einmalmaßnahmen.' },
            ],
            fakten: 'Basis ab 3 Monaten · empfohlen 6–12 Monate · Mitreisen vor Ort · messbare Ergebnisse',
          },
        },
        {
          eyebrow: 'UMSETZUNG',
          title: 'KI-Workflows & Automatisierung',
          text: 'Prozesse analysieren, digitalisieren, automatisieren — maßgeschneiderte Agenten in wenigen Wochen startklar.',
          detail: {
            intro:
              'Wir schauen uns deine Prozesse an, schreiben sie nieder und digitalisieren sie. Maßgeschneiderte Software, Agenten und Automatisierungen — in wenigen Wochen startklar, ohne Programmierkenntnisse auf deiner Seite.',
            punkte: [
              { title: 'Agenten & digitale Mitarbeiter', text: 'Personalisierte GPTs, LLM-Agenten und Assistenten: Leadgenerierung, Gesprächsskripte, Kalkulationen.' },
              { title: 'Prozessautomatisierung', text: 'Wiederkehrendes automatisieren: Angebotsgenerator, Verbrauchsartikel-Reminder, Onboarding u. v. m.' },
              { title: 'Wissensdatenbanken (RAG)', text: 'Eigene Dokumente und Produktdaten mit KI verknüpfen — für Mitarbeiter, Abteilungen und Chatbots.' },
              { title: 'Web-Apps für die Branche', text: 'Bautagebuch, Dachwartungstool, Maschinenaufnahmetool — nach deinem Kundenprozess gebaut.' },
              { title: 'Klick & Collect Plattform', text: 'Online reservieren, vor Ort übergeben — mit KI-Kundenunterstützung rund um die Uhr.' },
              { title: 'Webdesign & digitaler Auftritt', text: 'Moderne Webauftritte, auf Wunsch mit KI-Chat und intelligenter Kundenführung.' },
            ],
            fakten: 'In Wochen startklar · No-Code (n8n, Make) · Begleitung vom Start bis zur Lösung',
          },
        },
        {
          eyebrow: 'PRODUKT',
          title: 'Fonio — KI-Telefonagent',
          text: 'Nimmt Anrufe an wie ein Mitarbeiter: 24/7, auf Deutsch, DSGVO-konform. Wir sind Gold-Partner.',
          detail: {
            intro:
              'Dein Telefon nimmt Anrufe an wie ein Mitarbeiter — 24/7, auf Deutsch, DSGVO-konform, Serverstandort Deutschland. Kein Anruf bleibt unbeantwortet. Als Fonio Gold Partner richte ich den Agenten für dich ein — von der Bedarfsanalyse bis zum Go-live.',
            punkte: [
              { title: 'Sekretariat & Anrufbeantworter', text: 'Nimmt Anrufe entgegen, gibt Auskunft, leitet weiter — auch in der Mittagspause und nach Feierabend.' },
              { title: 'Terminvereinbarung', text: 'Bucht Termine direkt in deinen Kalender — prüft Verfügbarkeit und bestätigt sofort.' },
              { title: 'Kundenservice & FAQ', text: 'Öffnungszeiten, Preise, Lieferzeiten, Produktinfos — sofort beantwortet, Team spürbar entlastet.' },
              { title: 'Lead-Qualifizierung', text: 'Stellt die richtigen Fragen und übergibt qualifizierte Leads an den Außendienst — mit Gesprächsprotokoll.' },
              { title: 'Transkription per E-Mail', text: 'Jedes Gespräch automatisch transkribiert und zugestellt — kein Detail geht verloren.' },
              { title: 'WhatsApp Add-on', text: 'Derselbe Assistent auch auf WhatsApp: FAQ, Terminbuchung, Bestellannahme — kein zweites Setup.' },
            ],
            fakten: '24/7 erreichbar · 100 % Anrufquote · Serverstandort Deutschland · DSGVO-konform · Fonio Gold Partner',
          },
        },
        {
          eyebrow: 'PROGRAMM',
          title: 'KI-Führerschein',
          text: '90-Tage-Lernprogramm mit Online-Prüfung und Zertifikat — auch als kompakte Light-Variante.',
          detail: {
            intro:
              'Strukturiertes KI-Wissen für Mitarbeitende und Teams — in zwei Varianten, mit Online-Prüfung und Zertifikat. Erfüllt nachweislich die Anforderungen aus Artikel 4 EU AI Act zur KI-Kompetenz der Mitarbeitenden.',
            punkte: [
              { title: 'Light — 4 Wochen', text: 'KI-Grundlagen & LLMs, Prompting, Agenten & Tools, Vibecoding — die kompakte Essenz, 90 Minuten pro Woche.' },
              { title: 'Vollprogramm — 3 Monate', text: '10 Module von KI-Grundlagen über DSGVO & EU AI Act bis KI-Strategie — inklusive Robbe AI-Copilot-Testzugang.' },
              { title: 'Online-Prüfung', text: 'Multiple Choice, 70 % Bestehensgrenze, beliebig oft wiederholbar — Ziel ist der Lernerfolg.' },
              { title: 'Zertifikat', text: 'Digitales PDF-Zertifikat, auf Wunsch mit Unternehmensname — plus LinkedIn-teilbares Badge.' },
              { title: 'Keine Vorkenntnisse nötig', text: 'Grundlegende PC-Kenntnisse genügen — Offenheit und Neugier reichen für den Einstieg.' },
              { title: 'EU-AI-Act-Nachweis', text: 'Dokumentiert die KI-Kompetenz deiner Mitarbeitenden nach Artikel 4 — rechtssicher belegt.' },
            ],
            fakten: '2 Varianten (4 Wochen / 3 Monate) · online & selbstbestimmt · Zertifikat · Copilot-Testzugang inklusive (Vollprogramm)',
          },
        },
        {
          eyebrow: 'RECHT',
          title: 'EU AI Act & KI-Richtlinien',
          text: 'Seit 08/2025 verpflichtend — wir machen dein Unternehmen rechtssicher, verständlich und praxisnah.',
          detail: {
            intro:
              'Seit dem 2.8.2025 sind KI-Richtlinien gesetzlich verpflichtend — für alle Unternehmen mit KI-Einsatz. Wer KI verbietet, verliert den Wettbewerbsvorteil; wer sie unkontrolliert lässt, riskiert Schaden. Der richtige Weg: Richtlinien, Schulung, kontrollierter Einsatz.',
            punkte: [
              { title: 'Risiko: Unkontrollierte Nutzung', text: 'Mitarbeiter nutzen KI ohne Regeln — ohne Überblick, was geteilt wird.' },
              { title: 'Risiko: Datenleck & DSGVO', text: 'Interne und personenbezogene Daten können über KI-Tools nach außen gelangen — mit rechtlichen Folgen.' },
              { title: 'Grundschulung', text: 'EU AI Act und KI-Datenschutz — verständlich und praxisnah für dein Team.' },
              { title: 'Firmenspezifische KI-Richtlinien', text: 'Als Konzept zur Vorlage und rechtssicheren Prüfung — zugeschnitten auf dein Unternehmen.' },
              { title: 'Fortlaufende Unterweisung', text: 'Z. B. jährlich — inklusive Dokumentation und Nachweis der Mitarbeiterkompetenz (Artikel 4).' },
              { title: 'Schnell umsetzbar', text: 'Risikoklassifizierung, Richtlinien und Schulung — mit Begleitung in 4 bis 8 Wochen.' },
            ],
            fakten: 'Pflicht seit 08/2025 (Art. 4 EU AI Act) · alle Unternehmen mit KI-Einsatz · umsetzbar in 4–8 Wochen',
          },
        },
      ],
    },
  },
  {
    id: 'team',
    kind: 'team',
    eyebrow: '07 — MENSCHEN',
    title: 'Das Team',
    teaser: 'Menschen, keine Buzzwords.',
    hubPosition: { x: 520, y: 730, rot: 0.9 },
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
          // Partner seit 08/2026 (Cyrobyte). Text = Entwurf, von Florian freizugeben.
          name: 'Mohammad Yousif',
          role: 'Partner · Softwareentwicklung & Prozessautomatisierung',
          text: 'Gründer von Cyrobyte und unser Partner für Softwareentwicklung und Prozessautomatisierung. Er verwandelt eure Abläufe in maßgeschneiderte Web-Apps und Automatisierungen — von der ersten Analyse bis zur fertigen Lösung.',
          image: '/fairs/default/team-mohammad.png',
        },
      ],
    },
  },
  {
    id: 'projekte',
    kind: 'projekte',
    eyebrow: '08 — UNSERE PROJEKTE',
    title: 'Unsere Projekte',
    teaser: 'Vier Software-Projekte aus der Praxis — live zum Anfassen.',
    hubPosition: { x: 980, y: 730, rot: -0.6 },
    botTeaser: 'Frag mich, wie so ein Projekt bei euch aussehen könnte.',
    payload: {
      // liveUrl + openMode:'tab' = gehostete Live-App oeffnet in eigenem Fenster
      // (Login/Basic-Auth dort, morgens 1x). liveUrl OHNE openMode = einbettbare
      // Demo-Instanz im iframe (HTTPS, ohne Login-Huerde, ohne X-Frame-Options).
      // Leer = noch keine erreichbare URL bekannt.
      projects: [
        {
          id: 'gmb',
          eyebrow: 'LANDTECHNIK · WÜSTENBERG',
          title: 'Gebrauchtmaschinen-Bewertung',
          text: 'KI-gestützte Bewertung gebrauchter Land- und Baumaschinen — mit Marktrecherche in Minuten statt Stunden.',
          liveUrl: '',
          frameLabel: 'GEBRAUCHTMASCHINEN-BEWERTUNG — LIVE-DEMO',
          detail: {
            intro:
              'Verkäufer fotografieren das Typenschild, die KI liest die Maschinendaten aus, recherchiert aktuelle Marktpreise vergleichbarer Angebote und erstellt eine belastbare Bewertung — als PDF und Excel, direkt aus der App.',
            punkte: [
              { title: 'Typenschild-OCR', text: 'Foto hochladen — Hersteller, Modell, Baujahr und Betriebsstunden werden automatisch erkannt.' },
              { title: 'Marktbewertung per KI', text: 'Automatische Recherche vergleichbarer Angebote am Markt, Preisspanne und Empfehlung.' },
              { title: 'Produktkatalog', text: 'Über 120 Maschinengruppen hinterlegt — die Bewertung kennt die Branche.' },
              { title: 'PDF & Excel', text: 'Bewertungsbericht auf Knopfdruck — für Kunde, Vertrieb und Ankauf.' },
              { title: 'Rollen & Rechte', text: 'Admin, Bewerter, Verkäufer — jeder sieht, was er braucht.' },
              { title: 'Selbst gehostet', text: 'Läuft auf eigenem Server, Daten bleiben im Haus. Automatisierung über n8n.' },
            ],
            fakten: 'Kunde: Wüstenberg Landtechnik · Web-App (React) + KI-Workflows (n8n) · Bewertung in Minuten',
          },
        },
        {
          id: 'patzig',
          eyebrow: 'DACHDECKER · PATZIG DACH',
          title: 'Dachwartung & Bautagesbericht',
          text: 'Vom Schadensfoto per Telegram bis zum Angebot: das komplette Wartungs- und Projektsystem für einen Dachdeckerbetrieb.',
          liveUrl: 'http://217.160.192.113/',
          openMode: 'tab', // nur HTTP + Basic-Auth → nicht einbettbar, eigenes Fenster
          frameLabel: 'PATZIG DACH-SYSTEM — LIVE-DEMO',
          detail: {
            intro:
              'Die Monteure melden Schadstellen direkt vom Dach per Telegram-Bot — mit Foto und Sprachnotiz. Das System ordnet sie Projekten zu, kalkuliert Reparaturoptionen, erstellt Angebote und Bautagesberichte und behält die Abrechnung im Blick.',
            punkte: [
              { title: 'Schadstellen per Telegram', text: 'Foto + Sprachnachricht vom Dach — landet strukturiert im System, ohne Büroarbeit.' },
              { title: 'Reparaturoptionen & Kalkulation', text: 'Hinterlegte Formeln kalkulieren Aufwand und Preis pro Schadstelle automatisch.' },
              { title: 'Angebote & Bautagesberichte', text: 'Dokumente entstehen aus den erfassten Daten — kein doppeltes Tippen.' },
              { title: 'Projekt- & Kundenverwaltung', text: 'Alle Objekte, Kunden, Mitarbeiter und Termine an einem Ort.' },
              { title: 'Abrechnungslogik', text: 'Wartungsverträge, Einzelaufträge und Nachträge sauber getrennt und nachvollziehbar.' },
              { title: 'Für den Handwerksbetrieb gebaut', text: 'Bedienbar mit dreckigen Händen auf dem Handy — genau für den Alltag auf der Baustelle.' },
            ],
            fakten: 'Kunde: Patzig Dach · Web-App (Vue) + Telegram-Bot + Datenbank · von der Schadstelle bis zur Rechnung',
          },
        },
        {
          id: 'holp',
          eyebrow: 'MASCHINENHANDEL · HOLP',
          title: 'HOLP Serviceportal',
          text: 'Ein Portal für Händler, Partner und Kunden: Servicefälle, Ersatzteile, Garantie und Angebote — mit KI-Wissensdatenbank.',
          liveUrl: 'https://serviceportal.holp.eu',
          openMode: 'tab', // Basic-Auth + Login → eigenes Fenster, bis Demo-Instanz steht
          frameLabel: 'HOLP SERVICEPORTAL — LIVE-DEMO',
          detail: {
            intro:
              'Statt Telefon und E-Mail-Pingpong: Händler, Partner und Endkunden melden Servicefälle im Portal, finden Ersatzteile, stellen Garantieanträge und bekommen Angebote — und eine KI-Wissensdatenbank beantwortet technische Fragen sofort aus den Handbüchern.',
            punkte: [
              { title: 'Servicefälle digital', text: 'Anlegen, verfolgen, abschließen — mit Historie, Fotos und Status für alle Beteiligten.' },
              { title: 'Ersatzteile & Angebote', text: 'Teile zur Maschine finden, Angebot anfordern — mit hinterlegten Arbeitswerten.' },
              { title: 'Garantieanträge', text: 'Strukturiert statt per Formular-Fax: alle Daten vollständig, Bearbeitung nachvollziehbar.' },
              { title: 'KI-Wissensdatenbank', text: 'Technische Fragen werden aus Handbüchern und Servicewissen beantwortet — Tag und Nacht.' },
              { title: 'Rollen für jeden Partner', text: 'Händler, Partner, Kunde, Service, Vertrieb, Admin — jeder sieht genau seinen Bereich.' },
              { title: 'ERP-Anbindung vorbereitet', text: 'Adapter für MyFactory, Messaging und Wissenssuche — austauschbar, produktiv erweiterbar.' },
            ],
            fakten: 'Kunde: HOLP · Web-App (React) + API + KI-Wissenssuche · live seit 08/2026',
          },
        },
        {
          id: 'image',
          eyebrow: 'ARBEITSSICHERHEIT · IMAGE CONSULTING',
          title: 'Arbeitssicherheits-Plattform',
          text: 'Begehungen, ASA-Protokolle, Maßnahmenpläne und Gefährdungsbeurteilungen — erfasst per Handy und Diktat, fertig als revisionssicherer Bericht.',
          liveUrl: '', // noch kein Deployment (Server + Demo-Subdomain offen) → später openMode 'tab'
          frameLabel: 'IMAGE ARBEITSSICHERHEIT — LIVE-DEMO',
          detail: {
            intro:
              'Die Plattform für Sicherheitsfachkräfte und ihre Firmenkunden: Vor Ort werden Begehungen, ASA-Sitzungen und Prüfungen per Wizard oder Handy-App erfasst — mit Foto und Diktat. Die KI transkribiert und formuliert daraus den Berichtsentwurf mit den passenden Textbausteinen; heraus kommen revisionssichere PDFs im Kundenlayout. Über das Kundenportal sehen Firmenkunden ihre Berichte, offenen Maßnahmen und Gefährdungsbeurteilungen und kommunizieren direkt mit der Fachkraft.',
            punkte: [
              { title: 'Berichte in Minuten', text: 'Begehung, ASA-Protokoll, Maßnahmenplan, Prüfbericht — Wizard am Rechner oder Handy-App vor Ort, offlinefähig.' },
              { title: 'Diktat wird Fachtext', text: 'Sprachnotiz oder Sitzungsaufnahme → KI-Entwurf mit Verweisen auf 290 geprüfte Textbausteine (EU-Hosting).' },
              { title: 'Gefährdungsbeurteilung', text: 'Katalog mit 68 Prüfpunkten, Risikomatrix, daraus abgeleitete Betriebsanweisungen.' },
              { title: 'Maßnahmen & Fristen', text: 'Aufgaben-Center mit Erinnerungen, Fristverlängerung per Antrag — nichts bleibt liegen.' },
              { title: 'Kundenportal', text: 'Firmenkunden und deren Mitarbeiter sehen ihre Berichte, Maßnahmen und Unterweisungen — mit Rollen von Geschäftsführung bis Mitarbeiter.' },
              { title: 'Revisionssicher & DSGVO', text: 'PDF/Excel im Kundenlayout mit Revisionen, jede KI-Nutzung protokolliert, Daten in der EU.' },
            ],
            fakten: 'Kunde: IMAGe Consulting · Web-App (Laravel) + Handy-App + KI-Transkription + Kundenportal · Deployment in Vorbereitung',
          },
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
