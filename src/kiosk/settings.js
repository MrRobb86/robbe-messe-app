// Laufzeit-Einstellungen (Einstellungsseite hinter der Admin-Geste).
// Ueberschreiben ausgewaehlte Config-Werte OHNE Redeploy und liegen in
// localStorage — sie ueberleben den DSGVO-Session-Reset (Whitelist in
// KioskSession.resetSession).
const SETTINGS_KEY = 'rq_settings'
const LAYOUT_KEY = 'rq_layout'

// ---------- Einstellungen (Telefon, Termin-URL, Idle-Zeiten) ----------
export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}
  } catch {
    return {}
  }
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch }
  // Leere Werte = Override entfernen → zurueck zum Config-Default.
  for (const k of Object.keys(next)) {
    if (next[k] === '' || next[k] == null) delete next[k]
  }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  return next
}

// Effektive Werte: Settings-Override vor Config-Default.
export function effective(config) {
  const s = getSettings()
  return {
    telefon: s.telefon || config.kontakt.telefon,
    terminUrl: s.terminUrl || config.urls.termin,
    idle: {
      ...config.idle,
      ...(s.hubToAttractSec ? { hubToAttractMs: s.hubToAttractSec * 1000 } : {}),
      ...(s.warnDefaultSec ? { warnDefaultMs: s.warnDefaultSec * 1000 } : {}),
    },
  }
}

// ---------- Hub-Layout (verschobene Karten) ----------
export function getLayout() {
  try {
    return JSON.parse(localStorage.getItem(LAYOUT_KEY)) || {}
  } catch {
    return {}
  }
}

export function saveLayoutPos(moduleId, pos) {
  const layout = getLayout()
  layout[moduleId] = { x: Math.round(pos.x), y: Math.round(pos.y) }
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout))
  return layout
}

export function resetLayout() {
  localStorage.removeItem(LAYOUT_KEY)
  return {}
}

export const PERSISTENT_KEYS = ['rq_lead_queue', SETTINGS_KEY, LAYOUT_KEY]
