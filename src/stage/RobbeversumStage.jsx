// Die Buehne: 1920×1080-Design-Flaeche, Kamera-Transform, Hub-Konstellation.
// Attract-Mode und Hub teilen sich diese eine Buehne — der Uebergang ist nur
// eine Kamerafahrt, kein Szenenwechsel ("der Bildschirmschoner war die Karte").
//
// Layout-Modus (Einstellungsseite): Karten lassen sich per Drag verschieben;
// Positionen liegen als Override in localStorage (settings.js) und
// ueberleben Session-Reset und Reload.
import { useEffect, useRef, useState } from 'react'
import { modules, config } from '../config/index.js'
import { getLayout, saveLayoutPos } from '../kiosk/settings.js'
import './stage.css'

const CARD_W = 400
const CARD_H = 270
const DESIGN_W = 1920
const DESIGN_H = 1080
const CENTER = { x: 960, y: 470 } // Wortmarke

// Kamera-Transform: Punkt (x,y) der Buehne ins Viewport-Zentrum, Zoom s.
function cameraTransform({ x, y, scale }) {
  const tx = DESIGN_W / 2 - x * scale
  const ty = DESIGN_H / 2 - y * scale
  return `translate(${tx}px, ${ty}px) scale(${scale})`
}

// Fittet die Design-Flaeche in den realen Viewport (contain, zentriert).
function useStageFit() {
  const [fit, setFit] = useState({ scale: 1, left: 0, top: 0 })
  useEffect(() => {
    function measure() {
      const scale = Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H)
      setFit({
        scale,
        left: (window.innerWidth - DESIGN_W * scale) / 2,
        top: (window.innerHeight - DESIGN_H * scale) / 2,
      })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  return fit
}

function ConstellationLines({ positions }) {
  const centers = modules.map((m) => {
    const p = positions[m.id]
    return { id: m.id, x: p.x + CARD_W / 2, y: p.y + CARD_H / 2 }
  })
  return (
    <svg className="stage-lines" viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}>
      {centers.map((c) => (
        <line key={c.id} x1={CENTER.x} y1={CENTER.y} x2={c.x} y2={c.y} />
      ))}
      {centers.map((c) => (
        <circle key={c.id} cx={c.x} cy={c.y} r="6" />
      ))}
      <circle cx={CENTER.x} cy={CENTER.y} r="6" />
    </svg>
  )
}

function HubCard({ mod, pos, index, editMode, fitScale, onOpen, onMoved }) {
  const drag = useRef(null)

  // Pro Karte eigener Drift (9–14 s) — im Layout-Modus aus, sonst "zittert" das Ziehen.
  const driftStyle = editMode
    ? { animation: 'none' }
    : {
        '--drift-dur': `${9 + (index % 6)}s`,
        '--drift-x': `${(index % 3) * 4 - 4}px`,
        '--drift-y': `${(index % 4) * 4 - 8}px`,
      }

  function onPointerDown(e) {
    if (!editMode) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y }
  }
  function onPointerMove(e) {
    if (!editMode || !drag.current) return
    // Pointer-Delta (Bildschirm-px) → Buehnen-Koordinaten (Hub: Kamera-Scale 1).
    const dx = (e.clientX - drag.current.startX) / fitScale
    const dy = (e.clientY - drag.current.startY) / fitScale
    onMoved(mod.id, {
      x: Math.max(0, Math.min(DESIGN_W - CARD_W, drag.current.origX + dx)),
      y: Math.max(0, Math.min(DESIGN_H - CARD_H, drag.current.origY + dy)),
    })
  }
  function onPointerUp() {
    if (drag.current) {
      drag.current = null
      onMoved(mod.id, pos, true) // persistieren
    }
  }

  return (
    <div className="hub-card-drift" style={{ left: pos.x, top: pos.y, ...driftStyle }}>
      <button
        className={`hub-card tap ${editMode ? 'hub-card--edit' : ''}`}
        style={{ transform: `rotate(${pos.rot}deg)` }}
        onClick={() => !editMode && onOpen(mod.id)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span className="hub-card__eyebrow-row">
          {mod.accentDot && <span className="dot dot--pulse" />}
          <span className="eyebrow" style={{ margin: 0 }}>{mod.eyebrow}</span>
        </span>
        <span className="hub-card__title">{mod.title}</span>
        <span className="hub-card__teaser">{mod.teaser}</span>
        <span className="hub-card__arrow">→</span>
      </button>
    </div>
  )
}

// flightMode: 'camera' (Attract, 1.4s) | 'in' (Zoom ins Modul, 600ms) | 'out' (Rueckflug, 450ms)
export default function RobbeversumStage({ focus, flightMode = 'camera', hubHidden, editMode, onOpenModule }) {
  const fit = useStageFit()
  const [layout, setLayout] = useState(getLayout)

  // Effektive Position pro Modul: Config-Default + localStorage-Override.
  const positions = Object.fromEntries(
    modules.map((m) => [m.id, { ...m.hubPosition, ...(layout[m.id] || {}) }])
  )

  function focusToCamera(f) {
    if (!f || f.type === 'overview') return { x: DESIGN_W / 2, y: DESIGN_H / 2, scale: 1 }
    if (f.type === 'center') return { ...CENTER, scale: f.scale || 1.15 }
    const p = positions[f.id]
    if (!p) return { x: DESIGN_W / 2, y: DESIGN_H / 2, scale: 1 }
    return { x: p.x + CARD_W / 2, y: p.y + CARD_H / 2, scale: f.scale || 1.9 }
  }

  function onCardMoved(id, pos, persist) {
    setLayout((cur) => ({ ...cur, [id]: { x: pos.x, y: pos.y } }))
    if (persist) saveLayoutPos(id, pos)
  }

  const cam = focusToCamera(focus)
  const flightClass =
    flightMode === 'in' ? 'stage-camera--fly-in' : flightMode === 'out' ? 'stage-camera--fly-out' : ''

  return (
    <div className="stage-viewport">
      <div
        className="stage-fit"
        style={{ left: fit.left, top: fit.top, transform: `scale(${fit.scale})` }}
      >
        <div className={`stage-camera ${flightClass}`} style={{ transform: cameraTransform(cam) }}>
          <ConstellationLines positions={positions} />
          <div className="stage-center">
            <p className="eyebrow">{config.kontakt.firma}</p>
            <h1>
              ROBBEVERSUM<span style={{ color: 'var(--accent)' }}>.</span>
            </h1>
          </div>
          <div className={`hub-layer ${hubHidden ? 'hub-layer--hidden' : ''}`}>
            {modules.map((m, i) => (
              <HubCard
                key={m.id}
                mod={m}
                pos={positions[m.id]}
                index={i}
                editMode={editMode}
                fitScale={fit.scale}
                onOpen={onOpenModule}
                onMoved={onCardMoved}
              />
            ))}
          </div>
        </div>
      </div>
      {editMode && (
        <div className="layout-banner">
          Layout-Modus: Karten ziehen und loslassen. Beenden über die Einstellungen (5× Logo).
        </div>
      )}
    </div>
  )
}
