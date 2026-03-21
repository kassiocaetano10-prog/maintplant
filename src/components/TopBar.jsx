import React from 'react';

const TopBar = ({ zone, setZone, zones }) => {
  return (
    <div id="topbar">
      <div className="logo">
        <div className="licon">
          <svg viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l6 2.18V11c0 3.83-2.6 7.43-6 8.93-3.4-1.5-6-5.1-6-8.93V7.18L12 5z" />
          </svg>
        </div>
        <div>
          <div className="ltxt">MAINTPLANT</div>
          <div className="lsub">GESTÃO DE MANUTENÇÃO</div>
        </div>
      </div>
      <select 
        className="zsel" 
        value={zone} 
        onChange={(e) => setZone(e.target.value)}
      >
        <option value="">⬡ Todas as zonas</option>
        {zones.map(z => <option key={z} value={z}>{z}</option>)}
      </select>
    </div>
  );
};

export default TopBar;
