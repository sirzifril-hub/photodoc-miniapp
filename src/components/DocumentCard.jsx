export default function DocumentCard({ icon, title, desc, onClick }) {
  return (
    <div className="card" onClick={onClick}>
      <div className="card-icon">{icon}</div>
      <div className="card-title">{title}</div>
      <div className="card-desc">{desc}</div>
    </div>
  )
}