import React, { useState } from 'react';
import { useLang } from '../i18n/LangContext';
import { loginUser } from '../lib/useSupabase';
import { saveSession, checkRateLimit, recordFailedAttempt, resetAttempts } from '../lib/auth';

const FlagBR = () => (<svg viewBox="0 0 36 36" width="22" height="22"><rect width="36" height="36" rx="4" fill="#009B3A"/><path d="M2 18L18 6l16 12L18 30z" fill="#FEDF00"/><circle cx="18" cy="18" r="6.5" fill="#002776"/><path d="M12 18.5c3-3 9-3 12 0" stroke="#fff" strokeWidth="1" fill="none"/></svg>);
const FlagES = () => (<svg viewBox="0 0 36 36" width="22" height="22"><rect width="36" height="36" rx="4" fill="#C60B1E"/><rect y="9" width="36" height="18" fill="#FFC400"/></svg>);
const FlagEN = () => (<svg viewBox="0 0 36 36" width="22" height="22"><rect width="36" height="36" rx="4" fill="#012169"/><path d="M0 0L36 36M36 0L0 36" stroke="#fff" strokeWidth="6"/><path d="M0 0L36 36M36 0L0 36" stroke="#C8102E" strokeWidth="2"/><path d="M18 0V36M0 18H36" stroke="#fff" strokeWidth="10"/><path d="M18 0V36M0 18H36" stroke="#C8102E" strokeWidth="6"/></svg>);
const flagComponents = { pt: <FlagBR />, es: <FlagES />, en: <FlagEN /> };

// Sem fallback local — autenticação apenas via Supabase

const Login = ({ onLogin }) => {
  const { t, lang, setLang } = useLang();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockMinutes, setLockMinutes] = useState(0);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Verificar rate limit
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      setLocked(true);
      setLockMinutes(rateCheck.minutesLeft);
      setError(t('login_locked') || `Conta bloqueada. Tente novamente em ${rateCheck.minutesLeft} minutos.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Tentar login via Supabase (com hash)
      const user = await loginUser(username, password);
      if (user) {
        resetAttempts();
        const session = saveSession(user);
        onLogin(session);
        setLoading(false);
        return;
      }
    } catch {
      // Supabase offline
    }

    // Login falhou
    recordFailedAttempt();
    const newCheck = checkRateLimit();
    if (!newCheck.allowed) {
      setLocked(true);
      setLockMinutes(newCheck.minutesLeft);
      setError(t('login_locked') || `Conta bloqueada. Tente novamente em ${newCheck.minutesLeft} minutos.`);
    } else {
      setError((t('login_error') || 'Credenciais inválidas') + ` (${newCheck.remaining} ${t('login_attempts_left') || 'tentativas restantes'})`);
      setTimeout(() => setError(''), 5000);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '20px'
    }}>
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.03,
        backgroundImage: 'radial-gradient(circle, var(--cy) 1px, transparent 1px)',
        backgroundSize: '36px 36px', pointerEvents: 'none'
      }} />

      {/* Language switcher */}
      <div style={{ position: 'fixed', top: '16px', right: '16px', display: 'flex', gap: '6px', zIndex: 10 }}>
        {['pt', 'es', 'en'].map(l => (
          <div key={l} onClick={() => setLang(l)} style={{
            width: '36px', height: '36px', borderRadius: '8px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            background: lang === l ? 'rgba(0,212,255,0.15)' : 'var(--s2)',
            border: lang === l ? '1px solid var(--cy)' : '1px solid var(--s3)'
          }}>{flagComponents[l]}</div>
        ))}
      </div>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative' }}>
        <div style={{
          width: '70px', height: '70px', margin: '0 auto 16px',
          borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, var(--or), var(--or2))',
          boxShadow: '0 4px 20px rgba(249,115,22,0.3)'
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
            <path d="M12 2L3 7v7c0 5 4 8.5 9 10 5-1.5 9-5 9-10V7l-9-5z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '1.5rem', color: 'var(--or)' }}>
          MAINTPLANT
        </div>
        <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.65rem', color: 'var(--mut)', marginTop: '4px', letterSpacing: '2px' }}>
          {t('login_subtitle')}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} style={{
        width: '100%', maxWidth: '360px',
        background: 'linear-gradient(145deg, rgba(12,17,32,.95), rgba(17,24,39,.9))',
        borderRadius: '16px', padding: '28px',
        border: '1px solid rgba(0,212,255,.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,.4), 0 0 60px rgba(0,212,255,.03)',
        backdropFilter: 'blur(12px)',
        position: 'relative'
      }}>
        <div style={{
          fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '.8rem',
          color: 'var(--cy)', marginBottom: '20px', textAlign: 'center'
        }}>
          {t('login_title')}
        </div>

        <div className="oflabel">{t('login_user')}</div>
        <input className="ofinput" placeholder="username" value={username}
          onChange={e => setUsername(e.target.value)} autoComplete="username"
          style={{ marginBottom: '12px' }} disabled={locked} />

        <div className="oflabel">{t('login_pass')}</div>
        <div style={{ position: 'relative' }}>
          <input className="ofinput" type={showPass ? 'text' : 'password'} placeholder="••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            autoComplete="current-password" disabled={locked} />
          <div onClick={() => setShowPass(!showPass)} style={{
            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
            cursor: 'pointer', fontSize: '.8rem', color: 'var(--mut)'
          }}>{showPass ? '🙈' : '👁'}</div>
        </div>

        {error && (
          <div style={{
            fontFamily: 'Share Tech Mono', fontSize: '.65rem',
            color: locked ? 'var(--or)' : 'var(--rd)',
            textAlign: 'center', marginTop: '10px',
            padding: '8px',
            background: locked ? 'rgba(249,115,22,0.1)' : 'rgba(239,68,68,0.1)',
            borderRadius: '6px'
          }}>
            {locked ? '🔒' : '⛔'} {error}
          </div>
        )}

        <button type="submit" className="btn btn-p"
          style={{ marginTop: '16px', opacity: (loading || locked) ? 0.4 : 1 }}
          disabled={loading || locked}>
          {locked ? (t('login_locked_btn') || '🔒 Bloqueado') : loading ? '...' : t('login_btn')}
        </button>

        <div style={{
          fontFamily: 'Share Tech Mono', fontSize: '.55rem', color: 'var(--mut)',
          textAlign: 'center', marginTop: '16px', lineHeight: '1.6'
        }}>
          {t('login_subtitle')}
        </div>
      </form>

      {/* Security badge */}
      <div style={{
        fontFamily: 'Share Tech Mono', fontSize: '.5rem', color: 'var(--mut)',
        marginTop: '20px', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '4px'
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L3 7v7c0 5 4 8.5 9 10 5-1.5 9-5 9-10V7l-9-5z" />
        </svg>
        Session timeout: 8h
      </div>
    </div>
  );
};

export default Login;
