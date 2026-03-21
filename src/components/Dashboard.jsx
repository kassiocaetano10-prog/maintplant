import React from 'react';

const Dashboard = ({ valves, vstatus, zones, onZoneClick }) => {
  const total = valves.length;
  const inDay = valves.filter(v => vstatus(v) === 'ok').length;
  const critical = valves.filter(v => vstatus(v) === 'crit').length;

  return (
    <div id="sc-dash" className="sc on">
      <div className="stats">
        <div className="sbox">
          <div className="snum" style={{ color: 'var(--cy)', textShadow: 'var(--gw-cy)' }}>{total}</div>
          <div className="slbl">Válvulas</div>
        </div>
        <div className="sbox">
          <div className="snum" style={{ color: 'var(--gn)', textShadow: 'var(--gw-gn)' }}>{inDay}</div>
          <div className="slbl">Em dia</div>
        </div>
        <div className="sbox">
          <div className="snum" style={{ color: 'var(--rd)', textShadow: 'var(--gw-rd)' }}>{critical}</div>
          <div className="slbl">Críticas</div>
        </div>
      </div>

      <div className="slabel">Estado por Zona</div>
      <div id="zlist">
        {zones.map(z => {
          const zv = valves.filter(v => v.zona === z);
          const ok = zv.filter(v => vstatus(v) === 'ok').length;
          const wn = zv.filter(v => vstatus(v) === 'warn').length;
          const cr = zv.filter(v => vstatus(v) === 'crit').length;
          const t = zv.length;
          const cls = cr > 0 ? 'cr-z' : wn > 0 ? 'wn-z' : 'ok-z';

          return (
            <div key={z} className={`zcard ${cls}`} onClick={() => onZoneClick(z)}>
              <div className="zch">
                <div>
                  <div className="znm">{z}</div>
                  <div className="zmt">{t} válvulas</div>
                </div>
                <div className="bx" style={{ 
                  background: cr > 0 ? 'rgba(239,68,68,.1)' : wn > 0 ? 'rgba(251,191,36,.1)' : 'rgba(34,197,94,.1)',
                  color: cr > 0 ? 'var(--rd)' : wn > 0 ? 'var(--yl)' : 'var(--gn)',
                  borderColor: cr > 0 ? 'rgba(239,68,68,.3)' : wn > 0 ? 'rgba(251,191,36,.3)' : 'rgba(34,197,94,.3)'
                }}>
                  {cr > 0 ? 'CRÍTICO' : wn > 0 ? 'ATENÇÃO' : 'OK'}
                </div>
              </div>
              <div className="zbars">
                <div className="zbar" style={{ width: `${(ok / t) * 100}%`, background: 'var(--gn)' }}></div>
                <div className="zbar" style={{ width: `${(wn / t) * 100}%`, background: 'var(--yl)' }}></div>
                <div className="zbar" style={{ width: `${(cr / t) * 100}%`, background: 'var(--rd)' }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
