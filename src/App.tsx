import { Topbar } from './components/Topbar'
import { Sidebar } from './components/Sidebar'
import { Fishtank } from './components/Fishtank'
import { ShipMap } from './components/ShipMap'
import { CommsLog } from './components/CommsLog'
import { InputBar } from './components/InputBar'
import { TracePanel } from './components/TracePanel'

function App() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Topbar — full width */}
      <div style={{ flexShrink: 0, height: 26 }}>
        <Topbar />
      </div>

      {/* Main grid — 162px | 1fr | 224px */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '162px 1fr 224px',
        height: 660,
        overflow: 'hidden',
      }}>
        {/* Left: Sidebar */}
        <Sidebar />

        {/* Center: vertical stack */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flexShrink: 0, height: 132 }}>
            <Fishtank />
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ShipMap />
          </div>
          <div style={{ flexShrink: 0, height: 130 }}>
            <CommsLog />
          </div>
          <div style={{ flexShrink: 0, height: 44 }}>
            <InputBar />
          </div>
        </div>

        {/* Right: TracePanel */}
        <TracePanel />
      </div>
    </div>
  )
}

export default App
