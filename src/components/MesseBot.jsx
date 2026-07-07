// Messe-Bot: Floating Bubble (unten rechts) + Side-Sheet. Sichtbar im Hub
// und in allen Modulen — nicht im Attract-Mode (dort waere er Rauschen).
//
// Proaktive Sprechblasen, streng gegen den Nerv-Faktor geregelt:
//   – pro Modul genau EINE Kontext-Blase, jede nur 1× pro Session
//   – Auto-Ausblenden nach 10 s, Tap oeffnet den Bot mit vorbefuellter Frage
//   – nach dem 3. besuchten Modul genau EINE Lead-Einladung → Kontakt-Modul
import { useEffect, useRef, useState } from 'react'
import { config, getModule } from '../config/index.js'
import { useKiosk } from '../kiosk/KioskSession.jsx'
import ChatScreen from './ChatScreen.jsx'

const TEASER_DELAY_MS = 4000
const TEASER_HIDE_MS = 10_000

const BOT_PAYLOAD = {
  backend: 'n8n',
  webhookKey: 'messeBot',
  greeting:
    'Hallo! Ich bin der Messe-Assistent von Robbe Sales & AI Consulting. ' +
    'Frag mich alles — zu KI, unseren Angeboten oder einfach, wo du hier anfangen sollst.',
  suggestions: [
    'Was macht Robbe Consulting genau?',
    'Wie startet mein Unternehmen mit KI?',
    'Was kostet ein Strategie-Workshop?',
  ],
}

export default function MesseBot() {
  const { mode, activeModuleId, visited, openModule } = useKiosk()
  const [open, setOpen] = useState(false)
  const [prefill, setPrefill] = useState(null)
  const [teaser, setTeaser] = useState(null) // {text, question?, isLeadInvite?}
  const teasersShown = useRef(new Set())
  const leadInviteShown = useRef(false)

  const visible = mode !== 'attract'
  const mod = activeModuleId ? getModule(activeModuleId) : null
  // Im Kontakt-Modul und in Chat-Modulen schweigt der Bot (kein Chat-im-Chat).
  const botAllowed = visible && mod?.kind !== 'lead' && mod?.kind !== 'kioskChat'

  // Kontext-Sprechblase 4 s nach Modul-Eintritt.
  useEffect(() => {
    setTeaser(null)
    if (!botAllowed || !mod?.botTeaser || teasersShown.current.has(mod.id) || open) return
    const show = setTimeout(() => {
      teasersShown.current.add(mod.id)
      setTeaser({ text: mod.botTeaser, question: mod.botTeaser })
    }, TEASER_DELAY_MS)
    return () => clearTimeout(show)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModuleId, open])

  // Lead-Einladung: einmalig nach dem n-ten besuchten Modul, im Hub.
  useEffect(() => {
    if (
      mode === 'hub' &&
      !leadInviteShown.current &&
      visited.size >= config.leadInviteAfterModules &&
      !visited.has('kontakt')
    ) {
      leadInviteShown.current = true
      setTeaser({
        text: `Du hast schon ${visited.size} von 7 Stationen gesehen. Soll ich dir was zum Mitnehmen geben?`,
        isLeadInvite: true,
      })
    }
  }, [mode, visited])

  // Sprechblase blendet sich nach 10 s selbst aus.
  useEffect(() => {
    if (!teaser) return
    const hide = setTimeout(() => setTeaser(null), TEASER_HIDE_MS)
    return () => clearTimeout(hide)
  }, [teaser])

  if (!visible) return null

  function onTeaserTap() {
    const t = teaser
    setTeaser(null)
    if (t?.isLeadInvite) {
      openModule('kontakt')
    } else {
      setPrefill(t?.question || null)
      setOpen(true)
    }
  }

  return (
    <>
      {teaser && (
        <button className="bot-teaser" onClick={onTeaserTap}>
          {teaser.text}
        </button>
      )}
      {botAllowed && !open && (
        <button
          className="bot-bubble tap"
          aria-label="Messe-Assistent öffnen"
          onClick={() => {
            setPrefill(null)
            setOpen(true)
          }}
        >
          {/* Gleiches Chat-Icon wie der Website-Chatbot (robbe-chatbot.js) */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        </button>
      )}
      {open && (
        <>
          <div className="bot-sheet-backdrop" onClick={() => setOpen(false)} />
          <div className="bot-sheet">
            <div className="bot-sheet__head">
              <h3>Frag uns alles.</h3>
              <button className="bot-sheet__close" aria-label="Schließen" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
            {/* key erzwingt frische Chat-Session pro Oeffnen mit neuem Prefill */}
            <ChatScreen key={prefill || 'plain'} payload={BOT_PAYLOAD} prefill={prefill} />
          </div>
        </>
      )}
    </>
  )
}
