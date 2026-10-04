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

  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 1707 },
          },
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

    // Кадр 3:4 — как овал на экране
    const targetRatio = 3 / 4
    let cropW = vw
    let cropH = vw / targetRatio
    if (cropH > vh) {
      cropH = vh
      cropW = vh * targetRatio
    }
    const sx = (vw - cropW) / 2
    const sy = (vh - cropH) / 2

    const canvas = document.createElement('canvas')
    canvas.width = cropW
    canvas.height = cropH
    const ctx = canvas.getContext('2d')

    // Зеркалим по горизонтали — как видит пользователь в селфи-камере
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, cropW, cropH)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        navigate('/result', {
          state: { photoUrl: url, blob, docKey },
        })
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
    setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))
  }

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
      <video ref={videoRef} playsInline muted />

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