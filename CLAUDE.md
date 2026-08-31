# SportsbookBar

A browser game where a sportsbook is a place, not a list. Top-down Irish pub, blob avatars, a live zodiac football league on the telly, bets placed by walking up to the bartender.

**What we are building:** a pitchable concept demo. Not a public product, not a real-money product. The measure of done is a five-minute live walkthrough that survives being run in front of someone who decides things.

**Audience for the product:** bettors aged 18 to 35 who find betting apps joyless and like internet culture, fantasy games and sports.

---

## Stack

- Vite, TypeScript (strict), React 18
- react-three-fiber + drei for the 3D scene
- Zustand for state
- Howler for audio
- Vitest for tests

## Commands

npm run dev        (local dev)
npm run build      (production build)
npm run test       (unit tests)
npm run sim:verify (mass season simulation, checks the odds model)
npm run demo       (launch in demo mode with the seeded match)

---

## Non-negotiables

These are not preferences. Breaking one is a bug.

1. src/sim/ imports nothing. No three, no react, no DOM. It is a pure TypeScript module. The league engine has to be liftable into a future fantasy game without a rewrite, and that portability is part of the pitch.
2. All randomness goes through src/sim/rng.ts. Never Math.random() anywhere in the codebase. Demo mode depends on total reproducibility.
3. The store is the single source of truth for match state. The in-scene TV and the match modal are both views of the same store slice. Never a second simulation.
4. No colour or font enters the codebase that is not in the art direction tokens. If a new one is genuinely needed, it gets added to the token file first, in the same commit.
5. No real-money code paths. No purchase flow, no payment SDK, no currency conversion. The wallet is an interface with a play-money implementation, and that is all.
6. No free-text chat. Emotes only. This is a moderation liability decision, not a scope decision, and it does not get revisited without a conversation.
7. Every change is checked against the demo script in .claude/skills/demo-script/SKILL.md. If it does not serve a beat in that script or directly support one, it goes on the parking list in docs/PARKING-LIST.md.

## Performance budget

Enforced, not aspirational. The demo runs on a laptop we do not control, possibly through a projector.

- 60fps on integrated graphics at 1080p
- Under 120 draw calls in the bar scene
- Under 5MB initial bundle, gzipped
- Cold load to interactive under 4 seconds

## How we work

One roadmap phase per branch. Every phase ends with a screen recording, reviewed before merge. Read docs/ARCHITECTURE.md before touching structure and docs/LEAGUE-SPEC.md before touching the sim.
