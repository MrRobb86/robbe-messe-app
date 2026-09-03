# Robbeversum — Messe-Kiosk-App

Interaktive Touch-App für den Messestand von Robbe Sales & AI Consulting.
Läuft auf einem Android-Touchdisplay im **Fully Kiosk Browser**, gebaut als
React+Vite-SPA (statischer Build hinter nginx, Subdomain `messe.robbe-consulting.de`).

## Konzept

**Papier-Kosmos:** Eine editoriale Karten-Konstellation auf warmem Papier — 7 Stationen
(Website, Unternehmens-KI, RoboAI Copilot, Chatbot-Demo, Wie wir arbeiten, Team, Kontakt),
verbunden durch Haarlinien. Der Bildschirmschoner (Attract-Mode) und der interaktive Hub
sind **dieselbe Bühne** — der Übergang ist nur eine Kamerafahrt.

- **Attract-Mode:** ~80s-Loop über 6 Szenen inkl. selbsttippendem Demo-Chat. Jeder Touch weckt.
- **Zoom-Navigation:** Tap auf Karte → Kamera fliegt hin (600ms), Modul öffnet.
  Zurück-Button fix unten links (450ms Rückflug).
- **Messe-Bot:** Floating Bubble + Side-Sheet (n8n-Webhook), kontextuelle Sprechblasen.
- **Lead-Flow:** Formular → n8n-Webhook → Odoo-CRM + Danke-Mail. Offline-Queue in
  localStorage (Messe-WLAN!), Idempotenz über clientseitige leadId.
- **DSGVO-Session-Reset:** Idle-Kaskade → Attract → Remount über `key={sessionId}`.
  Chats/Formulare sterben garantiert; nur die Lead-Queue überlebt.
- **Admin:** 5× Tap aufs Logo + PIN → Status, Queue, Reset, Reload.

## Konfiguration

Eine Messe = ein Verzeichnis:

- `src/config/fairs/<fairId>/` — fair.config.js (Timeouts, Webhooks, Kontakt),
  modules.js (Stationen), attract.js (Szenen)
- `public/fairs/<fairId>/` — Bilder, Team-Fotos, QR-Codes
- Aktivierung über `VITE_FAIR_ID` beim Build. Registrierung in `src/config/index.js`.

`.env` nach `.env.example` anlegen — API-Key nur für den dedizierten
OWUI-Kiosk-User (keine Adminrechte, nach jeder Messe rotieren).

## Entwicklung & Build

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ → per rsync hinter nginx deployen
```

## Vor der Messe (Checkliste)

- [x] Echte QR-Codes (Termin + vCard) → `public/fairs/default/`
- [x] Telefonnummer + Termin-URL in fair.config.js
- [x] Website erlaubt Einbettung (`frame-ancestors`, seit 07/2026 live)
- [x] n8n-Workflow `messe-lead` gebaut → `n8n/messe-lead.workflow.json` + `n8n/ANLEITUNG.md`
- [ ] `messe-lead` in n8n importieren, Credentials (Odoo/SMTP/OpenAI) zuordnen, aktivieren, testen
- [ ] n8n-Workflow `messe-bot` (VOM-FASS-Kopie mit Robbe-Wissen) anlegen
- [ ] OWUI-Kiosk-User + API-Key anlegen (`VITE_OWUI_KIOSK_KEY`), Modell-ID prüfen, `streamChat` testen
- [ ] Foto Ghiath (`public/fairs/default/team-ghiath.png`)
- [ ] Deployment: Subdomain messe.robbe-consulting.de hinter nginx
- [ ] Fully Kiosk: URL-Whitelist (inkl. ai.tool.center, calendar.google.com), Keep Screen On,
      Screensaver AUS, PIN, Scheduled Reload 04:00, **Kamera-Permission erlauben** (Visitenkarten-Scan),
      **Cookies NICHT automatisch löschen** (Copilot-Login vom Morgen muss den Tag überleben),
      **Popups/neue Tabs erlauben** (Projekt-Buttons „App öffnen" starten HOLP/Patzig in eigenem Fenster)
- [ ] Morgens am Stand: einmal im Robbe AI-Copilot einloggen (Session hält per Cookie)
- [ ] 48h-Dauerlauf + Netzabriss-Test + Kamera-Test auf dem Zielgerät
