import React, { useState } from 'react';

const Agenda = ({
  orders,
  onDeleteOrder,
  onNewOrder,
  onUpdateOrderStatus,
  zones,
  valves,
  vstatus,
  user,
  restockRequests = [],
  onCreateRestockRequest,
  onUpdateRestockRequestStatus
}) => {
  const [tab, setTab] = useState('orders');
  const [problemRef, setProblemRef] = useState('');
  const [problemDesc, setProblemDesc] = useState('');
  const canCreateOrder = user?.role === 'admin' || user?.role === 'chefe';
  const canManageRequests = user?.role === 'admin' || user?.role === 'chefe' || user?.role === 'compras';
  const isTech = user?.role === 'tecnico';

  const delO = (id) => {
    if (confirm('Remover esta ordem?')) {
      onDeleteOrder(id);
    }
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
          {canCreateOrder && (
            <button className="btn btn-p" onClick={onNewOrder} style={{ marginBottom: '13px' }}>
              ⚡ Nova Ordem de Serviço
            </button>
          )}
          <div id="olist">
            {orders.length === 0 ? (
              <div className="empty">
                <div className="ei">📋</div>
                <div className="et">Nenhuma ordem criada ainda</div>
              </div>
            ) : (
              orders.map((o) => {
                const s = o.status || 'aberta';
                const sc = s === 'concluida' ? 'ok' : s === 'andamento' ? 'bl' : 'wn';
                const st = s === 'concluida' ? '✓ Concluída' : s === 'andamento' ? '⚡ Em andamento' : '⏳ Aberta';
                return (
                  <div key={o.id} className="oi">
                    <div className="oih">
                      <div>
                        <div className="oiz">{o.zona}</div>
                        <div className="oid">{o.data_programada} · {o.tecnico}</div>
                        {o.createdBy && (
                          <div className="oid">Criada por: {o.createdBy}</div>
                        )}
                        {o.valveTag && (
                          <div className="oid">Válvula: {o.valveTag}</div>
                        )}
                      </div>
                      <span className={`bx ${sc}`}>{st}</span>
                    </div>
                    {o.observacoes && (
                      <div style={{ fontSize: '.74rem', color: 'var(--mut)', marginTop: '6px', fontFamily: "'Share Tech Mono'" }}>
                        📝 {o.observacoes}
                      </div>
                    )}
                    <div className="oact">
                      <button
                        className="btn btn-g"
                        onClick={() => onUpdateOrderStatus?.(o.id, s === 'concluida' ? 'aberta' : 'concluida')}
                      >
                        {s !== 'concluida' ? '✓ Concluir' : '✓ Concluída'}
                      </button>
                      {canCreateOrder && (
                        <button className="btn btn-o" style={{ maxWidth: '46px', color: 'var(--rd)' }} onClick={() => delO(o.id)}>🗑</button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {isTech && (
            <div className="card" style={{ marginTop: '12px' }}>
              <div className="ctitle">🧩 Reportar peça com problema</div>
              <div className="ff">
                <label className="fl">Referência da peça/kit</label>
                <input className="fi" value={problemRef} onChange={(e) => setProblemRef(e.target.value)} placeholder="Ex: 2.30.4.16 / kit-xyz" />
              </div>
              <div className="ff">
                <label className="fl">Descrição do problema</label>
                <input className="fi" value={problemDesc} onChange={(e) => setProblemDesc(e.target.value)} placeholder="Vazando, desgaste, não fecha..." />
              </div>
              <button
                className="btn btn-p"
                onClick={() => {
                  if (!problemRef.trim() || !problemDesc.trim()) {
                    alert('Preencha a referência e a descrição');
                    return;
                  }
                  onCreateRestockRequest?.({
                    ref: problemRef.trim(),
                    description: problemDesc.trim(),
                    suggestedBy: user?.name || 'Técnico'
                  });
                  setProblemRef('');
                  setProblemDesc('');
                  alert('Sugestão enviada para análise do chefe/equipe de compras.');
                }}
              >
                Enviar sugestão de reposição
              </button>
            </div>
          )}

          {canManageRequests && (
            <div className="card" style={{ marginTop: '12px' }}>
              <div className="ctitle">📥 Sugestões de reposição</div>
              {restockRequests.length === 0 ? (
                <div className="et" style={{ color: 'var(--mut)' }}>Nenhuma sugestão recebida.</div>
              ) : (
                restockRequests.map((req) => (
                  <div key={req.id} className="kr">
                    <div>
                      <div className="kc">{req.ref}</div>
                      <div className="ki">{req.description}</div>
                      <div className="ki">Por: {req.suggestedBy} · {new Date(req.createdAt).toLocaleString('pt-BR')}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span className={`bx ${req.status === 'aprovada' ? 'ok' : req.status === 'rejeitada' ? 'cr' : 'wn'}`}>{req.status}</span>
                      {(user?.role === 'admin' || user?.role === 'chefe') && req.status === 'pendente' && (
                        <>
                          <button className="btn btn-g" style={{ maxWidth: '36px' }} onClick={() => onUpdateRestockRequestStatus?.(req.id, 'aprovada')}>✓</button>
                          <button className="btn btn-o" style={{ maxWidth: '36px', color: 'var(--rd)' }} onClick={() => onUpdateRestockRequestStatus?.(req.id, 'rejeitada')}>✕</button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
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
