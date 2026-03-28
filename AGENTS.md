# Hermes Dashboard — Agent Coordination File

## Color palette
All colors defined as CSS variables in src/index.css. Never hardcode colors.
--c, --cbright, --cwhite, --cdim, --cvdim, --cvvdim
--teal, --tealdim, --amber, --green, --red, --purple
--bg, --bg2, --border

## Typography
Font: Inter, letter-spacing: 0, weights 400/500/600

## Layout
Single page CSS grid: 162px sidebar | 1fr center | 224px right panel
Height: 660px

## Component ownership
- Topbar.tsx — OpenCode
- Sidebar.tsx — Codex
- Fishtank.tsx — Claude Code
- ShipMap.tsx — OpenCode
- CommsLog.tsx — Codex
- TracePanel.tsx — Claude Code
- MetricsPanel.tsx — Codex
- InputBar.tsx — OpenCode

## Types
All types defined in src/types/index.ts. Import from there, never redefine.

## Branch strategy
- scaffold — OpenCode
- fishtank — Claude Code
- panels — Codex
- main — clean, audited only

## Rules
- No UI libraries, no Tailwind, no CSS modules
- CSS variables only for all colors
- All TypeScript types imported from src/types/index.ts
- No agent touches another agent's component
