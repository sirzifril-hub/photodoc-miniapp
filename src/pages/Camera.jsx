import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/theme.css'

export default function Camera() {
  const navigate = useNavigate()
  const location = useLocation()
  const docKey = location.state?.docKey || 'ru_passport'

  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)
  const [facingMode, setFacingMode] = useState('user')
  // zoomFactor: 1.0 = без зума, 0.5 = отойти, 2.0 = приблизить
  const [zoom, setZoom] = useState(1.0)

  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      try {
        // Без ideal — используем нативное разрешение, без телезума
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setReady(true)
        }
      } catch (e) {
        console.error('Camera error:', e)
        setError(e.message || 'Не удалось открыть камеру')
      }
    }

    startCamera()

    return () => {
      cancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [facingMode])

  const handleShutter = () => {
    const video = videoRef.current
    if (!video) return

    const vw = video.videoWidth
    const vh = video.videoHeight

    // Пропорции кадра — такие же, как в овале (3:4)
    const targetRatio = 3 / 4
    let cropW = vw
    let cropH = vw / targetRatio
    if (cropH > vh) {
      cropH = vh
      cropW = vh * targetRatio
    }
    // Учитываем zoom: чем больше zoom, тем меньше область кропа
    cropW = cropW / zoom
    cropH = cropH / zoom

    const sx = (vw - cropW) / 2
    const sy = (vh - cropH) / 2

    const canvas = document.createElement('canvas')
    canvas.width = cropW
    canvas.height = cropH
    const ctx = canvas.getContext('2d')

    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, cropW, cropH)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        navigate('/result', { state: { photoUrl: url, blob, docKey } })
      },
      'image/jpeg',
      0.92,
    )
  }

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
    }
    navigate(-1)
  }

  const handleFlip = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
    }
    setReady(false)
    setZoom(1.0)
    setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))
  }

  const zoomOut = () => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(1)))
  const zoomIn = () => setZoom((z) => Math.min(2.0, +(z + 0.1).toFixed(1)))

  if (error) {
    return (
      <div className="camera-error">
        <h2>📵 Камера недоступна</h2>
        <p>{error}</p>
        <p style={{ fontSize: 13 }}>
          Разреши доступ к камере в браузере или открой мини-апп в Telegram.
        </p>
        <button className="primary-btn" onClick={handleClose}>
          ← Назад
        </button>
      </div>
    )
  }

  return (
    <div className="camera-screen">
      <video
        ref={videoRef}
        playsInline
        muted
        style={{ transform: `scaleX(-1) scale(${zoom})` }}
      />

      <div className="camera-topbar">
        <button className="camera-close" onClick={handleClose}>✕</button>
        <button className="camera-close" onClick={handleFlip}>⟳</button>
      </div>

      <div className="camera-overlay">
        <div className="camera-oval">
          <div className="camera-line top">линия головы</div>
          <div className="camera-line bottom">линия подбородка</div>
        </div>
      </div>

      <div className="camera-hint">
        {ready ? 'Поместите лицо в овал' : 'Загрузка камеры...'}
      </div>

      {/* Кнопки zoom */}
      <div className="camera-zoom">
        <button
          className="zoom-btn"
          onClick={zoomOut}
          disabled={zoom <= 0.5}
        >
          −
        </button>
        <span className="zoom-label">{zoom.toFixed(1)}×</span>
        <button
          className="zoom-btn"
          onClick={zoomIn}
          disabled={zoom >= 2.0}
        >
          +
        </button>
      </div>

      <div className="camera-bottom">
        <button
          className="camera-shutter"
          onClick={handleShutter}
          disabled={!ready}
          aria-label="Сделать снимок"
        />
      </div>
    </div>
  )
}