import { useEffect } from 'react'
import { useHermes } from '../hooks/useHermes'

const metricCards = ({
  tasks,
  running,
  tokens,
  cost,
}: { tasks: number; running: string; tokens: string; cost: string }) => [
  { label: 'TASKS', value: String(tasks), color: 'var(--green)' },
  { label: 'RUNNING', value: running, color: 'var(--amber)' },
  { label: 'TOKENS', value: tokens, color: 'var(--teal)' },
  { label: 'COST', value: cost, color: 'var(--cbright)' },
] as const

const resourceBars = ({
  vram,
  ram,
  cpu,
}: { vram: number; ram: number; cpu: number }) => [
  { label: 'VRAM', value: vram, color: 'var(--purple)' },
  { label: 'RAM', value: ram, color: 'var(--teal)' },
  { label: 'CPU', value: cpu, color: 'var(--amber)' },
] as const

export const MetricsPanel = () => {
  const { metrics, session } = useHermes()

  useEffect(() => {
    const linkId = 'metrics-panel-vt323-font'

    if (document.getElementById(linkId)) {
      return
    }

    const link = document.createElement('link')
    link.id = linkId
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=VT323&display=swap'
    document.head.appendChild(link)
  }, [])

  return (
    <>
      <style>{`
        .metrics-panel {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .metrics-panel__grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 3px;
        }

        .metrics-panel__card {
          background: var(--bg);
          border: 1px solid var(--border);
          padding: 3px 5px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .metrics-panel__label,
        .metrics-panel__bar-label,
        .metrics-panel__bar-value {
          font-size: 7px;
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: 0.04em;
        }

        .metrics-panel__label,
        .metrics-panel__bar-label {
          color: var(--cvdim);
        }

        .metrics-panel__value {
          font-family: 'VT323', monospace;
          font-size: 13px;
          line-height: 1;
        }

        .metrics-panel__resources {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .metrics-panel__resource {
          display: grid;
          grid-template-columns: 26px 1fr 28px;
          align-items: center;
          gap: 5px;
        }

        .metrics-panel__bar-track {
          height: 6px;
          background: var(--bg);
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .metrics-panel__bar-fill {
          height: 100%;
        }

        .metrics-panel__bar-value {
          color: var(--cvvdim);
          text-align: right;
        }
      `}</style>
      <section className="metrics-panel" aria-label="Runtime metrics">
        <div className="metrics-panel__grid">
          {metricCards({
            tasks: session.tool_calls,
            running: '—',
            tokens: String(session.turns),
            cost: '—',
          }).map((metric) => (
            <article className="metrics-panel__card" key={metric.label}>
              <span className="metrics-panel__label">{metric.label}</span>
              <span className="metrics-panel__value" style={{ color: metric.color }}>
                {metric.value}
              </span>
            </article>
          ))}
        </div>

        <div className="metrics-panel__resources">
          {resourceBars({
            vram: metrics.vram,
            ram: metrics.ram,
            cpu: metrics.cpu,
          }).map((resource) => (
            <div className="metrics-panel__resource" key={resource.label}>
              <span className="metrics-panel__bar-label">{resource.label}</span>
              <div className="metrics-panel__bar-track" aria-hidden="true">
                <div
                  className="metrics-panel__bar-fill"
                  style={{
                    background: resource.color,
                    width: `${Math.max(0, Math.min(resource.value, 100))}%`,
                  }}
                />
              </div>
              <span className="metrics-panel__bar-value">{resource.value}%</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
