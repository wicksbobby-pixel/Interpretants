import type { VocabEntry } from '../types';
import { NOUNS } from './nouns';
import { ADJECTIVES } from './adjectives';
import { VERBS } from './verbs';

export { NOUNS, ADJECTIVES, VERBS };

export const VOCABULARY: VocabEntry[] = [...NOUNS, ...ADJECTIVES, ...VERBS];

const BY_ID = new Map(VOCABULARY.map((entry) => [entry.id, entry]));

export function getVocabEntry(id: string): VocabEntry | undefined {
  return BY_ID.get(id);
}
