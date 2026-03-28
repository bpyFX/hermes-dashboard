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
      width: '100%',
      height: '100%',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ flexShrink: 0, height: 26 }}>
        <Topbar />
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '162px 1fr 224px',
        flex: 1,
        minHeight: 0,
        width: '100%',
        overflow: 'hidden',
      }}>
        <Sidebar />
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>
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
        <TracePanel />
      </div>
    </div>
  )
}

export default App
