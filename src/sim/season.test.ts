import { describe, expect, it } from "vitest";
import {
  buildLeagueTable,
  computeForm,
  generateFixtures,
  simulateSeason,
  type MatchResult,
} from "./season";
import { TEAMS, type TeamId } from "./teams";
import { mulberry32 } from "./rng";

const TEAM_IDS: readonly TeamId[] = TEAMS.map((t) => t.id);

describe("generateFixtures", () => {
  it("produces 11 matchdays of 6 matches for 12 teams", () => {
    const fixtures = generateFixtures(TEAM_IDS);
    expect(fixtures.length).toBe(66);
    const matchdayCount = new Map<number, number>();
    for (const fixture of fixtures) {
      matchdayCount.set(fixture.matchday, (matchdayCount.get(fixture.matchday) ?? 0) + 1);
    }
    expect(matchdayCount.size).toBe(11);
    for (const count of matchdayCount.values()) {
      expect(count).toBe(6);
    }
  });

  it("every team appears exactly once per matchday", () => {
    const fixtures = generateFixtures(TEAM_IDS);
    const byMatchday = new Map<number, TeamId[]>();
    for (const fixture of fixtures) {
      const list = byMatchday.get(fixture.matchday) ?? [];
      list.push(fixture.home, fixture.away);
      byMatchday.set(fixture.matchday, list);
    }
    for (const teams of byMatchday.values()) {
      expect(new Set(teams).size).toBe(12);
    }
  });

  it("every pair of teams meets exactly once across the season", () => {
    const fixtures = generateFixtures(TEAM_IDS);
    const pairs = new Set<string>();
    for (const fixture of fixtures) {
      const pair = [fixture.home, fixture.away].sort().join("-");
      expect(pairs.has(pair)).toBe(false);
      pairs.add(pair);
    }
    // C(12, 2) = 66
    expect(pairs.size).toBe(66);
  });

  it("throws for an odd number of teams", () => {
    expect(() => generateFixtures(["ARI", "TAU", "GEM"])).toThrow();
  });
});

describe("computeForm", () => {
  const win = (teamId: TeamId, opponent: TeamId, matchday: number): MatchResult => ({
    matchday,
    home: teamId,
    away: opponent,
    homeGoals: 2,
    awayGoals: 0,
    preMatchProbabilities: { home: 0.4, draw: 0.3, away: 0.3 },
  });
  const loss = (teamId: TeamId, opponent: TeamId, matchday: number): MatchResult => ({
    matchday,
    home: teamId,
    away: opponent,
    homeGoals: 0,
    awayGoals: 2,
    preMatchProbabilities: { home: 0.4, draw: 0.3, away: 0.3 },
  });
  const draw = (teamId: TeamId, opponent: TeamId, matchday: number): MatchResult => ({
    matchday,
    home: teamId,
    away: opponent,
    homeGoals: 1,
    awayGoals: 1,
    preMatchProbabilities: { home: 0.4, draw: 0.3, away: 0.3 },
  });

  it("is exactly 1.0 with no results", () => {
    expect(computeForm([], "ARI")).toBe(1.0);
  });

  it("is 1.15 after five straight wins", () => {
    const results = [1, 2, 3, 4, 5].map((md) => win("ARI", "TAU", md));
    expect(computeForm(results, "ARI")).toBeCloseTo(1.15, 10);
  });

  it("is 0.85 after five straight losses", () => {
    const results = [1, 2, 3, 4, 5].map((md) => loss("ARI", "TAU", md));
    expect(computeForm(results, "ARI")).toBeCloseTo(0.85, 10);
  });

  it("is 1.0 after five straight draws", () => {
    const results = [1, 2, 3, 4, 5].map((md) => draw("ARI", "TAU", md));
    expect(computeForm(results, "ARI")).toBeCloseTo(1.0, 10);
  });

  it("decays towards 1.0 with fewer than five games played", () => {
    const oneWin = computeForm([win("ARI", "TAU", 1)], "ARI");
    const fiveWins = computeForm(
      [1, 2, 3, 4, 5].map((md) => win("ARI", "TAU", md)),
      "ARI",
    );
    expect(oneWin).toBeGreaterThan(1.0);
    expect(oneWin).toBeLessThan(fiveWins);
  });

  it("only looks at the most recent five results", () => {
    const sixWins = [1, 2, 3, 4, 5, 6].map((md) => win("ARI", "TAU", md));
    expect(computeForm(sixWins, "ARI")).toBeCloseTo(1.15, 10);
  });

  it("ignores results the team wasn't involved in", () => {
    const unrelated = win("TAU", "GEM", 1);
    expect(computeForm([unrelated], "ARI")).toBe(1.0);
  });
});

describe("buildLeagueTable", () => {
  it("computes points, goal difference and sorting correctly", () => {
    const results: MatchResult[] = [
      {
        matchday: 1,
        home: "ARI",
        away: "TAU",
        homeGoals: 3,
        awayGoals: 1,
        preMatchProbabilities: { home: 0.4, draw: 0.3, away: 0.3 },
      },
      {
        matchday: 2,
        home: "TAU",
        away: "ARI",
        homeGoals: 1,
        awayGoals: 1,
        preMatchProbabilities: { home: 0.4, draw: 0.3, away: 0.3 },
      },
    ];
    const table = buildLeagueTable(results, ["ARI", "TAU"]);
    const ari = table.find((r) => r.teamId === "ARI")!;
    const tau = table.find((r) => r.teamId === "TAU")!;

    expect(ari.played).toBe(2);
    expect(ari.won).toBe(1);
    expect(ari.drawn).toBe(1);
    expect(ari.lost).toBe(0);
    expect(ari.points).toBe(4);
    expect(ari.goalsFor).toBe(4);
    expect(ari.goalsAgainst).toBe(2);
    expect(ari.goalDifference).toBe(2);

    expect(tau.played).toBe(2);
    expect(tau.won).toBe(0);
    expect(tau.drawn).toBe(1);
    expect(tau.lost).toBe(1);
    expect(tau.points).toBe(1);

    // ARI (4 pts) should rank above TAU (1 pt)
    expect(table[0]!.teamId).toBe("ARI");
  });

  it("includes every team even with zero games played", () => {
    const table = buildLeagueTable([], ["ARI", "TAU", "GEM"]);
    expect(table.length).toBe(3);
    for (const row of table) {
      expect(row.played).toBe(0);
      expect(row.points).toBe(0);
    }
  });
});

describe("simulateSeason", () => {
  it("produces 66 results and a full 12-row table respecting temporal causality", () => {
    const rng = mulberry32(123);
    const { results, table } = simulateSeason(rng, TEAMS);
    expect(results.length).toBe(66);
    expect(table.length).toBe(12);

    const totalPlayed = table.reduce((sum, row) => sum + row.played, 0);
    expect(totalPlayed).toBe(66 * 2);

    // Every score is non-negative.
    for (const result of results) {
      expect(result.homeGoals).toBeGreaterThanOrEqual(0);
      expect(result.awayGoals).toBeGreaterThanOrEqual(0);
    }
  });

  it("is deterministic for a given rng seed", () => {
    const a = simulateSeason(mulberry32(999), TEAMS);
    const b = simulateSeason(mulberry32(999), TEAMS);
    expect(a.results).toEqual(b.results);
  });
});
