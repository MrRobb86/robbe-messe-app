// Die RobbeVersum-Wortmarke — ueberall EIN Bauteil, damit die Schreibweise
// konsistent ist: das R-Symbol als Trenner zwischen Robbe und Versum, danach
// der rote Punkt. caps=true → Versalien (Hub-Zentrum, Startbildschirm),
// sonst gemischt (Zurueck-Button). Groesse passt sich per em an den Kontext an.
import './wordmark.css'

export default function Wordmark({ caps = false, dot = true, className = '' }) {
  return (
    <span className={`wordmark ${className}`}>
      {caps ? 'ROBBE' : 'Robbe'}
      <img className="wordmark__mark" src="/robbe-symbol.png" alt="" />
      {caps ? 'VERSUM' : 'Versum'}
      {dot && <span className="wordmark__dot">.</span>}
    </span>
  )
}
