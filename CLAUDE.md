# CLAUDE.md — Robbeversum Messe-Kiosk

Interaktive Messe-App für Robbe Sales & AI Consulting auf Android-Touchdisplay
(Fully Kiosk Browser). **Konzept, Architektur-Begründungen und offene Punkte stehen
in `KONZEPT.md` — zuerst lesen.** Betriebs-Checkliste in `README.md`.

**Sprache:** Code-Kommentare, Commits und UI-Texte auf Deutsch. UI-Anrede: „Du".
Commits imperativ mit Phasen-Präfix (`P2: …`).

## Architektur-Entscheidungen (nicht ändern ohne Rücksprache)

1. **Kein eigenes Backend.** Alle Serverlogik in n8n (Bots, Lead-Flow → Odoo) bzw.
   Open WebUI (Unternehmens-KI). Die App macht nur fetch/POST.
2. **Unternehmens-KI = OpenWebUI-Oberfläche als iframe** (ki.robbe-consulting.de
   sendet keine iframe-Sperre). Florian loggt sich morgens 1× ein, Session hält
   per Cookie. Kein API-Key. `src/api/openwebui.js` (streamChat) bleibt ungenutzt
   im Repo als Fallback, falls doch ein eigener API-Chat gewünscht wird.
3. **DSGVO-Session-Reset ist heilig:** Reset läuft über `key={sessionId}`-Remount
   (App.jsx) + localStorage-Wipe. Whitelist überlebender Keys NUR über
   `PERSISTENT_KEYS` in `src/kiosk/settings.js` erweitern. Der nächste Besucher darf
   NIE Chats/Formulardaten des vorherigen sehen.
4. **Alles Messe-Spezifische in Config, nie in Komponenten:**
   `src/config/fairs/<fairId>/` (fair.config.js, modules.js, attract.js) +
   `public/fairs/<fairId>/` (Bilder, QR-PNGs). Neue Messe = neues Verzeichnis +
   Registrierung in `src/config/index.js`, Auswahl per `VITE_FAIR_ID`.
5. **Performance-Regeln Bühne:** Nur `transform`/`opacity` animieren, ein
   Kamera-Transform für alle Fahrten, keine animierten Schatten/Filter, kein WebGL.
   Zielgerät ist ein Mittelklasse-Android-WebView.
6. **Kiosk-Skalierung:** Overlays sind für 1920×1080 dimensioniert und werden über
   `zoom: var(--k, 1)` (Liste in kiosk.css, --k aus App.jsx) mitskaliert. Neue
   Fullscreen-Overlays in diese Liste aufnehmen.

## Struktur (Ist)

```
src/
  config/fairs/default/   # fair.config.js (Timeouts, Webhooks, URLs, QR, PIN)
                          # modules.js (8 Stationen, kind-Registry), attract.js (6 Szenen)
  kiosk/                  # KioskSession.jsx (Modus-Statemachine attract|hub|module,
                          #   Idle-Kaskade, Reset), settings.js (localStorage-Overrides,
                          #   Hub-Layout), leadQueue.js (Offline-Queue, idempotent),
                          #   useOnline.js (onLine + Heartbeat)
  api/                    # openwebui.js (nur streamChat, SSE), n8n.js (Chat/End/Lead)
  stage/                  # RobbeversumStage.jsx (Bühne 1920×1080, Kamera, Hub-Karten,
                          #   Drag-Layout-Modus), stage.css
  attract/                # AttractLoop.jsx (Szenen-Sequencer, Auto-Typing-Chat)
  modules/                # ModuleView.jsx (Registry: iframe|kioskChat|portal|
                          #   contentCards|team|lead), LeadModule.jsx
  components/             # ChatScreen.jsx (EIN Chat für OWUI & n8n), MesseBot.jsx,
                          #   ModuleFrame.jsx, IframeModule.jsx, AdminOverlay.jsx
```

## Wichtige Mechaniken (Stolperfallen)

- **Wake-Guard:** `openModule` ignoriert Aufrufe <500 ms nach dem Attract-Aufwecken
  (KioskSession) — der Weck-Tap darf kein Modul öffnen. Bei UI-Tests dazwischen warten.
- **`.tap` setzt bewusst KEINE position** (kiosk.css) — Element selbst muss
  relative/fixed sein, sonst landet die Hit-Area falsch.
- **Bot-Bubble unten LINKS** (über dem Zurück-Button), Telefonnummer unten rechts —
  Kundenwunsch, nicht tauschen.
- **Chat-Transkripte:** n8n-Chats melden ihr Transkript im Unmount-Cleanup
  (`sendSessionEnd`) — nicht entfernen, daraus entstehen die Lead-Hinweise.
- **Einstellungsseite:** 5× schneller Tap aufs Logo → PIN (`VITE_ADMIN_PIN`, Default
  2468) → Telefon/Termin-URL/Idle-Zeiten/Layout-Modus. Overrides in localStorage.
- **Hub-Layout / Ziehen:** JEDER darf Karten frei ziehen — gedrückt halten und
  bewegen, Drag ab 12 px (Tap ohne Bewegung öffnet). WÄHREND des Ziehens weichen
  die anderen Karten live aus (dodgeOthers + 300ms-left/top-Transition). Beim
  Loslassen: Abstoßen (GAP 36 px — größer als der kombinierte Schwebe-Drift
  2×14 px), globale Entspannung (relaxAll, mit Rastersuche-Fallback gegen
  Rand-Oszillation), Zentrum-Zone bleibt frei, auf voller Bühne Platztausch.
  Funktioniert in Quer- UND Hochformat (Hochformat-Wortmarke sitzt bei y 430,
  damit oberhalb Platz für eine Karte ist). Besucher-Verschiebungen sind
  temporär (Session-Reset stellt Ordnung her); DAUERHAFT speichert nur der
  Layout-Modus der Einstellungen (`rq_layout` / `rq_layout_portrait`).

## Entwicklung

```bash
npm install && npm run dev   # http://localhost:5173
npm run build                # dist/ (PWA precacht Assets für Offline-Betrieb)
```

`.env` nach `.env.example`. Verifikation: immer im Browser durchklicken
(Attract → Wake → Modul → Zurück, Lead-Submit offline/online, Reset-Test mit
zwei „Besuchern"). Vor der Messe zwingend auf dem echten Android-Panel testen.
