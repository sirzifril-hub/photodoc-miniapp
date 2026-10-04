import { useNavigate } from 'react-router-dom'
import DocumentCard from '../components/DocumentCard'
import '../styles/theme.css'

const DOCS = [
  { key: 'ru_passport', icon: '🇷🇺', title: 'Паспорт РФ', desc: '35×45 мм' },
  { key: 'ru_passport_intl', icon: '✈️', title: 'Загранпаспорт', desc: '35×45 мм' },
  { key: 'ru_driver', icon: '🚗', title: 'Водительское', desc: '35×45 мм' },
  { key: 'schengen', icon: '🇪🇺', title: 'Шенген', desc: '35×45 мм' },
  { key: 'us_visa', icon: '🇺🇸', title: 'Виза США', desc: '51×51 мм' },
  { key: 'uk_visa', icon: '🇬🇧', title: 'Виза UK', desc: '35×45 мм' },
  { key: 'china_visa', icon: '🇨🇳', title: 'Виза Китая', desc: '33×48 мм' },
  { key: 'custom', icon: '✏️', title: 'Свой размер', desc: 'любой' },
]

export default function DocumentPicker() {
  const navigate = useNavigate()

  const selectDoc = (key) => {
    navigate('/camera', { state: { docKey: key } })
  }

  return (
    <div className="container">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>← Назад</button>
      </div>

      <h1 className="title">Выберите документ</h1>
      <p className="subtitle">Фото будет кадрировано по стандарту документа</p>

      <div className="grid">
        {DOCS.map((doc) => (
          <DocumentCard
            key={doc.key}
            icon={doc.icon}
            title={doc.title}
            desc={doc.desc}
            onClick={() => selectDoc(doc.key)}
          />
        ))}
      </div>
    </div>
  )
}