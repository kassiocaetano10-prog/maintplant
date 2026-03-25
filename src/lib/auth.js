// ─── Auth Security Module ───
// Handles password hashing, session expiration, and login rate limiting

const isBrowser = typeof window !== 'undefined'

// ─── Password Hashing (SHA-256) ───
export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + '_proexel_salt_2026')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ─── Session Management ───
const SESSION_KEY = 'mp_session'
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000 // 8 horas

export function saveSession(user) {
  if (!isBrowser) return
  const session = {
    ...user,
    loginTime: new Date().toISOString(),
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString()
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function getSession() {
  if (!isBrowser) return null
  const saved = localStorage.getItem(SESSION_KEY)
  if (!saved) return null

  try {
    const session = JSON.parse(saved)

    // Verificar expiração
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      clearSession()
      return null
    }

    return session
  } catch {
    clearSession()
    return null
  }
}

export function clearSession() {
  if (!isBrowser) return
  localStorage.removeItem(SESSION_KEY)
}

// ─── Rate Limiting (tentativas de login) ───
const ATTEMPTS_KEY = 'mp_login_attempts'
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutos

export function checkRateLimit() {
  if (!isBrowser) return { allowed: true, remaining: MAX_ATTEMPTS }

  const saved = localStorage.getItem(ATTEMPTS_KEY)
  if (!saved) return { allowed: true, remaining: MAX_ATTEMPTS }

  try {
    const data = JSON.parse(saved)

    // Se o lockout expirou, resetar
    if (data.lockedUntil && new Date(data.lockedUntil) < new Date()) {
      localStorage.removeItem(ATTEMPTS_KEY)
      return { allowed: true, remaining: MAX_ATTEMPTS }
    }

    // Se está bloqueado
    if (data.lockedUntil && new Date(data.lockedUntil) > new Date()) {
      const minutesLeft = Math.ceil((new Date(data.lockedUntil) - new Date()) / 60000)
      return { allowed: false, remaining: 0, minutesLeft }
    }

    return { allowed: true, remaining: MAX_ATTEMPTS - (data.count || 0) }
  } catch {
    return { allowed: true, remaining: MAX_ATTEMPTS }
  }
}

export function recordFailedAttempt() {
  if (!isBrowser) return

  const saved = localStorage.getItem(ATTEMPTS_KEY)
  let data = saved ? JSON.parse(saved) : { count: 0 }

  data.count = (data.count || 0) + 1

  if (data.count >= MAX_ATTEMPTS) {
    data.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString()
  }

  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(data))
}

export function resetAttempts() {
  if (!isBrowser) return
  localStorage.removeItem(ATTEMPTS_KEY)
}
