import React, { useState } from 'react';

const Agenda = ({ orders, setOrders, zones, onNewOrder, valves, vstatus }) => {
  const [tab, setTab] = useState('orders');

  const delO = (i) => {
    if (confirm('Remover esta ordem?')) {
      const newOrders = [...orders];
      newOrders.splice(i, 1);
      setOrders(newOrders);
    }
  };

  const setOS = (i, s) => {
    const newOrders = [...orders];
    newOrders[i].status = s;
    setOrders(newOrders);
  };

  return (
    <div id="sc-agenda" className="sc on">
      <div className="tabs">
        <button 
          className={`tab ${tab === 'orders' ? 'on' : ''}`} 
          onClick={() => setTab('orders')}
        >
          📋 Ordens de Serviço
        </button>
        <button 
          className={`tab ${tab === 'cal' ? 'on' : ''}`} 
          onClick={() => setTab('cal')}
        >
          📅 Calendário
        </button>
      </div>

      {tab === 'orders' && (
        <div id="ag-orders">
          <button className="btn btn-p" onClick={onNewOrder} style={{ marginBottom: '13px' }}>
            ⚡ Nova Ordem de Serviço
          </button>
          <div id="olist">
            {orders.length === 0 ? (
              <div className="empty">
                <div className="ei">📋</div>
                <div className="et">Nenhuma ordem criada ainda</div>
              </div>
            ) : (
              orders.slice().reverse().map((o, ri) => {
                const i = orders.length - 1 - ri;
                const s = o.status || 'aberta';
                const sc = s === 'concluida' ? 'ok' : s === 'andamento' ? 'bl' : 'wn';
                const st = s === 'concluida' ? '✓ Concluída' : s === 'andamento' ? '⚡ Em andamento' : '⏳ Aberta';
                return (
                  <div key={i} className="oi">
                    <div className="oih">
                      <div>
                        <div className="oiz">{o.zona}</div>
                        <div className="oid">{o.date} · {o.tech}</div>
                      </div>
                      <span className={`bx ${sc}`}>{st}</span>
                    </div>
                    {o.obs && (
                      <div style={{ fontSize: '.74rem', color: 'var(--mut)', marginTop: '6px', fontFamily: "'Share Tech Mono'" }}>
                        📝 {o.obs}
                      </div>
                    )}
                    <div className="oact">
                      {s === 'aberta' && <button className="btn btn-cy" onClick={() => setOS(i, 'andamento')}>⚡ Iniciar</button>}
                      <button className="btn btn-g" onClick={() => setOS(i, 'concluida')}>
                        {s !== 'concluida' ? '✓ Concluir' : '✓ Concluída'}
                      </button>
                      <button className="btn btn-o" style={{ maxWidth: '46px', color: 'var(--rd)' }} onClick={() => delO(i)}>🗑</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {tab === 'cal' && (
        <div id="ag-cal">
          <div className="info">Prioridade de manutenção por zona. <strong style={{ color: 'var(--rd)' }}>Vermelho</strong> = crítico, nunca mantido.</div>
          <div id="clist">
            {zones.map(z => {
              const zv = valves.filter(v => v.zona === z);
              if (!zv.length) return null;
              const ok = zv.filter(v => vstatus(v) === 'ok').length;
              const cr = zv.filter(v => vstatus(v) === 'crit').length;
              const t = zv.length;
              const pr = cr === t ? '⛔ Crítica' : cr > t * 0.5 ? '⚠️ Alta' : '✅ Baixa';
              const pc = cr === t ? 'var(--rd)' : cr > t * 0.5 ? 'var(--yl)' : 'var(--gn)';
              return (
                <div key={z} className="calz">
                  <div className="calzn">{z}<span className="bx" style={{ fontSize: '.6rem', color: pc, background: 'rgba(0,0,0,.3)', border: 'none' }}>{pr}</span></div>
                  <div className="calb">
                    <div className="calbl">Em dia</div>
                    <div className="calbg"><div className="calfi" style={{ width: `${Math.round(ok/t*100)}%`, background: 'var(--gn)' }}></div></div>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '.64rem', color: 'var(--mut)', width: '22px', textAlign: 'right' }}>{ok}</div>
                  </div>
                  <div className="calb">
                    <div className="calbl">Crítico</div>
                    <div className="calbg"><div className="calfi" style={{ width: `${Math.round(cr/t*100)}%`, background: 'var(--rd)' }}></div></div>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '.64rem', color: 'var(--mut)', width: '22px', textAlign: 'right' }}>{cr}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
