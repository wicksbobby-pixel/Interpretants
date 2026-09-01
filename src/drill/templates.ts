import type { Case, GrammaticalNumber } from '../domain/types';

/**
 * Hand-authored clause skeletons, in the same spirit as the vocabulary bank:
 * which verb, which person, which nouns are plausible fillers for each
 * slot — curated for semantic sanity, not randomly cross-joined from the
 * whole vocabulary (nothing here stops "myślę o oknie" from being
 * generated grammatically, but nobody hand-picked "pisać oknem" as a
 * pairing, so it won't come up). The actual inflected FORMS are still
 * resolved from the vocabulary bank at generation time, never hardcoded
 * here — only the noun/modifier CHOICES are curated.
 */

export interface ModifierSpec {
  kind: 'adjective' | 'demonstrative';
  ids: string[];
}

export interface NpSlotSpec {
  nounIds: string[];
  number?: GrammaticalNumber;
  modifier?: ModifierSpec;
}

export interface ComplementSpec extends NpSlotSpec {
  /** Index into the verb's governance[] array — determines the case and preposition. */
  governanceIndex: number;
  /** Overrides governance[].case, for phenomena governance doesn't capture (genitive of negation). */
  caseOverride?: Case;
  explanationOverride?: string;
}

export interface VerbClauseTemplate {
  kind: 'verb-clause';
  id: string;
  verbId: string;
  person: 'first' | 'third';
  /** e.g. "Nie " for negated clauses. Only "mieć" is negated in the seed set. */
  negatedPrefix?: string;
  /** Present only when person is 'third' — first-person clauses are pro-drop, no overt subject. */
  subject?: NpSlotSpec;
  complements: ComplementSpec[];
  /** English gloss skeleton; {subj}, {obj0}, {obj1}... are filled from the resolved NPs. */
  translationTemplate: string;
}

export interface VocativeAddressTemplate {
  kind: 'vocative-address';
  id: string;
  addressee: NpSlotSpec;
  /** Fixed trailing text, e.g. ", chodź tu!" — imperatives aren't modeled (see verbs.ts note on iść), so direct-address clauses don't drill a verb form at all, only the vocative noun (+ optional adjective). */
  interjection: string;
  translationTemplate: string;
}

export type ClauseTemplate = VerbClauseTemplate | VocativeAddressTemplate;

export const CLAUSE_TEMPLATES: ClauseTemplate[] = [
  // ---- tier 1 (nominative / accusative / genitive) ----
  {
    kind: 'verb-clause',
    id: 'see-object',
    verbId: 'v-widziec',
    person: 'first',
    complements: [{ governanceIndex: 0, nounIds: ['n-kot', 'n-kobieta', 'n-stol', 'n-dlugopis', 'n-student'] }],
    translationTemplate: 'I see {obj0}.',
  },
  {
    kind: 'verb-clause',
    id: 'see-object-demonstrative',
    verbId: 'v-widziec',
    person: 'first',
    complements: [
      { governanceIndex: 0, nounIds: ['n-kot', 'n-student', 'n-dlugopis', 'n-stol'], modifier: { kind: 'demonstrative', ids: ['d-ten'] } },
    ],
    translationTemplate: 'I see {obj0}.',
  },
  {
    kind: 'verb-clause',
    id: 'see-object-adjective',
    verbId: 'v-widziec',
    person: 'first',
    complements: [
      { governanceIndex: 0, nounIds: ['n-student', 'n-stol', 'n-kot'], modifier: { kind: 'adjective', ids: ['a-dobry', 'a-wysoki'] } },
    ],
    translationTemplate: 'I see {obj0}.',
  },
  {
    kind: 'verb-clause',
    id: 'have-negated',
    verbId: 'v-miec',
    person: 'first',
    negatedPrefix: 'Nie ',
    complements: [
      {
        governanceIndex: 0,
        nounIds: ['n-kot', 'n-student', 'n-dlugopis'],
        caseOverride: 'genitive',
        explanationOverride: 'negated verb → genitive of negation (a general syntactic rule, not specific to mieć)',
      },
    ],
    translationTemplate: "I don't have {obj0}.",
  },
  {
    kind: 'verb-clause',
    id: 'subject-verb-object',
    verbId: 'v-widziec',
    person: 'third',
    subject: { nounIds: ['n-kot', 'n-student', 'n-nauczyciel', 'n-kobieta'] },
    complements: [{ governanceIndex: 0, nounIds: ['n-kobieta', 'n-student', 'n-stol', 'n-dlugopis'] }],
    translationTemplate: '{subj} sees {obj0}.',
  },
  {
    kind: 'verb-clause',
    id: 'subject-demonstrative-verb-object',
    verbId: 'v-widziec',
    person: 'third',
    subject: { nounIds: ['n-kot', 'n-student'], modifier: { kind: 'demonstrative', ids: ['d-ten'] } },
    complements: [{ governanceIndex: 0, nounIds: ['n-kobieta', 'n-stol', 'n-dlugopis'] }],
    translationTemplate: '{subj} sees {obj0}.',
  },
  {
    kind: 'verb-clause',
    id: 'see-virile-plural',
    verbId: 'v-widziec',
    person: 'first',
    complements: [{ governanceIndex: 0, nounIds: ['n-student'], number: 'plural' }],
    translationTemplate: 'I see {obj0}.',
  },
  {
    kind: 'verb-clause',
    id: 'go-to-university',
    verbId: 'v-isc',
    person: 'first',
    complements: [{ governanceIndex: 0, nounIds: ['n-uniwersytet'] }],
    translationTemplate: "I'm going to {obj0}.",
  },

  // ---- tier 2 (instrumental / locative) ----
  {
    kind: 'verb-clause',
    id: 'think-about',
    verbId: 'v-myslec',
    person: 'first',
    complements: [{ governanceIndex: 0, nounIds: ['n-kot', 'n-kobieta', 'n-dziecko'] }],
    translationTemplate: "I'm thinking about {obj0}.",
  },
  {
    kind: 'verb-clause',
    id: 'think-about-demonstrative',
    verbId: 'v-myslec',
    person: 'first',
    complements: [{ governanceIndex: 0, nounIds: ['n-kobieta', 'n-kot'], modifier: { kind: 'demonstrative', ids: ['d-ten'] } }],
    translationTemplate: "I'm thinking about {obj0}.",
  },
  {
    kind: 'verb-clause',
    id: 'be-predicate',
    verbId: 'v-byc',
    person: 'first',
    complements: [{ governanceIndex: 0, nounIds: ['n-nauczyciel', 'n-student'] }],
    translationTemplate: 'I am {obj0}.',
  },
  {
    kind: 'verb-clause',
    id: 'write-instrumental',
    verbId: 'v-pisac',
    person: 'first',
    complements: [{ governanceIndex: 1, nounIds: ['n-dlugopis'] }],
    translationTemplate: "I'm writing with {obj0}.",
  },
  {
    kind: 'verb-clause',
    id: 'write-instrumental-adjective',
    verbId: 'v-pisac',
    person: 'first',
    complements: [{ governanceIndex: 1, nounIds: ['n-dlugopis'], modifier: { kind: 'adjective', ids: ['a-dobry'] } }],
    translationTemplate: "I'm writing with {obj0}.",
  },
  {
    kind: 'verb-clause',
    id: 'be-at-university',
    verbId: 'v-byc',
    person: 'first',
    complements: [{ governanceIndex: 1, nounIds: ['n-uniwersytet'] }],
    translationTemplate: 'I am at {obj0}.',
  },

  // ---- tier 3 (dative) ----
  {
    kind: 'verb-clause',
    id: 'give-dative-demonstrative-accusative',
    verbId: 'v-dawac',
    person: 'first',
    complements: [
      { governanceIndex: 1, nounIds: ['n-dziecko', 'n-kot'], modifier: { kind: 'demonstrative', ids: ['d-ten'] } },
      { governanceIndex: 0, nounIds: ['n-dlugopis'] },
    ],
    translationTemplate: 'I give {obj0} {obj1}.',
  },
  {
    kind: 'verb-clause',
    id: 'give-dative-simple',
    verbId: 'v-dawac',
    person: 'first',
    complements: [
      { governanceIndex: 1, nounIds: ['n-kot', 'n-nauczyciel'] },
      { governanceIndex: 0, nounIds: ['n-dlugopis'] },
    ],
    translationTemplate: 'I give {obj0} {obj1}.',
  },

  // ---- tier 4 (vocative) ----
  {
    kind: 'vocative-address',
    id: 'vocative-kot',
    addressee: { nounIds: ['n-kot'] },
    interjection: ', chodź tu!',
    translationTemplate: '{addr}, come here!',
  },
  {
    kind: 'vocative-address',
    id: 'vocative-student-adjective',
    addressee: { nounIds: ['n-student'], modifier: { kind: 'adjective', ids: ['a-dobry'] } },
    interjection: ', dziękuję!',
    translationTemplate: '{addr}, thank you!',
  },
];
