// EIN gemeinsamer Kiosk-Chat fuer alle drei Einsaetze:
//   backend 'openwebui' → SSE-Streaming gegen die Unternehmens-KI
//   backend 'n8n'       → Webhook-Bot (Website-Bot-Demo, Messe-Bot)
// Einstieg immer ueber Vorschlags-Chips — niemand muss zuerst tippen.
//
// DSGVO/Auswertung: n8n-Chats melden ihr Transkript im Unmount-Cleanup
// (Session-Reset, Modulwechsel) als type:"end" — daraus macht der n8n-Workflow
// abends Lead-Hinweise. Der Verlauf selbst stirbt mit dem Unmount.
import { useEffect, useRef, useState } from 'react'
import { streamChat } from '../api/openwebui.js'
import { newSessionId, sendChatMessage, sendSessionEnd } from '../api/n8n.js'
import { config } from '../config/index.js'
import { useOnline } from '../kiosk/useOnline.js'
import './chat.css'

// URLs/Markdown-Links in klickbare Links wandeln (portiert aus robbe-chatbot.js;
// escaped zuerst, dann verlinkt — sicher fuer dangerouslySetInnerHTML).
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
export function linkify(s) {
  let t = esc(s)
  const store = []
  t = t.replace(/\[([^\]]+)\]\s*\(\s*(https?:\/\/[^\s)]+)\s*\)/g, (_, text, url) => {
    url = url.replace(/[.,;:!?)]+$/, '')
    const token = `@@RCLINK${store.length}@@`
    store.push(`<a href="${url}" target="_blank" rel="noopener">${text}</a>`)
    return token
  })
  t = t.replace(/(https?:\/\/[^\s<]+)/g, (u) => {
    let trail = ''
    const m = u.match(/[.,;:!?)\]]+$/)
    if (m) {
      trail = m[0]
      u = u.slice(0, -trail.length)
    }
    return `<a href="${u}" target="_blank" rel="noopener">${u}</a>${trail}`
  })
  t = t.replace(/@@RCLINK(\d+)@@/g, (_, i) => store[i])
  return t
}

function Bubble({ role, text, typing }) {
  return (
    <div className={`chat__row chat__row--${role === 'user' ? 'user' : 'bot'}`}>
      <div className="chat__bubble">
        {typing ? (
          <span className="chat__typing">
            <span></span>
            <span></span>
            <span></span>
          </span>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: linkify(text) }} />
        )}
      </div>
    </div>
  )
}

export default function ChatScreen({ payload, prefill }) {
  const { backend, greeting, suggestions = [] } = payload
  const webhookUrl = backend === 'n8n' ? config.webhooks[payload.webhookKey] : null

  const [messages, setMessages] = useState(() =>
    greeting ? [{ role: 'assistant', content: greeting }] : []
  )
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const online = useOnline()

  const session = useRef({ id: newSessionId(), startedAt: new Date().toISOString() })
  const historyRef = useRef(messages)
  historyRef.current = messages
  const msgsEl = useRef(null)
  const prefillSent = useRef(false)

  // Auto-Scroll ans Ende.
  useEffect(() => {
    msgsEl.current?.scrollTo({ top: msgsEl.current.scrollHeight })
  }, [messages])

  // Transkript-Meldung beim Unmount (Session-Reset / Modul verlassen).
  useEffect(() => {
    return () => {
      if (webhookUrl) {
        sendSessionEnd(webhookUrl, {
          sessionId: session.current.id,
          transcript: historyRef.current,
          startedAt: session.current.startedAt,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function send(text) {
    text = (text || '').trim()
    if (!text || busy) return
    setInput('')
    setBusy(true)
    const history = historyRef.current
    setMessages([...history, { role: 'user', content: text }, { role: 'assistant', content: '', pending: true }])

    function setAnswer(content, pending = false) {
      setMessages([...history, { role: 'user', content: text }, { role: 'assistant', content, pending }])
    }

    try {
      if (backend === 'openwebui') {
        await streamChat({
          messages: [...history, { role: 'user', content: text }].map(({ role, content }) => ({ role, content })),
          onChunk: (full) => setAnswer(full, true),
        }).then((full) => setAnswer(full))
      } else {
        const reply = await sendChatMessage(webhookUrl, {
          sessionId: session.current.id,
          message: text,
          history: history.map(({ role, content }) => ({ role, content })),
          startedAt: session.current.startedAt,
        })
        setAnswer(reply || 'Da ist etwas schiefgelaufen — frag mich gern nochmal.')
      }
    } catch (e) {
      setAnswer(e.message || 'Verbindung fehlgeschlagen — sprich uns gern direkt am Stand an!')
    } finally {
      setBusy(false)
    }
  }

  // Vorbefuellte Frage (Tap auf Bot-Sprechblase) einmalig abschicken.
  useEffect(() => {
    if (prefill && !prefillSent.current) {
      prefillSent.current = true
      send(prefill)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill])

  const showChips = suggestions.length > 0 && messages.filter((m) => m.role === 'user').length === 0

  return (
    <div className="chat">
      <div className="chat__msgs scrollable" ref={msgsEl}>
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} text={m.content} typing={m.pending && !m.content} />
        ))}
        {!online && (
          <Bubble
            role="assistant"
            text="Gerade kein Internet am Stand — sprich uns einfach direkt an, wir zeigen dir alles live!"
          />
        )}
      </div>
      {showChips && (
        <div className="chat__chips">
          {suggestions.map((s) => (
            <button key={s} className="chip pressable" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      <div>
        <form
          className="chat__foot"
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
        >
          <input
            className="chat__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Frage eintippen …"
            disabled={busy}
          />
          <button className="chat__send" type="submit" disabled={busy || !input.trim()} aria-label="Senden">
            →
          </button>
        </form>
        <p className="chat__legal">KI-Assistent · kann Fehler machen · es werden keine Daten gespeichert</p>
      </div>
    </div>
  )
}
