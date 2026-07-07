// n8n-Webhook-Client — Kontrakt wie robbe-chatbot.js / VOM-FASS-Workflow:
//   Chat:  POST {type:"message", sessionId, message, history, page, startedAt} → {reply}
//   Ende:  POST {type:"end", sessionId, transcript, page, startedAt, endedAt, durationSeconds}
//   Lead:  POST {type:"lead", leadId, ...} → {ok:true}
import { config } from '../config/index.js'

const NETWORK_ERR =
  'Der Chat braucht Internet — sprich uns gern direkt am Stand an!'

export function newSessionId() {
  return 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9)
}

export async function sendChatMessage(webhookUrl, { sessionId, message, history, page, startedAt, signal }) {
  let res
  try {
    res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'message',
        sessionId,
        message,
        history,
        page: page || `kiosk:${config.fairId}`,
        startedAt,
        source: 'messe-kiosk',
        messe: config.messe.name,
      }),
      signal,
    })
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new Error(NETWORK_ERR)
  }
  if (!res.ok) throw new Error(`Der Bot antwortet gerade nicht (Status ${res.status}).`)
  const data = await res.json().catch(() => ({}))
  return data.reply || data.output || data.text || ''
}

// Session-Ende: Transkript zur Auswertung (Lead-Hinweis!) an n8n melden.
// keepalive ueberlebt den Session-Reset; scheitert bewusst leise.
export function sendSessionEnd(webhookUrl, { sessionId, transcript, page, startedAt }) {
  const hasUser = transcript.some((m) => m.role === 'user')
  if (!hasUser) return
  const endedAt = new Date().toISOString()
  const durationSeconds = Math.round((Date.now() - new Date(startedAt).getTime()) / 1000)
  try {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'end',
        sessionId,
        transcript,
        page: page || `kiosk:${config.fairId}`,
        startedAt,
        endedAt,
        durationSeconds,
        source: 'messe-kiosk',
        messe: config.messe.name,
      }),
      keepalive: true,
      mode: 'cors',
    }).catch(() => {})
  } catch {
    /* Ende-Meldung darf nie blockieren */
  }
}

// Lead absenden. 8s-Timeout — bei Fehler uebernimmt die Offline-Queue.
export async function sendLead(lead) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(config.webhooks.lead, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`Lead-Webhook Status ${res.status}`)
    return await res.json().catch(() => ({ ok: true }))
  } finally {
    clearTimeout(timer)
  }
}
