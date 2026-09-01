import type { Case } from '../domain/types';
import { createInitialCaseStats, recordCaseAttempt, type CaseStats } from './gating';

/**
 * Pure state + reducers, no DOM. "Unit" = one drilled item for
 * scoring/streak purposes — a single-slot answer OR a completed coupled
 * pair (both modifier and noun correct), counted once. Per-case gating
 * stats are recorded per SLOT though (recordSlotAnswer), since a coupled
 * pair is genuinely two separate case-recall attempts on the same case,
 * not one.
 *
 * No persistence, pause/resume, or mistake log here — those are stage 3.
 * This is intentionally the minimum needed to drive a playable round.
 */

export interface SessionState {
  stats: CaseStats;
  score: number;
  streak: number;
  correctUnits: number;
  totalUnits: number;
}

export function createSession(): SessionState {
  return { stats: createInitialCaseStats(), score: 0, streak: 0, correctUnits: 0, totalUnits: 0 };
}

export function recordSlotAnswer(state: SessionState, caseName: Case, correct: boolean): SessionState {
  return { ...state, stats: recordCaseAttempt(state.stats, caseName, correct) };
}

export function recordUnitResult(state: SessionState, correct: boolean): SessionState {
  const streak = correct ? state.streak + 1 : 0;
  const score = correct ? state.score + 10 + state.streak : state.score;
  return {
    ...state,
    streak,
    score,
    correctUnits: state.correctUnits + (correct ? 1 : 0),
    totalUnits: state.totalUnits + 1,
  };
}
