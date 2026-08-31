# sportsbookbar

Vite + React 18 + TypeScript (strict) + react-three-fiber + drei + Zustand +
Howler + Vitest.

## Directory structure

- `src/sim/` — pure game/simulation logic. See hard rule below.
- `src/store/` — Zustand stores.
- `src/wallet/` — balance / betting-ledger logic.
- `src/presence/` — multiplayer presence and sync.
- `src/scene/` — react-three-fiber scene, meshes, cameras.
- `src/ui/` — 2D UI overlay (HUD, menus, modals).
- `src/audio/` — Howler-based sound engine and audio assets.
- `src/art/` — design tokens (colors, fonts) and static art assets.
- `docs/` — project documentation.
- `.claude/skills/` — project-specific Claude Code skills.

## Hard rule #1: `src/sim/` is pure TypeScript

`src/sim/` must import nothing external — no `three`, no `react`, no DOM
APIs, no npm packages of any kind. Only relative imports within `src/sim/`
itself are allowed. This keeps the simulation layer:

- portable (usable outside a browser — server-side, tests, workers)
- trivially unit-testable without a DOM or a renderer
- decoupled from rendering/UI churn

If `src/sim/` needs something from the outside world (current time, RNG,
config), it must be passed in as a plain-data argument or a plain function
— never imported.

Enforced by ESLint (`eslint.config.js`): `no-restricted-syntax` bans any
non-relative `ImportDeclaration` under `src/sim/**/*.{ts,tsx}` (excluding
`*.test.ts`, which may import `vitest`), and `no-restricted-globals` bans
DOM globals (`window`, `document`, `navigator`, `fetch`, `localStorage`,
`requestAnimationFrame`, ...) in the same files.

## Hard rule #2: no `Math.random()`

`Math.random()` is banned everywhere in this codebase. It makes bugs
unreproducible and simulation runs non-deterministic. Use the seeded
mulberry32 PRNG in `src/sim/rng.ts` instead:

```ts
import { mulberry32 } from "../sim/rng";

const rng = mulberry32(seed);
rng(); // float in [0, 1), deterministic for a given seed
```

Enforced by ESLint (`eslint.config.js`): `no-restricted-properties` bans
`Math.random` project-wide.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — typecheck (`tsc -b`) and build
- `npm run lint` — run ESLint
- `npm test` — run Vitest once
- `npm run test:watch` — run Vitest in watch mode
