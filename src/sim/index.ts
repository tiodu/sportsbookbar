/**
 * Public API surface for src/sim/. Everything outside src/sim/ imports
 * only from here — see CLAUDE.md non-negotiable #1 and
 * docs/ARCHITECTURE.md's directory layout.
 */

export { mulberry32, randInt, randFloat, pick } from "./rng";
export type { Rng } from "./rng";

export { TEAMS, TEAMS_BY_ID } from "./teams";
export type { Team, TeamId } from "./teams";

export {
  LEAGUE_AVG_GOALS,
  HOME_ADVANTAGE,
  OVERROUND,
  MAX_GOALS,
  OVER_UNDER_LINE,
  poissonPmf,
  computeRate,
  computeMatchLambdas,
  remainingLambda,
  buildScoreMatrix,
  matchWinnerProbabilities,
  overUnderProbabilities,
  bttsProbabilities,
  fairOdds,
  pricedOdds,
  priceMatchWinner,
  priceOverUnder,
  priceBtts,
  sampleScoreFromMatrix,
} from "./odds";
export type {
  ScoreMatrix,
  MatchLambdas,
  MatchWinnerProbabilities,
  OverUnderProbabilities,
  BttsProbabilities,
  MatchWinnerPrices,
  OverUnderPrices,
  BttsPrices,
  ScoreSample,
} from "./odds";

export { generateFixtures, computeForm, buildLeagueTable, simulateSeason } from "./season";
export type {
  Fixture,
  MatchResult,
  ResultOutcome,
  TableRow,
  SeasonResult,
} from "./season";

export { computeNearMissRates, computeCardRate, rollTickEvents } from "./events";
export type {
  EventType,
  Side,
  CardColour,
  KickoffEvent,
  GoalEvent,
  NearMissEvent,
  CardEvent,
  HalfTimeEvent,
  FullTimeEvent,
  MatchEvent,
  TickRates,
} from "./events";

export {
  createMatch,
  tick,
  TICK_SECONDS,
  MATCH_MINUTES_PER_TICK,
  HALF_LENGTH_MINUTES,
  AD_BREAK_DURATION_SECONDS,
} from "./match";
export type { MatchPhase, MatchState, LiveOdds, ScriptedEvent, SentOff } from "./match";

export {
  DEMO_SEED,
  DEMO_HOME_TEAM_ID,
  DEMO_AWAY_TEAM_ID,
  DEMO_FORM_HOME,
  DEMO_FORM_AWAY,
  DEMO_EVENT_SCRIPT,
  createDemoMatch,
  createDemoRng,
  tickDemoMatch,
} from "./demo";
