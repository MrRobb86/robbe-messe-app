// Konnektivitaet: navigator.onLine luegt bei Captive Portals (Messe-WLAN!),
// deshalb zusaetzlich ein 30-s-Heartbeat auf eine kleine Datei der eigenen
// Domain (wird vom Service Worker NICHT gecacht, weil per no-store geholt).
import { useEffect, useState } from 'react'

const HEARTBEAT_MS = 30_000

export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    let alive = true

    async function heartbeat() {
      if (!navigator.onLine) {
        if (alive) setOnline(false)
        return
      }
      try {
        await fetch(`/robbe-logo.png?ping=${Date.now()}`, {
          method: 'HEAD',
          cache: 'no-store',
        })
        if (alive) setOnline(true)
      } catch {
        if (alive) setOnline(false)
      }
    }

    heartbeat()
    const timer = setInterval(heartbeat, HEARTBEAT_MS)
    const onOnline = () => heartbeat()
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      alive = false
      clearInterval(timer)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  return online
}
