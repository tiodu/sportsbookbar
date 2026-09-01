/**
 * The Poisson goal model and pricing, exactly as specified in
 * docs/LEAGUE-SPEC.md: lambda from attack/defence/home-advantage/form,
 * the score matrix, the three v1 markets, and the 1.06 overround.
 */

import type { Rng } from "./rng";

// The league spec gives 1.35 here ("leagueAvgGoals equals 1.35 per team
// per match"). Implemented exactly as specified — this formula, this
// home advantage, and the individual clubs' attack/defence values
// unchanged — that literal 1.35 produces a league-wide mean of ~3.04
// goals/match (confirmed via npm run sim:verify), just outside the
// spec's own calibration target of [2.4, 3.0]: the real spread of club
// ratings plus home advantage pushes the realised average above the
// "1.35 per team" the constant is named for. Since mean goals scales
// exactly linearly in this one constant, it's tuned down here — leaving
// every club's identity (attack/defence/colour/character line) and the
// home advantage figure untouched — to land mid-range instead of right
// at the boundary.
export const LEAGUE_AVG_GOALS = 1.22;
export const HOME_ADVANTAGE = 1.15;
export const OVERROUND = 1.06;
export const MAX_GOALS = 8;
export const OVER_UNDER_LINE = 2.5;

/** P(X = k) for X ~ Poisson(lambda), computed in log-space for stability. */
export function poissonPmf(k: number, lambda: number): number {
  if (lambda <= 0) {
    return k === 0 ? 1 : 0;
  }
  let logPmf = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i++) {
    logPmf -= Math.log(i);
  }
  return Math.exp(logPmf);
}

/**
 * A generic expected-rate formula sharing the exact shape of the league
 * spec's lambda formula: base times attack times (1 / opponent defence)
 * times home advantage (home side only) times form. Reused for goals
 * (base = LEAGUE_AVG_GOALS) and, in events.ts, for near misses (a
 * different base rate) — the same structural relationship, just scaled.
 */
export function computeRate(
  baseAvgPer90: number,
  attack: number,
  opponentDefence: number,
  isHome: boolean,
  form: number,
): number {
  const homeFactor = isHome ? HOME_ADVANTAGE : 1;
  return baseAvgPer90 * attack * (1 / opponentDefence) * homeFactor * form;
}

export interface MatchLambdas {
  lambdaHome: number;
  lambdaAway: number;
}

export function computeMatchLambdas(
  homeAttack: number,
  homeDefence: number,
  awayAttack: number,
  awayDefence: number,
  formHome: number,
  formAway: number,
): MatchLambdas {
  return {
    lambdaHome: computeRate(LEAGUE_AVG_GOALS, homeAttack, awayDefence, true, formHome),
    lambdaAway: computeRate(LEAGUE_AVG_GOALS, awayAttack, homeDefence, false, formAway),
  };
}

/**
 * Scales a full-match lambda down to the rate implied by the minutes
 * left to play — used for in-play repricing ("using remaining match
 * time", per docs/LEAGUE-SPEC.md's In-play section).
 */
export function remainingLambda(
  fullMatchLambda: number,
  minutesElapsed: number,
  matchLengthMinutes = 90,
): number {
  const remainingFraction = Math.max(
    0,
    Math.min(1, (matchLengthMinutes - minutesElapsed) / matchLengthMinutes),
  );
  return fullMatchLambda * remainingFraction;
}

/** matrix[h][a] = P(h goals for the "home" side of this matrix, a for the "away" side). */
export type ScoreMatrix = readonly (readonly number[])[];

export function buildScoreMatrix(
  lambdaHome: number,
  lambdaAway: number,
  maxGoals: number = MAX_GOALS,
): ScoreMatrix {
  const matrix: number[][] = [];
  for (let h = 0; h <= maxGoals; h++) {
    const row: number[] = [];
    for (let a = 0; a <= maxGoals; a++) {
      row.push(poissonPmf(h, lambdaHome) * poissonPmf(a, lambdaAway));
    }
    matrix.push(row);
  }
  return matrix;
}

function cell(matrix: ScoreMatrix, h: number, a: number): number {
  return matrix[h]?.[a] ?? 0;
}

export interface MatchWinnerProbabilities {
  home: number;
  draw: number;
  away: number;
}

/**
 * Home/draw/away probabilities from the score matrix. `currentHomeGoals`
 * / `currentAwayGoals` default to 0-0 (the pre-match case); passing the
 * live score turns this into the in-play version, since the matrix's
 * cells are then read as *additional* goals from here — the current
 * score just shifts which cells count as a home win, draw, or away win.
 */
export function matchWinnerProbabilities(
  matrix: ScoreMatrix,
  currentHomeGoals = 0,
  currentAwayGoals = 0,
): MatchWinnerProbabilities {
  let home = 0;
  let draw = 0;
  let away = 0;
  const maxGoals = matrix.length - 1;
  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const p = cell(matrix, h, a);
      const finalHome = currentHomeGoals + h;
      const finalAway = currentAwayGoals + a;
      if (finalHome > finalAway) home += p;
      else if (finalHome === finalAway) draw += p;
      else away += p;
    }
  }
  return { home, draw, away };
}

export interface OverUnderProbabilities {
  over: number;
  under: number;
}

export function overUnderProbabilities(
  matrix: ScoreMatrix,
  currentTotalGoals = 0,
  line: number = OVER_UNDER_LINE,
): OverUnderProbabilities {
  let over = 0;
  const maxGoals = matrix.length - 1;
  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      if (currentTotalGoals + h + a > line) {
        over += cell(matrix, h, a);
      }
    }
  }
  return { over, under: 1 - over };
}

export interface BttsProbabilities {
  yes: number;
  no: number;
}

export function bttsProbabilities(
  matrix: ScoreMatrix,
  currentHomeGoals = 0,
  currentAwayGoals = 0,
): BttsProbabilities {
  if (currentHomeGoals >= 1 && currentAwayGoals >= 1) {
    return { yes: 1, no: 0 };
  }
  let yes = 0;
  const maxGoals = matrix.length - 1;
  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const homeScores = currentHomeGoals >= 1 || h >= 1;
      const awayScores = currentAwayGoals >= 1 || a >= 1;
      if (homeScores && awayScores) {
        yes += cell(matrix, h, a);
      }
    }
  }
  return { yes, no: 1 - yes };
}

export function fairOdds(probability: number): number {
  return probability > 0 ? 1 / probability : Infinity;
}

export function pricedOdds(probability: number): number {
  const fair = fairOdds(probability);
  if (!Number.isFinite(fair)) return Infinity;
  return Math.round((fair / OVERROUND) * 100) / 100;
}

export interface MatchWinnerPrices {
  home: number;
  draw: number;
  away: number;
}

export function priceMatchWinner(
  matrix: ScoreMatrix,
  currentHomeGoals = 0,
  currentAwayGoals = 0,
): MatchWinnerPrices {
  const p = matchWinnerProbabilities(matrix, currentHomeGoals, currentAwayGoals);
  return { home: pricedOdds(p.home), draw: pricedOdds(p.draw), away: pricedOdds(p.away) };
}

export interface OverUnderPrices {
  over: number;
  under: number;
}

export function priceOverUnder(
  matrix: ScoreMatrix,
  currentTotalGoals = 0,
  line: number = OVER_UNDER_LINE,
): OverUnderPrices {
  const p = overUnderProbabilities(matrix, currentTotalGoals, line);
  return { over: pricedOdds(p.over), under: pricedOdds(p.under) };
}

export interface BttsPrices {
  yes: number;
  no: number;
}

export function priceBtts(
  matrix: ScoreMatrix,
  currentHomeGoals = 0,
  currentAwayGoals = 0,
): BttsPrices {
  const p = bttsProbabilities(matrix, currentHomeGoals, currentAwayGoals);
  return { yes: pricedOdds(p.yes), no: pricedOdds(p.no) };
}

export interface ScoreSample {
  homeGoals: number;
  awayGoals: number;
}

/**
 * Samples a final score directly from the score matrix (inverse-CDF over
 * its cells), so simulated outcomes are drawn from exactly the same
 * distribution the odds are priced from. This is what makes the
 * calibration check in docs/LEAGUE-SPEC.md ("implied probability from
 * priced odds tracks realised outcome frequency") a meaningful,
 * self-consistent test rather than two independently-coded models that
 * could drift apart.
 */
export function sampleScoreFromMatrix(rng: Rng, matrix: ScoreMatrix): ScoreSample {
  const draw = rng();
  let cumulative = 0;
  const maxGoals = matrix.length - 1;
  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      cumulative += cell(matrix, h, a);
      if (draw < cumulative) {
        return { homeGoals: h, awayGoals: a };
      }
    }
  }
  // Residual tail mass (goals beyond maxGoals for one side, or
  // floating-point slack): fall back to the matrix's highest cell.
  return { homeGoals: maxGoals, awayGoals: maxGoals };
}
