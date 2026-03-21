import React from 'react';

const Panel = ({ valves, vstatus, zones, orders }) => {
  const ok = valves.filter(v => vstatus(v) === 'ok').length;
  const cr = valves.filter(v => vstatus(v) === 'crit').length;
  const t = valves.length;

  const brands = {};
  valves.forEach(v => {
    const b = (v.marca || '').trim().replace('GUTH  VENTILE', 'Guth Ventile');
    if (b && b !== 'NaT') brands[b] = (brands[b] || 0) + 1;
  });
  const sb = Object.entries(brands).sort((a, b) => b[1] - a[1]).slice(0, 7);
  const mx = sb[0]?.[1] || 1;

  const zc = zones.map(z => {
    const zv = valves.filter(v => v.zona === z);
    return { z, cr: zv.filter(v => vstatus(v) === 'crit').length, t: zv.length };
  }).filter(x => x.cr > 0).sort((a, b) => b.cr - a.cr).slice(0, 8);

  return (
    <div id="sc-painel" className="sc on" style={{ paddingBottom: '110px' }}>
      <div className="krow">
        <div className="kcard">
          <div className="kval" style={{ color: 'var(--cy)' }}>{t}</div>
          <div className="klbl">Total cadastradas</div>
          <div className="ktrd" style={{ color: 'var(--gn)' }}>{zones.length} zonas ativas</div>
        </div>
        <div className="kcard">
          <div className="kval" style={{ color: 'var(--gn)' }}>{ok}</div>
          <div className="klbl">Kit registrado</div>
          <div className="ktrd" style={{ color: 'var(--mut)' }}>{Math.round(ok/t*100)}% do total</div>
        </div>
      </div>
      <div className="krow">
        <div className="kcard">
          <div className="kval" style={{ color: 'var(--rd)' }}>{cr}</div>
          <div className="klbl">Sem kit trocado</div>
          <div className="ktrd" style={{ color: 'var(--rd)' }}>{Math.round(cr/t*100)}% — atenção ⚠️</div>
        </div>
        <div className="kcard">
          <div className="kval" style={{ color: 'var(--yl)' }}>{orders.filter(o => o.status !== 'concluida').length}</div>
          <div className="klbl">Ordens abertas</div>
          <div className="ktrd" style={{ color: 'var(--mut)' }}>{orders.filter(o => o.status === 'concluida').length} concluídas</div>
        </div>
      </div>
      <div className="card">
        <div className="ctitle">Por fabricante</div>
        <div id="brchart">
          {sb.map(([b, c]) => (
            <div key={b} className="bbar">
              <div className="bname">{b}</div>
              <div className="btrack"><div className="bfill" style={{ width: `${Math.round(c/mx*100)}%` }}></div></div>
              <div className="bcnt">{c}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="ctitle">Zonas mais críticas</div>
        <div id="critz">
          {zc.map(x => (
            <div key={x.z} className="bbar">
              <div className="bname" style={{ fontSize: '.68rem' }}>{x.z}</div>
              <div className="btrack"><div className="bfill" style={{ width: `${Math.round(x.cr/x.t*100)}%`, background: 'var(--rd)' }}></div></div>
              <div className="bcnt" style={{ color: 'var(--rd)' }}>{x.cr}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Panel;
