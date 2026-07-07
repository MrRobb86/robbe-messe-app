// Orchestrierung: Attract ⇄ Hub ⇄ Modul auf EINER Buehne.
// Der Modul-Root haengt an key={sessionId} — der Session-Reset unmountet
// damit garantiert jeden Chat-Verlauf und jedes halbe Formular (DSGVO).
import { useCallback, useEffect, useRef, useState } from 'react'
import RobbeversumStage from './stage/RobbeversumStage.jsx'
import AttractLoop from './attract/AttractLoop.jsx'
import ModuleFrame from './components/ModuleFrame.jsx'
import ModuleView from './modules/ModuleView.jsx'
import MesseBot from './components/MesseBot.jsx'
import AdminOverlay from './components/AdminOverlay.jsx'
import { KioskSessionProvider, useKiosk } from './kiosk/KioskSession.jsx'
import { startQueueWorker } from './kiosk/leadQueue.js'
import { config, modules, getModule } from './config/index.js'

// "Noch da?"-Overlay mit Countdown-Kreis (ein animiertes Element).
function IdleWarn() {
  const [left, setLeft] = useState(config.idle.countdownMs / 1000)
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])
  const total = config.idle.countdownMs / 1000
  const r = 54
  const circ = 2 * Math.PI * r
  return (
    <div className="idle-warn">
      <svg className="idle-warn__ring" width="140" height="140" viewBox="0 0 140 140">
        <circle className="bg" cx="70" cy="70" r={r} />
        <circle
          className="fg"
          cx="70"
          cy="70"
          r={r}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - left / total)}
        />
      </svg>
      <h2>Noch da?</h2>
      <p>Tipp irgendwo hin, um weiterzumachen.</p>
    </div>
  )
}

// Fortschritts-Konstellation: x von 7 entdeckt.
function ProgressDots() {
  const { visited, mode } = useKiosk()
  if (mode === 'attract') return null
  return (
    <div className="progress-dots">
      {modules.map((m) => (
        <span
          key={m.id}
          className={`progress-dots__dot ${visited.has(m.id) ? 'progress-dots__dot--filled' : ''}`}
        />
      ))}
      <span>
        {visited.size} von {modules.length} entdeckt
      </span>
    </div>
  )
}

function Kiosk() {
  const kiosk = useKiosk()
  const { sessionId, mode, activeModuleId, warnVisible, wakeFromAttract, openModule, goHub } = kiosk

  // Buehnen-Fokus. Im Attract steuert der Loop die Kamera, sonst der Modus.
  const [attractFocus, setAttractFocus] = useState({ type: 'center' })
  const [closing, setClosing] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const logoTaps = useRef({ count: 0, t: 0 })

  // Lead-Queue-Worker laeuft app-lebenslang.
  useEffect(() => startQueueWorker(), [])

  const mod = activeModuleId ? getModule(activeModuleId) : null

  const focus =
    mode === 'attract'
      ? attractFocus
      : mode === 'module'
        ? { type: 'module', id: activeModuleId, scale: 2.6 }
        : { type: 'overview' }
  const flightMode = mode === 'module' ? 'in' : closing ? 'out' : mode === 'hub' ? 'out' : 'camera'

  // Rueckflug: Modul-Layer blendet aus (300ms), dann faehrt die Kamera zurueck.
  const onBack = useCallback(() => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      goHub()
    }, 280)
  }, [goHub])

  // Admin-Geste: 5 schnelle Taps aufs Logo.
  function onLogoTap() {
    const now = Date.now()
    if (now - logoTaps.current.t > 2500) logoTaps.current.count = 0
    logoTaps.current.t = now
    logoTaps.current.count += 1
    if (logoTaps.current.count >= 5) {
      logoTaps.current.count = 0
      setAdminOpen(true)
    }
  }

  return (
    <div
      // Im Attract-Mode weckt JEDER Touch den Kiosk.
      onPointerDown={mode === 'attract' ? wakeFromAttract : undefined}
    >
      <RobbeversumStage
        focus={focus}
        flightMode={flightMode}
        hubHidden={mode === 'module'}
        onOpenModule={openModule}
      />

      {mode === 'attract' && <AttractLoop onFocus={setAttractFocus} />}

      {/* key={sessionId}: der DSGVO-Reset — Remount toetet jeden State. */}
      <div key={sessionId}>
        {mode === 'module' && mod && (
          <ModuleFrame mod={mod} closing={closing} onBack={onBack}>
            <ModuleView mod={mod} />
          </ModuleFrame>
        )}
        <MesseBot />
      </div>

      <ProgressDots />

      <button className="stage-logo" onPointerDown={onLogoTap}>
        <img src="/robbe-logo.png" alt="Robbe Sales & AI Consulting" />
        <span>
          {config.kontakt.firma} — {config.messe.stand}
        </span>
      </button>

      <div className="stage-phone">
        <span className="dot" />
        {config.kontakt.telefon}
      </div>

      {warnVisible && <IdleWarn />}
      {adminOpen && <AdminOverlay onClose={() => setAdminOpen(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <KioskSessionProvider>
      <Kiosk />
    </KioskSessionProvider>
  )
}
