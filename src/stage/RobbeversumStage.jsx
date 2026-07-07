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

  // Sichtbares Schweben: pro Karte eigene Amplitude/Dauer (transform-only,
  // 60fps). Waehrend des Ziehens aus, sonst "zittert" die Karte am Finger.
  const driftStyle = dragging
    ? { animation: 'none', transition: 'none' }
    : {
        '--drift-dur': `${7 + (index % 5)}s`,
        '--drift-x': `${((index * 7) % 3) * 12 - 12}px`,
        '--drift-y': `${((index * 5) % 3) * 14 - 14}px`,
      }

  function onPointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId)
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
      // Abstossen/Platztausch + ggf. speichern; origin = frei gewordener Platz.
      onMoved(mod.id, d.lastPos || pos, { origin: { x: d.origX, y: d.origY } })
      // Klick nach Drag unterdruecken (click feuert nach pointerup).
      drag.current = { suppressClick: true }
      setDragging(false)
      setTimeout(() => (drag.current = null), 250)
    } else {
      drag.current = null
    }
  }

  function onClick() {
    if (drag.current?.suppressClick || dragging) return
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

// Abstossen beim Loslassen: Karte wird aus Ueberlappungen mit anderen Karten
// und der Zentrum-Zone (Wortmarke) herausgedrueckt — entlang der Achse der
// geringsten Eindringtiefe, iterativ, damit Kettenkollisionen aufgehen.
function resolveCollisions(id, pos, positions, dims) {
  const p = { ...pos }
  const centerZone = {
    x: dims.center.x - 320,
    y: dims.center.y - 100,
    w: 640,
    h: 200,
  }
  const obstacles = [
    ...Object.entries(positions)
      .filter(([oid]) => oid !== id)
      .map(([, o]) => ({ x: o.x, y: o.y, w: CARD_W, h: CARD_H })),
    centerZone,
  ]
  for (let i = 0; i < 24; i++) {
    let pushed = false
    for (const o of obstacles) {
      const overlapX = Math.min(p.x + CARD_W + GAP, o.x + o.w + GAP) - Math.max(p.x - GAP, o.x - GAP)
      const overlapY = Math.min(p.y + CARD_H + GAP, o.y + o.h + GAP) - Math.max(p.y - GAP, o.y - GAP)
      if (overlapX > 0 && overlapY > 0) {
        // Entlang der Achse mit der geringsten Ueberlappung herausschieben.
        // Blockiert der Buehnenrand die Richtung, in die Gegenrichtung
        // ausweichen — sonst klemmt die Karte am Rand fest (Endlos-Patt).
        if (overlapX < overlapY) {
          const dir = p.x + CARD_W / 2 < o.x + o.w / 2 ? -1 : 1
          const nx = p.x + dir * overlapX
          p.x = nx < 0 || nx > dims.w - CARD_W ? p.x - dir * overlapX : nx
        } else {
          const dir = p.y + CARD_H / 2 < o.y + o.h / 2 ? -1 : 1
          const ny = p.y + dir * overlapY
          p.y = ny < 0 || ny > dims.h - CARD_H ? p.y - dir * overlapY : ny
        }
        pushed = true
      }
    }
    p.x = Math.max(0, Math.min(dims.w - CARD_W, p.x))
    p.y = Math.max(0, Math.min(dims.h - CARD_H, p.y))
    if (!pushed) break
  }

  // Konvergiert das Schieben nicht (lokales Minimum, z. B. volle Spalte am
  // Rand): Rastersuche nach der naechstgelegenen wirklich freien Position.
  const isFree = (q) =>
    obstacles.every(
      (o) =>
        q.x + CARD_W + GAP <= o.x || o.x + o.w + GAP <= q.x || q.y + CARD_H + GAP <= o.y || o.y + o.h + GAP <= q.y
    )
  if (!isFree(p)) {
    let best = null
    for (let gx = 0; gx <= dims.w - CARD_W; gx += 40) {
      for (let gy = 0; gy <= dims.h - CARD_H; gy += 40) {
        const q = { x: gx, y: gy }
        if (!isFree(q)) continue
        const d = (gx - pos.x) ** 2 + (gy - pos.y) ** 2
        if (!best || d < best.d) best = { ...q, d }
      }
    }
    if (best) return { x: best.x, y: best.y, resolved: true }
    // Buehne ist voll — kein freier Platz. Aufrufer macht einen Platztausch.
    return { ...p, resolved: false }
  }
  return { ...p, resolved: true }
}

// Karte, die am Drop-Punkt am staerksten ueberlappt wird (fuer Platztausch).
function mostOverlappedCard(id, pos, positions) {
  let best = null
  for (const [oid, o] of Object.entries(positions)) {
    if (oid === id) continue
    const ox = Math.min(pos.x + CARD_W, o.x + CARD_W) - Math.max(pos.x, o.x)
    const oy = Math.min(pos.y + CARD_H, o.y + CARD_H) - Math.max(pos.y, o.y)
    const area = Math.max(0, ox) * Math.max(0, oy)
    if (area > 0 && (!best || area > best.area)) best = { id: oid, area }
  }
  return best?.id || null
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
    if (!release) {
      setLayouts((cur) => ({
        ...cur,
        [fit.orientation]: { ...cur[fit.orientation], [id]: { x: pos.x, y: pos.y } },
      }))
      return
    }
    // Loslassen: aus Ueberlappungen herausdruecken. Findet sich auf der
    // vollen Buehne kein freier Platz → Platztausch mit der getroffenen
    // Karte (wie beim App-Icons-Sortieren): sie weicht auf den frei
    // gewordenen Ursprungsplatz aus.
    const updates = {}
    const resolved = resolveCollisions(id, pos, positions, dims)
    if (resolved.resolved) {
      updates[id] = { x: resolved.x, y: resolved.y }
    } else {
      const hitId = mostOverlappedCard(id, pos, positions)
      if (hitId && release.origin) {
        updates[id] = { x: positions[hitId].x, y: positions[hitId].y }
        updates[hitId] = { x: release.origin.x, y: release.origin.y }
      } else {
        updates[id] = { x: release.origin?.x ?? resolved.x, y: release.origin?.y ?? resolved.y }
      }
    }
    setLayouts((cur) => ({
      ...cur,
      [fit.orientation]: { ...cur[fit.orientation], ...updates },
    }))
    // DAUERHAFT speichern nur im Layout-Modus — Besucher-Schiebereien sind
    // temporaer und enden mit dem Session-Reset.
    if (editMode) for (const [uid, upos] of Object.entries(updates)) saveLayoutPos(uid, upos, fit.orientation)
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
