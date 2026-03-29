import { useEffect, useRef } from 'react'
import type { Room, Agent, AgentId } from '../types/index'

const CANVAS_WIDTH = 900
const CANVAS_HEIGHT = 500
const STORAGE_KEY = 'hermes-dashboard-room-positions'

const ROOMS: Room[] = [
  { id: 'dock',     x: 370, y: 190, w: 160, h: 120, name: 'HERMES',      sub: 'awaiting input',      files: [], isHub: true },
  { id: 'project',  x: 40,  y: 40,  w: 150, h: 95,  name: 'PROJECT',     sub: 'active codebase',     files: [] },
  { id: 'web',      x: 40,  y: 195, w: 150, h: 85,  name: 'WEB SEARCH',  sub: 'browsing / scraping', files: [] },
  { id: 'vault',    x: 40,  y: 370, w: 150, h: 85,  name: 'VAULT',       sub: 'obsidian / memory',   files: [] },
  { id: 'files',    x: 710, y: 40,  w: 150, h: 85,  name: 'FILE OPS',    sub: 'read / write / exec', files: [] },
  { id: 'comms',    x: 710, y: 195, w: 150, h: 85,  name: 'COMMS',       sub: 'telegram / discord',  files: [] },
  { id: 'analysis', x: 710, y: 370, w: 150, h: 85,  name: 'ANALYSIS',    sub: 'data / metrics',      files: [] },
]

const ROOM_COLOR_VARS: Record<string, string> = {
  dock: '--cbright',
  project: '--purple',
  web: '--teal',
  vault: '--c',
  files: '--amber',
  comms: '--green',
  analysis: '--cwhite',
}

type AgentSim = Pick<Agent, 'id' | 'color' | 'room'> & {
  x: number
  y: number
  tx: number
  ty: number
  trail: Array<{ x: number; y: number }>
  phase: 'working' | 'reporting'
  timer: number
  spinAngle: number
  driftT: number
}

const AGENT_DEFS: Array<{ id: AgentId; colorVar: string; startRoom: string }> = [
  { id: 'cc', colorVar: '--agent-cc', startRoom: 'project' },
  { id: 'cx', colorVar: '--agent-cx', startRoom: 'analysis' },
  { id: 'oc', colorVar: '--agent-oc', startRoom: 'files' },
]

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const roomCenter = (room: Room) => ({
  x: room.x + room.w / 2,
  y: room.y + room.h / 2,
})

const getCssColor = (style: CSSStyleDeclaration, variable: string) =>
  style.getPropertyValue(variable).trim()

const loadRooms = (): Room[] => {
  if (typeof window === 'undefined') return ROOMS.map(room => ({ ...room }))

  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (!saved) return ROOMS.map(room => ({ ...room }))

  try {
    const positions = JSON.parse(saved) as Record<string, { x?: number; y?: number }>

    return ROOMS.map(room => ({
      ...room,
      x: positions[room.id]?.x ?? room.x,
      y: positions[room.id]?.y ?? room.y,
    }))
  } catch {
    return ROOMS.map(room => ({ ...room }))
  }
}

const persistRooms = (rooms: Room[]) => {
  if (typeof window === 'undefined') return

  const positions = Object.fromEntries(
    rooms.map(room => [room.id, { x: room.x, y: room.y }]),
  )
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(positions))
}

type DragState = {
  room: Room
  x: number
  y: number
}

type ResolvedRoomColors = Record<string, { fill: string; border: string; text: string }>

export const ShipMap = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const agentsRef = useRef<AgentSim[]>([])
  const roomsRef = useRef<Room[]>(loadRooms())
  const roomColorsRef = useRef<ResolvedRoomColors>({})
  const corridorColorsRef = useRef({ primary: '', secondary: '', ring: '', label: '' })
  const tickRef = useRef(0)
  const selectedRef = useRef<string | null>(null)
  const draggingRef = useRef<DragState | null>(null)
  const dragMovedRef = useRef(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT

    const style = window.getComputedStyle(document.documentElement)
    roomColorsRef.current = Object.fromEntries(
      Object.entries(ROOM_COLOR_VARS).map(([id, variable]) => {
        const color = getCssColor(style, variable)
        return [id, {
          fill: hexToRgba(color, 0.08),
          border: hexToRgba(color, 0.32),
          text: hexToRgba(color, 0.92),
        }]
      }),
    )
    corridorColorsRef.current = {
      primary: hexToRgba(getCssColor(style, '--cbright'), 0.08),
      secondary: hexToRgba(getCssColor(style, '--cbright'), 0.04),
      ring: hexToRgba(getCssColor(style, '--cbright'), 0.18),
      label: hexToRgba(getCssColor(style, '--cbright'), 0.28),
    }

    agentsRef.current = AGENT_DEFS.map(def => {
      const room = roomsRef.current.find(candidate => candidate.id === def.startRoom)!
      const center = roomCenter(room)
      return {
        id: def.id,
        color: getCssColor(style, def.colorVar),
        room: def.startRoom,
        x: center.x,
        y: center.y,
        tx: center.x,
        ty: center.y,
        trail: [],
        phase: 'working' as const,
        timer: rand(70, 190),
        spinAngle: 0,
        driftT: Math.random() * Math.PI * 2,
      }
    })

    const frame = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) { rafRef.current = requestAnimationFrame(frame); return }

      const tick = tickRef.current++
      const rooms = roomsRef.current
      const dock = rooms.find(room => room.id === 'dock')!
      const roomColors = roomColorsRef.current
      const corridorColors = corridorColorsRef.current

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const dockCenter = roomCenter(dock)

      for (const room of rooms) {
        if (room.isHub) continue
        const center = roomCenter(room)
        const dx = dockCenter.x - center.x
        const dy = dockCenter.y - center.y
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const nx = -dy / len
        const ny = dx / len
        const off = 3.5

        ctx.setLineDash([])
        ctx.lineWidth = 1
        ctx.strokeStyle = corridorColors.primary

        ctx.beginPath()
        ctx.moveTo(center.x + nx * off, center.y + ny * off)
        ctx.lineTo(dockCenter.x + nx * off, dockCenter.y + ny * off)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(center.x - nx * off, center.y - ny * off)
        ctx.lineTo(dockCenter.x - nx * off, dockCenter.y - ny * off)
        ctx.stroke()

        ctx.lineWidth = 0.5
        ctx.strokeStyle = corridorColors.secondary
        ctx.beginPath()
        ctx.moveTo(center.x, center.y)
        ctx.lineTo(dockCenter.x, dockCenter.y)
        ctx.stroke()
      }

      for (const room of rooms) {
        const col = roomColors[room.id]
        const rx = room.x
        const ry = room.y
        const rw = room.w
        const rh = room.h
        const cx = rx + rw / 2
        const cy = ry + rh / 2
        const isSelected = selectedRef.current === room.id

        ctx.fillStyle = col.fill
        ctx.fillRect(rx, ry, rw, rh)

        ctx.setLineDash([])
        ctx.strokeStyle = isSelected ? hexToRgba(getCssColor(style, ROOM_COLOR_VARS[room.id]), 0.85) : col.border
        ctx.lineWidth = isSelected ? 1.5 : 0.8
        ctx.strokeRect(rx, ry, rw, rh)

        if (room.isHub) {
          ctx.save()
          ctx.translate(cx, cy)
          ctx.rotate(tick * 0.005)
          ctx.setLineDash([3, 6])
          ctx.strokeStyle = corridorColors.ring
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.arc(0, 0, Math.min(rw, rh) * 0.44, 0, Math.PI * 2)
          ctx.stroke()
          ctx.restore()
        }

        ctx.setLineDash([])
        const roomFiles = room.files ?? []
        const hasFiles = roomFiles.length > 0 && !room.isHub
        const nameY = hasFiles ? cy - rh * 0.14 : cy + (room.isHub ? -4 : 0)

        ctx.font = '600 7.5px Inter'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = room.isHub ? col.text : col.border
        ctx.fillText(room.name, cx, nameY)

        ctx.font = '400 6.5px Inter'
        ctx.fillStyle = corridorColors.label
        ctx.fillText(room.sub, cx, nameY + 11)

        if (hasFiles) {
          const modW = Math.min(26, (rw - 10) / roomFiles.length - 2)
          const modH = 10
          const gap = 2
          const totalW = roomFiles.length * modW + (roomFiles.length - 1) * gap
          let mx = cx - totalW / 2
          const my = ry + rh - modH - 5
          const hasAgent = agentsRef.current.some(
            a => a.room === room.id && a.phase === 'working',
          )

          for (const file of roomFiles) {
            ctx.fillStyle = hasAgent ? hexToRgba(getCssColor(style, ROOM_COLOR_VARS[room.id]), 0.15) : hexToRgba(getCssColor(style, ROOM_COLOR_VARS[room.id]), 0.05)
            ctx.fillRect(mx, my, modW, modH)
            ctx.strokeStyle = hexToRgba(getCssColor(style, ROOM_COLOR_VARS[room.id]), 0.35)
            ctx.lineWidth = 0.3
            ctx.strokeRect(mx, my, modW, modH)

            ctx.fillStyle = hexToRgba(getCssColor(style, ROOM_COLOR_VARS[room.id]), 0.75)
            ctx.font = '400 5px Inter'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            const label = file.length > 7 ? file.slice(0, 6) + '…' : file
            ctx.fillText(label, mx + modW / 2, my + modH / 2)
            mx += modW + gap
          }
        }
      }

      const nonHubRooms = rooms.filter(room => !room.isHub)

      for (const agent of agentsRef.current) {
        agent.timer--
        if (agent.timer <= 0) {
          if (agent.phase === 'working') {
            const dockPoint = roomCenter(dock)
            agent.tx = dockPoint.x
            agent.ty = dockPoint.y
            agent.phase = 'reporting'
            agent.timer = rand(45, 70)
          } else {
            const others = nonHubRooms.filter(room => room.id !== agent.room)
            const newRoom = others[Math.floor(Math.random() * others.length)]
            const center = roomCenter(newRoom)
            agent.room = newRoom.id
            agent.tx = center.x
            agent.ty = center.y
            agent.phase = 'working'
            agent.timer = rand(70, 190)
          }
        }

        if (agent.phase === 'working') {
          agent.driftT += 0.018
          const room = rooms.find(candidate => candidate.id === agent.room)!
          const center = roomCenter(room)
          agent.tx = center.x + Math.sin(agent.driftT) * 12
          agent.ty = center.y + Math.cos(agent.driftT * 0.73) * 7
        }

        agent.trail.push({ x: agent.x, y: agent.y })
        if (agent.trail.length > 14) agent.trail.shift()

        agent.x += (agent.tx - agent.x) * 0.07
        agent.y += (agent.ty - agent.y) * 0.07
        agent.spinAngle += 0.08

        const ax = agent.x
        const ay = agent.y

        for (let i = 0; i < agent.trail.length; i++) {
          const p = agent.trail[i]
          const alpha = (i / agent.trail.length) * 0.35
          ctx.beginPath()
          ctx.arc(p.x, p.y, 1, 0, Math.PI * 2)
          ctx.fillStyle = hexToRgba(agent.color, alpha)
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(ax, ay, 4.5, 0, Math.PI * 2)
        ctx.fillStyle = agent.color
        ctx.fill()

        if (agent.phase === 'working') {
          ctx.beginPath()
          ctx.arc(ax, ay, 7.5, agent.spinAngle, agent.spinAngle + Math.PI * 0.65)
          ctx.strokeStyle = agent.color
          ctx.lineWidth   = 1.2
          ctx.setLineDash([])
          ctx.stroke()
        }

        ctx.font = '600 6px Inter'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = agent.color
        ctx.fillText(agent.id.toUpperCase(), ax, ay - 10)
      }

      if (tick % 30 === 0 && overlayRef.current) {
        const sel = selectedRef.current
        if (sel) {
          const selRoom = rooms.find(room => room.id === sel)
          if (selRoom) {
            const active = agentsRef.current
              .filter(a => a.room === sel && a.phase === 'working')
              .map(a => a.id.toUpperCase())
            overlayRef.current.textContent =
              selRoom.name + (active.length > 0 ? ' · ' + active.join(' ') : '')
            overlayRef.current.style.display = 'block'
          }
        } else {
          overlayRef.current.style.display = 'none'
        }
      }

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const getPointerPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const getRoomAtPoint = (x: number, y: number) => (
    [...roomsRef.current].reverse().find(room => (
      x >= room.x &&
      x <= room.x + room.w &&
      y >= room.y &&
      y <= room.y + room.h
    )) ?? null
  )

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getPointerPosition(e)
    const canvas = canvasRef.current
    if (!point) return

    const hit = getRoomAtPoint(point.x, point.y)
    draggingRef.current = hit ? { room: hit, x: point.x, y: point.y } : null
    dragMovedRef.current = false

    if (canvas) {
      canvas.style.cursor = hit ? 'grabbing' : 'pointer'
    }

    if (!hit && overlayRef.current) {
      selectedRef.current = null
      overlayRef.current.style.display = 'none'
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getPointerPosition(e)
    const drag = draggingRef.current
    if (!point || !drag) return

    const dx = point.x - drag.x
    const dy = point.y - drag.y
    if (dx === 0 && dy === 0) return

    drag.room.x += dx
    drag.room.y += dy
    drag.x = point.x
    drag.y = point.y
    dragMovedRef.current = true
    persistRooms(roomsRef.current)
  }

  const handleMouseUp = () => {
    const canvas = canvasRef.current
    draggingRef.current = null
    if (canvas) {
      canvas.style.cursor = 'pointer'
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragMovedRef.current) {
      dragMovedRef.current = false
      return
    }

    const point = getPointerPosition(e)
    if (!point) return

    const hit = getRoomAtPoint(point.x, point.y)
    selectedRef.current = hit && selectedRef.current === hit.id ? null : hit?.id ?? null

    if (!selectedRef.current && overlayRef.current) {
      overlayRef.current.style.display = 'none'
    }
  }

  return (
    <div ref={containerRef} style={{
      flex: 1,
      width: '100%',
      minHeight: 0,
      position: 'relative',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        style={{
          display: 'block',
          cursor: 'pointer',
        }}
      />
      <div ref={overlayRef} style={{
        position: 'absolute', bottom: 4, left: 6,
        fontSize: 8, color: 'var(--teal)',
        fontFamily: 'Inter', letterSpacing: '0.3px',
        pointerEvents: 'none', display: 'none',
      }} />
    </div>
  )
}
