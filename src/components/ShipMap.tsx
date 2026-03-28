import { useEffect, useState } from 'react';
import type { Agent } from '../types/index';

const rooms = [
  { id: 'core', label: 'CORE', tooltip: 'CORE HUB', sub: 'src/', x: 220, y: 180, w: 160, h: 100, isHub: true },
  { id: 'components', label: 'COMPONENTS', tooltip: 'COMPONENTS', sub: 'src/components/', x: 60, y: 140, w: 120, h: 80, isHub: false },
  { id: 'types', label: 'TYPES', tooltip: 'TYPES', sub: 'src/types/', x: 60, y: 260, w: 120, h: 60, isHub: false },
  { id: 'config', label: 'CONFIG', tooltip: 'CONFIG', sub: '*.config.ts', x: 420, y: 140, w: 120, h: 60, isHub: false },
  { id: 'assets', label: 'ASSETS', tooltip: 'ASSETS', sub: 'public/', x: 420, y: 260, w: 120, h: 60, isHub: false },
  { id: 'root', label: 'ROOT', tooltip: 'ROOT', sub: 'package.json', x: 220, y: 340, w: 160, h: 60, isHub: false },
];

const roomIds = rooms.map((room) => room.id);

const roomCenter = (roomId: string) => {
  const room = rooms.find((entry) => entry.id === roomId);

  if (!room) {
    return { x: 0, y: 0 };
  }

  return {
    x: room.x + room.w / 2,
    y: room.y + room.h / 2,
  };
};

const nextRoomId = (currentRoom: string) => {
  const options = roomIds.filter((roomId) => roomId !== currentRoom);
  return options[Math.floor(Math.random() * options.length)] ?? currentRoom;
};

export const ShipMap = () => {
  const [agents, setAgents] = useState<Agent[]>([
    { id: 'cc', name: 'Codex', color: 'var(--c)', state: 'idle', room: 'components', file: 'src/components/', workTimer: 0 },
    { id: 'cx', name: 'Claude Code', color: 'var(--green)', state: 'idle', room: 'core', file: 'src/', workTimer: 0 },
    { id: 'oc', name: 'OpenCode', color: 'var(--amber)', state: 'idle', room: 'config', file: '*.config.ts', workTimer: 0 },
    { id: 'gm', name: 'OpenCode', color: 'var(--red)', state: 'idle', room: 'root', file: 'package.json', workTimer: 0 },
  ]);

  useEffect(() => {
    let timeoutId: number;

    const scheduleMove = () => {
      const delay = 4000 + Math.floor(Math.random() * 4001);

      timeoutId = window.setTimeout(() => {
        setAgents((current) =>
          current.map((agent) => ({
            ...agent,
            room: nextRoomId(agent.room),
            state: 'moving',
            workTimer: 0,
          })),
        );

        window.setTimeout(() => {
          setAgents((current) =>
            current.map((agent) => ({
              ...agent,
              state: 'idle',
            })),
          );
        }, 600);

        scheduleMove();
      }, delay);
    };

    scheduleMove();

    return () => window.clearTimeout(timeoutId);
  }, []);

  const hubCenter = roomCenter('core');

  return (
    <div
      style={{
        flex: 1,
        background: 'var(--bg)',
        overflow: 'hidden',
        position: 'relative',
        backgroundImage:
          'radial-gradient(circle, rgba(155,143,212,0.1) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes shipmap-corridor-dash {
              from { stroke-dashoffset: 0; }
              to { stroke-dashoffset: 16; }
            }

            @keyframes shipmap-agent-pulse {
              from { opacity: 0.6; transform: scale(0.7); }
              to { opacity: 0; transform: scale(1.5); }
            }
          `,
        }}
      />
      <svg viewBox="0 0 600 460" style={{ width: '100%', height: '100%' }}>
        {rooms
          .filter((room) => !room.isHub)
          .map((room) => {
            const center = roomCenter(room.id);

            return (
              <line
                key={`corridor-${room.id}`}
                x1={center.x}
                y1={center.y}
                x2={hubCenter.x}
                y2={hubCenter.y}
                stroke="var(--border)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                style={{ animation: 'shipmap-corridor-dash 8s linear infinite' }}
              />
            );
          })}

        {rooms.map((room) => (
          <g key={room.id}>
            <title>{`${room.tooltip} — ${room.sub}`}</title>
            <rect
              x={room.x}
              y={room.y}
              width={room.w}
              height={room.h}
              rx={3}
              fill={room.isHub ? 'rgba(155,143,212,0.06)' : 'var(--bg2)'}
              stroke={room.isHub ? 'var(--c)' : 'var(--border)'}
              strokeWidth={1}
            />
            <text
              x={room.x + room.w / 2}
              y={room.y + room.h / 2 - 8}
              fill="var(--cdim)"
              fontFamily="Inter, sans-serif"
              fontSize="8"
              fontWeight="600"
              letterSpacing="0"
              textAnchor="middle"
            >
              {room.label}
            </text>
            <text
              x={room.x + room.w / 2}
              y={room.y + room.h / 2 + 8}
              fill="var(--cvdim)"
              fontFamily="Inter, sans-serif"
              fontSize="7"
              letterSpacing="0"
              textAnchor="middle"
            >
              {room.sub}
            </text>
          </g>
        ))}

        {agents.map((agent) => {
          const position = roomCenter(agent.room);

          return (
            <g key={agent.id}>
              <circle
                cx={position.x}
                cy={position.y}
                r={7}
                fill="none"
                stroke={agent.color}
                strokeWidth={1}
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  animation: 'shipmap-agent-pulse 1.6s ease-out infinite',
                }}
              />
              <circle cx={position.x} cy={position.y} r={4} fill={agent.color} />
              <text
                x={position.x}
                y={position.y + 15}
                fill={agent.color}
                fontFamily="Inter, sans-serif"
                fontSize="7"
                letterSpacing="0"
                textAnchor="middle"
              >
                {agent.id.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
