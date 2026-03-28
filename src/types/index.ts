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
  files: string[]
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