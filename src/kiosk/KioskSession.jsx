// Herzstueck des Kiosks: Modus-Statemachine (attract → hub → module),
// Inaktivitaets-Kaskade und der DSGVO-kritische Session-Reset.
//
// Reset-Prinzip: sessionId zaehlt hoch und haengt als key am Modul-Root —
// React unmountet ALLES, State-Verlust ist per Konstruktion garantiert.
// Chat-Komponenten melden ihr Transkript im Unmount-Cleanup an n8n
// (sendSessionEnd), Formulare verschwinden einfach.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { config, getModule } from '../config/index.js'

const KioskContext = createContext(null)

// Module mit Eingaben bekommen die grosszuegigere Warn-Schwelle.
const INPUT_KINDS = new Set(['kioskChat', 'lead'])

export function KioskSessionProvider({ children }) {
  const [sessionId, setSessionId] = useState(1)
  const [mode, setMode] = useState('attract') // attract | hub | module
  const [activeModuleId, setActiveModuleId] = useState(null)
  const [warnVisible, setWarnVisible] = useState(false)
  const [visited, setVisited] = useState(() => new Set())

  // Refs statt State fuer alles, was der 1-s-Tick liest (kein Re-Render-Sturm).
  const lastActivity = useRef(Date.now())
  const warnDeadline = useRef(null)
  const attractSince = useRef(Date.now())
  const dirty = useRef(false) // gab es seit dem letzten Reset Interaktion?
  const modeRef = useRef(mode)
  modeRef.current = mode
  const activeRef = useRef(activeModuleId)
  activeRef.current = activeModuleId

  // ---------- Session-Reset (DSGVO) ----------
  const resetSession = useCallback(() => {
    setSessionId((n) => n + 1) // → key-Remount, alle Modul-/Chat-States sterben
    setVisited(new Set())
    setActiveModuleId(null)
    setWarnVisible(false)
    dirty.current = false
    // localStorage selektiv wischen — die Lead-Queue MUSS ueberleben.
    const keep = localStorage.getItem('rq_lead_queue')
    localStorage.clear()
    if (keep) localStorage.setItem('rq_lead_queue', keep)
  }, [])

  const enterAttract = useCallback(() => {
    attractSince.current = Date.now()
    setWarnVisible(false)
    setMode('attract')
  }, [])

  // ---------- Navigation ----------
  const wakeAt = useRef(0)
  const wakeFromAttract = useCallback(() => {
    lastActivity.current = Date.now()
    wakeAt.current = Date.now()
    setMode('hub')
  }, [])

  const openModule = useCallback((id) => {
    // Der Weck-Tap aus dem Attract-Mode darf nur wecken — nicht gleich das
    // Modul oeffnen, auf dem der Finger zufaellig landete.
    if (Date.now() - wakeAt.current < 500) return
    lastActivity.current = Date.now()
    dirty.current = true
    setActiveModuleId(id)
    setVisited((v) => new Set(v).add(id))
    setMode('module')
  }, [])

  const goHub = useCallback(() => {
    lastActivity.current = Date.now()
    setActiveModuleId(null)
    setWarnVisible(false)
    setMode('hub')
  }, [])

  // ---------- Aktivitaet ----------
  useEffect(() => {
    const onPointer = () => {
      lastActivity.current = Date.now()
      // Jeder Touch waehrend der Warnung = "noch da".
      if (warnDeadline.current) {
        warnDeadline.current = null
        setWarnVisible(false)
      }
    }
    window.addEventListener('pointerdown', onPointer, { capture: true })
    return () => window.removeEventListener('pointerdown', onPointer, { capture: true })
  }, [])

  // ---------- Idle-Kaskade (1-s-Tick) ----------
  useEffect(() => {
    const tick = setInterval(() => {
      const now = Date.now()
      const idleMs = now - lastActivity.current
      const m = modeRef.current

      if (m === 'attract') {
        // Nach Interaktion + Rueckfall in den Attract: einmal komplett aufraeumen.
        if (dirty.current && now - attractSince.current >= config.idle.attractToResetMs) {
          resetSession()
        }
        return
      }

      if (m === 'hub') {
        if (idleMs >= config.idle.hubToAttractMs) enterAttract()
        return
      }

      // m === 'module'
      const mod = getModule(activeRef.current)
      const warnAfter = mod && INPUT_KINDS.has(mod.kind) ? config.idle.warnInputMs : config.idle.warnDefaultMs

      if (warnDeadline.current) {
        if (now >= warnDeadline.current) {
          warnDeadline.current = null
          enterAttract()
        }
        return
      }
      if (idleMs >= warnAfter) {
        warnDeadline.current = now + config.idle.countdownMs
        setWarnVisible(true)
      }
    }, 1000)
    return () => clearInterval(tick)
  }, [enterAttract, resetSession])

  // ---------- Wake Lock (Display an) ----------
  useEffect(() => {
    let lock = null
    async function acquire() {
      try {
        lock = await navigator.wakeLock?.request('screen')
      } catch {
        /* Fully Kiosk haelt das Display ohnehin wach (Keep Screen On) */
      }
    }
    acquire()
    const onVis = () => document.visibilityState === 'visible' && acquire()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      lock?.release?.().catch(() => {})
    }
  }, [])

  // ---------- Naechtlicher Reload (Memory-Leak-Prophylaxe) ----------
  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date()
      if (d.getHours() === config.nightlyReloadHour && d.getMinutes() === 0 && modeRef.current === 'attract') {
        window.location.reload()
      }
    }, 60_000)
    return () => clearInterval(t)
  }, [])

  const value = useMemo(
    () => ({
      sessionId,
      mode,
      activeModuleId,
      warnVisible,
      visited,
      wakeFromAttract,
      openModule,
      goHub,
      enterAttract,
      resetSession,
    }),
    [sessionId, mode, activeModuleId, warnVisible, visited, wakeFromAttract, openModule, goHub, enterAttract, resetSession]
  )

  return <KioskContext.Provider value={value}>{children}</KioskContext.Provider>
}

export function useKiosk() {
  const ctx = useContext(KioskContext)
  if (!ctx) throw new Error('useKiosk nur innerhalb von KioskSessionProvider verwenden')
  return ctx
}
