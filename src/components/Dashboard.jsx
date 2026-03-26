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

  const roleLabel =
    user?.role === 'admin' ? 'Diretor'
    : user?.role === 'chefe' ? 'Chefe de Equipe'
    : user?.role === 'compras' ? 'Equipe de Compras'
    : t('technician');

  return (
    <div id="sc-dash" className="sc on">
      {user && (
        <div className="dash-welcome">
          {t('welcome')}, <span className="text-or">{user.name}</span> — {roleLabel}
        </div>
      )}

      <div className="stats">
        <div className="sbox">
          <div className="snum text-cy" style={{ textShadow: 'var(--gw-cy)' }}>{total}</div>
          <div className="slbl">{t('valves')}</div>
        </div>
        <div className="sbox">
          <div className="snum text-gn" style={{ textShadow: 'var(--gw-gn)' }}>{inDay}</div>
          <div className="slbl">{t('up_to_date')}</div>
        </div>
        <div className="sbox">
          <div className="snum text-rd" style={{ textShadow: 'var(--gw-rd)' }}>{critical}</div>
          <div className="slbl">{t('critical')}</div>
        </div>
      </div>

      <div className="card mb-10 p-12">
        <div className="dash-health-header">
          <div className="dash-health-label">{t('plant_health')}</div>
          <div className="font-orbitron fw-900 fs-xl" style={{ color: pctOk >= 80 ? 'var(--gn)' : pctOk >= 50 ? 'var(--yl)' : 'var(--rd)' }}>
            {pctOk}%
          </div>
        </div>
        <div className="dash-health-bar">
          <div style={{ width: `${(inDay / total) * 100}%`, background: 'var(--gn)', transition: '0.5s' }} />
          <div style={{ width: `${(warn / total) * 100}%`, background: 'var(--yl)', transition: '0.5s' }} />
          <div style={{ width: `${(critical / total) * 100}%`, background: 'var(--rd)', transition: '0.5s' }} />
        </div>
        <div className="dash-health-legend">
          <span className="text-gn">{'\u25CF'} {inDay} {t('ok_label')}</span>
          <span className="text-yl">{'\u25CF'} {warn} {t('attention')}</span>
          <span className="text-rd">{'\u25CF'} {critical} {t('critical')}</span>
        </div>
      </div>

      <div className="dash-mini-grid">
        <div className="card dash-mini-card">
          <div className="font-orbitron fw-900 fs-2xl text-or">{recentMaint.length}</div>
          <div className="font-mono fs-xs text-mut">{t('maint_7days')}</div>
        </div>
        <div className="card dash-mini-card">
          <div className="font-orbitron fw-900 fs-2xl" style={{ color: 'var(--cy2)' }}>{withKit}</div>
          <div className="font-mono fs-xs text-mut">{t('with_kit')}</div>
        </div>
      </div>

      <div className="card mb-10 p-12">
        <div className="ctitle">{t('top_brands')}</div>
        {topBrands.map(([brand, count]) => (
          <div key={brand} className="mb-6">
            <div className="flex justify-between mb-6">
              <div className="font-mono fs-sm text-txt2">{brand}</div>
              <div className="font-orbitron fs-sm text-cy">{count}</div>
            </div>
            <div style={{ height: '4px', background: 'var(--s3)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${(count / maxBrand) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--cy), var(--cy2))', borderRadius: '2px', transition: '0.5s' }} />
            </div>
          </div>
        ))}
      </div>

      {recentMaint.length > 0 && (
        <div className="card mb-10 p-12">
          <div className="ctitle">{t('recent_maint')}</div>
          {recentMaint.slice(0, 5).map((h, i) => (
            <div key={i} className="flex justify-between items-center" style={{
              padding: '6px 0', borderBottom: i < recentMaint.length - 1 ? '1px solid var(--s3)' : 'none'
            }}>
              <div>
                <div className="font-orbitron fs-sm text-cy">{h.tag}</div>
                <div className="font-mono fs-xs text-mut">
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
                  {cr > 0 ? t('status_crit').replace('\u26D4 ', '') : wn > 0 ? t('status_warn').replace('\u26A0\uFE0F ', '') : t('ok_label')}
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
