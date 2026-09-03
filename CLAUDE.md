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
   Fullscreen-Overlays in diese Liste aufnehmen. **AUSNAHME — iframes NIE unter
   einen zoom-Vorfahren legen:** dann stimmt der innere iframe-Viewport nicht mit
   der sichtbaren Fläche überein → externe Apps lassen weiße Ränder rechts/unten.
   iframe-Module bekommen `module-layer--native` (zoom: 1, kompakter Kopf); der
   Kalender-Overlay hat bewusst keinen zoom.

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
- **Modul „Unsere Projekte" (kind `projekte`):** 3 Software-Projekte (GMB Wüstenberg,
  Patzig Dach, HOLP Serviceportal) als Detailseiten; `liveUrl` pro Projekt = einbettbare
  Demo-Instanz (HTTPS, ohne Login-Hürde, ohne X-Frame-Options). Leer = „Live-Demo wird
  eingerichtet". Stand 09/2026: alle drei Live-Systeme haben Login + Passwortschutz
  (GMB zusätzlich `X-Frame-Options`, Patzig nur HTTP) → Demo-Instanzen sind offen.
- **Messe-Bot-Webhook:** zeigt vorerst auf den PRODUKTIVEN `robbe-chatbot`-Webhook,
  weil `messe-bot` in n8n nicht existiert (404). Bei eigenem Messe-Workflow zurückstellen.
- **Chat-Transkripte:** n8n-Chats melden ihr Transkript im Unmount-Cleanup
  (`sendSessionEnd`) — nicht entfernen, daraus entstehen die Lead-Hinweise.
- **Einstellungsseite:** 5× schneller Tap aufs Logo → PIN (`VITE_ADMIN_PIN`, Default
  2468) → Telefon/Termin-URL/Idle-Zeiten/Layout-Modus. Overrides in localStorage.
- **Selbst-Update:** SW-Modus `prompt` (vite.config) + registerSW in main.jsx
  (Update-Check alle 5 Min, Flag `__swUpdateBereit`); KioskSession aktiviert +
  reloadet im Attract-Mode. Nach einem Deploy holt sich der Kiosk die neue
  Version also selbst — nie `autoUpdate` zurückstellen, sonst laufen Seiten
  bis zum manuellen Doppel-Reload mit altem Asset-Cache.
- **Hub-Layout / Ziehen:** JEDER darf Karten frei ziehen — gedrückt halten und
  bewegen, Drag ab 12 px (Tap ohne Bewegung öffnet). Die gesamte Kollisionslogik
  ist EINE Funktion `separate(layout, dims, fixedId)` in RobbeversumStage.jsx:
  volle Positions-Momentaufnahme → gezogene Karte auf Fingerposition → feste
  60 Iterationen Auseinanderdrücken (andere weichen aus, gezogene bleibt fix,
  Zentrum-Zone frei). Deterministisch, NaN-gesichert (`finite()`), hängt nie.
  Läuft identisch bei jedem pointermove UND beim Loslassen. Klick-nach-Drag wird
  über `justDragged`-Ref unterdrückt, NICHT per setTimeout (ein Timer würgte
  sonst einen schnell folgenden zweiten Drag ab). Funktioniert in Quer- UND
  Hochformat (Hochformat-Wortmarke y 430, damit oberhalb Platz ist).
  Besucher-Verschiebungen sind temporär (Session-Reset stellt Ordnung her);
  DAUERHAFT speichert nur der Layout-Modus (`rq_layout` / `rq_layout_portrait`).
  GAP 36 px (> kombinierter Schwebe-Drift). NIE wieder dodge/resolve/relax/swap
  einführen — das war die Bug-Quelle (State-Inkonsistenz + Hänger).

## Push & Deploy — Stolperfalle GitHub-Konto

Florian betreibt zwei eigene GitHub-Konten (`MrRobb86` und `ghiathnj88`), beide in `gh` angemeldet. Ist das
andere Konto aktiv, schlägt `git push` in MrRobb86-Repos mit **403** fehl — und `gh run list` zeigt dann
trügerisch den letzten *alten* erfolgreichen Lauf. Deshalb: Remote-URL trägt den
Benutzer (`https://MrRobb86@github.com/...`), sodass der gh-Credential-Helper immer
MrRobb86 nimmt. Nach jedem Push **Live-Bundle mit `dist/index.html` vergleichen**
(Hash identisch = wirklich deployt), nicht nur auf „success" vertrauen.

## Entwicklung

```bash
npm install && npm run dev   # http://localhost:5173
npm run build                # dist/ (PWA precacht Assets für Offline-Betrieb)
```

`.env` nach `.env.example`. Verifikation: immer im Browser durchklicken
(Attract → Wake → Modul → Zurück, Lead-Submit offline/online, Reset-Test mit
zwei „Besuchern"). Vor der Messe zwingend auf dem echten Android-Panel testen.
