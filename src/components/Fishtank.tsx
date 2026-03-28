const AGENT_ROWS = [
  { id: 'CC', color: 'var(--agent-cc)', pulse: true,  delay: '0s'    },
  { id: 'CX', color: 'var(--agent-cx)', pulse: true,  delay: '0.4s'  },
  { id: 'OC', color: 'var(--agent-oc)', pulse: false, delay: ''       },
  { id: 'GM', color: 'var(--agent-gm)', pulse: false, delay: ''       },
]

export const Fishtank = () => (
  <div style={{
    height: '132px',
    background: 'var(--fishtank-bg)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
  }}>
    <style>{`
      @keyframes ft-bob {
        0%,100% { transform: translateY(0px); }
        50%      { transform: translateY(-4px); }
      }
      @keyframes ft-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes ft-antenna {
        0%,100% { opacity:1; r:3; }
        50%     { opacity:0.25; }
      }
      @keyframes ft-led-p {
        0%,100% { opacity:1; }
        40%,60% { opacity:0.08; }
      }
      @keyframes ft-led-a {
        0%,100% { opacity:1; }
        20%,50% { opacity:0.08; }
      }
      @keyframes ft-led-g {
        0%,100% { opacity:1; }
        60%,80% { opacity:0.08; }
      }
      @keyframes ft-scanline {
        0%   { transform: translateY(-32px); }
        100% { transform: translateY(132px); }
      }
      @keyframes ft-pulse {
        0%,100% { opacity:1; transform:scale(1); }
        50%     { opacity:0.45; transform:scale(1.35); }
      }
    `}</style>

    {/* Dot grid overlay */}
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: 'var(--shipmap-dot-grid)',
      backgroundSize: '12px 12px',
    }} />

    {/* Scanline sweep */}
    <div style={{
      position: 'absolute', left: 0, right: 0, height: '32px', pointerEvents: 'none', zIndex: 2,
      background: 'linear-gradient(to bottom, transparent, var(--scanline-base), transparent)',
      animation: 'ft-scanline 7s linear infinite',
    }} />

    {/* Corner brackets — TL */}
    <div style={{ position:'absolute', top:6, left:6, width:10, height:10,
      borderTop:'1px solid var(--c)', borderLeft:'1px solid var(--c)', opacity:0.2, pointerEvents:'none' }} />
    {/* TR */}
    <div style={{ position:'absolute', top:6, right:6, width:10, height:10,
      borderTop:'1px solid var(--c)', borderRight:'1px solid var(--c)', opacity:0.2, pointerEvents:'none' }} />
    {/* BL */}
    <div style={{ position:'absolute', bottom:6, left:6, width:10, height:10,
      borderBottom:'1px solid var(--c)', borderLeft:'1px solid var(--c)', opacity:0.2, pointerEvents:'none' }} />
    {/* BR */}
    <div style={{ position:'absolute', bottom:6, right:6, width:10, height:10,
      borderBottom:'1px solid var(--c)', borderRight:'1px solid var(--c)', opacity:0.2, pointerEvents:'none' }} />

    {/* ── LEFT: CREW + TOOLS ─────────────────── */}
    <div style={{ width:90, padding:'10px 8px', display:'flex', flexDirection:'column', gap:2, flexShrink:0 }}>
      <div style={{ fontSize:7, fontWeight:600, color:'var(--cvdim)', letterSpacing:'0.6px', marginBottom:3 }}>CREW</div>

      {AGENT_ROWS.map(a => (
        <div key={a.id} style={{ display:'flex', alignItems:'center', gap:4 }}>
          <div style={{
            width:5, height:5, borderRadius:'50%', background: a.color, flexShrink:0,
            ...(a.pulse ? { animation:`ft-pulse 2s ease-in-out ${a.delay} infinite` } : {}),
          }} />
          <span style={{ fontSize:9, color:'var(--cdim)' }}>{a.id}</span>
        </div>
      ))}

      <div style={{ marginTop:6, fontSize:7, fontWeight:600, color:'var(--cvdim)', letterSpacing:'0.6px' }}>TOOLS</div>
      <div style={{ fontSize:8, color:'var(--teal)' }}>30 avail</div>
      <div style={{ fontSize:8, color:'var(--cdim)' }}>12 active</div>
    </div>

    {/* ── CENTER: Robot ──────────────────────── */}
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2 }}>
      <div style={{ animation:'ft-bob 3s ease-in-out infinite' }}>
        <svg viewBox="0 0 70 82" width="56" height="66" style={{ display:'block', overflow:'visible' }}>
          {/* Spinning orbit ring */}
          <g style={{ transformOrigin:'35px 44px', animation:'ft-spin 8s linear infinite' }}>
            <circle cx="35" cy="44" r="28" fill="none"
              stroke="var(--purple)" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.45" />
          </g>

          {/* Antenna stem */}
          <rect x="33" y="7" width="4" height="8" fill="var(--cvdim)" />
          {/* Antenna tip — pulsing */}
          <circle cx="35" cy="5" r="3" fill="var(--teal)"
            style={{ animation:'ft-antenna 1.4s ease-in-out infinite' }} />

          {/* Head */}
          <rect x="15" y="15" width="40" height="20" rx="2"
            fill="var(--bg2)" stroke="var(--c)" strokeWidth="0.8" />
          {/* Left eye */}
          <rect x="21" y="19" width="9" height="8" rx="1" fill="var(--cbright)" />
          {/* Right eye */}
          <rect x="40" y="19" width="9" height="8" rx="1" fill="var(--cbright)" />
          {/* Pixel mouth */}
          <rect x="24" y="30" width="3" height="2" fill="var(--cvdim)" />
          <rect x="29" y="31" width="4" height="1" fill="var(--cvdim)" />
          <rect x="35" y="31" width="4" height="1" fill="var(--cvdim)" />
          <rect x="41" y="30" width="3" height="2" fill="var(--cvdim)" />

          {/* Neck */}
          <rect x="30" y="35" width="10" height="4" fill="var(--bg2)" stroke="var(--c)" strokeWidth="0.5" />

          {/* Body */}
          <rect x="10" y="39" width="50" height="22" rx="2"
            fill="var(--bg2)" stroke="var(--c)" strokeWidth="0.8" />

          {/* Chest panel */}
          <rect x="18" y="43" width="34" height="13" rx="1"
            fill="var(--bg)" stroke="var(--cvdim)" strokeWidth="0.5" />
          {/* LED purple */}
          <circle cx="27" cy="49" r="3" fill="var(--purple)"
            style={{ animation:'ft-led-p 1.6s ease-in-out infinite' }} />
          {/* LED amber */}
          <circle cx="35" cy="49" r="3" fill="var(--amber)"
            style={{ animation:'ft-led-a 2.1s ease-in-out infinite' }} />
          {/* LED green */}
          <circle cx="43" cy="49" r="3" fill="var(--green)"
            style={{ animation:'ft-led-g 2.7s ease-in-out infinite' }} />

          {/* Left arm */}
          <rect x="2" y="41" width="8" height="14" rx="2"
            fill="var(--bg2)" stroke="var(--c)" strokeWidth="0.5" />
          {/* Right arm */}
          <rect x="60" y="41" width="8" height="14" rx="2"
            fill="var(--bg2)" stroke="var(--c)" strokeWidth="0.5" />

          {/* Left leg */}
          <rect x="17" y="61" width="13" height="14" rx="1"
            fill="var(--bg2)" stroke="var(--c)" strokeWidth="0.5" />
          {/* Right leg */}
          <rect x="40" y="61" width="13" height="14" rx="1"
            fill="var(--bg2)" stroke="var(--c)" strokeWidth="0.5" />
        </svg>
      </div>

      <div style={{ fontSize:7, color:'var(--cvdim)', letterSpacing:'1px' }}>HERMES-1</div>
      <div style={{ fontSize:7, color:'var(--amber)', letterSpacing:'0.5px' }}>[ WORKING... ]</div>
    </div>

    {/* ── RIGHT: SESSION ─────────────────────── */}
    <div style={{ width:100, padding:'10px 8px', display:'flex', flexDirection:'column', gap:2, flexShrink:0 }}>
      <div style={{ fontSize:7, fontWeight:600, color:'var(--cvdim)', letterSpacing:'0.6px', marginBottom:3 }}>SESSION</div>

      {([
        ['TOOLS',  '12',   'var(--cdim)'],
        ['STEPS',  '47',   'var(--cdim)'],
        ['TOKENS', '142K', 'var(--teal)'],
        ['TIME',   '4:23', 'var(--green)'],
        ['COST',   '$1.24','var(--amber)'],
      ] as const).map(([label, val, col]) => (
        <div key={label} style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:7, color:'var(--cvdim)' }}>{label}</span>
          <span style={{ fontSize:7, color: col }}>{val}</span>
        </div>
      ))}

      <div style={{ marginTop:6, fontSize:7, fontWeight:600, color:'var(--cvdim)', letterSpacing:'0.6px' }}>MODEL</div>
      <div style={{ fontSize:8, color:'var(--purple)', lineHeight:'1.3' }}>nemotron cascade-2</div>
    </div>
  </div>
)
