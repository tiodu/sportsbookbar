---
name: demo-script
description: The five-minute demo beat sheet and its acceptance criteria. Load before starting any feature, and check every change against it before merge.
---

# The demo script

This is what gets built. If a feature does not appear here or directly support a beat here, it goes in docs/PARKING-LIST.md.

Run in demo mode, seeded, on a laptop we do not control.

## Beats

0:00, Arrival. Load straight into the bar. Warm lamp light, ambient murmur under muffled commentary, three other avatars already present and moving. No splash, no login, one line of copy that fades.
Passes when: a first-time viewer says something about the atmosphere before anything is explained.

0:30, Movement. Click the floor, walk, click a stool, sit at the counter.
Passes when: the viewer understands the controls without being told.

0:45, The telly. Camera composition puts the screen in focus. Live match, scoreboard, clock, prices on screen.
Passes when: the scoreboard is legible at default zoom on a projector.

1:15, The bet. Click the bartender. Bet slip opens. Match winner, over/under, both teams to score. Place a stake on the favourite.
Passes when: placing a bet takes under 10 seconds and three clicks.

1:45, The goal. Scripted. Confetti at the telly, all NPCs bounce, hype bubbles, warm lights pulse, roar from the room.
Passes when: someone in the room reacts out loud. This beat is the entire emotional argument of the product.

2:30, Odds move. Prices visibly shift after the goal, on the telly and in the slip.
Passes when: the movement is noticeable without being pointed out.

3:00, The payoff. Full time. The bet lands. Player avatar celebrates, NPCs turn towards the player, payout toast, coins on the counter.
Passes when: it is clearly bigger than the ambient goal celebration at 1:45.

3:30, Personality. Ad break on the telly. Joke sponsor, in the pub's voice.
Passes when: it gets a laugh, or at minimum a smile.

3:50, The roadmap, shown not told. Click the casino machine: coming soon. Pick a club, get a scarf, NPC banter changes.
Passes when: the viewer asks what else is planned.

4:20, The world. Close on the league table and the fixture list.
Passes when: it reads as a season rather than a tech demo.

## Resilience requirements

Non-negotiable, because this runs live.

- R resets the full sequence from any state.
- Demo mode is a URL flag, toggleable mid-session.
- Every modal closes on Escape and on backdrop click.
- No state can wedge. If a click misses, nothing breaks.
- Runs offline. No network dependency at runtime.
- Audio muted on load with an obvious unmute, because demos happen in rooms with other people.
- A fallback screen recording exists, and is kept current.

## Review

At the end of each phase, run the full script start to finish, recorded, and check every beat against its pass condition. Beats that fail block the merge.
