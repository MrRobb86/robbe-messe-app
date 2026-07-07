// Visitenkarten-Scanner: Kamera an, gruener Rahmen, Vorderseite erfassen,
// optional Rueckseite, Interessen + Einwilligung, ab an n8n.
//
// Webhook-Kontrakt (gleicher Endpoint wie Leads, n8n verzweigt auf type):
//   POST { type:"card", leadId, images:{front,back?}  (JPEG, dataURL),
//          interesse[], consent, consentText, consentVersion, consentAt,
//          source:"messe-kiosk", messe, createdAt }
// n8n: Vision-Modell liest die Karte → Odoo-Lead + Mail an Florian.
//
// DSGVO: Kamera nur nach explizitem Tap, Einwilligung VOR dem Versand,
// Bilder verlassen den Speicher nur Richtung n8n (bzw. Offline-Queue).
import { useEffect, useRef, useState } from 'react'
import { config } from '../config/index.js'
import { newLeadId, submitLead } from '../kiosk/leadQueue.js'

const INTERESTS = ['Schulung', 'Strategie-Check', 'KI-Automatisierung', 'Unternehmens-KI', 'Sonstiges']
const JPEG_QUALITY = 0.72
const MAX_W = 1280

export default function CardScan({ onDone, onCancel }) {
  // step: camera-front | camera-back | details | sending | thanks | error
  const [step, setStep] = useState('camera-front')
  const [images, setImages] = useState({})
  const [interests, setInterests] = useState([])
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const cameraActive = step === 'camera-front' || step === 'camera-back'

  // Kamera starten/stoppen. Rueckkamera bevorzugen (Kiosk-Tablet).
  useEffect(() => {
    if (!cameraActive) return
    let cancelled = false
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      } catch {
        setError('Die Kamera ist nicht verfügbar. Tipp deine Daten einfach ein — oder sprich uns an!')
        setStep('error')
      }
    }
    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [cameraActive])

  function capture() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const scale = Math.min(1, MAX_W / video.videoWidth)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
    if (step === 'camera-front') {
      setImages({ front: dataUrl })
      setStep('camera-back')
    } else {
      setImages((cur) => ({ ...cur, back: dataUrl }))
      setStep('details')
    }
  }

  async function send() {
    if (!consent) return
    setStep('sending')
    await submitLead({
      type: 'card',
      leadId: newLeadId(),
      images,
      interesse: interests,
      consent: true,
      consentText: config.consentText,
      consentVersion: config.consentVersion,
      consentAt: new Date().toISOString(),
      source: 'messe-kiosk',
      messe: config.messe.name,
      createdAt: new Date().toISOString(),
      queuedOffline: false,
    })
    setStep('thanks')
  }

  // Danke-Screen nach 10 s automatisch schliessen.
  useEffect(() => {
    if (step !== 'thanks') return
    const t = setTimeout(onDone, 10_000)
    return () => clearTimeout(t)
  }, [step, onDone])

  if (step === 'error') {
    return (
      <div className="cardscan">
        <p className="cardscan__hint">{error}</p>
        <button className="pill pressable" onClick={onCancel} style={{ justifyContent: 'center' }}>
          Zurück
        </button>
      </div>
    )
  }

  if (step === 'thanks') {
    return (
      <div className="cardscan cardscan--thanks">
        <h3>
          Vielen Dank<span className="accent-em">.</span>
        </h3>
        <p>
          Deine Daten wurden gespeichert — <strong>{config.kontakt.name} meldet sich bei dir.</strong>
        </p>
      </div>
    )
  }

  if (step === 'sending') {
    return (
      <div className="cardscan cardscan--thanks">
        <p>Einen Moment — deine Visitenkarte wird übertragen …</p>
      </div>
    )
  }

  if (step === 'details') {
    return (
      <div className="cardscan">
        <div className="cardscan__previews">
          <img src={images.front} alt="Vorderseite" />
          {images.back && <img src={images.back} alt="Rückseite" />}
        </div>
        <p className="cardscan__hint">Worum geht's dir? (optional)</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {INTERESTS.map((i) => (
            <button
              key={i}
              type="button"
              className={`chip pressable ${interests.includes(i) ? 'chip--active' : ''}`}
              onClick={() => setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]))}
            >
              {i}
            </button>
          ))}
        </div>
        <label className="lead-consent" style={{ maxWidth: 640 }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>{config.consentText}</span>
        </label>
        <button
          className="pill pressable cardscan__cta"
          disabled={!consent}
          style={{ opacity: consent ? 1 : 0.4 }}
          onClick={send}
        >
          Absenden →
        </button>
        <button className="chip pressable" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    )
  }

  // camera-front / camera-back
  return (
    <div className="cardscan">
      <p className="cardscan__hint">
        {step === 'camera-front'
          ? 'Halte die VORDERSEITE deiner Visitenkarte in den grünen Rahmen.'
          : 'Jetzt die RÜCKSEITE — oder direkt weiter.'}
      </p>
      <div className="cardscan__viewport">
        <video ref={videoRef} playsInline muted />
        <span className="cardscan__light" />
      </div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="pill pressable cardscan__cta" onClick={capture}>
          {step === 'camera-front' ? 'Vorderseite erfassen' : 'Rückseite erfassen'}
        </button>
        {step === 'camera-back' && (
          <button className="pill pressable" onClick={() => setStep('details')}>
            Ohne Rückseite weiter →
          </button>
        )}
        <button className="chip pressable" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </div>
  )
}
