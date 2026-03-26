import React, { useState } from 'react';
import { useLang } from '../i18n/LangContext';
import { loginUser } from '../lib/useSupabase';
import { saveSession, checkRateLimit, recordFailedAttempt, resetAttempts } from '../lib/auth';

const FlagBR = () => (<svg viewBox="0 0 36 36" width="22" height="22"><rect width="36" height="36" rx="4" fill="#009B3A"/><path d="M2 18L18 6l16 12L18 30z" fill="#FEDF00"/><circle cx="18" cy="18" r="6.5" fill="#002776"/><path d="M12 18.5c3-3 9-3 12 0" stroke="#fff" strokeWidth="1" fill="none"/></svg>);
const FlagES = () => (<svg viewBox="0 0 36 36" width="22" height="22"><rect width="36" height="36" rx="4" fill="#C60B1E"/><rect y="9" width="36" height="18" fill="#FFC400"/></svg>);
const FlagEN = () => (<svg viewBox="0 0 36 36" width="22" height="22"><rect width="36" height="36" rx="4" fill="#012169"/><path d="M0 0L36 36M36 0L0 36" stroke="#fff" strokeWidth="6"/><path d="M0 0L36 36M36 0L0 36" stroke="#C8102E" strokeWidth="2"/><path d="M18 0V36M0 18H36" stroke="#fff" strokeWidth="10"/><path d="M18 0V36M0 18H36" stroke="#C8102E" strokeWidth="6"/></svg>);
const flagComponents = { pt: <FlagBR />, es: <FlagES />, en: <FlagEN /> };

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
    <div className="login-screen">
      <div className="login-grid-bg" />

      {/* Language switcher */}
      <div className="login-lang-switcher">
        {['pt', 'es', 'en'].map(l => (
          <div key={l} className={`login-lang-btn ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>
            {flagComponents[l]}
          </div>
        ))}
      </div>

      {/* Logo */}
      <div className="login-logo">
        <div className="login-logo-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
            <path d="M12 2L3 7v7c0 5 4 8.5 9 10 5-1.5 9-5 9-10V7l-9-5z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div className="login-brand">MAINTPLANT</div>
        <div className="login-subtitle">{t('login_subtitle')}</div>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="login-form">
        <div className="login-form-title">{t('login_title')}</div>

        <div className="oflabel">{t('login_user')}</div>
        <input className="ofinput" placeholder="username" value={username}
          onChange={e => setUsername(e.target.value)} autoComplete="username"
          style={{ marginBottom: '12px' }} disabled={locked} />

        <div className="oflabel">{t('login_pass')}</div>
        <div style={{ position: 'relative' }}>
          <input className="ofinput" type={showPass ? 'text' : 'password'} placeholder="••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            autoComplete="current-password" disabled={locked} />
          <div className="login-pass-toggle" onClick={() => setShowPass(!showPass)}>
            {showPass ? '\u{1F648}' : '\u{1F441}'}
          </div>
        </div>

        {error && (
          <div className={`login-error ${locked ? 'locked' : 'failed'}`}>
            {locked ? '\u{1F512}' : '\u26D4'} {error}
          </div>
        )}

        <button type="submit" className="btn btn-p"
          style={{ marginTop: '16px', opacity: (loading || locked) ? 0.4 : 1 }}
          disabled={loading || locked}>
          {locked ? (t('login_locked_btn') || '\u{1F512} Bloqueado') : loading ? '...' : t('login_btn')}
        </button>

        <div className="login-footer">{t('login_subtitle')}</div>
      </form>

      {/* Security badge */}
      <div className="login-security-badge">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L3 7v7c0 5 4 8.5 9 10 5-1.5 9-5 9-10V7l-9-5z" />
        </svg>
        Session timeout: 8h
      </div>
    </div>
  );
};

export default Login;
