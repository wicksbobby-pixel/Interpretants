import type { Case, FormCell, GrammaticalNumber, NounEntry } from '../domain/types';

export function resolveNounForm(noun: NounEntry, num: GrammaticalNumber, caseName: Case): FormCell {
  return noun.paradigm[num][caseName];
}
