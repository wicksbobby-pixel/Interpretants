import type { Case, GrammaticalNumber } from '../domain/types';
import { createInitialCaseStats, recordCaseAttempt, type CaseStats } from './gating';

/**
 * Two layers of state, deliberately not one:
 *
 * AppState persists across "play again" within a browser session (reset
 * only on page reload — no cross-session persistence yet, that's stage 3).
 * It holds the case-gating stats (so tier unlocks accumulate across
 * rounds, not just within one) and the scorecard's "encountered" set
 * (so the collection genuinely builds up over a sitting rather than
 * resetting every round, which would defeat the point of it).
 *
 * RoundState is the score/streak for the round in progress and resets
 * every startRound().
 */

export interface AppState {
  stats: CaseStats;
  encountered: Set<string>;
}

export function createAppState(): AppState {
  return { stats: createInitialCaseStats(), encountered: new Set() };
}

export function encounterKey(nounId: string, number: GrammaticalNumber, caseName: Case): string {
  return `${nounId}|${number}|${caseName}`;
}

export function markEncountered(app: AppState, nounId: string, number: GrammaticalNumber, caseName: Case): AppState {
  const encountered = new Set(app.encountered);
  encountered.add(encounterKey(nounId, number, caseName));
  return { ...app, encountered };
}

export function recordSlotAnswer(app: AppState, caseName: Case, correct: boolean): AppState {
  return { ...app, stats: recordCaseAttempt(app.stats, caseName, correct) };
}

export interface RoundState {
  score: number;
  streak: number;
  correctUnits: number;
  totalUnits: number;
}

export function createRoundState(): RoundState {
  return { score: 0, streak: 0, correctUnits: 0, totalUnits: 0 };
}

export function recordUnitResult(round: RoundState, correct: boolean): RoundState {
  const streak = correct ? round.streak + 1 : 0;
  const score = correct ? round.score + 10 + round.streak : round.score;
  return {
    ...round,
    streak,
    score,
    correctUnits: round.correctUnits + (correct ? 1 : 0),
    totalUnits: round.totalUnits + 1,
  };
}
