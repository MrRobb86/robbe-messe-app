// Die Buehne: Design-Flaeche mit Kamera-Transform und Hub-Konstellation.
// Attract-Mode und Hub teilen sich diese eine Buehne — der Uebergang ist nur
// eine Kamerafahrt, kein Szenenwechsel ("der Bildschirmschoner war die Karte").
//
// Ausrichtung: Querformat 1920×1080 (Karten-Positionen aus modules.js),
// Hochformat 1080×1920 (automatisches 2-Spalten-Raster). Beide Layouts sind
// per Drag anpassbar und werden getrennt in localStorage gespeichert.
//
// Karten verschieben: einfach ANPACKEN und ziehen — ab ~12 px Bewegung wird
// aus dem Tap ein Drag (Tap ohne Bewegung oeffnet das Modul). Besucher duerfen
// frei schieben; DAUERHAFT gespeichert wird nur im Layout-Modus der
// Einstellungen. Beim Session-Reset ordnet sich das RobbeVersum wieder.
// Beim Loslassen stossen sich Karten ab: keine Ueberlappungen, das Zentrum
// (Wortmarke) bleibt frei.
import { useEffect, useRef, useState } from 'react'
import { modules, config } from '../config/index.js'
import { getLayout, saveLayoutPos } from '../kiosk/settings.js'
import Wordmark from '../components/Wordmark.jsx'
import './stage.css'

const CARD_W = 400
const CARD_H = 270
const DRAG_START_PX = 12 // ab dieser Bewegung wird der Tap zum Drag
// Mindestabstand beim Abstossen: muss GROESSER sein als der maximale
// kombinierte Schwebe-Drift zweier Karten (2×14px), sonst beruehren sie
// sich beim Schweben wieder.
const GAP = 36

const DIMS = {
  landscape: { w: 1920, h: 1080, center: { x: 960, y: 470 } },
  // Hochformat: Wortmarke bewusst so tief (y 430), dass OBERHALB eine
  // Karte Platz hat (270 + GAP + Zone) — Kundenwunsch: auch ueber dem
  // RobbeVersum darf geparkt werden.
  portrait: { w: 1080, h: 1920, center: { x: 540, y: 430 } },
}

// Schutzzone um die Wortmarke — hier parkt keine Karte.
function centerZone(dims) {
  return { x: dims.center.x - 320, y: dims.center.y - 80, w: 640, h: 160 }
}

// Hochformat-Default: 2-Spalten-Raster unter der Wortmarke.
function portraitDefault(index) {
  const col = index % 2
  const row = Math.floor(index / 2)
  return { x: col === 0 ? 70 : 610, y: 560 + row * 330, rot: col === 0 ? -1.2 : 1.2 }
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
      {/* KEIN zentraler roter Punkt mehr — die Linien laufen auf dem
          Design-Element (R-Symbol der Wortmarke) zusammen; der einzige rote
          Punkt am Zentrum ist der Punkt der Wortmarke nach VERSUM. */}
    </svg>
  )
}

function HubCard({ mod, pos, index, editMode, fit, dims, onOpen, onMoved }) {
  const drag = useRef(null)
  const justDragged = useRef(false) // unterdrueckt den Klick direkt nach einem Drag
  const [dragging, setDragging] = useState(false)

  // Waehrend des Ziehens folgt die Karte hart dem Finger (keine Nachzieh-
  // Transition), sonst rastet sie beim Loslassen weich ein. Das "Schweben"
  // liegt als GEMEINSAME Atembewegung auf .hub-layer (bewegt Linien + Karten
  // zusammen), damit die Verbindungslinien immer exakt an den Karten sitzen.
  const driftStyle = dragging ? { transition: 'none' } : undefined

  function onPointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId)
    justDragged.current = false
    drag.current = {
      mode: 'pending',
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    }
  }

  function onPointerMove(e) {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    // Ab der Bewegungsschwelle wird aus dem Tap ein freies Ziehen.
    if (d.mode === 'pending') {
      if (Math.hypot(dx, dy) < DRAG_START_PX) return
      d.mode = 'drag'
      setDragging(true)
    }
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
    if (d.mode === 'drag') {
      onMoved(mod.id, d.lastPos || pos, true)
      // Klick nach Drag unterdruecken (click feuert nach pointerup) — ueber ein
      // Flag, KEIN setTimeout: ein alter Timer wuerde sonst einen schnell
      // folgenden zweiten Drag mitten drin abwuergen (Stale-Timeout-Bug).
      justDragged.current = true
      setDragging(false)
    }
    drag.current = null
  }

  function onClick() {
    if (justDragged.current || dragging) {
      justDragged.current = false
      return
    }
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

// Endlicher Wert oder Fallback — schuetzt jede Positionsrechnung vor NaN/undefined.
function finite(v, fb) {
  return Number.isFinite(v) ? v : fb
}

// EINZIGER Separations-Algorithmus: schiebt alle Karten auseinander, bis keine
// mehr ueberlappt und keine die Zentrum-Zone (Wortmarke) verletzt. fixedId
// bleibt liegen (die gerade angefasste Karte). Deterministisch, feste
// Iterationszahl (haengt NIE), jede Koordinate NaN-gesichert. Ersetzt die
// frueheren dodge/resolve/relax/swap-Funktionen — die waren die Bug-Quelle.
function separate(layout, dims, fixedId) {
  const ids = Object.keys(layout)
  const p = {}
  for (const id of ids) p[id] = { x: finite(layout[id]?.x, 0), y: finite(layout[id]?.y, 0) }
  const zone = centerZone(dims)
  const clamp = (q) => {
    q.x = Math.max(0, Math.min(dims.w - CARD_W, finite(q.x, 0)))
    q.y = Math.max(0, Math.min(dims.h - CARD_H, finite(q.y, 0)))
  }
  for (const id of ids) clamp(p[id])

  for (let iter = 0; iter < 60; iter++) {
    let moved = false
    // Karte vs. Zentrum-Zone
    for (const id of ids) {
      if (id === fixedId) continue
      const q = p[id]
      const ox = Math.min(q.x + CARD_W + GAP, zone.x + zone.w + GAP) - Math.max(q.x - GAP, zone.x - GAP)
      const oy = Math.min(q.y + CARD_H + GAP, zone.y + zone.h + GAP) - Math.max(q.y - GAP, zone.y - GAP)
      if (ox > 0 && oy > 0) {
        if (ox < oy) q.x += q.x + CARD_W / 2 < zone.x + zone.w / 2 ? -ox : ox
        else q.y += q.y + CARD_H / 2 < zone.y + zone.h / 2 ? -oy : oy
        clamp(q)
        moved = true
      }
    }
    // Karte vs. Karte — beide weichen zur Haelfte, ausser eine ist fixiert.
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = p[ids[i]]
        const b = p[ids[j]]
        const ox = Math.min(a.x + CARD_W + GAP, b.x + CARD_W + GAP) - Math.max(a.x - GAP, b.x - GAP)
        const oy = Math.min(a.y + CARD_H + GAP, b.y + CARD_H + GAP) - Math.max(a.y - GAP, b.y - GAP)
        if (ox <= 0 || oy <= 0) continue
        const af = ids[i] === fixedId
        const bf = ids[j] === fixedId
        if (ox < oy) {
          const dir = a.x < b.x ? 1 : -1
          if (af) b.x += dir * ox
          else if (bf) a.x -= dir * ox
          else { a.x -= (dir * ox) / 2; b.x += (dir * ox) / 2 }
        } else {
          const dir = a.y < b.y ? 1 : -1
          if (af) b.y += dir * oy
          else if (bf) a.y -= dir * oy
          else { a.y -= (dir * oy) / 2; b.y += (dir * oy) / 2 }
        }
        clamp(a)
        clamp(b)
        moved = true
      }
    }
    if (!moved) break
  }
  return p
}

// flightMode: 'camera' (Attract, 1.4s) | 'in' (Zoom ins Modul, 600ms) | 'out' (Rueckflug, 450ms)
export default function RobbeversumStage({ focus, flightMode = 'camera', hubHidden, editMode, sessionId, onOpenModule }) {
  const fit = useStageFit()
  const dims = DIMS[fit.orientation]
  const [layouts, setLayouts] = useState(() => ({
    landscape: getLayout('landscape'),
    portrait: getLayout('portrait'),
  }))
  const layout = layouts[fit.orientation]

  // Session-Reset: Besucher-Verschiebungen verwerfen, gespeicherte
  // (bzw. Standard-)Konstellation wiederherstellen.
  useEffect(() => {
    setLayouts({ landscape: getLayout('landscape'), portrait: getLayout('portrait') })
  }, [sessionId])

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

  function onCardMoved(id, pos, release) {
    // Volle Momentaufnahme ALLER Positionen (immer vollstaendig, nie nur
    // Teilmengen — das war die Inkonsistenz-Quelle). Gezogene Karte auf die
    // Fingerposition, dann EIN Separations-Durchlauf (die anderen weichen aus,
    // gezogene bleibt fix). Ergebnis ist immer ein vollstaendiges, NaN-freies
    // Layout — waehrend des Ziehens UND beim Loslassen derselbe Code.
    const snapshot = {}
    for (const m of modules) snapshot[m.id] = { x: finite(positions[m.id].x, 0), y: finite(positions[m.id].y, 0) }
    snapshot[id] = { x: finite(pos.x, snapshot[id].x), y: finite(pos.y, snapshot[id].y) }
    const next = separate(snapshot, dims, id)
    setLayouts((cur) => ({ ...cur, [fit.orientation]: next }))
    // DAUERHAFT speichern nur im Layout-Modus (5× Logo) — Besucher-Schiebereien
    // sind temporaer und enden mit dem Session-Reset.
    if (release && editMode) for (const [uid, upos] of Object.entries(next)) saveLayoutPos(uid, upos, fit.orientation)
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
          <div className="stage-center" style={{ left: dims.center.x, top: dims.center.y }}>
            <p className="eyebrow">{config.kontakt.firma}</p>
            <h1>
              <Wordmark caps />
            </h1>
          </div>
          {/* Linien UND Karten teilen sich denselben "breathing"-Wrapper, damit
              das sanfte Schweben sie GEMEINSAM bewegt — kein Versatz mehr. */}
          <div className={`hub-layer ${hubHidden ? 'hub-layer--hidden' : ''}`}>
            <ConstellationLines positions={positions} dims={dims} />
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
