// ─── Shared Utilities ───

export const isBrowser = typeof window !== 'undefined'

export const ls = (key) => isBrowser ? localStorage.getItem(key) : null

export const lsSet = (key, val) => isBrowser && localStorage.setItem(key, val)

export const lsRm = (key) => isBrowser && localStorage.removeItem(key)

export const safeParse = (value, fallback) => {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}
