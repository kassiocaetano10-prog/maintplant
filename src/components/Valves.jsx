import React from 'react';

const Valves = ({ valves, search, setSearch, vstatus, onValveClick, photos }) => {
  return (
    <div id="sc-valves" className="sc on" style={{ paddingBottom: '110px' }}>
      <div className="sw">
        <svg className="sico" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input 
          className="si" 
          placeholder="TAG, zona, kit, fabricante..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off" 
        />
      </div>
      <div className="slabel" style={{ marginBottom: '10px' }}>{valves.length} válvulas</div>
      <div id="vlist">
        {valves.length === 0 ? (
          <div className="empty">
            <div className="ei">🔍</div>
            <div className="et">Nenhuma válvula encontrada</div>
          </div>
        ) : (
          valves.map(v => {
            const status = vstatus(v);
            const photo = photos[v.tag];
            return (
              <div key={v.tag} className="vi" onClick={() => onValveClick(v)}>
                <div className="vi-sb" style={{ background: status === 'ok' ? 'var(--gn)' : status === 'warn' ? 'var(--yl)' : 'var(--rd)' }}></div>
                <div className="vi-img">
                  {photo ? <img src={photo} alt={v.tag} /> : <div style={{ color: 'var(--mut)', fontSize: '1.5rem' }}>⬡</div>}
                </div>
                <div className="vi-body">
                  <div className="vtag">{v.tag}</div>
                  <div className="vmarca">{v.marca}</div>
                  <div className="vtype">{v.tipo?.replace('_', ' ')}</div>
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
