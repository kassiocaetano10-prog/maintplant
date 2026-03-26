import React from 'react';
import LangSelector from './LangSelector';
import { useLang } from '../i18n/LangContext';
import { useOnlineStatus } from '../lib/useOnlineStatus';

const TopBar = ({ zone, setZone, zones, alertCount, onNotifications, onReport, onLogout, user }) => {
  const { t } = useLang();
  const online = useOnlineStatus();

  return (
    <div id="topbar">
      <div className="logo">
        <div className="licon">
          <svg viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l6 2.18V11c0 3.83-2.6 7.43-6 8.93-3.4-1.5-6-5.1-6-8.93V7.18L12 5z" />
          </svg>
        </div>
        <div>
          <div className="ltxt">{t('app_name')}</div>
          <div className="lsub">{t('app_sub')}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Online indicator */}
        <div className={`online-indicator ${online ? 'online' : 'offline'}`}
          title={online ? 'Online' : 'Offline — dados em cache'}>
          <span className="online-dot" />
          <span className="online-label">{online ? 'Online' : 'Offline'}</span>
        </div>

        {/* Language */}
        <LangSelector />

        {/* Report */}
        <div onClick={onReport} style={{
          width: '32px', height: '32px', borderRadius: '8px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          background: 'var(--s2)', border: '1px solid var(--s3)', fontSize: '.85rem'
        }}>📄</div>

        {/* Notifications */}
        <div onClick={onNotifications} style={{
          width: '32px', height: '32px', borderRadius: '8px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          background: alertCount > 0 ? 'rgba(239,68,68,0.15)' : 'var(--s2)',
          border: `1px solid ${alertCount > 0 ? 'rgba(239,68,68,0.3)' : 'var(--s3)'}`,
          position: 'relative', fontSize: '.85rem'
        }}>
          🔔
          {alertCount > 0 && (
            <div style={{
              position: 'absolute', top: '-5px', right: '-5px',
              minWidth: '16px', height: '16px', borderRadius: '8px',
              background: 'var(--rd)', color: '#fff', fontSize: '.5rem',
              fontFamily: 'Orbitron', fontWeight: 900,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 3px', border: '2px solid var(--bg)'
            }}>
              {alertCount > 99 ? '99+' : alertCount}
            </div>
          )}
        </div>

        {/* Logout */}
        <div onClick={onLogout} style={{
          width: '32px', height: '32px', borderRadius: '8px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          background: 'var(--s2)', border: '1px solid var(--s3)', fontSize: '.85rem'
        }} title="Sair">⏻</div>
      </div>
    </div>
  );
};

export default TopBar;
