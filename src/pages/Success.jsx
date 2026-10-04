import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/theme.css'

export default function Success() {
  const navigate = useNavigate()
  const location = useLocation()
  const count = location.state?.count || 4
  const docTitle = location.state?.docTitle || 'Документ'

  const openBot = () => {
    // Попробуем закрыть Mini App (в Telegram) или открыть бота в браузере
    try {
      if (window.Telegram?.WebApp?.close) {
        window.Telegram.WebApp.close()
        return
      }
    } catch (e) {}
    window.open('https://t.me/photo_you_document_bot', '_blank')
  }

  return (
    <div className="success-screen">
      <div className="success-icon">✅</div>
      <h1 className="success-title">Готово!</h1>
      <p className="success-desc">
        Фото отправлено в чат с ботом.<br />
        <strong>{docTitle}</strong> · {count} фото на листе 10×15
      </p>

      <button className="primary-btn" onClick={openBot} style={{ maxWidth: 400 }}>
        Открыть Telegram
      </button>
      <button
        className="primary-btn"
        onClick={() => navigate('/')}
        style={{
          background: 'transparent',
          color: '#7d8b99',
          marginTop: 8,
          maxWidth: 400,
        }}
      >
        На главную
      </button>
    </div>
  )
}