import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import './styles/tokens.css'
import './styles/base.css'
import './styles/kiosk.css'

// Service-Worker-Updates: alle 5 Minuten nach einer neuen Version fragen.
// Ist eine da, merken wir uns das nur — aktiviert + neu geladen wird im
// Attract-Mode (KioskSession), wenn niemand die App benutzt. So kommen
// Deployments von selbst auf den Kiosk, ohne je einen Besucher zu stören.
const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (registration) setInterval(() => registration.update().catch(() => {}), 5 * 60 * 1000)
  },
  onNeedRefresh() {
    window.__swUpdateBereit = true
  },
})
// true = neue Version aktivieren und Seite neu laden.
window.__swDoUpdate = () => updateSW(true)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
