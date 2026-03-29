import { useHermes } from '../hooks/useHermes'
import { useSessionStore } from '../store/sessionStore'

const sections = [
  {
    title: 'ACTIVE',
    rows: [
      {
        label: 'Dashboard build',
        dotClassName: 'pulse',
        dotColor: 'var(--cbright)',
        active: true,
      },
      {
        label: 'Auth refactor',
        dotColor: 'var(--amber)',
      },
    ],
  },
  {
    title: 'QUEUED',
    rows: [
      {
        label: 'Write API docs',
        dotColor: 'var(--cvdim)',
      },
      {
        label: 'Run test suite',
        dotColor: 'var(--cvdim)',
      },
    ],
  },
  {
    title: 'AGENTS',
    rows: [
      {
        label: 'CC',
        dotClassName: 'pulse',
        dotColor: 'var(--purple)',
        value: 'BUSY',
      },
      {
        label: 'CX',
        dotClassName: 'pulse',
        dotColor: 'var(--green)',
        value: 'BUSY',
      },
      {
        label: 'OC',
        dotColor: 'var(--amber)',
        value: 'BUSY',
      },
      {
        label: 'Gemini',
        dotColor: 'var(--red)',
        value: 'ERR',
      },
    ],
  },
] as const

const formatRelativeTime = (value: string) => {
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) {
    return 'unknown'
  }

  const diffMs = time - Date.now()
  const minuteMs = 60 * 1000
  const hourMs = 60 * minuteMs
  const dayMs = 24 * hourMs
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (Math.abs(diffMs) >= dayMs) {
    return rtf.format(Math.round(diffMs / dayMs), 'day')
  }

  if (Math.abs(diffMs) >= hourMs) {
    return rtf.format(Math.round(diffMs / hourMs), 'hour')
  }

  return rtf.format(Math.round(diffMs / minuteMs), 'minute')
}

export const Sidebar = () => {
  const { online, metrics } = useHermes()
  const { sessions } = useSessionStore()

  const recentSessions = [...sessions]
    .sort((left, right) => new Date(right.updated).getTime() - new Date(left.updated).getTime())
    .slice(0, 3)
    .map((session) => ({
      label: session.id,
      dotColor: 'var(--teal)',
      value: `${session.platform} · ${formatRelativeTime(session.updated)}`,
    }))

  const renderedSections = [
    ...sections,
    {
      title: 'SESSIONS',
      rows: recentSessions,
    },
    {
      title: 'SYSTEM',
      rows: [
        {
          label: 'Ollama',
          dotColor: online ? 'var(--green)' : 'var(--red)',
          value: online ? 'OK' : 'OFF',
        },
        {
          label: 'WSL2',
          dotColor: 'var(--green)',
          value: 'OK',
        },
        {
          label: 'GPU',
          dotColor: 'var(--amber)',
          value: `${metrics.gpu_util}%`,
        },
      ],
    },
  ]

  return (
    <>
    <style>{`
      .sidebar {
        width: 162px;
        background: var(--bg2);
        border-right: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .sidebar__section {
        display: flex;
        flex-direction: column;
      }

      .sidebar__header {
        padding: 3px 8px;
        background: var(--bg);
        border-bottom: 1px solid var(--border);
        color: var(--cvdim);
        font-size: 7px;
        font-weight: 600;
        letter-spacing: 0.08em;
        line-height: 1.3;
      }

      .sidebar__row {
        padding: 4px 8px;
        border-bottom: 1px solid var(--border-subtle);
        display: flex;
        align-items: center;
        gap: 5px;
        min-height: 19px;
        box-sizing: border-box;
        border-left: 1.5px solid transparent;
        transition: background 160ms ease;
      }

      .sidebar__row:hover {
        background: var(--border-subtle);
      }

      .sidebar__row--active {
        background: rgba(127, 184, 216, 0.07);
        border-left-color: var(--cbright);
      }

      .sidebar__dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        flex: 0 0 auto;
      }

      .sidebar__dot.pulse {
        animation: sidebar-dot-pulse 2s ease-in-out infinite;
      }

      .sidebar__label {
        color: var(--cdim);
        font-size: 9px;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1 1 auto;
      }

      .sidebar__value {
        color: var(--cvdim);
        font-size: 8px;
        line-height: 1;
        flex: 0 0 auto;
      }

      @keyframes sidebar-dot-pulse {
        0%,
        100% {
          opacity: 1;
        }

        50% {
          opacity: 0.3;
        }
      }
    `}</style>
    <aside className="sidebar" aria-label="Agent navigation">
      {renderedSections.map((section) => (
        <section className="sidebar__section" key={section.title}>
          <div className="sidebar__header">{section.title}</div>
          {section.rows.map((row) => (
            <div
              className={`sidebar__row${'active' in row && row.active ? ' sidebar__row--active' : ''}`}
              key={`${section.title}-${row.label}`}
            >
              <span
                aria-hidden="true"
                className={`sidebar__dot${'dotClassName' in row ? ` ${row.dotClassName}` : ''}`}
                style={{ background: row.dotColor }}
              />
              <span className="sidebar__label">{row.label}</span>
              {'value' in row ? <span className="sidebar__value">{row.value}</span> : null}
            </div>
          ))}
        </section>
      ))}
    </aside>
  </>
  )
}
