import React, { useState } from 'react';
import { useLang } from '../i18n/LangContext';

const FlagBR = () => (
  <svg viewBox="0 0 36 36" width="20" height="20">
    <rect width="36" height="36" rx="4" fill="#009B3A"/>
    <path d="M2 18L18 6l16 12L18 30z" fill="#FEDF00"/>
    <circle cx="18" cy="18" r="6.5" fill="#002776"/>
    <path d="M12 18.5c3-3 9-3 12 0" stroke="#fff" strokeWidth="1" fill="none"/>
  </svg>
);

const FlagES = () => (
  <svg viewBox="0 0 36 36" width="20" height="20">
    <rect width="36" height="36" rx="4" fill="#C60B1E"/>
    <rect y="9" width="36" height="18" fill="#FFC400"/>
  </svg>
);

const FlagEN = () => (
  <svg viewBox="0 0 36 36" width="20" height="20">
    <rect width="36" height="36" rx="4" fill="#012169"/>
    <path d="M0 0L36 36M36 0L0 36" stroke="#fff" strokeWidth="6"/>
    <path d="M0 0L36 36M36 0L0 36" stroke="#C8102E" strokeWidth="2"/>
    <path d="M18 0V36M0 18H36" stroke="#fff" strokeWidth="10"/>
    <path d="M18 0V36M0 18H36" stroke="#C8102E" strokeWidth="6"/>
  </svg>
);

const flags = { pt: <FlagBR />, es: <FlagES />, en: <FlagEN /> };
const labels = { pt: 'Português', es: 'Español', en: 'English' };

const LangSelector = () => {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <div onClick={() => setOpen(!open)} style={{
        width: '32px', height: '32px', borderRadius: '8px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        background: 'var(--s2)', border: '1px solid var(--s3)'
      }}>
        {flags[lang]}
      </div>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
          <div style={{
            position: 'absolute', top: '38px', right: 0, background: 'var(--s1)',
            border: '1px solid var(--s3)', borderRadius: '8px', overflow: 'hidden',
            zIndex: 100, minWidth: '140px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}>
            {['pt', 'es', 'en'].map(l => (
              <div key={l} onClick={() => { setLang(l); setOpen(false); }}
                style={{
                  padding: '10px 14px', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '10px',
                  background: lang === l ? 'rgba(0,212,255,0.1)' : 'transparent',
                  borderLeft: lang === l ? '3px solid var(--cy)' : '3px solid transparent',
                  fontFamily: 'Share Tech Mono', fontSize: '.7rem',
                  color: lang === l ? 'var(--cy)' : 'var(--txt2)'
                }}>
                {flags[l]}
                {labels[l]}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LangSelector;
