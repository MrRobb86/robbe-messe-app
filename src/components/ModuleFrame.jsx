// Einheitlicher Modul-Rahmen: Eyebrow-Orientierung, Titel, Inhalt — und der
// allgegenwaertige Zurueck-Button unten links (mit RobbeVersum-Wortmarke).
import Wordmark from './Wordmark.jsx'
import './module.css'

export default function ModuleFrame({ mod, closing, onBack, children, hideTitle }) {
  // Module mit eingebetteten externen Apps (iframes) bekommen KEINE
  // --k-Zoom-Skalierung: Unter einem zoom-Vorfahren stimmt der innere
  // iframe-Viewport nicht mit der sichtbaren Flaeche ueberein → die externe
  // App rendert zu gross/klein und laesst weisse Raender. Externe Apps sind
  // selbst responsiv und sollen die echte Browser-Aufloesung sehen.
  const nativeRes = mod.kind === 'iframe' || mod.kind === 'portal' || mod.kind === 'projekte'
  return (
    <>
      <div
        className={`module-layer ${nativeRes ? 'module-layer--native' : ''} ${closing ? 'module-layer--closing' : ''}`}
      >
        {!hideTitle && (
          <div className="module-head">
            <p className="eyebrow">
              <Wordmark caps dot={false} /> / {mod.title.toUpperCase()}
            </p>
            <h2>{mod.title}</h2>
          </div>
        )}
        <div className="module-body">{children}</div>
      </div>
      <button className="pill pressable back-btn" onClick={onBack}>
        ← Zurück ins <Wordmark />
      </button>
    </>
  )
}
