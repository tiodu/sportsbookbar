# Architecture

## The central idea

Three layers, strictly separated, with dependencies pointing one way only.

  sim/            pure TypeScript. No three, no react, no DOM.
                  League, match engine, odds model, RNG.
  store/          Zustand. Holds sim output plus player and world state.
  scene/  ui/     R3F components and DOM overlays. Read-only consumers.

The dependency direction is sim, then store, then scene and ui. Nothing in scene/ or ui/ ever computes match state. They render what the store holds. This is the implementation of the rule that the telly is the single source of truth: the store is the truth, the telly and the modal are two views of it.

The reason for the hard boundary is not tidiness. A league engine with zero rendering dependencies is a league engine you can lift straight into a fantasy game, a predictions game, or a standalone odds feed. That optionality is part of what gets pitched.

## Directory layout

src/sim/
  rng.ts              seeded PRNG (mulberry32). The only source of randomness.
  teams.ts            the 12 zodiac clubs and their attributes
  season.ts           fixture generation, league table, results archive
  match.ts            match state machine and the tick function
  events.ts           event types and the event generator
  odds.ts             Poisson model, probability to price conversion
  demo.ts             the scripted match used in demo mode
  index.ts            public API surface. Everything else imports only this.

src/store/
  useMatch.ts         current match, clock, events, live odds
  useSeason.ts        table, fixtures, results
  usePlayer.ts        position, target, avatar, club, wallet
  useBets.ts          open bets, history, settlement
  useWorld.ts         NPCs, presence, celebration triggers

src/wallet/
  WalletAdapter.ts    interface
  PlayMoneyWallet.ts  the only implementation that ships

src/presence/
  PresenceSource.ts   interface
  ScriptedPresence.ts fake avatars, believable paths

src/scene/
  Bar.tsx             the room
  Telly.tsx           canvas texture driven by the store
  Avatar.tsx          blob rig, animation states
  Bartender.tsx, CasinoMachine.tsx, Confetti.tsx
  lighting/           the rig, and the goal pulse

src/ui/
  Hud.tsx, BetSlip.tsx, MatchModal.tsx, LeagueTable.tsx, Toast.tsx

src/audio/
  bus.ts              Howler wrapper, ducking, master mute

src/art/
  tokens.ts           generated from the art direction skill. Do not hand-edit.

## Time

Two clocks, deliberately separate.

Render clock runs at whatever the frame rate is. Handles movement interpolation, animation, particles.

Sim clock runs at a fixed 10Hz, driven by an accumulator, never by frame delta. The match engine advances in fixed steps and produces events. If the tab stalls, the sim catches up in discrete steps rather than jumping.

Mapping: 120 real seconds equals 90 match minutes. One sim tick is 0.1 real seconds, so 0.075 match minutes. Demo mode can compress this without changing the engine.

## Match lifecycle

kickoff, then firstHalf, then halfTime, then secondHalf, then fullTime, then settlement, then adBreak, then back to kickoff.

fullTime and settlement are separate states. Settlement is where bets resolve, and separating it gives the win celebration a clean hook rather than racing the clock.

## Determinism and demo mode

Every match is created from a seed. demo.ts holds a fixed seed plus an optional event override track, so the demo match produces the same goals at the same minutes every run, and the player's bet lands at full time. Demo mode is a URL flag, not a build flag, so it can be toggled live if something goes wrong mid-pitch.

A reset key, bound to R, restarts the whole sequence cleanly from any state. This is a demo-resilience requirement, not a nicety.

## The two interfaces that carry the pitch

WalletAdapter exposes getBalance, debit, and credit. PlayMoneyWallet is the only implementation in the repo. The point of the interface is to be able to say, truthfully, that swapping in an operator's real-money wallet is one file.

PresenceSource exposes a subscribe method yielding avatar positions and states. ScriptedPresence produces three to five believable fake patrons. A socket implementation drops in behind the same interface later. Never claim in a pitch that presence is live while ScriptedPresence is in use.

## Testing

Unit tests cover the sim only. Rendering is verified by eye and by screen recording.

npm run sim:verify runs 10,000 seasons and asserts the output looks like football: goals per game in a sane range, home advantage visible, the table spread not degenerate, and, critically, that the implied probabilities from the priced odds track the realised outcome frequencies. If the odds model is not calibrated, the whole product is a slot machine with a scarf on.

## Parking list

docs/PARKING-LIST.md exists so that good ideas can be captured without being built. Anything that does not serve the demo script goes there. It is a real file, checked in, and reviewed at the end of each phase.
