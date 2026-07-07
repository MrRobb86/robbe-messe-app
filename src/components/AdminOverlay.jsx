// Versteckte Einstellungsseite fuers Standpersonal: 5× schneller Tap aufs
// Logo → PIN → Status, Notfall-Aktionen und Laufzeit-Einstellungen
// (Telefon, Termin-URL, Idle-Zeiten, Hub-Layout). Fuer Besucher unsichtbar.
// Overrides liegen in localStorage (settings.js) — ohne Redeploy aenderbar,
// leeres Feld = zurueck zum Config-Default.
import { useState } from 'react'
import { config } from '../config/index.js'
import { queueLength, flushQueue } from '../kiosk/leadQueue.js'
import { getSettings, saveSettings, resetLayout, effective } from '../kiosk/settings.js'
import { useOnline } from '../kiosk/useOnline.js'
import { useKiosk } from '../kiosk/KioskSession.jsx'

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 100,
  background: 'rgba(17,17,19,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
const panelStyle = {
  zoom: 'var(--k, 1)',
  background: 'var(--paper)',
  borderRadius: 'var(--r-xl)',
  padding: '36px 44px',
  width: 720,
  maxHeight: '86vh',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  boxShadow: 'var(--shadow-lg)',
}
const h3Style = { margin: 0, fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--ink-900)' }
const labelStyle = { fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.1em' }
const rowStyle = { display: 'flex', gap: 14 }
const btn = { justifyContent: 'center', fontSize: 22, height: 64 }

export default function AdminOverlay({ onClose, layoutEdit, onToggleLayoutEdit }) {
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const online = useOnline()
  const { resetSession, enterAttract } = useKiosk()
  const [queue, setQueue] = useState(queueLength())
  const [form, setForm] = useState(() => {
    const s = getSettings()
    return {
      telefon: s.telefon || '',
      terminUrl: s.terminUrl || '',
      hubToAttractSec: s.hubToAttractSec || '',
      warnDefaultSec: s.warnDefaultSec || '',
    }
  })
  const [saved, setSaved] = useState(false)
  const eff = effective(config)

  if (!unlocked) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={{ ...panelStyle, width: 560 }} onClick={(e) => e.stopPropagation()}>
          <h3 style={h3Style}>Einstellungen — PIN</h3>
          <input
            className="field"
            type="password"
            inputMode="numeric"
            value={pin}
            autoFocus
            onChange={(e) => {
              const v = e.target.value
              setPin(v)
              if (v === config.adminPin) setUnlocked(true)
            }}
            placeholder="PIN eingeben"
          />
          <button className="pill pressable" onClick={onClose} style={btn}>
            Abbrechen
          </button>
        </div>
      </div>
    )
  }

  function save() {
    saveSettings({
      telefon: form.telefon.trim(),
      terminUrl: form.terminUrl.trim(),
      hubToAttractSec: form.hubToAttractSec ? Number(form.hubToAttractSec) : '',
      warnDefaultSec: form.warnDefaultSec ? Number(form.warnDefaultSec) : '',
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={h3Style}>Kiosk-Einstellungen</h3>
        <p className="mono" style={{ margin: 0, fontSize: 18, color: 'var(--ink-500)' }}>
          Netz: {online ? '✓ online' : '✗ OFFLINE'} · Lead-Queue: {queue} wartend · Version:{' '}
          {config.messe.name} / {config.fairId}
        </p>

        <div style={{ borderTop: '1px solid var(--ink-200)', paddingTop: 16 }}>
          <p style={labelStyle}>Anzeige-Telefonnummer (leer = {config.kontakt.telefon})</p>
          <input
            className="field"
            style={{ height: 64 }}
            value={form.telefon}
            placeholder={eff.telefon}
            onChange={(e) => setForm({ ...form, telefon: e.target.value })}
          />
        </div>
        <div>
          <p style={labelStyle}>Termin-Buchungs-URL (leer = Config)</p>
          <input
            className="field"
            style={{ height: 64 }}
            value={form.terminUrl}
            placeholder={eff.terminUrl}
            onChange={(e) => setForm({ ...form, terminUrl: e.target.value })}
          />
        </div>
        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <p style={labelStyle}>Sek. bis Bildschirmschoner</p>
            <input
              className="field"
              style={{ height: 64 }}
              type="number"
              value={form.hubToAttractSec}
              placeholder={String(eff.idle.hubToAttractMs / 1000)}
              onChange={(e) => setForm({ ...form, hubToAttractSec: e.target.value })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <p style={labelStyle}>Sek. bis „Noch da?"</p>
            <input
              className="field"
              style={{ height: 64 }}
              type="number"
              value={form.warnDefaultSec}
              placeholder={String(eff.idle.warnDefaultMs / 1000)}
              onChange={(e) => setForm({ ...form, warnDefaultSec: e.target.value })}
            />
          </div>
        </div>
        <button className="pill pill--primary pressable" style={btn} onClick={save}>
          {saved ? '✓ Gespeichert' : 'Einstellungen speichern'}
        </button>

        <div style={{ borderTop: '1px solid var(--ink-200)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            className="pill pressable"
            style={btn}
            onClick={() => {
              onToggleLayoutEdit()
              onClose()
            }}
          >
            {layoutEdit ? 'Layout-Modus beenden' : 'Hub-Layout bearbeiten (Karten ziehen)'}
          </button>
          <button
            className="pill pressable"
            style={btn}
            onClick={() => {
              resetLayout()
              window.location.reload()
            }}
          >
            Layout auf Standard zurücksetzen
          </button>
          <button
            className="pill pressable"
            style={btn}
            onClick={async () => {
              await flushQueue()
              setQueue(queueLength())
            }}
          >
            Lead-Queue jetzt senden
          </button>
          <button
            className="pill pressable"
            style={btn}
            onClick={() => {
              resetSession()
              enterAttract()
              onClose()
            }}
          >
            Session zurücksetzen → Attract
          </button>
          <button className="pill pressable" style={btn} onClick={() => window.location.reload()}>
            App komplett neu laden
          </button>
        </div>

        <button className="pill pill--primary pressable" onClick={onClose} style={btn}>
          Schließen
        </button>
      </div>
    </div>
  )
}
