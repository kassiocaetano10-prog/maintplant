import React from 'react'
import { useLang } from '../i18n/LangContext'

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  const { t } = useLang()

  if (!message) return null

  return (
    <div className="overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="confirm-msg">{message}</div>
        <div className="confirm-actions">
          <button className="btn btn-o" onClick={onCancel}>
            {t('cancel') || 'Cancelar'}
          </button>
          <button className="btn btn-p" onClick={onConfirm}>
            {t('confirm') || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
