import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/theme.css'

export default function Success() {
  const navigate = useNavigate()
  const location = useLocation()
  const count = location.state?.count || 4
  const docTitle = location.state?.docTitle || 'Документ'

  const [seconds, setSeconds] = useState(5)
  const [autoClose, setAutoClose] = useState(true)

  const closeApp = () => {
    try {
      if (window.Telegram?.WebApp?.close) {
        window.Telegram.WebApp.close()
        return
      }
    } catch (e) {}
    navigate('/')
  }

  useEffect(() => {
    if (!autoClose) return
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval)
          closeApp()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [autoClose])

  const handleMore = () => {
    setAutoClose(false)
    navigate('/docs')
  }

  const handleClose = () => {
    setAutoClose(false)
    closeApp()
  }

  return (
    <div className="success-screen">
      <div className="success-icon">✅</div>
      <h1 className="success-title">Готово!</h1>
      <p className="success-desc">
        <strong>{docTitle}</strong> · {count} фото на листе 10×15
        <br /><br />
        Через 30–60 секунд бот пришлёт файл <strong>прямо в чат</strong>.
      </p>

      {autoClose && (
        <p
          style={{
            color: '#7d8b99',
            fontSize: 13,
            marginBottom: 20,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          Приложение закроется через {seconds} сек...
        </p>
      )}

      <button
        className="primary-btn"
        onClick={handleMore}
        style={{ maxWidth: 400, marginBottom: 10 }}
      >
        📸 Сделать ещё фото
      </button>

      <button
        className="primary-btn"
        onClick={handleClose}
        style={{
          maxWidth: 400,
          background: 'transparent',
          color: '#7d8b99',
          fontSize: 14,
        }}
      >
        Вернуться в чат
      </button>
    </div>
  )
}