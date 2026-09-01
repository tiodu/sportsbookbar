import { describe, expect, it } from "vitest";
import {
  DEMO_EVENT_SCRIPT,
  createDemoMatch,
  createDemoRng,
  tickDemoMatch,
} from "./demo";

describe("demo mode", () => {
  it("produces the same goals at the same minutes on every run", () => {
    function runToFullTime() {
      let state = createDemoMatch();
      const rng = createDemoRng();
      const totalTicks = Math.ceil(90 / 0.075) + 2000;
      for (let i = 0; i < totalTicks; i++) {
        state = tickDemoMatch(state, rng);
      }
      return state;
    }

    const runA = runToFullTime();
    const runB = runToFullTime();
    expect(runA).toEqual(runB);

    const scriptedGoals = DEMO_EVENT_SCRIPT.filter((s) => s.event.type === "goal");
    const actualGoals = runA.events.filter((e) => e.type === "goal");
    expect(actualGoals.length).toBe(scriptedGoals.length);
    for (const scripted of scriptedGoals) {
      expect(actualGoals.some((g) => g.minute === scripted.minute)).toBe(true);
    }
  });

  it("lands the scripted home win by full time (the player's bet lands)", () => {
    let state = createDemoMatch();
    const rng = createDemoRng();
    const totalTicks = Math.ceil(90 / 0.075) + 200;
    for (let i = 0; i < totalTicks; i++) {
      state = tickDemoMatch(state, rng);
    }
    expect(state.minute).toBe(90);
    expect(state.homeGoals).toBeGreaterThan(state.awayGoals);
  });
});
