import { useState } from 'react';

export const InputBar = () => {
  const [value, setValue] = useState('');
  const [isCommandHovered, setIsCommandHovered] = useState(false);
  const [isSendHovered, setIsSendHovered] = useState(false);
  const [isMicHovered, setIsMicHovered] = useState(false);

  const handleSend = () => {
    const nextValue = value.trim();

    if (!nextValue) {
      return;
    }

    console.log(nextValue);
    setValue('');
  };

  return (
    <div
      className="input-bar-shell"
      style={{
        height: '44px',
        background: 'var(--bg2)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: '8px',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          color: 'var(--teal)',
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        ❯
      </span>

      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            handleSend();
          }
        }}
        placeholder="send a message to hermes..."
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          fontWeight: 400,
          letterSpacing: 0,
          color: 'var(--cwhite)',
          caretColor: 'var(--teal)',
        }}
      />

      <button
        type="button"
        onMouseEnter={() => setIsCommandHovered(true)}
        onMouseLeave={() => setIsCommandHovered(false)}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          color: isCommandHovered ? 'var(--cdim)' : 'var(--cvdim)',
          fontFamily: 'Inter, sans-serif',
          fontSize: '8px',
          fontWeight: 500,
          letterSpacing: 0,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        ⌘K
      </button>

      <button
        type="button"
        onClick={handleSend}
        onMouseEnter={() => setIsSendHovered(true)}
        onMouseLeave={() => setIsSendHovered(false)}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '3px',
          border: '1px solid rgba(155,143,212,0.3)',
          background: isSendHovered ? 'rgba(155,143,212,0.22)' : 'rgba(155,143,212,0.15)',
          color: 'var(--c)',
          fontFamily: 'Inter, sans-serif',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        ↑
      </button>

      <button
        type="button"
        onMouseEnter={() => setIsMicHovered(true)}
        onMouseLeave={() => setIsMicHovered(false)}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          color: isMicHovered ? 'var(--cdim)' : 'var(--cvdim)',
          fontFamily: 'Inter, sans-serif',
          fontSize: '8px',
          fontWeight: 500,
          letterSpacing: 0,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        ⊙
      </button>

      <style>
        {`
          .input-bar-shell input::placeholder {
            color: var(--cvdim);
          }
        `}
      </style>
    </div>
  );
};
