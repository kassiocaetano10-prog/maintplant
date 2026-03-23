import React from 'react';
import { useLang } from '../i18n/LangContext';

const MaintHistory = ({ valve, history, onClose }) => {
  const { t } = useLang();
  const records = history.filter(h => h.tag === valve.tag).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="overlay on">
      <div className="ovhd">
        <button className="bkbtn" onClick={onClose}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '1rem', color: 'var(--cy)' }}>{t('history_title')}</div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.63rem', color: 'var(--mut)', marginTop: '2px' }}>{valve.tag} — {valve.zona}</div>
        </div>
      </div>
      <div className="ovbd">
        {records.length === 0 ? (
          <div className="empty">
            <div className="ei">📋</div>
            <div className="et">{t('no_records')}</div>
            <div className="es">{t('records_appear')}</div>
          </div>
        ) : (
          records.map((r, i) => (
            <div key={i} className="card" style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '.7rem', color: 'var(--cy)' }}>
                  {new Date(r.date).toLocaleDateString('pt-BR')}
                </div>
                <div className={`bx ${r.type === 'preventiva' ? 'ok' : 'bl'}`} style={{ fontSize: '.55rem' }}>
                  {r.type === 'preventiva' ? t('preventive_label') : t('corrective_label')}
                </div>
              </div>
              <div className="df"><div className="dk">{t('tech_label')}</div><div className="dv">{r.technician}</div></div>
              <div className="df"><div className="dk">{t('service_label')}</div><div className="dv">{r.service}</div></div>
              {r.kitChanged && (
                <div className="df"><div className="dk">{t('kit_changed_label')}</div><div className="dv" style={{ color: 'var(--gn)' }}>✓ {t('yes')} — {valve.kit || 'N/A'}</div></div>
              )}
              {r.notes && (
                <div className="df"><div className="dk">{t('observations')}</div><div className="dv" style={{ fontSize: '.65rem', color: 'var(--mut)' }}>{r.notes}</div></div>
              )}
              {r.signature && (
                <div style={{ marginTop: '8px', borderTop: '1px solid var(--s3)', paddingTop: '8px' }}>
                  <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.55rem', color: 'var(--mut)', marginBottom: '4px' }}>{t('tech_signature')}</div>
                  <img src={r.signature} alt="Signature" style={{ maxWidth: '200px', height: '60px', background: 'var(--s1)', borderRadius: '6px', padding: '4px', border: '1px solid var(--s3)' }} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MaintHistory;
