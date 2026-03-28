const rows = [
  {
    speaker: 'SYS',
    speakerColor: 'var(--cvdim)',
    message: (
      <>
        Session init. 3 agents online. Ollama OK.
      </>
    ),
    timestamp: '14:30',
  },
  {
    speaker: 'YOU',
    speakerColor: 'var(--teal)',
    message: (
      <>
        Build hermes-dashboard {'\u2014'} start with layout skeleton.
      </>
    ),
    timestamp: '14:30',
  },
  {
    speaker: 'HERMES',
    speakerColor: 'var(--cbright)',
    message: (
      <>
        Delegating scaffold to CC. I will audit.
      </>
    ),
    timestamp: '14:30',
  },
  {
    speaker: 'CC',
    speakerColor: 'var(--purple)',
    message: (
      <>
        Scaffold done. 14 files. <span className="comms-log__accent">npm run dev</span>{' '}
        passing.
      </>
    ),
    timestamp: '14:31',
  },
  {
    speaker: 'HERMES',
    speakerColor: 'var(--cbright)',
    message: (
      <>
        Audit OK. Dispatching OC to fishtank component.
      </>
    ),
    timestamp: '14:32',
  },
] as const

export const CommsLog = () => (
  <>
    <style>{`
      .comms-log {
        height: 130px;
        border-top: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      .comms-log__header {
        background: var(--bg2);
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 8px;
      }

      .comms-log__title {
        color: var(--cdim);
        font-size: 8px;
        font-weight: 600;
        line-height: 1.2;
      }

      .comms-log__status {
        color: var(--teal);
        font-size: 8px;
        font-weight: 600;
        line-height: 1.2;
      }

      .comms-log__body {
        padding: 4px 8px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1 1 auto;
        overflow: hidden;
        box-sizing: border-box;
      }

      .comms-log__row {
        display: grid;
        grid-template-columns: 46px minmax(0, 1fr) auto;
        align-items: start;
        gap: 6px;
      }

      .comms-log__speaker {
        font-size: 8px;
        font-weight: 600;
        line-height: 1.3;
      }

      .comms-log__message {
        color: var(--cdim);
        font-size: 9px;
        line-height: 1.3;
        min-width: 0;
      }

      .comms-log__timestamp {
        color: var(--cvvdim);
        font-size: 8px;
        line-height: 1.3;
      }

      .comms-log__accent {
        color: var(--cbright);
      }
    `}</style>
    <section className="comms-log" aria-label="Agent communications log">
      <header className="comms-log__header">
        <span className="comms-log__title">AGENT COMMS</span>
        <span className="comms-log__status">LIVE</span>
      </header>
      <div className="comms-log__body">
        {rows.map((row) => (
          <div className="comms-log__row" key={`${row.speaker}-${row.timestamp}`}>
            <span className="comms-log__speaker" style={{ color: row.speakerColor }}>
              {row.speaker}
            </span>
            <span className="comms-log__message">{row.message}</span>
            <span className="comms-log__timestamp">{row.timestamp}</span>
          </div>
        ))}
      </div>
    </section>
  </>
)
