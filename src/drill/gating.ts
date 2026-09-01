import type { Case } from '../domain/types';

/**
 * Acquisition-order tiers, per the spec: highest-communicative-frequency
 * cases first, vocative last since it's lowest-frequency and often dropped
 * in casual speech. Tier 0 (nominative/accusative/genitive) is unlocked
 * from the start; each later tier unlocks once the cases already unlocked
 * are being answered accurately enough.
 */
export const CASE_TIERS: readonly Case[][] = [
  ['nominative', 'accusative', 'genitive'],
  ['instrumental', 'locative'],
  ['dative'],
  ['vocative'],
];

/**
 * FLAGGING FOR REVIEW, not a settled value: these numbers are a starting
 * guess, not something I have grammatical or pedagogical grounds to assert.
 * `accuracyThreshold` is the rolling accuracy (across ALL cases unlocked so
 * far, not just the newest tier) required before the next tier opens;
 * `minAttemptsBeforeUnlock` guards against unlocking off three lucky
 * guesses. Sanity-check both before trusting the gating behavior.
 */
export const GATING_CONFIG = {
  accuracyThreshold: 0.8,
  minAttemptsBeforeUnlock: 8,
};

export interface CaseStat {
  correct: number;
  total: number;
}

/** Keyed by Case; a case with no attempts yet is simply absent rather than a zeroed record, so serialized stats stay small. */
export type CaseStats = Partial<Record<Case, CaseStat>>;

export function createInitialCaseStats(): CaseStats {
  return {};
}

export function recordCaseAttempt(stats: CaseStats, caseName: Case, correct: boolean): CaseStats {
  const prior = stats[caseName] ?? { correct: 0, total: 0 };
  return {
    ...stats,
    [caseName]: { correct: prior.correct + (correct ? 1 : 0), total: prior.total + 1 },
  };
}

function combinedAccuracy(stats: CaseStats, cases: readonly Case[]): { accuracy: number; total: number } {
  let correct = 0;
  let total = 0;
  for (const c of cases) {
    const s = stats[c];
    if (!s) continue;
    correct += s.correct;
    total += s.total;
  }
  return { accuracy: total > 0 ? correct / total : 0, total };
}

/** Index of the highest tier unlocked so far (0-based; tier 0 is always unlocked). */
export function unlockedTierIndex(stats: CaseStats): number {
  let index = 0;
  for (let i = 0; i < CASE_TIERS.length - 1; i++) {
    const casesSoFar = CASE_TIERS.slice(0, i + 1).flat();
    const { accuracy, total } = combinedAccuracy(stats, casesSoFar);
    if (total >= GATING_CONFIG.minAttemptsBeforeUnlock && accuracy >= GATING_CONFIG.accuracyThreshold) {
      index = i + 1;
    } else {
      break;
    }
  }
  return index;
}

export function unlockedCases(stats: CaseStats): Case[] {
  return CASE_TIERS.slice(0, unlockedTierIndex(stats) + 1).flat();
}
