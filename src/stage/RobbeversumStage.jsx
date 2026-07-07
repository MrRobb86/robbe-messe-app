// Die Buehne: 1920×1080-Design-Flaeche, Kamera-Transform, Hub-Konstellation.
// Attract-Mode und Hub teilen sich diese eine Buehne — der Uebergang ist nur
// eine Kamerafahrt, kein Szenenwechsel ("der Bildschirmschoner war die Karte").
import { useEffect, useState } from 'react'
import { modules, config } from '../config/index.js'
import './stage.css'

const CARD_W = 400
const CARD_H = 270
const DESIGN_W = 1920
const DESIGN_H = 1080
const CENTER = { x: 960, y: 470 } // Wortmarke

export function cardCenter(mod) {
  return { x: mod.hubPosition.x + CARD_W / 2, y: mod.hubPosition.y + CARD_H / 2 }
}

// Kamera-Transform: Punkt (x,y) der Buehne ins Viewport-Zentrum, Zoom s.
function cameraTransform({ x, y, scale }) {
  const tx = DESIGN_W / 2 - x * scale
  const ty = DESIGN_H / 2 - y * scale
  return `translate(${tx}px, ${ty}px) scale(${scale})`
}

// focus → Kamera-Ziel. focus:
//   {type:'overview'} | {type:'center', scale?} | {type:'module', id, scale?}
export function focusToCamera(focus) {
  if (!focus || focus.type === 'overview') return { x: DESIGN_W / 2, y: DESIGN_H / 2, scale: 1 }
  if (focus.type === 'center') return { ...CENTER, scale: focus.scale || 1.15 }
  const mod = modules.find((m) => m.id === focus.id)
  if (!mod) return { x: DESIGN_W / 2, y: DESIGN_H / 2, scale: 1 }
  return { ...cardCenter(mod), scale: focus.scale || 1.9 }
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

function ConstellationLines() {
  return (
    <svg className="stage-lines" viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}>
      {modules.map((m) => {
        const c = cardCenter(m)
        return <line key={m.id} x1={CENTER.x} y1={CENTER.y} x2={c.x} y2={c.y} />
      })}
      {modules.map((m) => {
        const c = cardCenter(m)
        return <circle key={m.id} cx={c.x} cy={c.y} r="6" />
      })}
      <circle cx={CENTER.x} cy={CENTER.y} r="6" />
    </svg>
  )
}

function HubCard({ mod, index, onOpen }) {
  const { x, y, rot } = mod.hubPosition
  // Pro Karte eigener Drift (9–14 s), damit das Robbeversum "schwebt" statt zappelt.
  const driftDur = `${9 + (index % 6)}s`
  const driftX = `${(index % 3) * 4 - 4}px`
  const driftY = `${(index % 4) * 4 - 8}px`
  return (
    <div
      className="hub-card-drift"
      style={{ left: x, top: y, '--drift-dur': driftDur, '--drift-x': driftX, '--drift-y': driftY }}
    >
      <button
        className="hub-card pressable tap"
        style={{ transform: `rotate(${rot}deg)` }}
        onClick={() => onOpen(mod.id)}
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
export default function RobbeversumStage({ focus, flightMode = 'camera', hubHidden, onOpenModule }) {
  const fit = useStageFit()
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
          <ConstellationLines />
          <div className="stage-center">
            <p className="eyebrow">{config.kontakt.firma}</p>
            <h1>
              ROBBEVERSUM<span style={{ color: 'var(--accent)' }}>.</span>
            </h1>
          </div>
          <div className={`hub-layer ${hubHidden ? 'hub-layer--hidden' : ''}`}>
            {modules.map((m, i) => (
              <HubCard key={m.id} mod={m} index={i} onOpen={onOpenModule} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
