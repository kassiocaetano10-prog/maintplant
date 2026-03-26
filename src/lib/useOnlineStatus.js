import { useState, useEffect } from 'react'
import { isBrowser } from './utils'

export function useOnlineStatus() {
  const [online, setOnline] = useState(() => isBrowser ? navigator.onLine : true)

  useEffect(() => {
    if (!isBrowser) return

    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return online
}
