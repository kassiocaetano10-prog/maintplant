import React, { useState, useMemo } from 'react';
import { useLang } from '../i18n/LangContext';

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
  onUpdateRestockRequestStatus,
  showToast,
  showConfirm
}) => {
  const { t, lang } = useLang();
  const [tab, setTab] = useState('orders');
  const [problemRef, setProblemRef] = useState('');
  const [problemDesc, setProblemDesc] = useState('');
  const [problemName, setProblemName] = useState('');
  const canCreateOrder = user?.role === 'admin' || user?.role === 'chefe';
  const canManageRequests = user?.role === 'admin' || user?.role === 'chefe' || user?.role === 'compras';
  const isTech = user?.role === 'tecnico';
  const canChangeOrderStatus = user?.role === 'admin' || user?.role === 'chefe';
  const locale = lang === 'es' ? 'es-ES' : lang === 'en' ? 'en-US' : 'pt-BR';

  const valveTags = useMemo(() => {
    return Array.from(new Set(
      valves.map(v => (v?.tag || '').trim()).filter(Boolean)
    )).sort((a, b) => a.localeCompare(b));
  }, [valves]);

  const valveSuggestions = useMemo(() => {
    const q = problemRef.trim().toLowerCase();
    if (!q) return valveTags.slice(0, 30);
    return valveTags.filter(tag => tag.toLowerCase().includes(q)).slice(0, 30);
  }, [problemRef, valveTags]);

  const delO = async (id) => {
    const ok = showConfirm
      ? await showConfirm(t('confirm_delete_order'))
      : window.confirm(t('confirm_delete_order'))
    if (ok) onDeleteOrder(id)
  };

  return (
    <div id="sc-agenda" className="sc on">
      <div className="tabs">
        <button 
          className={`tab ${tab === 'orders' ? 'on' : ''}`} 
          onClick={() => setTab('orders')}
        >
          {t('service_orders')}
        </button>
        <button 
          className={`tab ${tab === 'cal' ? 'on' : ''}`} 
          onClick={() => setTab('cal')}
        >
          {t('calendar')}
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
                  <div className="et">{t('no_orders_yet')}</div>
              </div>
            ) : (
              orders.map((o) => {
                const rawStatus = o.status || 'pendente';
                const s = rawStatus === 'aberta' ? 'pendente' : rawStatus;
                const sc = s === 'concluida' ? 'ok' : s === 'andamento' ? 'bl' : 'wn';
                const st = s === 'concluida' ? t('completed') : s === 'andamento' ? t('in_progress') : t('open');
                return (
                  <div key={o.id} className="oi">
                    <div className="oih">
                      <div>
                        <div className="oiz">{o.zona || o.zone}</div>
                        <div className="oid">{o.data_programada} · {o.tecnico}</div>
                        {(o.createdBy || o.created_by) && (
                          <div className="oid">{t('created_by')}: {o.createdBy || o.created_by}</div>
                        )}
                        {(o.valveTag || o.valve_tag) && (
                          <div className="oid">{t('valve_label')}: {o.valveTag || o.valve_tag}</div>
                        )}
                      </div>
                      <span className={`bx ${sc}`}>{st}</span>
                    </div>
                    {(o.observacoes || o.description) && (
                      <div style={{ fontSize: '.74rem', color: 'var(--mut)', marginTop: '6px', fontFamily: "'Share Tech Mono'" }}>
                        📝 {o.observacoes || o.description}
                      </div>
                    )}
                    <div className="oact">
                      <button
                        className="btn btn-g"
                        disabled={!canChangeOrderStatus}
                        onClick={() => onUpdateOrderStatus?.(o.id, s === 'concluida' ? 'aberta' : 'concluida')}
                      >
                        {s !== 'concluida' ? t('conclude') : t('completed')}
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
              <div className="ctitle">{t('report_part_problem')}</div>
              <div className="ff">
                <label className="fl">{t('your_name')}</label>
                <input className="fi" value={problemName} onChange={(e) => setProblemName(e.target.value)} placeholder={t('your_name_placeholder')} />
              </div>
              <div className="ff">
                <label className="fl">{t('part_ref_label')}</label>
                <input className="fi" list="problem-valve-tags" value={problemRef} onChange={(e) => setProblemRef(e.target.value)} placeholder={t('part_ref_placeholder')} />
                <datalist id="problem-valve-tags">
                  {valveSuggestions.map(tag => <option key={tag} value={tag} />)}
                </datalist>
              </div>
              <div className="ff">
                <label className="fl">{t('problem_description')}</label>
                <input className="fi" value={problemDesc} onChange={(e) => setProblemDesc(e.target.value)} placeholder={t('problem_description_placeholder')} />
              </div>
              <button
                className="btn btn-p"
                onClick={() => {
                  if (!problemName.trim() || !problemRef.trim() || !problemDesc.trim()) {
                    showToast?.(t('fill_name_ref_description'), 'warning')
                    return;
                  }
                  onCreateRestockRequest?.({
                    ref: problemRef.trim(),
                    description: problemDesc.trim(),
                    suggestedBy: problemName.trim()
                  });
                  setProblemRef('');
                  setProblemDesc('');
                  showToast?.(t('restock_suggestion_sent'), 'success')
                }}
              >
                {t('send_restock_suggestion')}
              </button>
            </div>
          )}

          {canManageRequests && (
            <div className="card" style={{ marginTop: '12px' }}>
              <div className="ctitle">{t('restock_suggestions')}</div>
              {restockRequests.length === 0 ? (
                <div className="et" style={{ color: 'var(--mut)' }}>{t('no_suggestions_received')}</div>
              ) : (
                restockRequests.map((req) => (
                  <div key={req.id} className="kr">
                    <div>
                      <div className="kc">{req.ref || req.kit}</div>
                      <div className="ki">{req.description || req.reason}</div>
                      <div className="ki">{t('by_label')}: {req.suggestedBy || req.suggested_by} · {new Date(req.createdAt || req.created_at).toLocaleString(locale)}</div>
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
          <div className="info">{t('maint_priority')}</div>
          <div id="clist">
            {zones.map(z => {
              const zv = valves.filter(v => v.zona === z);
              if (!zv.length) return null;
              const ok = zv.filter(v => vstatus(v) === 'ok').length;
              const cr = zv.filter(v => vstatus(v) === 'crit').length;
              const total = zv.length;
              const pr = cr === total ? t('priority_critical') : cr > total * 0.5 ? t('priority_high') : t('priority_low');
              const pc = cr === total ? 'var(--rd)' : cr > total * 0.5 ? 'var(--yl)' : 'var(--gn)';
              return (
                <div key={z} className="calz">
                  <div className="calzn">{z}<span className="bx" style={{ fontSize: '.6rem', color: pc, background: 'rgba(0,0,0,.3)', border: 'none' }}>{pr}</span></div>
                  <div className="calb">
                    <div className="calbl">{t('in_day')}</div>
                    <div className="calbg"><div className="calfi" style={{ width: `${Math.round(ok/total*100)}%`, background: 'var(--gn)' }}></div></div>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '.64rem', color: 'var(--mut)', width: '22px', textAlign: 'right' }}>{ok}</div>
                  </div>
                  <div className="calb">
                    <div className="calbl">{t('critical')}</div>
                    <div className="calbg"><div className="calfi" style={{ width: `${Math.round(cr/total*100)}%`, background: 'var(--rd)' }}></div></div>
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
