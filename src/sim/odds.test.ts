import { describe, expect, it } from "vitest";
import {
  HOME_ADVANTAGE,
  MAX_GOALS,
  OVERROUND,
  bttsProbabilities,
  buildScoreMatrix,
  computeMatchLambdas,
  computeRate,
  fairOdds,
  matchWinnerProbabilities,
  overUnderProbabilities,
  poissonPmf,
  priceMatchWinner,
  pricedOdds,
  sampleScoreFromMatrix,
} from "./odds";
import { mulberry32 } from "./rng";

describe("poissonPmf", () => {
  it("sums to ~1 across a wide enough range of k", () => {
    const lambda = 1.5;
    let sum = 0;
    for (let k = 0; k <= 30; k++) {
      sum += poissonPmf(k, lambda);
    }
    expect(sum).toBeCloseTo(1, 6);
  });

  it("treats lambda <= 0 as a certainty of zero", () => {
    expect(poissonPmf(0, 0)).toBe(1);
    expect(poissonPmf(1, 0)).toBe(0);
  });

  it("matches a hand-computed value", () => {
    // P(X=2) for lambda=1: e^-1 * 1^2 / 2! = e^-1 / 2
    expect(poissonPmf(2, 1)).toBeCloseTo(Math.exp(-1) / 2, 10);
  });
});

describe("computeRate / computeMatchLambdas", () => {
  it("matches the league spec's formula shape exactly", () => {
    // lambdaHome = leagueAvgGoals * attackHome * (1/defenceAway) * homeAdvantage * formHome
    const rate = computeRate(1.35, 1.3, 0.95, true, 1.0);
    expect(rate).toBeCloseTo(1.35 * 1.3 * (1 / 0.95) * HOME_ADVANTAGE * 1.0, 10);
  });

  it("applies home advantage to the home side only", () => {
    const { lambdaHome, lambdaAway } = computeMatchLambdas(1.0, 1.0, 1.0, 1.0, 1.0, 1.0);
    expect(lambdaHome).toBeGreaterThan(lambdaAway);
    expect(lambdaHome / lambdaAway).toBeCloseTo(HOME_ADVANTAGE, 10);
  });

  it("a stronger attack raises lambda, a stronger opponent defence lowers it", () => {
    const base = computeRate(1.35, 1.0, 1.0, false, 1.0);
    const strongerAttack = computeRate(1.35, 1.35, 1.0, false, 1.0);
    const strongerOpponentDefence = computeRate(1.35, 1.0, 1.35, false, 1.0);
    expect(strongerAttack).toBeGreaterThan(base);
    expect(strongerOpponentDefence).toBeLessThan(base);
  });
});

describe("buildScoreMatrix / matchWinnerProbabilities", () => {
  it("has (MAX_GOALS + 1) rows and columns", () => {
    const matrix = buildScoreMatrix(1.5, 1.2);
    expect(matrix.length).toBe(MAX_GOALS + 1);
    for (const row of matrix) {
      expect(row.length).toBe(MAX_GOALS + 1);
    }
  });

  it("home/draw/away probabilities sum to ~1", () => {
    const matrix = buildScoreMatrix(1.6, 1.1);
    const { home, draw, away } = matchWinnerProbabilities(matrix);
    expect(home + draw + away).toBeCloseTo(1, 3);
  });

  it("a much stronger home lambda gives a higher home-win probability", () => {
    const matrix = buildScoreMatrix(2.5, 0.6);
    const { home, away } = matchWinnerProbabilities(matrix);
    expect(home).toBeGreaterThan(away);
  });

  it("equal lambdas give equal home/away win probability", () => {
    const matrix = buildScoreMatrix(1.4, 1.4);
    const { home, away } = matchWinnerProbabilities(matrix);
    expect(home).toBeCloseTo(away, 10);
  });

  it("in-play: a 2-0 current score with no more goals possible favours home heavily", () => {
    const matrix = buildScoreMatrix(0.05, 0.05); // almost no time/lambda left
    const { home, draw, away } = matchWinnerProbabilities(matrix, 2, 0);
    expect(home).toBeGreaterThan(0.9);
    expect(draw + away).toBeLessThan(0.1);
  });
});

describe("overUnderProbabilities", () => {
  it("over + under sum to 1 by construction", () => {
    const matrix = buildScoreMatrix(1.5, 1.3);
    const { over, under } = overUnderProbabilities(matrix);
    expect(over + under).toBeCloseTo(1, 10);
  });

  it("a current total already above the line makes over a near-certainty", () => {
    // The matrix is truncated at MAX_GOALS per side, so its cells sum to
    // slightly under 1 (the missing tail mass beyond MAX_GOALS goals),
    // not exactly 1 — hence toBeCloseTo rather than toBe here.
    const matrix = buildScoreMatrix(1.0, 1.0);
    const { over, under } = overUnderProbabilities(matrix, 3);
    expect(over).toBeCloseTo(1, 3);
    expect(under).toBeCloseTo(0, 3);
  });
});

describe("bttsProbabilities", () => {
  it("yes + no sum to 1 by construction", () => {
    const matrix = buildScoreMatrix(1.4, 1.2);
    const { yes, no } = bttsProbabilities(matrix);
    expect(yes + no).toBeCloseTo(1, 10);
  });

  it("both sides already on the board makes yes a certainty", () => {
    const matrix = buildScoreMatrix(1.0, 1.0);
    const { yes, no } = bttsProbabilities(matrix, 1, 1);
    expect(yes).toBe(1);
    expect(no).toBe(0);
  });
});

describe("pricing", () => {
  it("fairOdds is the reciprocal of probability", () => {
    expect(fairOdds(0.25)).toBeCloseTo(4, 10);
  });

  it("pricedOdds bakes in the overround, so implied probability from priced odds exceeds the true probability", () => {
    const probability = 0.4;
    const priced = pricedOdds(probability);
    const impliedFromPriced = 1 / priced;
    expect(impliedFromPriced).toBeGreaterThan(probability);
    // De-vigging (dividing back out by the overround) recovers the true probability.
    expect(impliedFromPriced / OVERROUND).toBeCloseTo(probability, 2);
  });

  it("priceMatchWinner returns three positive, finite prices", () => {
    const matrix = buildScoreMatrix(1.5, 1.2);
    const prices = priceMatchWinner(matrix);
    expect(prices.home).toBeGreaterThan(1);
    expect(prices.draw).toBeGreaterThan(1);
    expect(prices.away).toBeGreaterThan(1);
    expect(Number.isFinite(prices.home)).toBe(true);
  });
});

describe("sampleScoreFromMatrix", () => {
  it("only returns scores within the matrix's range", () => {
    const rng = mulberry32(1);
    const matrix = buildScoreMatrix(1.4, 1.1);
    for (let i = 0; i < 200; i++) {
      const { homeGoals, awayGoals } = sampleScoreFromMatrix(rng, matrix);
      expect(homeGoals).toBeGreaterThanOrEqual(0);
      expect(homeGoals).toBeLessThanOrEqual(MAX_GOALS);
      expect(awayGoals).toBeGreaterThanOrEqual(0);
      expect(awayGoals).toBeLessThanOrEqual(MAX_GOALS);
    }
  });

  it("is deterministic for a given rng seed", () => {
    const matrix = buildScoreMatrix(1.4, 1.1);
    const a = sampleScoreFromMatrix(mulberry32(42), matrix);
    const b = sampleScoreFromMatrix(mulberry32(42), matrix);
    expect(a).toEqual(b);
  });

  it("over many draws, the sample mean tracks the matrix's expected goals", () => {
    const rng = mulberry32(7);
    const lambdaHome = 1.6;
    const lambdaAway = 1.1;
    const matrix = buildScoreMatrix(lambdaHome, lambdaAway);
    const n = 20_000;
    let totalHome = 0;
    let totalAway = 0;
    for (let i = 0; i < n; i++) {
      const { homeGoals, awayGoals } = sampleScoreFromMatrix(rng, matrix);
      totalHome += homeGoals;
      totalAway += awayGoals;
    }
    expect(totalHome / n).toBeCloseTo(lambdaHome, 1);
    expect(totalAway / n).toBeCloseTo(lambdaAway, 1);
  });
});
