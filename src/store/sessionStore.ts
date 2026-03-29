import { useEffect, useState } from 'react'
import type { HermesSessionsResponse, SessionStoreState } from '../types'

const SESSIONS_URL = 'http://127.0.0.1:8643/api/sessions?limit=10'
const POLL_INTERVAL_MS = 10000

const DEFAULT_SESSION_STORE: SessionStoreState = {
  sessions: [],
}

export const useSessionStore = (): SessionStoreState => {
  const [sessions, setSessions] = useState<SessionStoreState>(DEFAULT_SESSION_STORE)

  useEffect(() => {
    let cancelled = false

    const pollSessions = async () => {
      try {
        const response = await fetch(SESSIONS_URL)
        if (!response.ok) {
          throw new Error(`Hermes sessions request failed: ${response.status}`)
        }

        const payload = await response.json() as HermesSessionsResponse
        if (!cancelled) {
          setSessions({ sessions: payload.sessions })
        }
      } catch {
        // Keep the last known sessions on polling errors.
      }
    }

    void pollSessions()
    const interval = window.setInterval(() => {
      void pollSessions()
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [])

  return sessions
}
