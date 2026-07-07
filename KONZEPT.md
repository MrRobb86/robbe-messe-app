# Robbeversum — Konzept & Handoff-Dokumentation

> Dieses Dokument macht das Projekt für jeden (Mensch oder LLM) fortsetzbar:
> Was gebaut wurde, WARUM es so gebaut wurde, wie vorgegangen wurde und was offen ist.
> Stand: 07.07.2026. Ergänzend: `README.md` (Betrieb/Checkliste), `CLAUDE.md` (Arbeitskonventionen).

## 1. Was ist das Robbeversum?

Eine interaktive Messe-Kiosk-App für **Robbe Sales & AI Consulting** (Florian Robbe,
robbe-consulting.de). Sie läuft auf einem großen Android-Touchdisplay im **Fully Kiosk
Browser** am Messestand. Ziel: Besucher klicken sich selbsterklärend durch die Themen,
erleben die KI-Produkte live — und hinterlassen am Ende ihre Kontaktdaten oder buchen
direkt einen Termin. Erste Messe: **Anfang September 2026**. Die App ist über
Konfigurationsdateien für alle künftigen Messen wiederverwendbar.

## 2. Das UX-Konzept: „Papier-Kosmos"

**Kernidee:** Kein dunkles Sci-Fi-Universum, sondern eine editoriale Karten-Konstellation
auf warmem Papier (#F8F7F4) im Robbe-CI — 8 Stationen („Satelliten") um die Wortmarke
ROBBEVERSUM, verbunden durch Haarlinien, rote Punkte als Knoten.

**Der zentrale Trick:** Bildschirmschoner (Attract-Mode) und interaktiver Hub sind
**dieselbe Bühne**. Der Attract-Loop ist nur eine Autopilot-Kamerafahrt über die
Konstellation (6 Szenen, ~80 s, inkl. selbsttippendem Demo-Chat als Hingucker).
Berührt jemand den Screen, fährt die Kamera in 700 ms auf die Gesamtansicht zurück —
„der Bildschirmschoner war die Karte". Kein Szenenwechsel, kein Ladescreen.

- **Zoom-Navigation:** Tap auf Karte → Karte wächst dem Besucher entgegen (140 ms),
  dann fliegt die Kamera hinein (600 ms), das Modul blendet gestaffelt ein.
  Zurück-Button: fixe Pill unten links, immer gleich („ein Button, ein Ort").
- **Messe-Bot:** Floating Bubble unten links (Optik = Website-Chatbot: roter Kreis,
  weißes Chat-Icon), öffnet ein Side-Sheet. Pro Modul max. 1 proaktive Sprechblase,
  je 1× pro Session. Nach dem 3. besuchten Modul genau EINE Lead-Einladung.
- **Gamification, dezent:** 8 Fortschritts-Punkte oben rechts („4 von 8 entdeckt").
- **Lead-Moment:** Kontakt-Modul mit zwei Wegen — Termin buchen (Google-Terminplanung
  als iframe + QR) oder Formular (3 Pflichtangaben, Interessens-Chips,
  DSGVO-Checkbox in Klartext). QR „Lieber aufs Handy?" in beiden Pfaden.

## 3. Architektur & Datenflüsse

**Eine React+Vite-SPA, kein eigenes Backend.** Alle Serverlogik liegt in n8n bzw. Open WebUI:

```
Android-Display (Fully Kiosk)
  └── Robbeversum-SPA (statisch, geplant: messe.robbe-consulting.de hinter nginx)
       ├── Website-Modul       → iframe https://robbe-consulting.de
       │                          (Website sendet seit 07/2026 CSP frame-ancestors
       │                           für messe.robbe-consulting.de + localhost:5173)
       ├── Unternehmens-KI     → EIGENER Chat-Screen gegen Open WebUI
       │                          POST /api/chat/completions (SSE-Streaming)
       │                          https://ki.robbe-consulting.de, Kiosk-API-Key
       ├── Robbe AI-Copilot    → Beschreibung + „Zum Portal"-Button, iframe
       │                          https://robbe-consulting.ai.tool.center/library/apps
       ├── Website-Bot-Demo    → n8n-Webhook /webhook/robbe-chatbot (Produktiv-Bot!)
       ├── Messe-Bot           → n8n-Webhook /webhook/messe-bot (NEU ANZULEGEN)
       ├── Lead-Formular       → n8n-Webhook /webhook/messe-lead (NEU ANZULEGEN)
       │                          → Odoo crm.lead + Danke-Mail + Buchungslink
       └── n8n-Instanz: https://n8n.srv1047901.hstgr.cloud
```

**Webhook-Kontrakt** (identisch zu robbe-chatbot.js / VOM-FASS-Workflow):
- Chat: `POST {type:"message", sessionId, message, history, page, startedAt}` → `{reply}`
- Ende: `POST {type:"end", sessionId, transcript, startedAt, endedAt, durationSeconds}` — n8n wertet Transkripte als Lead-Hinweise aus
- Lead: `POST {type:"lead", leadId(UUID!), name, firma, email, telefon, interesse[], consent, consentText, consentVersion, consentAt, source:"messe-kiosk", messe, createdAt, queuedOffline}` → `{ok:true}`. **leadId clientseitig = Idempotenz** beim Nachsenden aus der Offline-Queue.
- Visitenkarte: `POST {type:"card", leadId, images:{front, back?} (JPEG-dataURLs, max 1280px), interesse[], consent…, source, messe, createdAt}` → `{ok:true}`. n8n-Seite: Vision-Modell liest die Karte → Odoo-Lead + Mail an Florian („Vielen Dank"-Screen zeigt die App selbst).

**Terminbuchung im iframe:** Der Kurzlink `calendar.app.google/…` sendet
`X-Frame-Options: SAMEORIGIN` und ist NICHT einbettbar (ergab ein leeres weißes
Feld). Einbettbar ist NUR die offizielle Embed-Form
`calendar.google.com/calendar/appointments/schedules/<ID>?gv=true`
(`urls.terminEmbed` in der Config). Der Kurzlink bleibt für QR-Codes und Mails.

## 4. Entscheidungen und ihre Begründungen

| Entscheidung | Begründung |
|---|---|
| Web-App statt nativer App | Fully Kiosk Browser (Android) zeigt eine URL — Updates ohne Gerätezugriff, ein Codebase |
| Open-WebUI-**API** statt OWUI-UI-iframe | OWUI-UI verlangt Login + zeigt Navigation/Einstellungen — auf einem Kiosk nicht absicherbar. Eigener Chat im CI, Workspace-Modell bringt Systemprompt+Wissen serverseitig mit |
| Messe-Bot über n8n statt OWUI | Transkript-Auswertung (Lead ja/nein, Zusammenfassung, Mail) existiert im VOM-FASS-Workflow schon; gleicher Kontrakt wie Website-Bot → eine Chat-Komponente für alles |
| Lead-Flow komplett in n8n | App macht nur einen POST. Odoo-Zugang, Mail-Versand, Dedup bleiben serverseitig änderbar |
| Offline-Queue (localStorage) für Leads | Messe-WLAN ist unzuverlässig. Besucher sieht IMMER denselben Danke-Screen; Nachversand idempotent über leadId |
| Session-Reset per `key={sessionId}`-Remount | React unmountet ALLES — State-Verlust ist per Konstruktion garantiert (DSGVO: nächster Besucher sieht nie Chat/Formular des vorherigen). Robuster als manuelles Aufräumen |
| Kamera-Zoom statt FLIP/Framer-Motion | Ein einziger animierter Transform = 60 fps auf Mittelklasse-Android; konsistent mit „Attract = Bühne"; eine Dependency weniger |
| `zoom: var(--k)` für UI-Skalierung | Overlays sind für 1920×1080 dimensioniert; --k (JS) skaliert sie auf kleineren Fenstern proportional. `zoom` skaliert Layout inkl. fixed-Positionen und läuft im Android-WebView |
| Kiosk-API-Key im Bundle akzeptiert | Dedizierter OWUI-User OHNE Adminrechte, nur EIN Modell, Rate-Limit, Rotation nach jeder Messe. Gerät ist physisch unter Kontrolle |
| Keine serverseitigen OWUI-Chats | Kiosk legt nichts an → beim Reset gibt es serverseitig nichts zu löschen |
| CSP `frame-ancestors` statt X-Frame-Options weg | Clickjacking-Schutz gegen Fremde bleibt; nur eigene Domains dürfen einbetten |

## 5. Wie wurde vorgegangen (und warum)?

1. **Bestandsaufnahme vor Neubau:** Vorhandene Bausteine gesichtet — holp-ki-portal
   (SSE-Chat-Client, Design-Tokens), robbe-chatbot.js (Webhook-Kontrakt),
   VOM-FASS-n8n-Workflow (Lead-Auswertung). ~60 % Wiederverwendung statt Neubau.
2. **Zwei getrennte Design-Perspektiven** (Architektur/Integrationen + Kreativ-UX),
   dann zu EINEM Plan zusammengeführt. Widersprüche (Timings, Struktur) explizit aufgelöst.
3. **Risiko zuerst:** Die nie gebauten Integrationsstücke (OWUI-Kiosk-Key, Odoo-JSON-RPC,
   iframe-Header) stehen VORN im Phasenplan — nicht in Woche 8.
4. **Kern vor Politur:** Erst Bühne/Zoom/Session-Mechanik (das Herzstück), dann Module,
   dann Erlebnis-Schicht. Jeder Schritt sofort im Browser verifiziert (Screenshots,
   Klick-Tests, localStorage-Inspektion) — nichts „blind" als fertig erklärt.
5. **Alles Messe-Spezifische in Config-Dateien** (`src/config/fairs/<fairId>/`),
   nie in Komponenten — Wiederverwendbarkeit war Anforderung Nr. 1.
6. **Echte Inhalte von der Website** übernommen (12-Schritte-Plan, Leistungen, Team)
   statt Lorem-Ipsum — Quelle: lokale Kopie in `~/Claude/Website prüfen/robbe-consulting-optimiert/`.

## 6. Externe Systeme & Zugänge

| System | URL | Status |
|---|---|---|
| Open WebUI (Unternehmens-KI) | https://ki.robbe-consulting.de | läuft; Kiosk-User + API-Key FEHLEN noch |
| Workspace-Modell | `robbe-unternehmenswissen` (ANNAHME) | echte Modell-ID klären |
| Robbe AI-Copilot | https://robbe-consulting.ai.tool.center/library/apps | einbettbar (keine frame-ancestors-Sperre); Login-Screen — Demo-User beim Anbieter (aven8/tool.center) klären |
| n8n | https://n8n.srv1047901.hstgr.cloud | läuft; Workflows `messe-bot` + `messe-lead` FEHLEN (Vorlage: VOM-FASS-Workflow, JSON in `~/Downloads/Claude/`) |
| Website | https://robbe-consulting.de | GitHub MrRobb86/MrRobb86.github.io → Push auf main deployt automatisch per FTPS zu IONOS. frame-ancestors seit 07/2026 gesetzt. Lokaler Klon: `~/Claude/Projects/robbe-website` |
| Terminbuchung | https://calendar.app.google/CfdmPcBowRim2uJe7 | von Florian 07/2026; ACHTUNG: Website-Kontaktseite nutzt einen ANDEREN Link (…/5yJeJ7c4jHHmSaBt6) — Diskrepanz mit Florian klären |
| Odoo CRM | URL/Zugang noch nicht hinterlegt | für n8n-Lead-Workflow nötig (JSON-RPC, crm.lead) |

## 7. Offene Punkte (Stand 07.07.2026)

1. **n8n-Workflows anlegen:** `messe-bot` (VOM-FASS-Kopie mit Robbe-Wissen) und
   `messe-lead` (Consent-Check → Dedup über leadId → Data-Table-Backup → Odoo
   crm.lead per JSON-RPC → Danke-Mail mit Kontaktdaten + Buchungslink → Respond).
   NEU: Zweig für `type:"card"` (Visitenkarten-Scan) — Vision-Modell extrahiert
   Name/Firma/Kontakt aus den Bildern → Odoo-Lead + Mail an Florian.
2. **OWUI-Kiosk-User** anlegen (keine Adminrechte, nur ein Modell), API-Key in
   `.env` (`VITE_OWUI_KIOSK_KEY`), echte Modell-ID eintragen, Streaming live testen.
3. **Copilot-Demo-Zugang:** Auto-Login in die fremdgehostete Instanz
   (aven8/tool.center) ist aus der App heraus NICHT möglich (Cross-Origin —
   wir können in deren Login-Formular nichts eintragen). Realistische Wege:
   (a) Anbieter nach Demo-User/Magic-Link-URL fragen (dann als `portalUrl`
   eintragen), (b) morgens am Stand einmal einloggen — die Session lebt im
   WebView-Cookie weiter (Fully Kiosk: Cookies NICHT automatisch löschen
   lassen; nächtlicher App-Reload loggt nicht aus). Testen!
4. **Deployment:** Subdomain messe.robbe-consulting.de + nginx auf dem Hostinger-Server.
5. **Assets:** Foto Ghiath (`team-ghiath.png`), Terminlink-Diskrepanz klären.
6. **Gerätetest:** Android-Panel + Fully Kiosk (Profil laut README), 48h-Dauerlauf,
   Netzabriss-Tests, Touch-Ergonomie. Nichts nur am Laptop „fertig" glauben.
7. Fully-Kiosk-**URL-Whitelist**: eigene Domain, robbe-consulting.de,
   ki.robbe-consulting.de, robbe-consulting.ai.tool.center, n8n-Domain, calendar.app.google.

## 8. Ursprünglicher Projektplan

Der vollständige genehmigte Plan (Kontext, UX-Feinheiten, 8-Wochen-Phasenplan,
Verifikationsschritte) liegt unter
`~/.claude/plans/lass-uns-mal-dar-ber-quirky-twilight.md` — bei Handoff an ein
anderes System dieses Dokument + README + CLAUDE.md mitgeben.
