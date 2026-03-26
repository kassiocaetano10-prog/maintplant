import React, { useEffect } from 'react'

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [message, onClose, duration])

  if (!message) return null

  const colors = {
    success: { bg: 'rgba(34,197,94,0.15)', border: 'var(--gn)', icon: '\u2713' },
    error: { bg: 'rgba(239,68,68,0.15)', border: 'var(--rd)', icon: '\u2717' },
    warning: { bg: 'rgba(251,191,36,0.15)', border: 'var(--yl)', icon: '!' },
    info: { bg: 'rgba(0,212,255,0.15)', border: 'var(--cy)', icon: 'i' }
  }
  const c = colors[type] || colors.success

  return (
    <div className="toast-overlay" onClick={onClose}>
      <div className="toast-box" style={{
        background: c.bg, borderColor: c.border
      }}>
        <span className="toast-icon" style={{ color: c.border }}>{c.icon}</span>
        <span className="toast-msg">{message}</span>
      </div>
    </div>
  )
}

export default Toast
