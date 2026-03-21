import React from 'react';

const NavBar = ({ view, setView }) => {
  const tabs = [
    { id: 'dash', label: 'Dashboard', icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    )},
    { id: 'valves', label: 'Válvulas', icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    )},
    { id: 'agenda', label: 'Agenda', icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    )},
    { id: 'painel', label: 'Painel', icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    )},
    { id: 'compras', label: 'Compras', icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    )}
  ];

  return (
    <div id="navbar">
      {tabs.map(t => (
        <button 
          key={t.id} 
          className={`nb ${view === t.id ? 'on' : ''}`} 
          onClick={() => setView(t.id)}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
};

export default NavBar;
