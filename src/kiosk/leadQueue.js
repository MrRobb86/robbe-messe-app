// Offline-Queue fuer Leads (Messe-WLAN!). Leads werden lokal gepuffert und
// nachgesendet, sobald Netz da ist. Idempotenz ueber clientseitige leadId —
// n8n dedupliziert, doppeltes Senden ist ungefaehrlich.
//
// DSGVO: Eintraege werden nach erfolgreichem Versand SOFORT geloescht.
// Die Queue uebersteht den Session-Reset (die Daten muessen ja noch raus).
import { sendLead } from '../api/n8n.js'

const QUEUE_KEY = 'rq_lead_queue'
const RETRY_MS = 30_000

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []
  } catch {
    return []
  }
}
function writeQueue(items) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items))
}

export function queueLength() {
  return readQueue().length
}

export function newLeadId() {
  return crypto.randomUUID ? crypto.randomUUID() : `lead_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

// Versucht direkt zu senden; bei Fehler/Timeout landet der Lead in der Queue.
// Rueckgabe: {sent: boolean} — der Besucher sieht in BEIDEN Faellen denselben
// Danke-Screen (Daten sind sicher, Unterschied darf er nicht merken).
export async function submitLead(lead) {
  try {
    await sendLead(lead)
    return { sent: true }
  } catch {
    const q = readQueue()
    q.push({ ...lead, queuedOffline: true })
    writeQueue(q)
    return { sent: false }
  }
}

// Queue abarbeiten (FIFO). Bricht beim ersten Fehler ab — naechster Versuch
// kommt per Timer/online-Event.
export async function flushQueue() {
  let q = readQueue()
  while (q.length > 0) {
    try {
      await sendLead(q[0])
      q = q.slice(1)
      writeQueue(q)
    } catch {
      return q.length
    }
  }
  return 0
}

// Retry-Loop: alle 30 s + bei online-Event + beim App-Start.
export function startQueueWorker() {
  flushQueue()
  const timer = setInterval(flushQueue, RETRY_MS)
  const onOnline = () => flushQueue()
  window.addEventListener('online', onOnline)
  return () => {
    clearInterval(timer)
    window.removeEventListener('online', onOnline)
  }
}
