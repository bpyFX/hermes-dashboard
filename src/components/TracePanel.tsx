import type { TraceEntry } from '../types/index'

const SAMPLE_TRACES: TraceEntry[] = [
  { id:'t1',  type:'info',    content:'Session initialized · agent HERMES-1 online',              timestamp: Date.now()-92000 },
  { id:'t2',  type:'think',   content:'Analyzing task: implement authentication module',           timestamp: Date.now()-87000 },
  { id:'t3',  type:'tool',    content:'read_file("src/auth/handler.ts")',                          timestamp: Date.now()-82000 },
  { id:'t4',  type:'result',  content:'File read · 142 lines · exports: handleLogin, handleLogout',timestamp: Date.now()-81000 },
  { id:'t5',  type:'think',   content:'Handler missing token refresh logic · need middleware',     timestamp: Date.now()-75000 },
  { id:'t6',  type:'tool',    content:'delegate_task("CC", "add refresh token middleware")',       timestamp: Date.now()-70000 },
  { id:'t7',  type:'result',  content:'Agent CC accepted · ETA 12 steps',                         timestamp: Date.now()-69000 },
  { id:'t8',  type:'tool',    content:'write_file("src/auth/refresh.ts", <67 lines>)',             timestamp: Date.now()-41000 },
  { id:'t9',  type:'result',  content:'File written · 67 lines · no TypeScript errors',           timestamp: Date.now()-40000 },
  { id:'t10', type:'running', content:'run_tests("src/auth/**")',                                  timestamp: Date.now()-5000  },
]

const TYPE_COLOR: Record<TraceEntry['type'], string> = {
  tool:    'var(--purple)',
  think:   'var(--amber)',
  result:  'var(--green)',
  running: 'var(--teal)',
  info:    'var(--cvdim)',
}

const TYPE_LABEL: Record<TraceEntry['type'], string> = {
  tool:    'TOOL',
  think:   'THINK',
  result:  'RESULT',
  running: 'RUN',
  info:    'INFO',
}

const TABS = ['TRACE', 'MEMORY', 'CONFIG']

const STAT_CARDS = [
  { label:'TASKS',   value:'18',    color:'var(--green)'  },
  { label:'RUNNING', value:'3',     color:'var(--amber)'  },
  { label:'TOKENS',  value:'142K',  color:'var(--teal)'   },
  { label:'COST',    value:'$1.24', color:'var(--cbright)'},
] as const

const RESOURCE_BARS = [
  { label:'VRAM', pct:79, fill:'var(--amber)' },
  { label:'RAM',  pct:44, fill:'var(--teal)'  },
  { label:'CPU',  pct:21, fill:'var(--green)' },
  { label:'CTX',  pct:12, fill:'#4a7dd4'      },
] as const

export const TracePanel = () => (
  <div style={{
    height: '100%',
    background: 'var(--bg2)',
    borderLeft: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
  }}>
    <style>{`
      @keyframes tp-cursor {
        0%,100% { opacity:1; }
        50%     { opacity:0; }
      }
    `}</style>

    {/* Tab bar */}
    <div style={{ display:'flex', borderBottom:'1px solid var(--border)', padding:'0 6px', flexShrink:0 }}>
      {TABS.map((tab, i) => (
        <div key={tab} style={{
          padding: '7px 10px',
          fontSize: 8,
          fontWeight: 600,
          letterSpacing: '0.5px',
          color:      i === 0 ? 'var(--cbright)' : 'var(--cvdim)',
          background: i === 0 ? 'rgba(155,143,212,0.08)' : 'transparent',
          cursor: 'pointer',
        }}>
          {tab}
        </div>
      ))}
    </div>

    {/* Trace log */}
    <div style={{ flex:1, overflowY:'auto', padding:'4px 0' }}>
      {SAMPLE_TRACES.map(entry => {
        const color = TYPE_COLOR[entry.type]
        const label = TYPE_LABEL[entry.type]

        // Split tool calls at first '(' for dimmed args rendering
        const parenIdx = entry.content.indexOf('(')
        const hasArgs   = entry.type === 'tool' && parenIdx !== -1
        const fnName    = hasArgs ? entry.content.slice(0, parenIdx) : entry.content
        const args      = hasArgs ? entry.content.slice(parenIdx + 1, -1) : ''

        return (
          <div key={entry.id} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 6,
            padding: '3px 8px 3px 7px',
            borderLeft: `1px solid ${color}`,
            marginLeft: 6,
            marginBottom: 2,
          }}>
            <span style={{ fontSize:7, fontWeight:600, color, minWidth:32, flexShrink:0, paddingTop:1 }}>
              {label}
            </span>
            <span style={{ fontSize:8, color:'var(--cdim)', lineHeight:'1.4', wordBreak:'break-all' }}>
              {hasArgs ? (
                <>
                  {fnName}
                  <span style={{ color:'var(--cvdim)' }}>({args})</span>
                </>
              ) : fnName}
              {entry.type === 'running' && (
                <span style={{ color:'var(--teal)', marginLeft:2, animation:'tp-cursor 1s step-end infinite' }}>
                  █
                </span>
              )}
            </span>
          </div>
        )
      })}
    </div>

    {/* Metrics panel */}
    <div style={{ borderTop:'1px solid var(--border)', padding:8, flexShrink:0 }}>
      {/* 2×2 stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4, marginBottom:8 }}>
        {STAT_CARDS.map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 2,
            padding: '4px 6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize:7, color:'var(--cvdim)', fontWeight:600 }}>{label}</span>
            <span style={{ fontSize:9, color, fontWeight:600 }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Resource bars */}
      {RESOURCE_BARS.map(({ label, pct, fill }) => (
        <div key={label} style={{ marginBottom:4 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
            <span style={{ fontSize:7, color:'var(--cvdim)' }}>{label}</span>
            <span style={{ fontSize:7, color:'var(--cvdim)' }}>{pct}%</span>
          </div>
          <div style={{ height:2, background:'var(--border)', borderRadius:1 }}>
            <div style={{ height:'100%', width:`${pct}%`, background:fill, borderRadius:1 }} />
          </div>
        </div>
      ))}
    </div>
  </div>
)
