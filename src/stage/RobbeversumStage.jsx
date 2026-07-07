// Die Buehne: Design-Flaeche mit Kamera-Transform und Hub-Konstellation.
// Attract-Mode und Hub teilen sich diese eine Buehne — der Uebergang ist nur
// eine Kamerafahrt, kein Szenenwechsel ("der Bildschirmschoner war die Karte").
//
// Ausrichtung: Querformat 1920×1080 (Karten-Positionen aus modules.js),
// Hochformat 1080×1920 (automatisches 2-Spalten-Raster). Beide Layouts sind
// per Drag anpassbar und werden getrennt in localStorage gespeichert.
//
// Karten verschieben: LANGER Druck (500 ms) auf eine Karte hebt sie an,
// dann ziehen. Kurzer Tap oeffnet das Modul. Im Layout-Modus der
// Einstellungen startet der Drag sofort.
import { useEffect, useRef, useState } from 'react'
import { modules, config } from '../config/index.js'
import { getLayout, saveLayoutPos } from '../kiosk/settings.js'
import './stage.css'

const CARD_W = 400
const CARD_H = 270
const LONG_PRESS_MS = 500
const DRAG_START_TOLERANCE = 14 // px Bewegung, ab der ein "pending" Long-Press zum Tap wird

const DIMS = {
  landscape: { w: 1920, h: 1080, center: { x: 960, y: 470 } },
  portrait: { w: 1080, h: 1920, center: { x: 540, y: 320 } },
}

// Hochformat-Default: 2-Spalten-Raster unter der Wortmarke.
function portraitDefault(index) {
  const col = index % 2
  const row = Math.floor(index / 2)
  return { x: col === 0 ? 70 : 610, y: 520 + row * 330, rot: col === 0 ? -1.2 : 1.2 }
}

// Fittet die Design-Flaeche in den realen Viewport (contain, zentriert).
function useStageFit() {
  const [fit, setFit] = useState({ scale: 1, left: 0, top: 0, orientation: 'landscape' })
  useEffect(() => {
    function measure() {
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      const { w, h } = DIMS[orientation]
      const scale = Math.min(window.innerWidth / w, window.innerHeight / h)
      setFit({
        scale,
        left: (window.innerWidth - w * scale) / 2,
        top: (window.innerHeight - h * scale) / 2,
        orientation,
      })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  return fit
}

function ConstellationLines({ positions, dims }) {
  const centers = modules.map((m) => {
    const p = positions[m.id]
    return { id: m.id, x: p.x + CARD_W / 2, y: p.y + CARD_H / 2 }
  })
  return (
    <svg className="stage-lines" viewBox={`0 0 ${dims.w} ${dims.h}`}>
      {centers.map((c) => (
        <line key={c.id} x1={dims.center.x} y1={dims.center.y} x2={c.x} y2={c.y} />
      ))}
      {centers.map((c) => (
        <circle key={c.id} cx={c.x} cy={c.y} r="6" />
      ))}
      <circle cx={dims.center.x} cy={dims.center.y} r="6" />
    </svg>
  )
}

function HubCard({ mod, pos, index, editMode, fit, dims, onOpen, onMoved }) {
  const drag = useRef(null)
  const [dragging, setDragging] = useState(false)

  const driftStyle =
    editMode || dragging
      ? { animation: 'none' }
      : {
          '--drift-dur': `${9 + (index % 6)}s`,
          '--drift-x': `${(index % 3) * 4 - 4}px`,
          '--drift-y': `${(index % 4) * 4 - 8}px`,
        }

  function beginDrag() {
    if (drag.current) {
      drag.current.mode = 'drag'
      setDragging(true)
    }
  }

  function onPointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = {
      mode: editMode ? 'drag' : 'pending',
      timer: editMode ? null : setTimeout(beginDrag, LONG_PRESS_MS),
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      draggedFar: false,
    }
    if (editMode) setDragging(true)
  }

  function onPointerMove(e) {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (d.mode === 'pending') {
      // Vor Ablauf des Long-Press bewegt → normaler Tap, kein Drag.
      if (Math.hypot(dx, dy) > DRAG_START_TOLERANCE) {
        clearTimeout(d.timer)
        drag.current = null
      }
      return
    }
    d.draggedFar = d.draggedFar || Math.hypot(dx, dy) > 6
    // Letzte Position im Ref merken — die pos-Prop hinkt beim schnellen
    // Loslassen einen Render hinterher (sonst wird der Drag "zurueckgesetzt").
    d.lastPos = {
      x: Math.max(0, Math.min(dims.w - CARD_W, d.origX + dx / fit.scale)),
      y: Math.max(0, Math.min(dims.h - CARD_H, d.origY + dy / fit.scale)),
    }
    onMoved(mod.id, d.lastPos)
  }

  function onPointerUp() {
    const d = drag.current
    if (!d) return
    clearTimeout(d.timer)
    if (d.mode === 'drag') {
      onMoved(mod.id, d.lastPos || pos, true) // persistieren
      // Klick nach Drag unterdruecken (click feuert nach pointerup).
      drag.current = { suppressClick: d.draggedFar }
      setDragging(false)
      setTimeout(() => (drag.current = null), 250)
    } else {
      drag.current = null
    }
  }

  function onClick() {
    if (drag.current?.suppressClick || dragging || editMode) return
    onOpen(mod.id)
  }

  return (
    <div className="hub-card-drift" style={{ left: pos.x, top: pos.y, ...driftStyle }}>
      <button
        className={`hub-card tap ${editMode ? 'hub-card--edit' : ''} ${dragging ? 'hub-card--dragging' : ''}`}
        style={{ transform: `rotate(${pos.rot ?? 0}deg)`, touchAction: 'none' }}
        onClick={onClick}
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
  const dims = DIMS[fit.orientation]
  const [layouts, setLayouts] = useState(() => ({
    landscape: getLayout('landscape'),
    portrait: getLayout('portrait'),
  }))
  const layout = layouts[fit.orientation]

  // Effektive Position: Ausrichtungs-Default + gespeicherter Override.
  const positions = Object.fromEntries(
    modules.map((m, i) => {
      const base = fit.orientation === 'portrait' ? portraitDefault(i) : m.hubPosition
      return [m.id, { ...base, ...(layout[m.id] || {}) }]
    })
  )

  function focusToCamera(f) {
    if (!f || f.type === 'overview') return { x: dims.w / 2, y: dims.h / 2, scale: 1 }
    if (f.type === 'center') return { ...dims.center, scale: f.scale || 1.15 }
    const p = positions[f.id]
    if (!p) return { x: dims.w / 2, y: dims.h / 2, scale: 1 }
    return { x: p.x + CARD_W / 2, y: p.y + CARD_H / 2, scale: f.scale || 1.9 }
  }

  function onCardMoved(id, pos, persist) {
    setLayouts((cur) => ({
      ...cur,
      [fit.orientation]: { ...cur[fit.orientation], [id]: { x: pos.x, y: pos.y } },
    }))
    if (persist) saveLayoutPos(id, pos, fit.orientation)
  }

  const cam = focusToCamera(focus)
  const tx = dims.w / 2 - cam.x * cam.scale
  const ty = dims.h / 2 - cam.y * cam.scale
  const flightClass =
    flightMode === 'in' ? 'stage-camera--fly-in' : flightMode === 'out' ? 'stage-camera--fly-out' : ''

  return (
    <div className="stage-viewport">
      <div
        className="stage-fit"
        style={{ left: fit.left, top: fit.top, width: dims.w, height: dims.h, transform: `scale(${fit.scale})` }}
      >
        <div
          className={`stage-camera ${flightClass}`}
          style={{ transform: `translate(${tx}px, ${ty}px) scale(${cam.scale})` }}
        >
          <ConstellationLines positions={positions} dims={dims} />
          <div className="stage-center" style={{ left: dims.center.x, top: dims.center.y }}>
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
                fit={fit}
                dims={dims}
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
