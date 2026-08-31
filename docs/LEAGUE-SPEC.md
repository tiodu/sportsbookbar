# League spec

The Zodiac Premier League. Twelve clubs, one season, a real model underneath.

## Clubs

Each club has a fixed identity and three tuned attributes.

Aries Athletic (ARI), colour #E74C3C, attack 1.30, defence 0.95. All-out attack, no plan B.
Taurus Town (TAU), colour #27AE60, attack 0.90, defence 1.35. Immovable, boring, effective.
Gemini Rovers (GEM), colour #F1C40F, attack 1.15, defence 0.80. Brilliant or dreadful, never between.
Cancer Celtic (CAN), colour #BDC3C7, attack 0.95, defence 1.10. Home fortress, away disaster.
Leo United (LEO), colour #E67E22, attack 1.35, defence 1.05. The rich ones. Everyone hates them.
Virgo Vale (VIR), colour #16A085, attack 1.00, defence 1.25. Analytics club, joyless, top four.
Libra Wanderers (LIB), colour #E84393, attack 1.05, defence 1.05. Draw specialists.
Scorpio City (SCO), colour #8E44AD, attack 1.10, defence 1.15. Dirty. Leads the league in cards.
Sagittarius FC (SAG), colour #2980B9, attack 1.20, defence 0.85. Long shots, literally.
Capricorn County (CAP), colour #8D6E63, attack 0.85, defence 1.20. Grinders. Nobody's second team.
Aquarius Albion (AQU), colour #00CEC9, attack 1.10, defence 0.90. Weird formations, cult following.
Pisces Harps (PIS), colour #6C5AE7, attack 1.00, defence 1.00. Bottle it every single time.

Character lines are not decoration. NPC banter, ad gags and commentary all pull from them, and a club with a personality is a club people pick.

## Goal model

Poisson, with home advantage and form.

leagueAvgGoals equals 1.35 per team per match.
homeAdvantage equals 1.15.

lambdaHome equals leagueAvgGoals times attackHome times (1 divided by defenceAway) times homeAdvantage times formHome.
lambdaAway equals leagueAvgGoals times attackAway times (1 divided by defenceHome) times formAway.

form is a multiplier in the range 0.85 to 1.15, derived from the last five results, decaying towards 1.0. It is what makes a season feel like it has a narrative.

Goals are drawn per sim tick from the per-tick probability implied by lambda over the match length, not resampled per second, so the totals stay Poisson.

## Outcome probabilities

Build the score matrix for 0 to 8 goals per side, where P(h,a) equals poisson(h, lambdaHome) times poisson(a, lambdaAway). Sum the upper triangle for a home win, the diagonal for a draw, the lower triangle for an away win.

## Pricing

fairOdds equals 1 divided by probability.
overround equals 1.06.
pricedOdds equals fairOdds divided by overround, rounded to 2 decimal places.

A 6% margin is roughly what a real book runs on a match winner market. It matters because anyone from the industry will check, and because it is the honest answer to "how would this make money."

## In-play

Recompute after every goal and at half time, using remaining match time and the current scoreline. Odds should visibly move on the telly when a goal goes in. That movement is free drama and costs nothing once the model exists.

## Markets for v1

Three, each priced from the same score matrix. No more.

1. Match winner: home, draw, away.
2. Over/under 2.5 goals: sum the matrix cells by total goals.
3. Both teams to score: sum cells where both are one or more.

## Match events

The telly needs something to say between goals. Event types are: kickoff, goal (with team, minute, scorer), nearMiss (with team, minute), card (with team, minute, colour of yellow or red), halfTime, fullTime.

Event rates scale off the same attributes. Scorpio City get more cards. A red card lowers the sending-off side's lambda for the remainder, which the odds then reflect. Small detail, disproportionate credibility.

## Season

Single round robin, 12 clubs, 11 matchdays, then it loops with the table archived. The bar always has a fixture list and a table, which is what turns a demo into a world.

## Calibration test

npm run sim:verify must pass before any sim change merges:

- Mean goals per match between 2.4 and 3.0
- Home win rate between 42% and 48%
- Draw rate between 22% and 28%
- No club finishing on more than 85% or fewer than 15% of available points
- Implied probability from priced odds tracks realised outcome frequency within 2 percentage points across 10,000 seasons
