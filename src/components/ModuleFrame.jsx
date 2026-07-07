// Einheitlicher Modul-Rahmen: Eyebrow-Orientierung ("ROBBEVERSUM / …"),
// Titel, Inhalt — und der allgegenwaertige Zurueck-Button unten links.
import './module.css'

export default function ModuleFrame({ mod, closing, onBack, children, hideTitle }) {
  return (
    <>
      <div className={`module-layer ${closing ? 'module-layer--closing' : ''}`}>
        {!hideTitle && (
          <div className="module-head">
            <p className="eyebrow">ROBBEVERSUM / {mod.title.toUpperCase()}</p>
            <h2>{mod.title}</h2>
          </div>
        )}
        <div className="module-body">{children}</div>
      </div>
      <button className="pill pressable back-btn" onClick={onBack}>
        <span className="dot" />
        ← Zurück ins RobbeVersum
      </button>
    </>
  )
}
