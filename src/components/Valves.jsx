import React, { useState } from 'react';
import { VALVE_PHOTOS } from '../data/plantData';
import { useLang } from '../i18n/LangContext';

const Valves = ({ valves, search, setSearch, vstatus, onValveClick, photos }) => {
  const { t } = useLang();
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = valves.filter(v => {
    if (statusFilter !== 'all' && vstatus(v) !== statusFilter) return false;
    if (typeFilter !== 'all' && v.tipo !== typeFilter) return false;
    return true;
  });

  const okCount = valves.filter(v => vstatus(v) === 'ok').length;
  const warnCount = valves.filter(v => vstatus(v) === 'warn').length;
  const critCount = valves.filter(v => vstatus(v) === 'crit').length;
  const types = [...new Set(valves.map(v => v.tipo).filter(Boolean))];

  return (
    <div id="sc-valves" className="sc on" style={{ paddingBottom: '110px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div className="sw" style={{ flex: 1 }}>
          <svg className="sico" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input className="si" placeholder={t('search_placeholder')} value={search}
            onChange={(e) => setSearch(e.target.value)} autoComplete="off" />
        </div>
        <div onClick={() => setShowFilters(!showFilters)} style={{
          width: '38px', height: '38px', borderRadius: '10px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          background: (statusFilter !== 'all' || typeFilter !== 'all') ? 'var(--or)' : 'var(--s2)',
          border: '1px solid var(--s3)', fontSize: '1rem', flexShrink: 0, position: 'relative'
        }}>
          ⚙️
          {(statusFilter !== 'all' || typeFilter !== 'all') && (
            <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--rd)', border: '2px solid var(--bg)' }} />
          )}
        </div>
      </div>

      {showFilters && (
        <div className="card" style={{ marginTop: '8px', padding: '12px' }}>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.6rem', color: 'var(--mut)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {t('filter_status')}
          </div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `${t('all')} (${valves.length})`, color: 'var(--cy)' },
              { id: 'ok', label: `${t('ok')} (${okCount})`, color: 'var(--gn)' },
              { id: 'warn', label: `${t('attention')} (${warnCount})`, color: 'var(--yl)' },
              { id: 'crit', label: `${t('critical')} (${critCount})`, color: 'var(--rd)' }
            ].map(f => (
              <div key={f.id} onClick={() => setStatusFilter(f.id)} style={{
                padding: '5px 10px', borderRadius: '6px', cursor: 'pointer',
                fontFamily: 'Share Tech Mono', fontSize: '.6rem',
                color: statusFilter === f.id ? '#fff' : f.color,
                background: statusFilter === f.id ? f.color : 'var(--s1)',
                border: `1px solid ${statusFilter === f.id ? f.color : 'var(--s3)'}`, transition: '0.2s'
              }}>{f.label}</div>
            ))}
          </div>

          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.6rem', color: 'var(--mut)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {t('filter_type')}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <div onClick={() => setTypeFilter('all')} style={{
              padding: '5px 10px', borderRadius: '6px', cursor: 'pointer',
              fontFamily: 'Share Tech Mono', fontSize: '.6rem',
              color: typeFilter === 'all' ? '#fff' : 'var(--cy)',
              background: typeFilter === 'all' ? 'var(--cy)' : 'var(--s1)',
              border: `1px solid ${typeFilter === 'all' ? 'var(--cy)' : 'var(--s3)'}`
            }}>{t('all')}</div>
            {types.map(tp => (
              <div key={tp} onClick={() => setTypeFilter(tp)} style={{
                padding: '5px 10px', borderRadius: '6px', cursor: 'pointer',
                fontFamily: 'Share Tech Mono', fontSize: '.6rem',
                color: typeFilter === tp ? '#fff' : 'var(--or)',
                background: typeFilter === tp ? 'var(--or)' : 'var(--s1)',
                border: `1px solid ${typeFilter === tp ? 'var(--or)' : 'var(--s3)'}`
              }}>{tp.replace(/_/g, ' ')}</div>
            ))}
          </div>

          {(statusFilter !== 'all' || typeFilter !== 'all') && (
            <div onClick={() => { setStatusFilter('all'); setTypeFilter('all'); }}
              style={{ marginTop: '10px', textAlign: 'center', cursor: 'pointer', fontFamily: 'Share Tech Mono', fontSize: '.6rem', color: 'var(--rd)' }}>
              ✕ {t('clear_filters')}
            </div>
          )}
        </div>
      )}

      <div className="slabel" style={{ marginBottom: '10px' }}>
        {filtered.length} {t('valves_count')}
        {filtered.length !== valves.length && ` (${t('of')} ${valves.length})`}
      </div>
      <div id="vlist">
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="ei">🔍</div>
            <div className="et">{t('no_valve_found')}</div>
          </div>
        ) : (
          filtered.map(v => {
            const status = vstatus(v);
            const photo = photos[v.tag] || VALVE_PHOTOS[v.tag];
            return (
              <div key={v.tag} className="vi" onClick={() => onValveClick(v)}>
                <div className="vi-sb" style={{ background: status === 'ok' ? 'var(--gn)' : status === 'warn' ? 'var(--yl)' : 'var(--rd)' }}></div>
                <div className="vi-img">
                  {photo ? <img src={photo} alt={v.tag} /> : <div style={{ color: 'var(--mut)', fontSize: '1.5rem' }}>⬡</div>}
                </div>
                <div className="vi-body">
                  <div className="vtag">{v.tag}</div>
                  <div className="vmarca">{v.marca}</div>
                  <div className="vtype">{v.tipo?.replace(/_/g, ' ')}</div>
                  {v.kit && <div className="vkit">K {v.kit}</div>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Valves;
