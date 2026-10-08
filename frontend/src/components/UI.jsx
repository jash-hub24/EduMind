import { ArrowRight, Check, X } from 'lucide-react'

export function Button({ children, variant = 'primary', icon, className = '', ...props }) {
  return (
    <button className={`btn btn-${variant} ${className}`.trim()} {...props}>
      {children}
      {icon && <span className="btn-icon">{icon}</span>}
    </button>
  )
}

export function Card({ children, className = '' }) {
  return <div className={`card ${className}`.trim()}>{children}</div>
}

export function Badge({ children, tone = 'default' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function ProgressBar({ value, height = 10, className = '' }) {
  return (
    <div className={`progress-shell ${className}`} style={{ height }}>
      <div className="progress-fill" style={{ width: `${value}%` }} />
    </div>
  )
}

export function Modal({ open, title, onClose, children }) {
  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}

export function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="search-box">
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  )
}

export function StatCard({ title, value, subtitle, accent = 'primary' }) {
  return (
    <div className={`stat-card accent-${accent}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{subtitle}</small>
    </div>
  )
}

export function Toast({ message, visible, tone = 'info' }) {
  if (!visible) return null
  return (
    <div className={`toast toast-${tone}`}>
      <Check size={16} />
      <span>{message}</span>
    </div>
  )
}

export function SectionHeading({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="section-heading">
      <div className="section-heading__title">
        {Icon && <Icon size={18} />}
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

export function InlineAction({ label, onClick, icon }) {
  return (
    <button type="button" className="inline-action" onClick={onClick}>
      {icon}
      {label}
      <ArrowRight size={14} />
    </button>
  )
}
