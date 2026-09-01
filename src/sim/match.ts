/**
 * The match state machine and the fixed 10Hz tick function, per
 * docs/ARCHITECTURE.md's Time and Match lifecycle sections.
 */

import type { Rng } from "./rng";
import type { Team } from "./teams";
import {
  buildScoreMatrix,
  computeMatchLambdas,
  priceBtts,
  priceMatchWinner,
  priceOverUnder,
  remainingLambda,
  type BttsPrices,
  type MatchWinnerPrices,
  type OverUnderPrices,
} from "./odds";
import {
  computeCardRate,
  computeNearMissRates,
  rollTickEvents,
  type MatchEvent,
  type TickRates,
} from "./events";

export type MatchPhase =
  | "kickoff"
  | "firstHalf"
  | "halfTime"
  | "secondHalf"
  | "fullTime"
  | "settlement"
  | "adBreak";

// Fixed 10Hz sim clock, per docs/ARCHITECTURE.md.
export const TICK_SECONDS = 0.1;
// "120 real seconds equals 90 match minutes... one sim tick is 0.1 real
// seconds, so 0.075 match minutes" — docs/ARCHITECTURE.md, Time section.
export const MATCH_MINUTES_PER_TICK = 0.075;
export const HALF_LENGTH_MINUTES = 45;

// Durations for the phases the architecture doc names but doesn't give
// timings for (kickoff/halfTime/fullTime/settlement/adBreak). Chosen for
// a believable presentational pace, not derived from anything in the
// docs — tune freely without touching the state machine's shape.
const KICKOFF_DURATION_SECONDS = 3;
const HALF_TIME_DURATION_SECONDS = 15;
const FULL_TIME_DURATION_SECONDS = 3;
const SETTLEMENT_DURATION_SECONDS = 5;
export const AD_BREAK_DURATION_SECONDS = 20;

// A red card's effect on the sending-off side's lambda "for the
// remainder" (docs/LEAGUE-SPEC.md doesn't give a magnitude). Applied
// multiplicatively per card, to goal and near-miss rates.
const RED_CARD_LAMBDA_FACTOR = 0.75;

function secondsToTicks(seconds: number): number {
  return Math.round(seconds / TICK_SECONDS);
}

export interface LiveOdds {
  matchWinner: MatchWinnerPrices;
  overUnder: OverUnderPrices;
  btts: BttsPrices;
}

export interface ScriptedEvent {
  minute: number;
  event: MatchEvent;
}

export interface SentOff {
  home: number;
  away: number;
}

export interface MatchState {
  readonly seed: number;
  readonly home: Team;
  readonly away: Team;
  readonly formHome: number;
  readonly formAway: number;
  readonly baseLambdaHome: number;
  readonly baseLambdaAway: number;
  readonly phase: MatchPhase;
  readonly phaseElapsedTicks: number;
  readonly minute: number;
  readonly homeGoals: number;
  readonly awayGoals: number;
  readonly sentOff: SentOff;
  readonly events: readonly MatchEvent[];
  readonly liveOdds: LiveOdds;
}

function computeLiveOdds(
  baseLambdaHome: number,
  baseLambdaAway: number,
  sentOff: SentOff,
  minute: number,
  homeGoals: number,
  awayGoals: number,
): LiveOdds {
  const effectiveLambdaHome = baseLambdaHome * RED_CARD_LAMBDA_FACTOR ** sentOff.home;
  const effectiveLambdaAway = baseLambdaAway * RED_CARD_LAMBDA_FACTOR ** sentOff.away;
  const remHome = remainingLambda(effectiveLambdaHome, minute);
  const remAway = remainingLambda(effectiveLambdaAway, minute);
  const matrix = buildScoreMatrix(remHome, remAway);
  return {
    matchWinner: priceMatchWinner(matrix, homeGoals, awayGoals),
    overUnder: priceOverUnder(matrix, homeGoals + awayGoals),
    btts: priceBtts(matrix, homeGoals, awayGoals),
  };
}

/** Creates a fresh match at kickoff, with pre-match odds already priced. */
export function createMatch(
  seed: number,
  home: Team,
  away: Team,
  formHome: number,
  formAway: number,
): MatchState {
  const { lambdaHome, lambdaAway } = computeMatchLambdas(
    home.attack,
    home.defence,
    away.attack,
    away.defence,
    formHome,
    formAway,
  );
  const sentOff: SentOff = { home: 0, away: 0 };
  return {
    seed,
    home,
    away,
    formHome,
    formAway,
    baseLambdaHome: lambdaHome,
    baseLambdaAway: lambdaAway,
    phase: "kickoff",
    phaseElapsedTicks: 0,
    minute: 0,
    homeGoals: 0,
    awayGoals: 0,
    sentOff,
    events: [],
    liveOdds: computeLiveOdds(lambdaHome, lambdaAway, sentOff, 0, 0, 0),
  };
}

function effectiveRates(state: MatchState): TickRates {
  const homeMultiplier = RED_CARD_LAMBDA_FACTOR ** state.sentOff.home;
  const awayMultiplier = RED_CARD_LAMBDA_FACTOR ** state.sentOff.away;
  const nearMiss = computeNearMissRates(
    state.home.attack,
    state.home.defence,
    state.away.attack,
    state.away.defence,
    state.formHome,
    state.formAway,
  );
  return {
    goalHome: state.baseLambdaHome * homeMultiplier,
    goalAway: state.baseLambdaAway * awayMultiplier,
    nearMissHome: nearMiss.home * homeMultiplier,
    nearMissAway: nearMiss.away * awayMultiplier,
    cardHome: computeCardRate(state.home.id, state.home.defence),
    cardAway: computeCardRate(state.away.id, state.away.defence),
  };
}

function withEvents(
  state: MatchState,
  newEvents: readonly MatchEvent[],
): readonly MatchEvent[] {
  return newEvents.length > 0 ? [...state.events, ...newEvents] : state.events;
}

function tickPlay(
  state: MatchState,
  rng: Rng,
  script: readonly ScriptedEvent[] | undefined,
  halfEndMinute: number,
  nextPhase: "halfTime" | "fullTime",
): MatchState {
  const nextMinute = state.minute + MATCH_MINUTES_PER_TICK;
  const scripted = script?.filter((s) => s.minute > state.minute && s.minute <= nextMinute) ?? [];

  // Once a script is active, goals are ONLY ever the scripted ones —
  // otherwise an unscripted random goal on some other tick could still
  // flip the outcome the script is meant to guarantee (see
  // src/sim/demo.ts: "the player's bet lands at full time"). Near
  // misses and cards don't affect the score, so they keep rolling
  // randomly on every non-scripted tick for texture.
  const randomRates = script ? { ...effectiveRates(state), goalHome: 0, goalAway: 0 } : effectiveRates(state);
  const randomEvents = rollTickEvents(rng, state.minute, MATCH_MINUTES_PER_TICK, randomRates);
  const rolled = [...scripted.map((s) => s.event), ...randomEvents];

  let homeGoals = state.homeGoals;
  let awayGoals = state.awayGoals;
  let sentOff = state.sentOff;
  let scoreChanged = false;

  for (const event of rolled) {
    if (event.type === "goal") {
      if (event.team === "home") homeGoals += 1;
      else awayGoals += 1;
      scoreChanged = true;
    } else if (event.type === "card" && event.colour === "red") {
      sentOff =
        event.team === "home"
          ? { ...sentOff, home: sentOff.home + 1 }
          : { ...sentOff, away: sentOff.away + 1 };
    }
  }

  const events = withEvents(state, rolled);

  if (nextMinute >= halfEndMinute) {
    const finalMinute = halfEndMinute;
    const phaseEvents: readonly MatchEvent[] =
      nextPhase === "fullTime" ? [...events, { type: "fullTime", minute: finalMinute }] : events;
    return {
      ...state,
      minute: finalMinute,
      homeGoals,
      awayGoals,
      sentOff,
      events: phaseEvents,
      phase: nextPhase,
      phaseElapsedTicks: 0,
      liveOdds: computeLiveOdds(
        state.baseLambdaHome,
        state.baseLambdaAway,
        sentOff,
        finalMinute,
        homeGoals,
        awayGoals,
      ),
    };
  }

  return {
    ...state,
    minute: nextMinute,
    homeGoals,
    awayGoals,
    sentOff,
    events,
    liveOdds: scoreChanged
      ? computeLiveOdds(
          state.baseLambdaHome,
          state.baseLambdaAway,
          sentOff,
          nextMinute,
          homeGoals,
          awayGoals,
        )
      : state.liveOdds,
  };
}

function tickPause(
  state: MatchState,
  durationSeconds: number,
  nextPhase: MatchPhase,
  extraOnExit: Partial<MatchState> = {},
): MatchState {
  const ticksSoFar = state.phaseElapsedTicks + 1;
  if (ticksSoFar >= secondsToTicks(durationSeconds)) {
    return { ...state, ...extraOnExit, phase: nextPhase, phaseElapsedTicks: 0 };
  }
  return { ...state, phaseElapsedTicks: ticksSoFar };
}

/**
 * Advances the match by exactly one 10Hz tick. Pass the same `rng`
 * instance across the whole match's lifetime (create it once via
 * `mulberry32(seed)`) — recreating it from the seed each call would
 * replay the same random draws every tick.
 *
 * `script`, if given, forces specific events at specific minutes during
 * play (see src/sim/demo.ts) instead of rolling them randomly for that
 * tick — everything outside the scripted minutes still plays out from
 * `rng` as normal.
 */
export function tick(state: MatchState, rng: Rng, script?: readonly ScriptedEvent[]): MatchState {
  switch (state.phase) {
    case "kickoff": {
      const isEntry = state.phaseElapsedTicks === 0;
      const withKickoffEvent = isEntry
        ? withEvents(state, [{ type: "kickoff", minute: 0 }])
        : state.events;
      return tickPause({ ...state, events: withKickoffEvent }, KICKOFF_DURATION_SECONDS, "firstHalf");
    }

    case "firstHalf":
      return tickPlay(state, rng, script, HALF_LENGTH_MINUTES, "halfTime");

    case "halfTime":
      return tickPause(state, HALF_TIME_DURATION_SECONDS, "secondHalf", {
        minute: HALF_LENGTH_MINUTES,
      });

    case "secondHalf":
      return tickPlay(state, rng, script, HALF_LENGTH_MINUTES * 2, "fullTime");

    case "fullTime":
      return tickPause(state, FULL_TIME_DURATION_SECONDS, "settlement");

    case "settlement":
      return tickPause(state, SETTLEMENT_DURATION_SECONDS, "adBreak");

    case "adBreak":
      // Terminal here — starting the next fixture is a season-level
      // decision made by whatever calls tick() (future store code), not
      // something match.ts decides on its own. AD_BREAK_DURATION_SECONDS
      // documents the intended presentational pace for that caller.
      return { ...state, phaseElapsedTicks: state.phaseElapsedTicks + 1 };
  }
}
