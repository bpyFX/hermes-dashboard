import { useEffect, useState } from 'react'
import type { HermesSummary } from '../types'

const SUMMARY_URL = 'http://127.0.0.1:8643/api/summary'
const POLL_INTERVAL_MS = 5000

const DEFAULT_HERMES_SUMMARY: HermesSummary = {
  online: false,
  model: '',
  time: '',
  metrics: {
    cpu: 0,
    ram: 0,
    vram: 0,
    gpu_util: 0,
    gpu_temp: 0,
    vram_used_mb: 0,
    vram_total_mb: 0,
    ram_used_gb: 0,
    ram_total_gb: 0,
  },
  session: {
    id: '',
    turns: 0,
    tool_calls: 0,
    tokens: 0,
    started: '',
  },
  session_count: 0,
}

export const useHermes = (): HermesSummary => {
  const [summary, setSummary] = useState<HermesSummary>(DEFAULT_HERMES_SUMMARY)

  useEffect(() => {
    let cancelled = false

    const pollSummary = async () => {
      try {
        const response = await fetch(SUMMARY_URL)
        if (!response.ok) {
          throw new Error(`Hermes summary request failed: ${response.status}`)
        }

        const nextSummary = await response.json() as HermesSummary
        if (!cancelled) {
          setSummary(nextSummary)
        }
      } catch {
        if (!cancelled) {
          setSummary(current => ({ ...current, online: false }))
        }
      }
    }

    void pollSummary()
    const interval = window.setInterval(() => {
      void pollSummary()
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [])

  return summary
}
