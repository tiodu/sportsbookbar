import { describe, expect, it } from "vitest";
import {
  AD_BREAK_DURATION_SECONDS,
  HALF_LENGTH_MINUTES,
  TICK_SECONDS,
  createMatch,
  tick,
} from "./match";
import { TEAMS_BY_ID } from "./teams";
import { mulberry32 } from "./rng";

const home = TEAMS_BY_ID.ARI;
const away = TEAMS_BY_ID.LEO;

function runTicks(count: number, seed = 1) {
  const rng = mulberry32(seed);
  let state = createMatch(seed, home, away, 1.0, 1.0);
  for (let i = 0; i < count; i++) {
    state = tick(state, rng);
  }
  return state;
}

describe("createMatch", () => {
  it("starts at kickoff, minute 0, scoreless, with pre-match odds already set", () => {
    const state = createMatch(1, home, away, 1.0, 1.0);
    expect(state.phase).toBe("kickoff");
    expect(state.minute).toBe(0);
    expect(state.homeGoals).toBe(0);
    expect(state.awayGoals).toBe(0);
    expect(state.events).toEqual([]);
    expect(state.liveOdds.matchWinner.home).toBeGreaterThan(1);
  });
});

describe("tick", () => {
  it("emits exactly one kickoff event, on the very first tick", () => {
    const rng = mulberry32(1);
    const state0 = createMatch(1, home, away, 1.0, 1.0);
    const state1 = tick(state0, rng);
    expect(state1.events.filter((e) => e.type === "kickoff").length).toBe(1);
    const state2 = tick(state1, rng);
    expect(state2.events.filter((e) => e.type === "kickoff").length).toBe(1);
  });

  it("progresses through every phase in order, ending steady in adBreak", () => {
    // Enough ticks to comfortably clear kickoff + both halves + halfTime +
    // fullTime + settlement + into adBreak.
    const totalMatchTicks = Math.ceil(90 / 0.075);
    const state = runTicks(totalMatchTicks + 2000);
    expect(state.phase).toBe("adBreak");
    expect(state.minute).toBe(HALF_LENGTH_MINUTES * 2);
  });

  it("stays in adBreak once reached (terminal for a single MatchState)", () => {
    const totalMatchTicks = Math.ceil(90 / 0.075);
    const settled = runTicks(totalMatchTicks + 2000);
    const rng = mulberry32(1);
    const next = tick(settled, rng);
    expect(next.phase).toBe("adBreak");
  });

  it("is fully deterministic for a given seed", () => {
    const a = runTicks(5000, 42);
    const b = runTicks(5000, 42);
    expect(a).toEqual(b);
  });

  it("fires halfTime with minute clamped to 45, and fullTime with minute clamped to 90", () => {
    // Budgets include the kickoff phase's own ticks (it runs before
    // firstHalf even starts advancing the match clock), plus a margin.
    const KICKOFF_TICKS = 30; // 3s / 0.1s
    const HALF_TICKS = Math.ceil(45 / 0.075); // 600
    const HALF_TIME_TICKS = 150; // 15s / 0.1s

    const ticksToHalfway = KICKOFF_TICKS + HALF_TICKS + 50;
    const atHalf = runTicks(ticksToHalfway, 7);
    expect(atHalf.phase === "halfTime" || atHalf.phase === "secondHalf").toBe(true);
    expect(atHalf.minute).toBe(45);

    const ticksToFull = KICKOFF_TICKS + HALF_TICKS + HALF_TIME_TICKS + HALF_TICKS + 50;
    const atFull = runTicks(ticksToFull, 7);
    expect(atFull.minute).toBe(90);
    expect(atFull.events.some((e) => e.type === "fullTime")).toBe(true);
  });

  it("respects the fixed 10Hz tick rate constant", () => {
    expect(TICK_SECONDS).toBe(0.1);
  });

  it("documents a positive ad-break duration for callers to use", () => {
    expect(AD_BREAK_DURATION_SECONDS).toBeGreaterThan(0);
  });
});
