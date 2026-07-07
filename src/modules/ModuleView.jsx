// Modul-Registry: rendert den Inhalt eines Satelliten nach seinem kind.
// Neue Messe-Inhalte entstehen in der Config — hier aendert sich nichts.
import { useState } from 'react'
import ChatScreen from '../components/ChatScreen.jsx'
import IframeModule from '../components/IframeModule.jsx'
import LeadModule from './LeadModule.jsx'
import { config } from '../config/index.js'

function ContentCards({ cards }) {
  return (
    <div className="cards-grid scrollable">
      {cards.map((c) => (
        <div key={c.title} className="content-card">
          <p className="eyebrow">{c.eyebrow}</p>
          <h3>{c.title}</h3>
          <p>{c.text}</p>
        </div>
      ))}
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
    case 'lead':
      return <LeadModule />
    default:
      return null
  }
}
