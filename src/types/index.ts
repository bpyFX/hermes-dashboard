export type AgentId = 'cc' | 'cx' | 'oc' | 'gm'
export type AgentState = 'idle' | 'working' | 'moving' | 'reporting' | 'error'
export interface Agent {
  id: AgentId
  name: string
  color: string
  state: AgentState
  room: string
  file: string
  workTimer: number
}
export type TraceType = 'info' | 'think' | 'tool' | 'result' | 'running'
export interface TraceEntry {
  id: string
  type: TraceType
  content: string
  timestamp: number
}
export interface Room {
  id: string
  name: string
  sub: string
  x: number
  y: number
  w: number
  h: number
  files?: string[]
  description?: string
  isHub?: boolean
}
export interface Session {
  id: string
  name: string
  duration: string
  tokens: number
  cost: number
  status: 'active' | 'queued' | 'done'
}
export interface MetricsPanelProps {
  tasks?: number
  running?: number
  tokens?: string
  cost?: string
  vram?: number
  ram?: number
  cpu?: number
  ctx?: number
}

export interface HermesMetrics {
  cpu: number
  ram: number
  vram: number
  gpu_util: number
  gpu_temp: number
  vram_used_mb: number
  vram_total_mb: number
  ram_used_gb: number
  ram_total_gb: number
}

export interface HermesCurrentSession {
  id: string
  turns: number
  tool_calls: number
  tokens: number
  started: string
}

export interface HermesSummary {
  online: boolean
  model: string
  time: string
  metrics: HermesMetrics
  session: HermesCurrentSession
  session_count: number
}

export interface HermesSessionListItem {
  id: string
  model: string
  platform: string
  started: string
  updated: string
  turns: number
  tool_calls: number
  tokens: number
}

export interface HermesSessionsResponse {
  count: number
  sessions: HermesSessionListItem[]
}

export interface SessionStoreState {
  sessions: HermesSessionListItem[]
}
