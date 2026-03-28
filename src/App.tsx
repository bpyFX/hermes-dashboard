import { Topbar } from './components/Topbar'
import { Sidebar } from './components/Sidebar'
import { Fishtank } from './components/Fishtank'
import { ShipMap } from './components/ShipMap'
import { CommsLog } from './components/CommsLog'
import { InputBar } from './components/InputBar'
import { TracePanel } from './components/TracePanel'

function App() {
  return (
    <div className="app-shell">
      <div className="app-topbar">
        <Topbar />
      </div>
      <div className="app-body">
        <div className="app-sidebar">
          <Sidebar />
        </div>
        <div className="app-center">
          <div className="app-fishtank">
            <Fishtank />
          </div>
          <div className="app-shipmap">
            <ShipMap />
          </div>
          <div className="app-commslog">
            <CommsLog />
          </div>
          <div className="app-inputbar">
            <InputBar />
          </div>
        </div>
        <div className="app-tracepanel">
          <TracePanel />
        </div>
      </div>
    </div>
  )
}

export default App
