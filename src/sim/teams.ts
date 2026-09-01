/**
 * The twelve clubs of the Zodiac Premier League, exactly as specified in
 * docs/LEAGUE-SPEC.md. Character lines are not decoration — NPC banter,
 * ad gags and commentary all pull from them (see .claude/skills/pub-voice
 * and .claude/skills/pub-identity).
 */

export type TeamId =
  | "ARI"
  | "TAU"
  | "GEM"
  | "CAN"
  | "LEO"
  | "VIR"
  | "LIB"
  | "SCO"
  | "SAG"
  | "CAP"
  | "AQU"
  | "PIS";

export interface Team {
  readonly id: TeamId;
  readonly name: string;
  readonly abbreviation: TeamId;
  readonly colour: string;
  readonly attack: number;
  readonly defence: number;
  readonly characterLine: string;
}

export const TEAMS: readonly Team[] = [
  {
    id: "ARI",
    name: "Aries Athletic",
    abbreviation: "ARI",
    colour: "#E74C3C",
    attack: 1.3,
    defence: 0.95,
    characterLine: "All-out attack, no plan B.",
  },
  {
    id: "TAU",
    name: "Taurus Town",
    abbreviation: "TAU",
    colour: "#27AE60",
    attack: 0.9,
    defence: 1.35,
    characterLine: "Immovable, boring, effective.",
  },
  {
    id: "GEM",
    name: "Gemini Rovers",
    abbreviation: "GEM",
    colour: "#F1C40F",
    attack: 1.15,
    defence: 0.8,
    characterLine: "Brilliant or dreadful, never between.",
  },
  {
    id: "CAN",
    name: "Cancer Celtic",
    abbreviation: "CAN",
    colour: "#BDC3C7",
    attack: 0.95,
    defence: 1.1,
    characterLine: "Home fortress, away disaster.",
  },
  {
    id: "LEO",
    name: "Leo United",
    abbreviation: "LEO",
    colour: "#E67E22",
    attack: 1.35,
    defence: 1.05,
    characterLine: "The rich ones. Everyone hates them.",
  },
  {
    id: "VIR",
    name: "Virgo Vale",
    abbreviation: "VIR",
    colour: "#16A085",
    attack: 1.0,
    defence: 1.25,
    characterLine: "Analytics club, joyless, top four.",
  },
  {
    id: "LIB",
    name: "Libra Wanderers",
    abbreviation: "LIB",
    colour: "#E84393",
    attack: 1.05,
    defence: 1.05,
    characterLine: "Draw specialists.",
  },
  {
    id: "SCO",
    name: "Scorpio City",
    abbreviation: "SCO",
    colour: "#8E44AD",
    attack: 1.1,
    defence: 1.15,
    characterLine: "Dirty. Leads the league in cards.",
  },
  {
    id: "SAG",
    name: "Sagittarius FC",
    abbreviation: "SAG",
    colour: "#2980B9",
    attack: 1.2,
    defence: 0.85,
    characterLine: "Long shots, literally.",
  },
  {
    id: "CAP",
    name: "Capricorn County",
    abbreviation: "CAP",
    colour: "#8D6E63",
    attack: 0.85,
    defence: 1.2,
    characterLine: "Grinders. Nobody's second team.",
  },
  {
    id: "AQU",
    name: "Aquarius Albion",
    abbreviation: "AQU",
    colour: "#00CEC9",
    attack: 1.1,
    defence: 0.9,
    characterLine: "Weird formations, cult following.",
  },
  {
    id: "PIS",
    name: "Pisces Harps",
    abbreviation: "PIS",
    colour: "#6C5AE7",
    attack: 1.0,
    defence: 1.0,
    characterLine: "Bottle it every single time.",
  },
];

export const TEAMS_BY_ID: Readonly<Record<TeamId, Team>> = Object.fromEntries(
  TEAMS.map((team) => [team.id, team]),
) as Record<TeamId, Team>;
