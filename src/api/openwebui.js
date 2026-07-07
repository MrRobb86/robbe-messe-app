// Open-WebUI-Client fuer den Kiosk — gekuerzte Kopie aus holp-ki-portal.
// Nur Chat-Streaming. Auth fix ueber den Kiosk-API-Key aus der Config:
// dedizierter Kiosk-User OHNE Adminrechte, nur EIN Workspace-Modell,
// Key nach jeder Messe rotieren. Kein Login, kein localStorage-Token,
// kein Logout-bei-401 (auf dem Kiosk gibt es nichts abzumelden).
//
// Bewusst NICHT uebernommen: createChat/updateChat — der Kiosk legt
// serverseitig KEINE Chats an (DSGVO: nichts zu loeschen beim Session-Reset).
import { config } from '../config/index.js'

const { baseUrl: BASE_URL, apiKey: API_KEY } = config.openwebui

const NETWORK_ERR =
  'Der KI-Chat braucht Internet — sprich uns gern direkt am Stand an!'

function authHeaders() {
  return API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}
}

// POST /api/chat/completions mit "stream": true. onChunk bekommt den bisher
// akkumulierten Text. Das Workspace-Modell bringt Systemprompt + Knowledge
// serverseitig mit — im Request nur die model-ID setzen.
export async function streamChat({ messages, signal, onChunk }) {
  const payload = { model: config.openwebui.model, messages, stream: true }
  let res
  try {
    res = await fetch(`${BASE_URL}/api/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
      signal,
    })
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new Error(NETWORK_ERR)
  }
  if (!res.ok || !res.body) {
    throw new Error(
      `Die Unternehmens-KI antwortet gerade nicht (Status ${res.status}). Versuch es gleich nochmal.`
    )
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() // unvollstaendige Zeile zurueckhalten
    for (const line of lines) {
      const t = line.trim()
      if (!t.startsWith('data:')) continue
      const chunk = t.slice(5).trim()
      if (chunk === '[DONE]') return full
      try {
        const json = JSON.parse(chunk)
        const delta = json.choices?.[0]?.delta?.content || ''
        if (delta) {
          full += delta
          onChunk?.(full)
        }
      } catch {
        // Keepalive/teilweises JSON ignorieren
      }
    }
  }
  return full
}
