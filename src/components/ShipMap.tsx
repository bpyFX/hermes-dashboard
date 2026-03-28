import { useRef, useEffect } from 'react'
import type { Room, Agent, AgentId } from '../types/index'

// ─── Room data ───────────────────────────────────────────────────────────────

const ROOMS: Room[] = [
  { id:'bridge',     x:220, y:170, w:160, h:120, name:'HERMES',     sub:'bridge/',         files:[],                                       isHub:true },
  { id:'components', x:50,  y:120, w:130, h:90,  name:'COMPONENTS', sub:'src/components/', files:['Topbar','Sidebar','Fishtank','ShipMap']             },
  { id:'types',      x:50,  y:250, w:130, h:70,  name:'TYPES',      sub:'src/types/',      files:['index.ts']                                          },
  { id:'config',     x:420, y:120, w:130, h:70,  name:'CONFIG',     sub:'*.config.ts',     files:['vite','tsconfig']                                   },
  { id:'assets',     x:420, y:230, w:130, h:70,  name:'ASSETS',     sub:'public/',         files:['favicon']                                           },
  { id:'root',       x:210, y:330, w:180, h:70,  name:'ROOT',       sub:'package.json',    files:['package.json','index.html']                         },
]

const ROOM_COLORS: Record<string, { fill: string; border: string }> = {
  bridge:     { fill: 'rgba(168,212,236,0.06)', border: 'rgba(168,212,236,0.4)' },
  components: { fill: 'rgba(155,143,212,0.06)', border: 'rgba(155,143,212,0.3)' },
  types:      { fill: 'rgba(93,187,122,0.06)',  border: 'rgba(93,187,122,0.3)'  },
  config:     { fill: 'rgba(240,165,0,0.06)',   border: 'rgba(240,165,0,0.3)'   },
  assets:     { fill: 'rgba(78,205,196,0.06)',  border: 'rgba(78,205,196,0.3)'  },
  root:       { fill: 'rgba(127,184,216,0.04)', border: 'rgba(127,184,216,0.2)' },
}

// ─── Agent sim types ─────────────────────────────────────────────────────────
// Extends the canonical Agent base type with canvas-simulation state.

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

const AGENT_DEFS: Array<{ id: AgentId; color: string; startRoom: string }> = [
  { id: 'cc', color: '#9b8fd4', startRoom: 'components' },
  { id: 'cx', color: '#5dbb7a', startRoom: 'types'      },
  { id: 'oc', color: '#f0a500', startRoom: 'config'     },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

/** Swap the alpha component of an rgba() string */
const withAlpha = (rgba: string, alpha: number) =>
  rgba.replace(/[\d.]+\)$/, `${alpha})`)

// ─── Component ───────────────────────────────────────────────────────────────

export const ShipMap = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const overlayRef   = useRef<HTMLDivElement>(null)
  const agentsRef    = useRef<AgentSim[]>([])
  const tickRef      = useRef(0)
  const selectedRef  = useRef<string | null>(null)
  const rafRef       = useRef<number>(0)

  useEffect(() => {
    const canvas    = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    // ── Resize observer ───────────────────────────────────────────────────
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const w   = container.clientWidth
      const h   = container.clientHeight
      canvas.width  = w * dpr
      canvas.height = h * dpr
      canvas.style.width  = w + 'px'
      canvas.style.height = h + 'px'
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    // ── Init agents ───────────────────────────────────────────────────────
    const bridge = ROOMS.find(r => r.id === 'bridge')!
    agentsRef.current = AGENT_DEFS.map(def => {
      const room = ROOMS.find(r => r.id === def.startRoom)!
      const c    = roomCenter(room)
      return {
        id: def.id, color: def.color, room: def.startRoom,
        x: c.x, y: c.y, tx: c.x, ty: c.y,
        trail: [],
        phase: 'working' as const,
        timer: rand(70, 190),
        spinAngle: 0,
        driftT: Math.random() * Math.PI * 2,
      }
    })

    // ── Draw loop ─────────────────────────────────────────────────────────
    const frame = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) { rafRef.current = requestAnimationFrame(frame); return }

      const dpr     = window.devicePixelRatio || 1
      const W       = canvas.width
      const H       = canvas.height
      const offsetX = (W / dpr - 600) / 2
      const offsetY = (H / dpr - 460) / 2
      const tick    = tickRef.current++

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W / dpr, H / dpr)

      // ── Corridors ──────────────────────────────────────────────────────
      const bc  = roomCenter(bridge)
      const bcx = bc.x + offsetX
      const bcy = bc.y + offsetY

      for (const room of ROOMS) {
        if (room.isHub) continue
        const rc  = roomCenter(room)
        const rcx = rc.x + offsetX
        const rcy = rc.y + offsetY
        const dx  = bcx - rcx
        const dy  = bcy - rcy
        const len = Math.sqrt(dx * dx + dy * dy)
        const nx  = -dy / len
        const ny  =  dx / len
        const off = 3.5

        ctx.setLineDash([])
        ctx.lineWidth   = 1
        ctx.strokeStyle = 'rgba(127,184,216,0.07)'

        ctx.beginPath()
        ctx.moveTo(rcx + nx * off, rcy + ny * off)
        ctx.lineTo(bcx + nx * off, bcy + ny * off)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(rcx - nx * off, rcy - ny * off)
        ctx.lineTo(bcx - nx * off, bcy - ny * off)
        ctx.stroke()

        ctx.lineWidth   = 0.5
        ctx.strokeStyle = 'rgba(127,184,216,0.03)'
        ctx.beginPath()
        ctx.moveTo(rcx, rcy)
        ctx.lineTo(bcx, bcy)
        ctx.stroke()
      }

      // ── Rooms ──────────────────────────────────────────────────────────
      for (const room of ROOMS) {
        const col        = ROOM_COLORS[room.id]
        const rx         = room.x + offsetX
        const ry         = room.y + offsetY
        const rw         = room.w
        const rh         = room.h
        const cx         = rx + rw / 2
        const cy         = ry + rh / 2
        const isSelected = selectedRef.current === room.id

        // Fill
        ctx.fillStyle = col.fill
        ctx.fillRect(rx, ry, rw, rh)

        // Border
        ctx.setLineDash([])
        ctx.strokeStyle = isSelected ? withAlpha(col.border, 0.85) : col.border
        ctx.lineWidth   = isSelected ? 1.5 : 0.8
        ctx.strokeRect(rx, ry, rw, rh)

        // Hub animated orbit ring
        if (room.isHub) {
          ctx.save()
          ctx.translate(cx, cy)
          ctx.rotate(tick * 0.005)
          ctx.setLineDash([3, 6])
          ctx.strokeStyle = 'rgba(168,212,236,0.2)'
          ctx.lineWidth   = 0.8
          ctx.beginPath()
          ctx.arc(0, 0, Math.min(rw, rh) * 0.44, 0, Math.PI * 2)
          ctx.stroke()
          ctx.restore()
        }

        // Room name
        ctx.setLineDash([])
        const hasFiles = room.files.length > 0 && !room.isHub
        const nameY    = hasFiles ? cy - rh * 0.14 : cy + (room.isHub ? -4 : 0)

        ctx.font         = '600 7.5px Inter'
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle    = room.isHub ? 'rgba(168,212,236,1)' : col.border
        ctx.fillText(room.name, cx, nameY)

        // Room sub-label
        ctx.font      = '400 6.5px Inter'
        ctx.fillStyle = 'rgba(127,184,216,0.25)'
        ctx.fillText(room.sub, cx, nameY + 11)

        // File modules
        if (hasFiles) {
          const modW    = Math.min(26, (rw - 10) / room.files.length - 2)
          const modH    = 10
          const gap     = 2
          const totalW  = room.files.length * modW + (room.files.length - 1) * gap
          let   mx      = cx - totalW / 2
          const my      = ry + rh - modH - 5
          const hasAgent = agentsRef.current.some(
            a => a.room === room.id && a.phase === 'working',
          )

          for (const file of room.files) {
            ctx.fillStyle   = hasAgent ? withAlpha(col.border, 0.15) : withAlpha(col.border, 0.05)
            ctx.fillRect(mx, my, modW, modH)
            ctx.strokeStyle = withAlpha(col.border, 0.35)
            ctx.lineWidth   = 0.3
            ctx.strokeRect(mx, my, modW, modH)

            ctx.fillStyle    = withAlpha(col.border, 0.75)
            ctx.font         = '400 5px Inter'
            ctx.textAlign    = 'center'
            ctx.textBaseline = 'middle'
            const label = file.length > 7 ? file.slice(0, 6) + '…' : file
            ctx.fillText(label, mx + modW / 2, my + modH / 2)
            mx += modW + gap
          }
        }
      }

      // ── Agents ─────────────────────────────────────────────────────────
      const nonHubRooms = ROOMS.filter(r => !r.isHub)

      for (const agent of agentsRef.current) {
        // Timer & phase transitions
        agent.timer--
        if (agent.timer <= 0) {
          if (agent.phase === 'working') {
            const bc2   = roomCenter(bridge)
            agent.tx    = bc2.x
            agent.ty    = bc2.y
            agent.phase = 'reporting'
            agent.timer = rand(45, 70)
          } else {
            const others  = nonHubRooms.filter(r => r.id !== agent.room)
            const newRoom = others[Math.floor(Math.random() * others.length)]
            const nc      = roomCenter(newRoom)
            agent.room  = newRoom.id
            agent.tx    = nc.x
            agent.ty    = nc.y
            agent.phase = 'working'
            agent.timer = rand(70, 190)
          }
        }

        // Idle drift while working
        if (agent.phase === 'working') {
          agent.driftT += 0.018
          const wRoom = ROOMS.find(r => r.id === agent.room)!
          const rc    = roomCenter(wRoom)
          agent.tx = rc.x + Math.sin(agent.driftT) * 12
          agent.ty = rc.y + Math.cos(agent.driftT * 0.73) * 7
        }

        // Push to trail before lerp
        agent.trail.push({ x: agent.x + offsetX, y: agent.y + offsetY })
        if (agent.trail.length > 14) agent.trail.shift()

        // Smooth lerp
        agent.x += (agent.tx - agent.x) * 0.07
        agent.y += (agent.ty - agent.y) * 0.07
        agent.spinAngle += 0.08

        const ax = agent.x + offsetX
        const ay = agent.y + offsetY

        // Trail dots
        for (let i = 0; i < agent.trail.length; i++) {
          const p     = agent.trail[i]
          const alpha = (i / agent.trail.length) * 0.35
          ctx.beginPath()
          ctx.arc(p.x, p.y, 1, 0, Math.PI * 2)
          ctx.fillStyle = hexToRgba(agent.color, alpha)
          ctx.fill()
        }

        // Agent body circle
        ctx.beginPath()
        ctx.arc(ax, ay, 4.5, 0, Math.PI * 2)
        ctx.fillStyle = agent.color
        ctx.fill()

        // Working-state arc spinner
        if (agent.phase === 'working') {
          ctx.beginPath()
          ctx.arc(ax, ay, 7.5, agent.spinAngle, agent.spinAngle + Math.PI * 0.65)
          ctx.strokeStyle = agent.color
          ctx.lineWidth   = 1.2
          ctx.setLineDash([])
          ctx.stroke()
        }

        // Agent label
        ctx.font         = '600 6px Inter'
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle    = agent.color
        ctx.fillText(agent.id.toUpperCase(), ax, ay - 10)
      }

      // ── Overlay (updated every 30 frames) ──────────────────────────────
      if (tick % 30 === 0 && overlayRef.current) {
        const sel = selectedRef.current
        if (sel) {
          const selRoom = ROOMS.find(r => r.id === sel)
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
      ro.disconnect()
    }
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect    = canvas.getBoundingClientRect()
    const mx      = e.clientX - rect.left
    const my      = e.clientY - rect.top
    const offsetX = (rect.width  - 600) / 2
    const offsetY = (rect.height - 460) / 2

    let hit: string | null = null
    for (const room of ROOMS) {
      if (
        mx >= room.x + offsetX && mx <= room.x + room.w + offsetX &&
        my >= room.y + offsetY && my <= room.y + room.h + offsetY
      ) { hit = room.id; break }
    }

    selectedRef.current = hit === selectedRef.current ? null : hit

    // Hide overlay immediately on deselect
    if (!selectedRef.current && overlayRef.current) {
      overlayRef.current.style.display = 'none'
    }
  }

  return (
    <div ref={containerRef} style={{
      flex: 1, minHeight: 0, position: 'relative',
      background: 'var(--bg)', overflow: 'hidden',
    }}>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{ display: 'block', cursor: 'pointer' }}
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
