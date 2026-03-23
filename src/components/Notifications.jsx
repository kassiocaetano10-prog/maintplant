import React, { useState } from 'react';
import { useLang } from '../i18n/LangContext';

const Notifications = ({ valves, vstatus, onClose, onValveClick }) => {
  const { t } = useLang();
  const [filter, setFilter] = useState('all');

  const alerts = valves.map(v => ({ valve: v, status: vstatus(v) })).filter(a => a.status !== 'ok')
    .sort((a, b) => (a.status === 'crit' && b.status !== 'crit') ? -1 : (a.status !== 'crit' && b.status === 'crit') ? 1 : 0);

  const critCount = alerts.filter(a => a.status === 'crit').length;
  const warnCount = alerts.filter(a => a.status === 'warn').length;
  const filtered = filter === 'all' ? alerts : filter === 'crit' ? alerts.filter(a => a.status === 'crit') : alerts.filter(a => a.status === 'warn');

  return (
    <div className="overlay on">
      <div className="ovhd">
        <button className="bkbtn" onClick={onClose}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '1rem', color: 'var(--or)' }}>{t('alerts_title')}</div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.63rem', color: 'var(--mut)' }}>{alerts.length} {t('valves_need_attention')}</div>
        </div>
      </div>
      <div className="ovbd">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {[
            { id: 'all', count: alerts.length, label: t('all_filter'), color: 'var(--cy)', bg: 'var(--s3)' },
            { id: 'crit', count: critCount, label: t('critical_filter'), color: 'var(--rd)', bg: 'rgba(239,68,68,0.15)' },
            { id: 'warn', count: warnCount, label: t('attention_filter'), color: 'var(--yl)', bg: 'rgba(251,191,36,0.15)' }
          ].map(f => (
            <div key={f.id} onClick={() => setFilter(f.id)} style={{
              flex: 1, textAlign: 'center', padding: '10px 6px', borderRadius: '8px', cursor: 'pointer',
              background: filter === f.id ? f.bg : 'var(--s1)',
              border: filter === f.id ? `1px solid ${f.color}` : '1px solid var(--s3)'
            }}>
              <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1.1rem', color: f.color }}>{f.count}</div>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.5rem', color: 'var(--mut)' }}>{f.label}</div>
            </div>
          ))}
        </div>
        {filtered.map(({ valve: v, status }) => {
          const days = v.ult_man ? Math.floor((new Date() - new Date(v.ult_man)) / (1000 * 60 * 60 * 24)) : null;
          return (
            <div key={v.tag} className="vi" onClick={() => onValveClick(v)} style={{ borderLeft: `3px solid ${status === 'crit' ? 'var(--rd)' : 'var(--yl)'}` }}>
              <div className="vi-body" style={{ padding: '6px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="vtag">{v.tag}</div>
                  <div className={`bx ${status === 'crit' ? 'cr' : 'wn'}`} style={{ fontSize: '.5rem' }}>
                    {status === 'crit' ? t('status_crit') : t('status_warn')}
                  </div>
                </div>
                <div className="vmarca">{v.marca} — {t('zone')} {v.zona}</div>
                <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.6rem', color: status === 'crit' ? 'var(--rd)' : 'var(--yl)', marginTop: '2px' }}>
                  {days !== null ? `${days} ${t('days_no_maint')}` : t('never_maintained')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
