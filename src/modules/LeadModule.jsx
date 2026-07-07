// Kontakt-Modul: links Termin buchen (Google-Terminplanung + QR),
// rechts Kontakt dalassen (3 Felder + Interessens-Chips + DSGVO-Klartext).
// QR-Codes als gleichwertige Fluchttuer — viele wollen an einem oeffentlichen
// Screen nichts eintippen.
//
// Submit laeuft ueber die Offline-Queue: Besucher sieht IMMER denselben
// Danke-Screen, egal ob das Messe-WLAN gerade mitspielt.
import { useEffect, useState } from 'react'
import { config } from '../config/index.js'
import { newLeadId, submitLead } from '../kiosk/leadQueue.js'
import { effective } from '../kiosk/settings.js'
import { useKiosk } from '../kiosk/KioskSession.jsx'
import './lead.css'

const INTERESTS = ['Schulung', 'Strategie-Workshop', 'Chatbot', 'Automatisierung', 'Unternehmens-KI']
const THANKS_AUTORETURN_MS = 12_000

export default function LeadModule() {
  const { goHub } = useKiosk()
  const [form, setForm] = useState({ name: '', firma: '', email: '', telefon: '' })
  const [interests, setInterests] = useState([])
  const [consent, setConsent] = useState(false)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  // Nach dem Danke-Screen automatisch zurueck ins Robbeversum.
  useEffect(() => {
    if (!sent) return
    const t = setTimeout(goHub, THANKS_AUTORETURN_MS)
    return () => clearTimeout(t)
  }, [sent, goHub])

  const valid = form.name.trim() && form.email.trim().includes('@') && consent

  async function onSubmit(e) {
    e.preventDefault()
    if (!valid || busy) return
    setBusy(true)
    await submitLead({
      type: 'lead',
      leadId: newLeadId(),
      name: form.name.trim(),
      firma: form.firma.trim(),
      email: form.email.trim(),
      telefon: form.telefon.trim(),
      interesse: interests,
      consent: true,
      consentText: config.consentText,
      consentVersion: config.consentVersion,
      consentAt: new Date().toISOString(),
      source: 'messe-kiosk',
      messe: config.messe.name,
      createdAt: new Date().toISOString(),
      queuedOffline: false,
    })
    setBusy(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="lead-thanks">
        <h2>
          Danke, {form.name.split(' ')[0]}<span className="accent-em">.</span>
        </h2>
        <p>
          Du bekommst gleich eine E-Mail mit allen Kontaktdaten und einem Link zur
          Terminbuchung. Bis dahin: Nimm uns mit aufs Handy.
        </p>
        <div className="qr-block">
          <img src={config.qr.vcard} alt="Kontakt-QR-Code" />
          <p className="mono">{effective(config).telefon}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="lead-grid">
      <div className="lead-card">
        <p className="eyebrow">DER SCHNELLSTE WEG</p>
        <h3>Termin buchen</h3>
        <p>Such dir direkt einen Termin mit {config.kontakt.name} aus — 30 Minuten, kostenlos.</p>
        {effective(config).terminUrl ? (
          <iframe
            src={effective(config).terminUrl}
            title="Terminbuchung"
            style={{ flex: 1, minHeight: 320, border: '1px solid var(--ink-200)', borderRadius: 'var(--r-lg)' }}
          />
        ) : null}
        <div className="lead-divider">Lieber aufs Handy?</div>
        <div className="qr-block">
          <img src={config.qr.termin} alt="Termin-QR-Code" />
          <p>Scannen und auf dem eigenen Handy buchen.</p>
        </div>
        <div className="lead-phone">
          <span className="dot" />
          {effective(config).telefon}
        </div>
      </div>

      <div className="lead-card">
        <p className="eyebrow">ODER GANZ UNVERBINDLICH</p>
        <h3>Kontakt dalassen</h3>
        <p>Wir melden uns nach der Messe — mit Infos zu genau deinem Thema.</p>
        <form className="lead-form" onSubmit={onSubmit}>
          <input
            className="field"
            placeholder="Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="field"
            placeholder="Firma"
            value={form.firma}
            onChange={(e) => setForm({ ...form, firma: e.target.value })}
          />
          <input
            className="field"
            type="email"
            placeholder="E-Mail *"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="field"
            type="tel"
            placeholder="Telefon (optional)"
            value={form.telefon}
            onChange={(e) => setForm({ ...form, telefon: e.target.value })}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {INTERESTS.map((i) => (
              <button
                type="button"
                key={i}
                className={`chip pressable ${interests.includes(i) ? 'chip--active' : ''}`}
                onClick={() =>
                  setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]))
                }
              >
                {i}
              </button>
            ))}
          </div>
          <label className="lead-consent">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>{config.consentText}</span>
          </label>
          <button
            className="pill pill--primary pressable"
            type="submit"
            disabled={!valid || busy}
            style={{ opacity: valid ? 1 : 0.4, justifyContent: 'center' }}
          >
            {busy ? 'Wird gesendet …' : 'Abschicken →'}
          </button>
        </form>
      </div>
    </div>
  )
}
