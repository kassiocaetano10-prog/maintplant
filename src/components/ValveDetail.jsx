import React from 'react';

const ValveDetail = ({ valve, onClose, vstatus, photo, onStartGuide }) => {
  const status = vstatus(valve);
  
  const fields = [
    { k: 'Marca / Fabricante', v: valve.marca },
    { k: 'Nº Série', v: valve.serie || '—' },
    { k: 'Tamanho (DN)', v: valve.dn || '—' },
    { k: 'Tipo de Assento', v: valve.assento || '—' },
    { k: 'Ano Fabricação', v: valve.fabricacao || '—' },
    { k: 'Atuador', v: valve.atuador || '—' },
    { k: 'Última Manutenção', v: valve.ult_man || 'Nunca registrada' },
    { k: 'Última Troca de Kit', v: valve.ult_kit || 'Nunca registrada' }
  ];

  const badgeCls = status === 'ok' ? 'ok' : status === 'warn' ? 'wn' : 'cr';
  const badgeTxt = status === 'ok' ? '✓ EM DIA' : status === 'warn' ? '⚠️ ATENÇÃO' : '⛔ CRÍTICO';

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
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.58rem', color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>⬡ Ref. Kit de Juntas</div>
          <div className="kitr">{valve.kit || 'SEM REF'}</div>
          <div className="kitp">Peça original recomendada</div>
        </div>
        <div className="card" style={{ marginBottom: '10px' }}>
          <div className="ctitle">Dados técnicos</div>
          <div id="dt-fields">
            {fields.map(f => (
              <div key={f.k} className="df">
                <div className="dk">{f.k}</div>
                <div className={`dv ${f.k === 'Nº Série' ? 'mn' : ''}`}>{f.v}</div>
              </div>
            ))}
          </div>
        </div>
        <button className="btn btn-p" onClick={onStartGuide} style={{ marginBottom: '8px' }}>🔧 Iniciar Guia de Manutenção</button>
        <button className="btn btn-cy" onClick={() => alert('Informações copiadas!')}>📋 Copiar informações para compra</button>
      </div>
    </div>
  );
};

export default ValveDetail;
