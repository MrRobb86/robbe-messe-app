// Modul-Registry: rendert den Inhalt eines Satelliten nach seinem kind.
// Neue Messe-Inhalte entstehen in der Config — hier aendert sich nichts.
import { useState } from 'react'
import ChatScreen from '../components/ChatScreen.jsx'
import IframeModule from '../components/IframeModule.jsx'
import LeadModule from './LeadModule.jsx'
import { config } from '../config/index.js'
import { useKiosk } from '../kiosk/KioskSession.jsx'

// Content-Karten. Karten mit `detail` in der Config sind antippbar und
// oeffnen eine tiefergehende Informationsseite (Angebots-Detail).
function ContentCards({ cards }) {
  const { openModule } = useKiosk()
  const [detail, setDetail] = useState(null)

  if (detail) {
    return (
      <div className="detail scrollable">
        <button className="chip pressable detail__back" onClick={() => setDetail(null)}>
          ← Zurück zur Übersicht
        </button>
        <p className="eyebrow">{detail.eyebrow}</p>
        <h3 className="detail__title">{detail.title}</h3>
        <p className="detail__intro">{detail.detail.intro}</p>
        <div className="cards-grid" style={{ overflow: 'visible' }}>
          {detail.detail.punkte.map((p) => (
            <div key={p.title} className="content-card content-card--compact">
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
        {detail.detail.fakten && <p className="detail__fakten">{detail.detail.fakten}</p>}
        <div className="detail__cta-row">
          <button className="pill pressable lead-red-cta detail__cta" onClick={() => openModule('kontakt')}>
            Sprechen wir darüber →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cards-grid scrollable">
      {cards.map((c) =>
        c.detail ? (
          <button key={c.title} className="content-card content-card--tappable pressable" onClick={() => setDetail(c)}>
            <p className="eyebrow">{c.eyebrow}</p>
            <h3>{c.title}</h3>
            <p>{c.text}</p>
            <span className="content-card__more">Mehr erfahren →</span>
          </button>
        ) : (
          <div key={c.title} className="content-card">
            <p className="eyebrow">{c.eyebrow}</p>
            <h3>{c.title}</h3>
            <p>{c.text}</p>
          </div>
        )
      )}
    </div>
  )
}

function TeamCards({ members }) {
  return (
    <div className="cards-grid scrollable">
      {members.map((m) => (
        <div key={m.name} className="content-card team-card">
          <img src={m.image} alt={m.name} onError={(e) => (e.target.style.visibility = 'hidden')} />
          <p className="eyebrow">{m.role}</p>
          <h3>{m.name}</h3>
          <p>{m.text}</p>
        </div>
      ))}
    </div>
  )
}

// Portal-Modul (Robbe AI-Copilot): ausfuehrliche Beschreibung + prominenter
// "Zum Portal"-Button, der die Live-Instanz im Demo-Rahmen oeffnet.
function Portal({ payload }) {
  const [live, setLive] = useState(false)

  if (live && payload.portalUrl) {
    return (
      <>
        <IframeModule payload={{ url: payload.portalUrl, frameLabel: payload.frameLabel }} />
        <button
          className="chip pressable"
          style={{ alignSelf: 'flex-start', marginTop: 16 }}
          onClick={() => setLive(false)}
        >
          ← Zur Beschreibung
        </button>
      </>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, minHeight: 0, flex: 1 }}>
      <p style={{ fontSize: 28, lineHeight: 1.5, color: 'var(--ink-700)', margin: 0, maxWidth: 1100 }}>
        {payload.intro}
      </p>
      <div className="cards-grid scrollable">
        {payload.features.map((f) => (
          <div key={f.title} className="content-card">
            <p className="eyebrow">{f.eyebrow}</p>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </div>
      {payload.portalUrl && (
        <button
          className="pill pressable"
          style={{
            alignSelf: 'center',
            height: 100,
            padding: '0 64px',
            fontSize: 36,
            fontWeight: 800,
            color: 'var(--accent)',
            border: '2px solid var(--accent)',
            borderRadius: 50,
          }}
          onClick={() => setLive(true)}
        >
          Zum Portal →
        </button>
      )}
    </div>
  )
}

// "Unsere Projekte": Uebersicht der Software-Projekte → Detailseite mit
// Beschreibung, Punkten und — sobald eine einbettbare Demo-Instanz existiert
// (liveUrl) — dem roten "Live ausprobieren"-Button, der die App im
// Demo-Rahmen oeffnet. Ohne liveUrl: ehrlicher Hinweis statt totem Button.
function Projekte({ payload }) {
  const { openModule } = useKiosk()
  const [current, setCurrent] = useState(null)
  const [live, setLive] = useState(false)

  if (current && live && current.liveUrl) {
    return (
      <>
        <IframeModule payload={{ url: current.liveUrl, frameLabel: current.frameLabel }} />
        <button className="chip pressable" style={{ alignSelf: 'flex-start', marginTop: 16 }} onClick={() => setLive(false)}>
          ← Zur Beschreibung
        </button>
      </>
    )
  }

  if (current) {
    return (
      <div className="detail scrollable">
        <button className="chip pressable detail__back" onClick={() => setCurrent(null)}>
          ← Alle Projekte
        </button>
        <p className="eyebrow">{current.eyebrow}</p>
        <h3 className="detail__title">{current.title}</h3>
        <p className="detail__intro">{current.detail.intro}</p>
        <div className="cards-grid" style={{ overflow: 'visible' }}>
          {current.detail.punkte.map((p) => (
            <div key={p.title} className="content-card content-card--compact">
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
        {current.detail.fakten && <p className="detail__fakten">{current.detail.fakten}</p>}
        <div className="detail__cta-row" style={{ gap: 16, flexWrap: 'wrap' }}>
          {current.liveUrl ? (
            <button className="pill pressable lead-red-cta detail__cta" onClick={() => setLive(true)}>
              Live ausprobieren →
            </button>
          ) : (
            <span className="detail__fakten" style={{ alignSelf: 'center' }}>Live-Demo wird eingerichtet</span>
          )}
          <button className="pill pressable detail__cta" onClick={() => openModule('kontakt')}>
            So etwas für mein Unternehmen →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cards-grid scrollable">
      {payload.projects.map((p) => (
        <button key={p.id} className="content-card content-card--tappable pressable" onClick={() => setCurrent(p)}>
          <p className="eyebrow">{p.eyebrow}</p>
          <h3>{p.title}</h3>
          <p>{p.text}</p>
          <span className="content-card__more">{p.liveUrl ? 'Ansehen & ausprobieren →' : 'Mehr erfahren →'}</span>
        </button>
      ))}
    </div>
  )
}

export default function ModuleView({ mod }) {
  switch (mod.kind) {
    case 'iframe':
      return <IframeModule payload={mod.payload} />
    case 'kioskChat':
      return (
        <div style={{ flex: 1, minHeight: 0, background: 'var(--paper)', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
          <ChatScreen payload={mod.payload} />
        </div>
      )
    case 'portal':
      return <Portal payload={mod.payload} />
    case 'contentCards':
      return <ContentCards cards={mod.payload.cards} />
    case 'team':
      return <TeamCards members={mod.payload.members} />
    case 'projekte':
      return <Projekte payload={mod.payload} />
    case 'lead':
      return <LeadModule />
    default:
      return null
  }
}
