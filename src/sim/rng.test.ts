import { describe, expect, it } from "vitest";
import { mulberry32, pick, randFloat, randInt } from "./rng";

describe("mulberry32", () => {
  it("is deterministic for a given seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("produces values in [0, 1)", () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 100; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("differs across seeds", () => {
    const a = mulberry32(1)();
    const b = mulberry32(2)();
    expect(a).not.toBe(b);
  });
});

describe("randInt", () => {
  it("stays within bounds inclusive", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const value = randInt(rng, 3, 5);
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(5);
    }
  });
});

describe("randFloat", () => {
  it("stays within [min, max)", () => {
    const rng = mulberry32(9);
    for (let i = 0; i < 100; i++) {
      const value = randFloat(rng, -2, 2);
      expect(value).toBeGreaterThanOrEqual(-2);
      expect(value).toBeLessThan(2);
    }
  });
});

describe("pick", () => {
  it("only returns items from the array", () => {
    const rng = mulberry32(11);
    const items = ["a", "b", "c"] as const;
    for (let i = 0; i < 20; i++) {
      expect(items).toContain(pick(rng, items));
    }
  });

  it("throws on an empty array", () => {
    const rng = mulberry32(11);
    expect(() => pick(rng, [])).toThrow();
  });
});
