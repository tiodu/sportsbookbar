/**
 * A fixed-seed, scripted match for demo mode, per docs/ARCHITECTURE.md:
 * "demo.ts holds a fixed seed plus an optional event override track, so
 * the demo match produces the same goals at the same minutes every run,
 * and the player's bet lands at full time."
 */

import { mulberry32, type Rng } from "./rng";
import { TEAMS_BY_ID, type TeamId } from "./teams";
import { createMatch, tick, type MatchState, type ScriptedEvent } from "./match";

export const DEMO_SEED = 20260901;

export const DEMO_HOME_TEAM_ID: TeamId = "ARI";
export const DEMO_AWAY_TEAM_ID: TeamId = "LEO";

export const DEMO_FORM_HOME = 1.0;
export const DEMO_FORM_AWAY = 1.0;

/**
 * The scripted beats: home takes an early lead (the demo script's 1:45
 * goal, .claude/skills/demo-script/SKILL.md), away claws level, home
 * wins it late. A bet placed on the home side after the first goal
 * lands at full time. Everything off-script (near misses, cards outside
 * this list) still plays out from DEMO_SEED as normal — only these
 * minutes are pinned.
 */
export const DEMO_EVENT_SCRIPT: readonly ScriptedEvent[] = [
  { minute: 12, event: { type: "goal", minute: 12, team: "home", scorerNumber: 9 } },
  { minute: 29, event: { type: "nearMiss", minute: 29, team: "away" } },
  { minute: 58, event: { type: "goal", minute: 58, team: "away", scorerNumber: 7 } },
  { minute: 71, event: { type: "card", minute: 71, team: "away", colour: "yellow" } },
  { minute: 84, event: { type: "goal", minute: 84, team: "home", scorerNumber: 9 } },
];

export function createDemoMatch(): MatchState {
  const home = TEAMS_BY_ID[DEMO_HOME_TEAM_ID];
  const away = TEAMS_BY_ID[DEMO_AWAY_TEAM_ID];
  return createMatch(DEMO_SEED, home, away, DEMO_FORM_HOME, DEMO_FORM_AWAY);
}

/** A fresh rng for the demo match. Reuse the same instance across ticks. */
export function createDemoRng(): Rng {
  return mulberry32(DEMO_SEED);
}

/** Advances a demo match by one tick, applying the scripted event track. */
export function tickDemoMatch(state: MatchState, rng: Rng): MatchState {
  return tick(state, rng, DEMO_EVENT_SCRIPT);
}
