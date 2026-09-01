/**
 * Match event types and the tick-level event generator, per
 * docs/LEAGUE-SPEC.md's Match events section.
 */

import type { Rng } from "./rng";
import { randInt } from "./rng";
import type { TeamId } from "./teams";
import { computeRate } from "./odds";

export type EventType = "kickoff" | "goal" | "nearMiss" | "card" | "halfTime" | "fullTime";
export type Side = "home" | "away";
export type CardColour = "yellow" | "red";

export interface KickoffEvent {
  type: "kickoff";
  minute: number;
}

export interface GoalEvent {
  type: "goal";
  minute: number;
  team: Side;
  /**
   * There's no player roster anywhere in the spec — only club-level
   * attack/defence. This is a lightweight placeholder (a shirt number)
   * standing in for a scorer identity until (if ever) individual players
   * are modelled.
   */
  scorerNumber: number;
}

export interface NearMissEvent {
  type: "nearMiss";
  minute: number;
  team: Side;
}

export interface CardEvent {
  type: "card";
  minute: number;
  team: Side;
  colour: CardColour;
}

export interface HalfTimeEvent {
  type: "halfTime";
  minute: number;
}

export interface FullTimeEvent {
  type: "fullTime";
  minute: number;
}

export type MatchEvent =
  | KickoffEvent
  | GoalEvent
  | NearMissEvent
  | CardEvent
  | HalfTimeEvent
  | FullTimeEvent;

// Near misses use the same attack/defence shape as the goal model
// (see computeRate in odds.ts), just scaled to a much higher base rate —
// chances that don't go in are far more common than ones that do.
const NEAR_MISS_AVG_PER_90 = 8;

export function computeNearMissRates(
  homeAttack: number,
  homeDefence: number,
  awayAttack: number,
  awayDefence: number,
  formHome: number,
  formAway: number,
): { home: number; away: number } {
  return {
    home: computeRate(NEAR_MISS_AVG_PER_90, homeAttack, awayDefence, true, formHome),
    away: computeRate(NEAR_MISS_AVG_PER_90, awayAttack, homeDefence, false, formAway),
  };
}

// Cards aren't tied to attack/defence anywhere in the league spec's
// prose the way goals and near misses are — the one concrete data point
// given is narrative ("Scorpio City get more cards"), not a formula.
// This is a deliberately simple, documented model: a league-average base
// rate, a mild bump for a weaker defence (more last-ditch fouls), and an
// explicit multiplier for Scorpio City to realise that specific line.
const BASE_CARDS_PER_90 = 3.2;
const CARD_DEFENCE_WEIGHT = 0.3;
const SCORPIO_CARD_MULTIPLIER = 1.8;
const RED_CARD_SHARE = 0.1; // fraction of card events that are red rather than yellow

export function computeCardRate(teamId: TeamId, defence: number): number {
  const defenceFactor = 1 + (1 - defence) * CARD_DEFENCE_WEIGHT;
  const scorpioFactor = teamId === "SCO" ? SCORPIO_CARD_MULTIPLIER : 1;
  return BASE_CARDS_PER_90 * defenceFactor * scorpioFactor;
}

export interface TickRates {
  goalHome: number;
  goalAway: number;
  nearMissHome: number;
  nearMissAway: number;
  cardHome: number;
  cardAway: number;
}

function tickProbability(ratePer90: number, tickMinutes: number): number {
  return (ratePer90 / 90) * tickMinutes;
}

/**
 * Rolls one tick's worth of independent Bernoulli trials, one per rate
 * channel. Per docs/LEAGUE-SPEC.md: "Goals are drawn per sim tick from
 * the per-tick probability implied by lambda over the match length, not
 * resampled per second, so the totals stay Poisson" — the same
 * mechanism is used here for near misses and cards too.
 */
export function rollTickEvents(
  rng: Rng,
  minute: number,
  tickMinutes: number,
  rates: TickRates,
): MatchEvent[] {
  const events: MatchEvent[] = [];

  if (rng() < tickProbability(rates.goalHome, tickMinutes)) {
    events.push({ type: "goal", minute, team: "home", scorerNumber: randInt(rng, 1, 99) });
  }
  if (rng() < tickProbability(rates.goalAway, tickMinutes)) {
    events.push({ type: "goal", minute, team: "away", scorerNumber: randInt(rng, 1, 99) });
  }
  if (rng() < tickProbability(rates.nearMissHome, tickMinutes)) {
    events.push({ type: "nearMiss", minute, team: "home" });
  }
  if (rng() < tickProbability(rates.nearMissAway, tickMinutes)) {
    events.push({ type: "nearMiss", minute, team: "away" });
  }
  if (rng() < tickProbability(rates.cardHome, tickMinutes)) {
    events.push({
      type: "card",
      minute,
      team: "home",
      colour: rng() < RED_CARD_SHARE ? "red" : "yellow",
    });
  }
  if (rng() < tickProbability(rates.cardAway, tickMinutes)) {
    events.push({
      type: "card",
      minute,
      team: "away",
      colour: rng() < RED_CARD_SHARE ? "red" : "yellow",
    });
  }

  return events;
}
