import React from 'react';
import { useLang } from '../i18n/LangContext';

const ValveDetail = ({ valve, onClose, vstatus, photo, onStartGuide, onShowHistory }) => {
  const { t } = useLang();
  const status = vstatus(valve);

  const fields = [
    { k: t('brand'), v: valve.marca },
    { k: t('serial'), v: valve.serie || '—' },
    { k: t('size'), v: valve.dn || '—' },
    { k: t('seat'), v: valve.assento || '—' },
    { k: t('year'), v: valve.fabricacao || '—' },
    { k: t('actuator'), v: valve.atuador || '—' },
    { k: t('last_maint'), v: valve.ult_man || t('never_registered') },
    { k: t('last_kit'), v: valve.ult_kit || t('never_registered') }
  ];

  const badgeCls = status === 'ok' ? 'ok' : status === 'warn' ? 'wn' : 'cr';
  const badgeTxt = status === 'ok' ? t('status_ok') : status === 'warn' ? t('status_warn') : t('status_crit');

  const copyInfo = () => {
    const info = `${t('valve_label')}: ${valve.tag}\n${t('zone')}: ${valve.zona}\n${t('brand')}: ${valve.marca}\nKit: ${valve.kit || 'N/A'}\nDN: ${valve.dn || 'N/A'}`;
    navigator.clipboard.writeText(info);
  };

  return (
    <div id="det" className="overlay on">
      <div className="ovhd">
        <button className="bkbtn" onClick={onClose}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '1rem', color: 'var(--cy)' }}>{valve.tag}</div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.63rem', color: 'var(--mut)', marginTop: '2px' }}>{valve.zona}</div>
        </div>
        <div className={`bx ${badgeCls}`}>{badgeTxt}</div>
      </div>
      <div className="ovbd">
        <div className="det-img-wrap">
          {photo ? <img src={photo} alt={valve.tag} /> : <div style={{ color: 'var(--mut)', fontSize: '2rem' }}>⬡</div>}
        </div>
        <div className="kith">
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.58rem', color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>{t('seal_kit_ref')}</div>
          <div className="kitr">{valve.kit || t('no_ref')}</div>
          <div className="kitp">{t('original_part')}</div>
        </div>
        <div className="card" style={{ marginBottom: '10px' }}>
          <div className="ctitle">{t('technical_data')}</div>
          <div id="dt-fields">
            {fields.map(f => (
              <div key={f.k} className="df">
                <div className="dk">{f.k}</div>
                <div className="dv">{f.v}</div>
              </div>
            ))}
          </div>
        </div>
        <button className="btn btn-p" onClick={onStartGuide} style={{ marginBottom: '8px' }}>{t('start_guide')}</button>
        <button className="btn btn-cy" onClick={onShowHistory} style={{ marginBottom: '8px' }}>{t('view_history')}</button>
        <button className="btn" onClick={copyInfo} style={{ marginBottom: '8px', background: 'var(--s2)' }}>{t('copy_info')}</button>
      </div>
    </div>
  );
};

export default ValveDetail;
