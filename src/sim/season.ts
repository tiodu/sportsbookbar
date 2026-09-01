/**
 * Fixture generation, the league table, the results archive, and form —
 * per docs/LEAGUE-SPEC.md's Season section: "Single round robin, 12
 * clubs, 11 matchdays, then it loops with the table archived."
 */

import type { Rng } from "./rng";
import type { Team, TeamId } from "./teams";
import {
  buildScoreMatrix,
  computeMatchLambdas,
  matchWinnerProbabilities,
  sampleScoreFromMatrix,
  type MatchWinnerProbabilities,
} from "./odds";

export interface Fixture {
  readonly matchday: number;
  readonly home: TeamId;
  readonly away: TeamId;
}

/**
 * Single round robin via the standard circle method: one team is fixed,
 * the rest rotate around it each round. For n (even) teams this produces
 * exactly n-1 rounds of n/2 matches, and every pair meets exactly once —
 * for 12 teams, 11 matchdays of 6 matches, matching the league spec
 * exactly. Home/away alternates by round parity so it's not always the
 * same side at home.
 */
export function generateFixtures(teamIds: readonly TeamId[]): Fixture[] {
  const n = teamIds.length;
  if (n < 2 || n % 2 !== 0) {
    throw new Error("generateFixtures: an even number of at least 2 teams is required");
  }

  const rounds = n - 1;
  const half = n / 2;
  const fixed = teamIds[0]!;
  const rotating = teamIds.slice(1);
  const rotatingCount = rotating.length;

  const fixtures: Fixture[] = [];
  for (let round = 0; round < rounds; round++) {
    const seats: TeamId[] = new Array(n);
    seats[0] = fixed;
    for (let i = 1; i < n; i++) {
      seats[i] = rotating[(round + i - 1) % rotatingCount]!;
    }
    for (let j = 0; j < half; j++) {
      const teamA = seats[j]!;
      const teamB = seats[n - 1 - j]!;
      const aIsHome = (round + j) % 2 === 0;
      fixtures.push({
        matchday: round + 1,
        home: aIsHome ? teamA : teamB,
        away: aIsHome ? teamB : teamA,
      });
    }
  }
  return fixtures;
}

export interface MatchResult {
  readonly matchday: number;
  readonly home: TeamId;
  readonly away: TeamId;
  readonly homeGoals: number;
  readonly awayGoals: number;
  /** The fair (pre-margin) pre-match probabilities this score was sampled from. */
  readonly preMatchProbabilities: MatchWinnerProbabilities;
}

export type ResultOutcome = "win" | "draw" | "loss";

function outcomeFor(teamId: TeamId, result: MatchResult): ResultOutcome | null {
  if (result.home === teamId) {
    if (result.homeGoals > result.awayGoals) return "win";
    if (result.homeGoals === result.awayGoals) return "draw";
    return "loss";
  }
  if (result.away === teamId) {
    if (result.awayGoals > result.homeGoals) return "win";
    if (result.awayGoals === result.homeGoals) return "draw";
    return "loss";
  }
  return null;
}

const FORM_WINDOW = 5;
const FORM_SWING = 0.15; // form = 1.0 +/- this, matching the spec's 0.85-1.15 range

/**
 * Form: a multiplier in [0.85, 1.15] from the team's last five results,
 * decaying towards 1.0. Dividing by a fixed window (rather than by the
 * number of games actually played) is what gives the decay: a team with
 * only one or two results behind it gets pulled most of the way back to
 * neutral, and only reaches the full +/-0.15 swing with a full five-game
 * window of results.
 */
export function computeForm(results: readonly MatchResult[], teamId: TeamId): number {
  const relevant = results.filter((r) => r.home === teamId || r.away === teamId);
  const lastFive = relevant.slice(-FORM_WINDOW);
  const sum = lastFive.reduce((total, result) => {
    const outcome = outcomeFor(teamId, result);
    if (outcome === "win") return total + 1;
    if (outcome === "loss") return total - 1;
    return total;
  }, 0);
  const formScore = sum / FORM_WINDOW; // in [-1, 1], damped when fewer than 5 games exist
  return 1 + formScore * FORM_SWING;
}

export interface TableRow {
  teamId: TeamId;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

/** Sorted by points, then goal difference, then goals for, then id (stable tie-break). */
export function buildLeagueTable(
  results: readonly MatchResult[],
  teamIds: readonly TeamId[],
): TableRow[] {
  const rows = new Map<TeamId, TableRow>();
  for (const teamId of teamIds) {
    rows.set(teamId, {
      teamId,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  for (const result of results) {
    const homeRow = rows.get(result.home);
    const awayRow = rows.get(result.away);
    if (!homeRow || !awayRow) continue;

    homeRow.played += 1;
    awayRow.played += 1;
    homeRow.goalsFor += result.homeGoals;
    homeRow.goalsAgainst += result.awayGoals;
    awayRow.goalsFor += result.awayGoals;
    awayRow.goalsAgainst += result.homeGoals;

    if (result.homeGoals > result.awayGoals) {
      homeRow.won += 1;
      homeRow.points += 3;
      awayRow.lost += 1;
    } else if (result.homeGoals < result.awayGoals) {
      awayRow.won += 1;
      awayRow.points += 3;
      homeRow.lost += 1;
    } else {
      homeRow.drawn += 1;
      homeRow.points += 1;
      awayRow.drawn += 1;
      awayRow.points += 1;
    }
  }

  const table = Array.from(rows.values());
  for (const row of table) {
    row.goalDifference = row.goalsFor - row.goalsAgainst;
  }
  table.sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.teamId.localeCompare(b.teamId),
  );
  return table;
}

export interface SeasonResult {
  fixtures: readonly Fixture[];
  results: MatchResult[];
  table: TableRow[];
}

/**
 * Simulates one full season: generates fixtures, then plays them in
 * matchday order, computing each side's form from results so far (never
 * from future matchdays) and sampling each score from the same
 * Poisson matrix used for pricing.
 */
export function simulateSeason(rng: Rng, teams: readonly Team[]): SeasonResult {
  const teamIds = teams.map((t) => t.id);
  const teamsById = new Map(teams.map((t) => [t.id, t]));
  const fixtures = generateFixtures(teamIds);
  const results: MatchResult[] = [];

  for (const fixture of fixtures) {
    const home = teamsById.get(fixture.home);
    const away = teamsById.get(fixture.away);
    if (!home || !away) continue;

    const formHome = computeForm(results, fixture.home);
    const formAway = computeForm(results, fixture.away);
    const { lambdaHome, lambdaAway } = computeMatchLambdas(
      home.attack,
      home.defence,
      away.attack,
      away.defence,
      formHome,
      formAway,
    );
    const matrix = buildScoreMatrix(lambdaHome, lambdaAway);
    const preMatchProbabilities = matchWinnerProbabilities(matrix);
    const { homeGoals, awayGoals } = sampleScoreFromMatrix(rng, matrix);

    results.push({
      matchday: fixture.matchday,
      home: fixture.home,
      away: fixture.away,
      homeGoals,
      awayGoals,
      preMatchProbabilities,
    });
  }

  return { fixtures, results, table: buildLeagueTable(results, teamIds) };
}
