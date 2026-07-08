// Attract-Mode: Szenen-Sequencer mit Autopilot-Kamera. Rotiert durch die
// Konfig-Szenen, steuert den Buehnen-Fokus (onFocus) und rendert pro Szene
// ein Overlay. Jeder Touch geht durch das Overlay hindurch und weckt den
// Kiosk (Handler liegt in App).
import { useEffect, useMemo, useState } from 'react'
import { attractScenes, getModule } from '../config/index.js'
import Wordmark from '../components/Wordmark.jsx'
import './attract.css'

// Die 8 Angebote fliegen als ROTE Kaesten nacheinander rein und raus.
// Inhalte kommen direkt aus dem Angebote-Modul (eine Quelle, keine Doppelpflege).
function AngeboteFly({ scene }) {
  const cards = getModule('angebote')?.payload.cards || []
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    setIdx(0)
    const t = setInterval(() => setIdx((i) => (i + 1) % cards.length), scene.perItemMs)
    return () => clearInterval(t)
  }, [scene.perItemMs, cards.length])
  const c = cards[idx]
  if (!c) return null
  return (
    <div className="attract-scene">
      <h2 className="attract-headline" style={{ fontSize: 'clamp(48px, 3.6vw, 72px)' }}>
        Was wir anbieten<span className="accent-em">.</span>
      </h2>
      {/* Nur Titel + Kurzbeschreibung — bewusst keine Nummerierung. */}
      <div className="attract-angebot" key={idx} style={{ '--fly-dur': `${scene.perItemMs}ms` }}>
        <h3 className="attract-angebot__title">{c.title}</h3>
        <p className="attract-angebot__text">{c.text}</p>
      </div>
    </div>
  )
}

// Tippender Text: erst die Frage Zeichen fuer Zeichen (40ms), kurze Pause,
// dann die Antwort Wort fuer Wort — wie echtes Streaming, aber vorproduziert.
function AutoChat({ script }) {
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const words = useMemo(() => script.answer.split(' '), [script.answer])

  useEffect(() => {
    setQ('')
    setA('')
    let qi = 0
    let wi = 0
    let answerTimer = null
    const qTimer = setInterval(() => {
      qi += 1
      setQ(script.question.slice(0, qi))
      if (qi >= script.question.length) {
        clearInterval(qTimer)
        answerTimer = setInterval(() => {
          wi += 1
          setA(words.slice(0, wi).join(' '))
          if (wi >= words.length) clearInterval(answerTimer)
        }, 90)
      }
    }, 40)
    return () => {
      clearInterval(qTimer)
      if (answerTimer) clearInterval(answerTimer)
    }
  }, [script, words])

  const done = a && a.length >= script.answer.length
  return (
    <div className="attract-chat">
      <div>
        <span className="attract-chat__q">
          {q}
          {q.length < script.question.length && <span className="attract-caret" />}
        </span>
      </div>
      <div className="attract-chat__a">
        {a}
        {!done && q.length >= script.question.length && <span className="attract-caret" />}
      </div>
    </div>
  )
}

// Brand-Opener: Headline setzt sich Buchstabe fuer Buchstabe (40ms Stagger).
function StaggeredHeadline({ text }) {
  return (
    <h2 className="attract-headline" aria-label={text}>
      {[...text].map((ch, i) => (
        <span key={i} className="attract-letter" style={{ animationDelay: `${i * 40}ms` }}>
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </h2>
  )
}

// Worte-Szene: die 4 Begriffe wechseln gross durch (je 3 s).
function RotatingWords({ words, durationMs }) {
  const [idx, setIdx] = useState(0)
  const per = Math.max(2000, Math.floor(durationMs / words.length))
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % words.length), per)
    return () => clearInterval(t)
  }, [words.length, per])
  const w = words[idx]
  return (
    <div className="attract-word" key={idx}>
      <h2 className="attract-headline">
        {w.word.replace('.', '')}
        <span className="accent-em">.</span>
      </h2>
      <p className="attract-sub">{w.line}</p>
    </div>
  )
}

function Scene({ scene }) {
  if (scene.type === 'brand') {
    // Startbildschirm: "Willkommen" oben, darunter die Wortmarke mit dem
    // R-Symbol als Trennelement (statt einer umbrechenden Textzeile).
    return (
      <div className="attract-scene" key={scene.id}>
        <StaggeredHeadline text={scene.headline} />
        <h2 className="attract-headline">
          <Wordmark caps />
        </h2>
        <p className="attract-sub">{scene.sub}</p>
      </div>
    )
  }
  if (scene.type === 'angebote') {
    return <AngeboteFly scene={scene} key={scene.id} />
  }
  if (scene.type === 'chatDemo') {
    return (
      <div className="attract-scene" key={scene.id}>
        <h2 className="attract-headline" style={{ fontSize: 'clamp(56px, 4.5vw, 84px)' }}>
          {scene.headline}
        </h2>
        <AutoChat script={scene.script} />
      </div>
    )
  }
  if (scene.type === 'words') {
    return (
      <div className="attract-scene" key={scene.id}>
        <RotatingWords words={scene.words} durationMs={scene.durationMs} />
      </div>
    )
  }
  if (scene.type === 'cta') {
    return (
      <div className="attract-scene" key={scene.id}>
        <h2 className="attract-headline">{scene.headline}</h2>
        <p className="attract-sub">{scene.sub}</p>
      </div>
    )
  }
  // team & Fallback: nur Headline — die Buehne (Karte im Fokus) traegt die Szene.
  return (
    <div className="attract-scene" key={scene.id}>
      <h2 className="attract-headline" style={{ fontSize: 'clamp(56px, 4.5vw, 84px)' }}>
        {scene.headline}
      </h2>
    </div>
  )
}

export default function AttractLoop({ onFocus }) {
  const [sceneIdx, setSceneIdx] = useState(0)
  const scene = attractScenes[sceneIdx]

  // Szenenwechsel nach durationMs.
  useEffect(() => {
    const t = setTimeout(() => setSceneIdx((i) => (i + 1) % attractScenes.length), scene.durationMs)
    return () => clearTimeout(t)
  }, [sceneIdx, scene.durationMs])

  // Kamera pro Szene ausrichten.
  useEffect(() => {
    if (scene.focusModule === 'overview') onFocus({ type: 'overview' })
    else if (scene.focusModule) onFocus({ type: 'module', id: scene.focusModule, scale: 1.9 })
    else onFocus({ type: 'center' })
  }, [scene, onFocus])

  return (
    <>
      <div
        className="attract-overlay"
        style={{ background: scene.type === 'chatDemo' ? 'rgba(248,247,244,0.82)' : 'rgba(248,247,244,0.55)' }}
      >
        <Scene scene={scene} />
      </div>
      <div className="attract-pill">
        <span className="dot" />
        Tippen zum Erkunden
      </div>
    </>
  )
}
