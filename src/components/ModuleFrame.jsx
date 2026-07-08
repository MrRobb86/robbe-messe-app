// Einheitlicher Modul-Rahmen: Eyebrow-Orientierung, Titel, Inhalt — und der
// allgegenwaertige Zurueck-Button unten links (mit RobbeVersum-Wortmarke).
import Wordmark from './Wordmark.jsx'
import './module.css'

export default function ModuleFrame({ mod, closing, onBack, children, hideTitle }) {
  return (
    <>
      <div className={`module-layer ${closing ? 'module-layer--closing' : ''}`}>
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
