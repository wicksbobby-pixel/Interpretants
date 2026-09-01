import type { VocabEntry, NounEntry, AdjectiveEntry, VerbEntry, DemonstrativeEntry } from '../types';
import { NOUNS } from './nouns';
import { ADJECTIVES } from './adjectives';
import { VERBS } from './verbs';
import { DEMONSTRATIVES } from './demonstratives';

export { NOUNS, ADJECTIVES, VERBS, DEMONSTRATIVES };

export const VOCABULARY: VocabEntry[] = [...NOUNS, ...ADJECTIVES, ...VERBS, ...DEMONSTRATIVES];

const BY_ID = new Map(VOCABULARY.map((entry) => [entry.id, entry]));
const NOUNS_BY_ID = new Map(NOUNS.map((entry) => [entry.id, entry]));
const ADJECTIVES_BY_ID = new Map(ADJECTIVES.map((entry) => [entry.id, entry]));
const VERBS_BY_ID = new Map(VERBS.map((entry) => [entry.id, entry]));
const DEMONSTRATIVES_BY_ID = new Map(DEMONSTRATIVES.map((entry) => [entry.id, entry]));

export function getVocabEntry(id: string): VocabEntry | undefined {
  return BY_ID.get(id);
}

/** Typed accessors that throw on a bad id rather than silently returning undefined — clause templates reference ids by hand, so a typo should fail loudly at generation time, not produce a blank slot. */
export function getNoun(id: string): NounEntry {
  const entry = NOUNS_BY_ID.get(id);
  if (!entry) throw new Error(`Unknown noun id: ${id}`);
  return entry;
}

export function getAdjective(id: string): AdjectiveEntry {
  const entry = ADJECTIVES_BY_ID.get(id);
  if (!entry) throw new Error(`Unknown adjective id: ${id}`);
  return entry;
}

export function getVerb(id: string): VerbEntry {
  const entry = VERBS_BY_ID.get(id);
  if (!entry) throw new Error(`Unknown verb id: ${id}`);
  return entry;
}

export function getDemonstrative(id: string): DemonstrativeEntry {
  const entry = DEMONSTRATIVES_BY_ID.get(id);
  if (!entry) throw new Error(`Unknown demonstrative id: ${id}`);
  return entry;
}
