// Versteckter Admin-Zugang fuers Standpersonal: 5× schneller Tap aufs Logo
// → PIN → Status & Notfall-Aktionen. Fuer Besucher unsichtbar.
import { useState } from 'react'
import { config } from '../config/index.js'
import { queueLength, flushQueue } from '../kiosk/leadQueue.js'
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
  background: 'var(--paper)',
  borderRadius: 'var(--r-xl)',
  padding: '40px 48px',
  width: 560,
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  boxShadow: 'var(--shadow-lg)',
}

export default function AdminOverlay({ onClose }) {
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const online = useOnline()
  const { resetSession, enterAttract } = useKiosk()
  const [queue, setQueue] = useState(queueLength())

  if (!unlocked) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 32 }}>Admin-PIN</h3>
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
          <button className="pill pressable" onClick={onClose} style={{ justifyContent: 'center' }}>
            Abbrechen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 32 }}>Kiosk-Status</h3>
        <p className="mono" style={{ margin: 0, fontSize: 20, color: 'var(--ink-500)' }}>
          Netz: {online ? '✓ online' : '✗ OFFLINE'} · Lead-Queue: {queue} wartend · Messe:{' '}
          {config.messe.name}
        </p>
        <button
          className="pill pressable"
          style={{ justifyContent: 'center' }}
          onClick={async () => {
            await flushQueue()
            setQueue(queueLength())
          }}
        >
          Lead-Queue jetzt senden
        </button>
        <button
          className="pill pressable"
          style={{ justifyContent: 'center' }}
          onClick={() => {
            resetSession()
            enterAttract()
            onClose()
          }}
        >
          Session zurücksetzen → Attract
        </button>
        <button
          className="pill pressable"
          style={{ justifyContent: 'center' }}
          onClick={() => window.location.reload()}
        >
          App komplett neu laden
        </button>
        <button className="pill pill--primary pressable" onClick={onClose} style={{ justifyContent: 'center' }}>
          Schließen
        </button>
      </div>
    </div>
  )
}
