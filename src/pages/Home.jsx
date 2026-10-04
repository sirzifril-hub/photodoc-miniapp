import { useNavigate } from 'react-router-dom'
import '../styles/theme.css'

export default function Home() {
  const navigate = useNavigate()
  const userName = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'друг'

  return (
    <div className="container">
      <div className="topbar">
        <span style={{ fontSize: 20, fontWeight: 600 }}>📸 ФотоДок</span>
      </div>
      <h1 className="title">Привет, {userName}!</h1>
      <p className="subtitle">
        Загрузи селфи — получи профессиональное фото на документы за 30 секунд.
      </p>
      <div className="steps">
        <span>1. Фото</span>
        <span>→</span>
        <span>2. Обработка</span>
        <span>→</span>
        <span>3. Скачать</span>
      </div>
      <button className="primary-btn footer-btn" onClick={() => navigate('/docs')}>
        Начать →
      </button>
    </div>
  )
}