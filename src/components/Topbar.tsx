import { useEffect, useState } from 'react';

export const Topbar = () => {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const roomsStatus = [
    { label: 'ONLINE', color: 'var(--cbright)' },
    { label: 'MDL:NEMOTRON-CASCADE-2', color: 'var(--purple)' },
    { label: 'VRAM:79%', color: 'var(--amber)' },
    { label: 'CTX:16.7K/262K', color: 'var(--teal)' },
    { label: 'AGENTS:3', color: 'var(--green)' },
  ];

  return (
    <div
      className="topbar"
      style={{
        width: '100%',
        height: '26px',
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontFamily: 'Inter, sans-serif',
        color: 'var(--cbright)',
      }}
    >
      <span
        style={{
          fontFamily: 'VT323, sans-serif',
          fontSize: '18px',
          letterSpacing: '0.1em',
          fontWeight: '600',
          color: 'var(--cbright)',
          marginRight: '12px',
        }}
      >
        HERMES
      </span>

      {roomsStatus.map((item, idx) => (
        <span
          key={idx}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '9px',
            marginLeft: idx === 0 ? '12px' : '4px',
            marginRight: '6px',
            color: item.color,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {item.label}
          {idx < roomsStatus.length - 1 && <span> | </span>}
        </span>
      ))}

      <span
        className="blink"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '9px',
          color: 'var(--cbright)',
          marginLeft: '8px',
          borderRight: '1px solid var(--cbright)',
          paddingRight: '2px',
        }}
      >
        {time}
      </span>
    </div>
  );
};