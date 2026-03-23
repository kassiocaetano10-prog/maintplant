import React from 'react';
import { useLang } from '../i18n/LangContext';

const Dashboard = ({ valves, vstatus, zones, onZoneClick, history, user }) => {
  const { t } = useLang();
  const total = valves.length;
  const inDay = valves.filter(v => vstatus(v) === 'ok').length;
  const warn = valves.filter(v => vstatus(v) === 'warn').length;
  const critical = valves.filter(v => vstatus(v) === 'crit').length;
  const withKit = valves.filter(v => v.kit).length;
  const pctOk = total > 0 ? Math.round(inDay / total * 100) : 0;

  const recentMaint = (history || []).filter(h => {
    const d = new Date(h.date);
    return (new Date() - d) / (1000 * 60 * 60 * 24) <= 7;
  });

  const brandMap = {};
  valves.forEach(v => { brandMap[v.marca] = (brandMap[v.marca] || 0) + 1; });
  const topBrands = Object.entries(brandMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxBrand = topBrands[0]?.[1] || 1;

  const roleLabel = user?.role === 'admin' ? t('admin') : user?.role === 'gestor' ? t('manager') : t('technician');

  return (
    <div id="sc-dash" className="sc on">
      {user && (
        <div style={{
          fontFamily: 'Share Tech Mono', fontSize: '.65rem', color: 'var(--mut)',
          marginBottom: '10px', padding: '8px 12px', background: 'var(--s1)', borderRadius: '8px',
          borderLeft: '3px solid var(--or)'
        }}>
          {t('welcome')}, <span style={{ color: 'var(--or)' }}>{user.name}</span> — {roleLabel}
        </div>
      )}

      <div className="stats">
        <div className="sbox">
          <div className="snum" style={{ color: 'var(--cy)', textShadow: 'var(--gw-cy)' }}>{total}</div>
          <div className="slbl">{t('valves')}</div>
        </div>
        <div className="sbox">
          <div className="snum" style={{ color: 'var(--gn)', textShadow: 'var(--gw-gn)' }}>{inDay}</div>
          <div className="slbl">{t('up_to_date')}</div>
        </div>
        <div className="sbox">
          <div className="snum" style={{ color: 'var(--rd)', textShadow: 'var(--gw-rd)' }}>{critical}</div>
          <div className="slbl">{t('critical')}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '10px', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.6rem', color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {t('plant_health')}
          </div>
          <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1rem', color: pctOk >= 80 ? 'var(--gn)' : pctOk >= 50 ? 'var(--yl)' : 'var(--rd)' }}>
            {pctOk}%
          </div>
        </div>
        <div style={{ height: '8px', background: 'var(--s3)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${(inDay / total) * 100}%`, background: 'var(--gn)', transition: '0.5s' }} />
          <div style={{ width: `${(warn / total) * 100}%`, background: 'var(--yl)', transition: '0.5s' }} />
          <div style={{ width: `${(critical / total) * 100}%`, background: 'var(--rd)', transition: '0.5s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.5rem', color: 'var(--gn)' }}>● {inDay} {t('ok_label')}</div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.5rem', color: 'var(--yl)' }}>● {warn} {t('attention')}</div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.5rem', color: 'var(--rd)' }}>● {critical} {t('critical')}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        <div className="card" style={{ padding: '10px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1.1rem', color: 'var(--or)' }}>{recentMaint.length}</div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.5rem', color: 'var(--mut)' }}>{t('maint_7days')}</div>
        </div>
        <div className="card" style={{ padding: '10px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1.1rem', color: 'var(--cy2)' }}>{withKit}</div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.5rem', color: 'var(--mut)' }}>{t('with_kit')}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '10px', padding: '12px' }}>
        <div className="ctitle">{t('top_brands')}</div>
        {topBrands.map(([brand, count]) => (
          <div key={brand} style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.6rem', color: 'var(--txt2)' }}>{brand}</div>
              <div style={{ fontFamily: 'Orbitron', fontSize: '.6rem', color: 'var(--cy)' }}>{count}</div>
            </div>
            <div style={{ height: '4px', background: 'var(--s3)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${(count / maxBrand) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--cy), var(--cy2))', borderRadius: '2px', transition: '0.5s' }} />
            </div>
          </div>
        ))}
      </div>

      {recentMaint.length > 0 && (
        <div className="card" style={{ marginBottom: '10px', padding: '12px' }}>
          <div className="ctitle">{t('recent_maint')}</div>
          {recentMaint.slice(0, 5).map((h, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 0', borderBottom: i < recentMaint.length - 1 ? '1px solid var(--s3)' : 'none'
            }}>
              <div>
                <div style={{ fontFamily: 'Orbitron', fontSize: '.6rem', color: 'var(--cy)' }}>{h.tag}</div>
                <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.5rem', color: 'var(--mut)' }}>
                  {h.technician} — {new Date(h.date).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div className={`bx ${h.type === 'preventiva' ? 'ok' : 'bl'}`} style={{ fontSize: '.45rem' }}>
                {h.type === 'preventiva' ? t('prev') : t('corr')}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="slabel">{t('zone_status')}</div>
      <div id="zlist">
        {zones.map(z => {
          const zv = valves.filter(v => v.zona === z);
          const ok = zv.filter(v => vstatus(v) === 'ok').length;
          const wn = zv.filter(v => vstatus(v) === 'warn').length;
          const cr = zv.filter(v => vstatus(v) === 'crit').length;
          const tl = zv.length;
          const cls = cr > 0 ? 'cr-z' : wn > 0 ? 'wn-z' : 'ok-z';

          return (
            <div key={z} className={`zcard ${cls}`} onClick={() => onZoneClick(z)}>
              <div className="zch">
                <div>
                  <div className="znm">{z}</div>
                  <div className="zmt">{tl} {t('valves_count')}</div>
                </div>
                <div className="bx" style={{
                  background: cr > 0 ? 'rgba(239,68,68,.1)' : wn > 0 ? 'rgba(251,191,36,.1)' : 'rgba(34,197,94,.1)',
                  color: cr > 0 ? 'var(--rd)' : wn > 0 ? 'var(--yl)' : 'var(--gn)',
                  borderColor: cr > 0 ? 'rgba(239,68,68,.3)' : wn > 0 ? 'rgba(251,191,36,.3)' : 'rgba(34,197,94,.3)'
                }}>
                  {cr > 0 ? t('status_crit').replace('⛔ ', '') : wn > 0 ? t('status_warn').replace('⚠️ ', '') : t('ok_label')}
                </div>
              </div>
              <div className="zbars">
                <div className="zbar" style={{ width: `${(ok / tl) * 100}%`, background: 'var(--gn)' }}></div>
                <div className="zbar" style={{ width: `${(wn / tl) * 100}%`, background: 'var(--yl)' }}></div>
                <div className="zbar" style={{ width: `${(cr / tl) * 100}%`, background: 'var(--rd)' }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
