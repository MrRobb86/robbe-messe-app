# n8n-Workflow „RobbeVersum Messe-Lead" — Einrichtung

Datei: `messe-lead.workflow.json` — deckt alle drei Kiosk-Nachrichtentypen ab:

| type | Weg |
|---|---|
| `lead` | Einwilligung prüfen → Dedup (leadId) → Odoo `crm.lead` → Danke-Mail an Besucher (mit Buchungslink + Telefon) → Info-Mail an Florian → `{ok:true}` |
| `card` | Visitenkarten-Fotos → GPT-4o-mini (Vision) extrahiert Kontaktdaten → Odoo-Lead → Mail an Florian **mit Original-Fotos im Anhang** → `{ok:true}` |
| `end` | Chat-Transkript → KI-Zusammenfassung + Lead-Einschätzung → Mail an Florian → `{ok:true}` |

Odoo-Ausfälle blockieren nie die Antwort: Die Odoo-Nodes stehen auf
„continue on error", die Info-Mail meldet dann „⚠ FEHLGESCHLAGEN — Daten nur
in dieser Mail" (die Mail ist das Backup).

## Import (2 Minuten)

1. n8n öffnen → **Workflows → Import from File** → `messe-lead.workflow.json`
2. **Credentials zuordnen** (Nodes mit rotem Ausrufezeichen):
   - **Odoo-Nodes** („Odoo: Lead anlegen", „Odoo: Lead aus Karte"): Odoo-Credential
     anlegen (URL der Odoo-Instanz, Datenbankname, Benutzer-E-Mail, Passwort/API-Key)
   - **E-Mail-Nodes** (4×): bestehendes SMTP-Credential auswählen
   - **HTTP-Nodes** („KI liest Visitenkarte", „Gespräch zusammenfassen"):
     bestehendes OpenAI-Credential auswählen (wie im VOM-FASS-Workflow)
3. Node „Konfiguration" prüfen: Absender, Florian-Mail, Buchungslink, Telefon
4. **Workflow aktivieren** → Production-URL ist dann
   `https://n8n.srv1047901.hstgr.cloud/webhook/messe-lead`
   (genau die URL, die die Kiosk-App als `VITE_N8N_LEAD_URL` erwartet)

## Testen

```bash
# Lead (sollte Odoo-Eintrag + 2 Mails ausloesen):
curl -X POST https://n8n.srv1047901.hstgr.cloud/webhook/messe-lead \
  -H 'Content-Type: application/json' \
  -d '{"type":"lead","leadId":"test-001","name":"Max Testmann","firma":"Test GmbH","email":"DEINE-TESTADRESSE","telefon":"+49 111 222333","interesse":["Schulung"],"consent":true,"consentText":"Testeinwilligung","consentVersion":"test","consentAt":"2026-07-07T12:00:00Z","source":"messe-kiosk","messe":"Testlauf","createdAt":"2026-07-07T12:00:00Z","queuedOffline":false}'

# Derselbe Aufruf nochmal → {"ok":true,"duplicate":true}, KEIN zweiter Odoo-Eintrag.
# Ohne consent → HTTP 400 {"ok":false,"error":"consent"}.
```

Ende-zu-Ende: Am Kiosk das Formular ausfüllen bzw. eine Visitenkarte scannen.

## Nacharbeiten

- **CORS einschränken:** Webhook-Node → Options → Allowed Origins von `*` auf
  `https://messe.robbe-consulting.de` stellen, sobald die Subdomain live ist.
- Odoo-Felder (`source_id`/`campaign_id` für UTM) nach Bedarf ergänzen —
  IDs vorher in Odoo anlegen.
- Noch offen: eigener Workflow **„Messe-Bot"** (Chat-Concierge) — Kopie des
  VOM-FASS-Workflows mit Robbe-Wissen, Webhook-Pfad `messe-bot`.
