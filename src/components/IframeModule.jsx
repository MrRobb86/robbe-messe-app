// iframe im "Demo-Rahmen": Chrome-Leiste macht klar, dass das ein Fenster
// in etwas Echtes ist. Laedt der Frame nicht (offline/Timeout), springt der
// Fallback ein. Der Zurueck-Button liegt AUSSERHALB und ist nie verdeckbar.
import { useEffect, useRef, useState } from 'react'
import { config } from '../config/index.js'
import { useOnline } from '../kiosk/useOnline.js'

const LOAD_TIMEOUT_MS = 12_000

export default function IframeModule({ payload }) {
  // payload.url = direkte URL (z. B. Copilot-Demo-Instanz), sonst Config-Key.
  const url = payload.url || config.urls[payload.urlKey]
  const online = useOnline()
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    setLoaded(false)
    setFailed(false)
    timer.current = setTimeout(() => setFailed(true), LOAD_TIMEOUT_MS)
    return () => clearTimeout(timer.current)
  }, [reloadKey])

  const showFallback = !url || failed || (!online && !loaded)

  return (
    <div className="frame-demo">
      <div className="frame-demo__bar">
        <span>
          <span className="dot" />
          {payload.frameLabel}
        </span>
        <button
          className="frame-demo__reload"
          aria-label="Neu laden"
          onClick={() => setReloadKey((k) => k + 1)}
        >
          ⟳
        </button>
      </div>
      {showFallback ? (
        <div className="frame-demo__fallback">
          <h3>Gerade nicht erreichbar.</h3>
          <p>
            Die Live-Ansicht braucht Internet. Scan den QR-Code und schau sie dir auf deinem
            Handy an — oder sprich uns direkt an!
          </p>
          <div className="qr-block">
            <img src={config.qr.vcard} alt="QR-Code" />
            <p className="mono">{config.urls.website?.replace('/?kiosk=1', '')}</p>
          </div>
        </div>
      ) : (
        <iframe
          key={reloadKey}
          src={url}
          title={payload.frameLabel}
          sandbox="allow-scripts allow-same-origin allow-forms"
          onLoad={() => {
            clearTimeout(timer.current)
            setLoaded(true)
          }}
        />
      )}
    </div>
  )
}
