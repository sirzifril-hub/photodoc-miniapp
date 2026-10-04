import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/theme.css'

const BACKEND_URL = 'https://api.myphotodoc.ru'

const DOCS = {
  ru_passport: 'Паспорт РФ',
  ru_passport_intl: 'Загранпаспорт',
  ru_driver: 'Водительское',
  schengen: 'Шенген',
  us_visa: 'Виза США',
  uk_visa: 'Виза UK',
  china_visa: 'Виза Китая',
}

const COUNT_OPTIONS = [
  { count: 1, label: '1 фото', desc: 'Одно фото на листе 10×15' },
  { count: 2, label: '2 фото', desc: '2 фото на листе 10×15' },
  { count: 4, label: '4 фото', desc: '4 фото на листе 10×15', popular: true },
  { count: 6, label: '6 фото', desc: '6 фото на листе 10×15' },
]

const LAYOUTS = { 1: [1, 1], 2: [1, 2], 4: [2, 2], 6: [2, 3] }

function CountIcon({ count }) {
  const [cols, rows] = LAYOUTS[count]
  return (
    <div
      className="count-icon"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="count-square" />
      ))}
    </div>
  )
}

export default function Result() {
  const navigate = useNavigate()
  const location = useLocation()
  const photoUrl = location.state?.photoUrl
  const blob = location.state?.blob
  const docKey = location.state?.docKey || 'ru_passport'

  const [count, setCount] = useState(4)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  if (!photoUrl) {
    return (
      <div className="container">
        <h1 className="title">Нет фото</h1>
        <button className="primary-btn footer-btn" onClick={() => navigate('/')}>
          На главную
        </button>
      </div>
    )
  }

  const getUserId = () => {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user?.id
    if (tgUser) return tgUser

    const saved = localStorage.getItem('debug_user_id')
    if (saved) return Number(saved)

    const input = window.prompt(
      'Ты в браузере, а не в Telegram.\nВведи свой Telegram user_id (узнать: @userinfobot):',
    )
    if (!input) return null
    const num = Number(input)
    if (isNaN(num)) return null
    localStorage.setItem('debug_user_id', String(num))
    return num
  }

  const handleSend = async () => {
    if (!blob) return
    const userId = getUserId()
    if (!userId) {
      setError('Не удалось определить Telegram ID')
      return
    }

    setSending(true)
    setError(null)

    const fd = new FormData()
    fd.append('photo', blob, 'photo.jpg')
    fd.append('user_id', String(userId))
    fd.append('doc_key', docKey)
    fd.append('count', String(count))

    try {
      const res = await fetch(`${BACKEND_URL}/process`, {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }
      navigate('/success', {
        state: { count, docTitle: DOCS[docKey] || 'Документ' },
      })
    } catch (e) {
      console.error(e)
      setError(e.message || 'Не удалось отправить. Проверь соединение.')
      setSending(false)
    }
  }

  return (
    <div className="container">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>← Назад</button>
      </div>

      <h1 className="title">Проверьте фото</h1>
      <p className="subtitle">
        Если всё хорошо — выберите формат и нажмите «Отправить».
      </p>

      {/* Миниатюра + инфо о документе */}
      <div className="result-preview">
        <img src={photoUrl} alt="Снимок" className="result-thumb" />
        <div className="result-info">
          <div className="result-doc">{DOCS[docKey] || 'Документ'}</div>
          <div className="result-hint">Фото обработается автоматически</div>
        </div>
      </div>

      <h2 className="section-title">Сколько фото на листе 10×15?</h2>

      <div className="tariff-list">
        {COUNT_OPTIONS.map((opt) => (
          <div
            key={opt.count}
            className={`tariff-item${count === opt.count ? ' selected' : ''}`}
            onClick={() => !sending && setCount(opt.count)}
          >
            {opt.popular && <div className="tariff-badge">Популярное</div>}
            <CountIcon count={opt.count} />
            <div className="tariff-info">
              <div className="tariff-label">{opt.label}</div>
              <div className="tariff-desc">{opt.desc}</div>
            </div>
            <div className="tariff-check">
              {count === opt.count ? '✓' : ''}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="error-box">
          <div className="error-icon">⚠️</div>
          <div className="error-text">{error}</div>
          <button
            className="error-retry"
            onClick={() => setError(null)}
          >
            Попробовать снова
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button
          className="primary-btn"
          style={{ background: '#2a3a4a' }}
          onClick={() => navigate(-1)}
          disabled={sending}
        >
          Переснять
        </button>
        <button
          className="primary-btn"
          onClick={handleSend}
          disabled={sending}
        >
          {sending ? 'Отправка...' : 'Отправить →'}
        </button>
      </div>
    </div>
  )
}