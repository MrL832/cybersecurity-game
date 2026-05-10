# Cyber Defender

A browser-based cybersecurity educational game for GCSE Computer Science students covering all seven AQA threat types.

## Run & Operate

- `pnpm --filter @workspace/cyber-defender run dev` — run the game (port 26270)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS
- Game: HTML5 Canvas with requestAnimationFrame loop
- No backend required

## Where things live

- `artifacts/cyber-defender/src/pages/Game.tsx` — all game logic, canvas rendering, state machine
- `artifacts/cyber-defender/src/App.tsx` — router mounting the Game component at "/"
- `artifacts/cyber-defender/src/index.css` — dark cybersecurity theme (navy/cyan palette)

## Architecture decisions

- Game state stored in `useRef` (not `useState`) to avoid React re-renders on every frame
- Canvas-based rendering for smooth 60fps with `requestAnimationFrame`
- All 7 GCSE AQA threat types with exact educational copy baked in
- Touch buttons overlaid on canvas for mobile/tablet support

## Product

Cyber Defender is an arcade-style dodge game where players control a shield to avoid 7 types of cyber threats. Each collision triggers an educational pop-up explaining the threat using AQA GCSE terminology. Progressive difficulty (faster threats) keeps engagement up while reinforcing learning through repetition.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The game uses `useRef` for mutable game state — do not convert to `useState` or frame rate will drop
- All CSS variables in `index.css` must be set (none should remain as `red`) — the scaffold ships with red placeholders

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
