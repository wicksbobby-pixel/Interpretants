import type { FormCell, GrammaticalNumber, NounEntry } from '../domain/types';

/**
 * Distractors are always OTHER cells from the same paradigm(s), never
 * unrelated words — the point is to force real case discrimination
 * ("kota vs. kotu vs. kotem"), not vocabulary recognition.
 */

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function collectDistinct(cells: FormCell[], excludeForms: Set<string>, count: number): FormCell[] {
  const result: FormCell[] = [];
  for (const c of shuffle(cells)) {
    if (result.length >= count) break;
    if (excludeForms.has(c.form)) continue;
    excludeForms.add(c.form);
    result.push(c);
  }
  return result;
}

/** Distractors for a noun slot: other cells of the same number-table first, falling back to the other number if the paradigm is too syncretic to supply enough distinct forms. */
export function pickNounDistractors(noun: NounEntry, num: GrammaticalNumber, correctForm: string, count = 2): FormCell[] {
  const excludeForms = new Set([correctForm]);
  const primary = Object.values(noun.paradigm[num]);
  const result = collectDistinct(primary, excludeForms, count);
  if (result.length < count) {
    const secondary = Object.values(noun.paradigm[num === 'singular' ? 'plural' : 'singular']);
    result.push(...collectDistinct(secondary, excludeForms, count - result.length));
  }
  return result;
}

/** Distractors for a modifier (adjective/demonstrative) slot: other cells of the same gender/number agreement table, falling back to the modifier's full paradigm if that table alone is too syncretic (small closed-class paradigms like "ten" can be). */
export function pickModifierDistractors(
  agreementTable: Record<string, FormCell>,
  fullParadigmCells: FormCell[],
  correctForm: string,
  count = 2
): FormCell[] {
  const excludeForms = new Set([correctForm]);
  const result = collectDistinct(Object.values(agreementTable), excludeForms, count);
  if (result.length < count) {
    result.push(...collectDistinct(fullParadigmCells, excludeForms, count - result.length));
  }
  return result;
}
