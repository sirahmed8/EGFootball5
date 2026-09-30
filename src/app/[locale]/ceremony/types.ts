export interface SeasonData {
  targetDate: string; // ISO string e.g. "2026-08-31T20:00:00Z"
  goldenBootWinner?: string;
  goldenBootGoals?: number;
  goldenGloveWinner?: string;
  goldenGloveSheets?: number;
  playmakerWinner?: string;
  playmakerAssists?: number;
  mvpWinner?: string;
  mvpRating?: number;
  fairplayWinner?: string;
  championSquad?: string;
  totsGk?: string;
  totsDef1?: string;
  totsDef2?: string;
  totsMid?: string;
  totsStr?: string;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
