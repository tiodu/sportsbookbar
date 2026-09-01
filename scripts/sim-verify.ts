/**
 * The calibration test at the bottom of docs/LEAGUE-SPEC.md, run as
 * "npm run sim:verify". Lives outside src/sim/ (which imports only from
 * ./index.ts, per CLAUDE.md non-negotiable #1) and imports only the
 * public API surface, same as any other consumer would.
 *
 * A note on "implied probability from priced odds tracks realised
 * outcome frequency": priced odds deliberately bake in the 1.06
 * overround (see docs/LEAGUE-SPEC.md's Pricing section), so the implied
 * probability read straight off them is ~6% higher than the model's
 * true probability by construction — comparing that raw number to
 * realised frequency would fail this check for a *correctly* calibrated
 * model, for a reason that has nothing to do with calibration. What
 * this check is actually protecting against ("if the odds model is not
 * calibrated, the whole product is a slot machine with a scarf on",
 * per docs/ARCHITECTURE.md) is the *model* being honest — so this
 * compares the model's fair (pre-margin) probability, which
 * src/sim/season.ts already records per match, against realised
 * frequency. A separate unit test (src/sim/odds.test.ts) checks that
 * de-vigging the priced odds recovers that same fair probability, which
 * is what ties the two together.
 *
 * "No club finishing on more than 85% or fewer than 15% of available
 * points" is read here as each club's *average* points fraction across
 * all simulated seasons, not a per-season hard cap — a single season's
 * points fraction is expected to swing widely by chance (that's the
 * "season feels like it has a narrative" bit in the league spec's Goal
 * model section), and a hard per-season cap checked across 10,000 x 12
 * = 120,000 team-seasons would fail on outlier variance alone even for
 * a well-balanced model.
 */

import { TEAMS, mulberry32, simulateSeason, type TeamId } from "../src/sim/index";

const SEASON_COUNT = 10_000;
const SIM_VERIFY_SEED = 777; // fixed, for reproducible verification runs
const CALIBRATION_TOLERANCE_PP = 2;

const rng = mulberry32(SIM_VERIFY_SEED);

let totalMatches = 0;
let totalGoals = 0;
let homeWins = 0;
let draws = 0;
let awayWins = 0;
let sumPredictedHome = 0;
let sumPredictedDraw = 0;
let sumPredictedAway = 0;

const pointsFractionSum = new Map<TeamId, number>(TEAMS.map((t) => [t.id, 0]));
const seasonsCounted = new Map<TeamId, number>(TEAMS.map((t) => [t.id, 0]));

for (let s = 0; s < SEASON_COUNT; s++) {
  const { results, table } = simulateSeason(rng, TEAMS);

  for (const result of results) {
    totalMatches += 1;
    totalGoals += result.homeGoals + result.awayGoals;
    if (result.homeGoals > result.awayGoals) homeWins += 1;
    else if (result.homeGoals === result.awayGoals) draws += 1;
    else awayWins += 1;

    sumPredictedHome += result.preMatchProbabilities.home;
    sumPredictedDraw += result.preMatchProbabilities.draw;
    sumPredictedAway += result.preMatchProbabilities.away;
  }

  for (const row of table) {
    const maxPoints = row.played * 3;
    const fraction = maxPoints > 0 ? row.points / maxPoints : 0;
    pointsFractionSum.set(row.teamId, (pointsFractionSum.get(row.teamId) ?? 0) + fraction);
    seasonsCounted.set(row.teamId, (seasonsCounted.get(row.teamId) ?? 0) + 1);
  }
}

const meanGoalsPerMatch = totalGoals / totalMatches;
const homeWinRate = homeWins / totalMatches;
const drawRate = draws / totalMatches;
const awayWinRate = awayWins / totalMatches;
const avgPredictedHome = sumPredictedHome / totalMatches;
const avgPredictedDraw = sumPredictedDraw / totalMatches;
const avgPredictedAway = sumPredictedAway / totalMatches;

interface Check {
  label: string;
  pass: boolean;
  detail: string;
}

const checks: Check[] = [];

checks.push({
  label: "Mean goals per match in [2.4, 3.0]",
  pass: meanGoalsPerMatch >= 2.4 && meanGoalsPerMatch <= 3.0,
  detail: meanGoalsPerMatch.toFixed(3),
});

checks.push({
  label: "Home win rate in [42%, 48%]",
  pass: homeWinRate >= 0.42 && homeWinRate <= 0.48,
  detail: `${(homeWinRate * 100).toFixed(2)}%`,
});

checks.push({
  label: "Draw rate in [22%, 28%]",
  pass: drawRate >= 0.22 && drawRate <= 0.28,
  detail: `${(drawRate * 100).toFixed(2)}%`,
});

let spreadOk = true;
const spreadDetails: string[] = [];
for (const team of TEAMS) {
  const seasons = seasonsCounted.get(team.id) ?? 0;
  const avgFraction = seasons > 0 ? (pointsFractionSum.get(team.id) ?? 0) / seasons : 0;
  const ok = avgFraction >= 0.15 && avgFraction <= 0.85;
  if (!ok) spreadOk = false;
  spreadDetails.push(`${team.id} ${(avgFraction * 100).toFixed(1)}%`);
}
checks.push({
  label: "No club averaging outside [15%, 85%] of available points across all seasons",
  pass: spreadOk,
  detail: spreadDetails.join(", "),
});

function calibrationCheck(label: string, predicted: number, realised: number): Check {
  const gapPp = Math.abs(predicted - realised) * 100;
  return {
    label: `${label}: implied probability tracks realised frequency (within ${CALIBRATION_TOLERANCE_PP}pp)`,
    pass: gapPp <= CALIBRATION_TOLERANCE_PP,
    detail: `predicted ${(predicted * 100).toFixed(2)}% vs realised ${(realised * 100).toFixed(2)}% (gap ${gapPp.toFixed(2)}pp)`,
  };
}
checks.push(calibrationCheck("Home win", avgPredictedHome, homeWinRate));
checks.push(calibrationCheck("Draw", avgPredictedDraw, drawRate));
checks.push(calibrationCheck("Away win", avgPredictedAway, awayWinRate));

console.log(
  `Simulated ${SEASON_COUNT.toLocaleString()} seasons, ${totalMatches.toLocaleString()} matches (seed ${SIM_VERIFY_SEED}).\n`,
);
for (const check of checks) {
  console.log(`${check.pass ? "PASS" : "FAIL"}  ${check.label}`);
  console.log(`      ${check.detail}`);
}

const allPass = checks.every((c) => c.pass);
console.log(`\n${allPass ? "All checks passed." : "One or more checks FAILED."}`);
process.exit(allPass ? 0 : 1);
