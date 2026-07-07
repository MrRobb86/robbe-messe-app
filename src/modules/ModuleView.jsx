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

// Gefuehrte Copilot-Tour: grosse Schritte, Weiter/Zurueck, optional
// "Selbst ausprobieren" (Demo-Instanz — Entscheidung W4).
function Tour({ payload }) {
  const [step, setStep] = useState(0)
  const [live, setLive] = useState(false)
  const s = payload.steps[step]

  if (live && payload.tryUrl) {
    return <IframeModule payload={{ url: payload.tryUrl, frameLabel: 'ROBOAI COPILOT — DEMO' }} />
  }

  return (
    <div className="tour">
      <div className="tour__step" key={step}>
        <img className="tour__image" src={s.image} alt="" onError={(e) => (e.target.style.visibility = 'hidden')} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 44, margin: '28px 0 12px', color: 'var(--ink-900)' }}>
          {s.title}
        </h3>
        <p style={{ fontSize: 26, color: 'var(--ink-500)', margin: 0 }}>{s.text}</p>
      </div>
      <div className="tour__nav">
        <button
          className="pill pressable"
          disabled={step === 0}
          style={{ opacity: step === 0 ? 0.35 : 1 }}
          onClick={() => setStep((x) => Math.max(0, x - 1))}
        >
          ←
        </button>
        <div className="tour__dots">
          {payload.steps.map((_, i) => (
            <span key={i} className={i === step ? 'active' : ''} />
          ))}
        </div>
        {step < payload.steps.length - 1 ? (
          <button className="pill pill--primary pressable" onClick={() => setStep((x) => x + 1)}>
            Weiter →
          </button>
        ) : payload.tryUrl ? (
          <button className="pill pill--primary pressable" onClick={() => setLive(true)}>
            Selbst ausprobieren →
          </button>
        ) : (
          <div className="qr-block">
            <img src={config.qr.vcard} alt="QR-Code" style={{ width: 180, height: 180 }} />
            <p>Mehr erfahren? Nimm uns mit aufs Handy.</p>
          </div>
        )}
      </div>
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
    case 'demoScript':
      return <Tour payload={mod.payload} />
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
