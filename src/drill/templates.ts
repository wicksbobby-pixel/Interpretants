import type { Case, GrammaticalNumber } from '../domain/types';

/**
 * Hand-authored clause skeletons. Each verb-clause template drills exactly
 * ONE case slot — a single cloze blank — chosen from a curated pool of
 * plausible nouns; any other complement the verb governs is shown as
 * fixed, already-correct text (flavor, not a drill target), which is how
 * a two-object verb like "dawać" still gets sentence variety without a
 * second blank. Actual inflected forms are resolved from the vocabulary
 * bank at generation time — only the noun choices and sentence shapes are
 * curated here.
 */

export interface ComplementSpec {
  /** Index into the verb's governance[] array — determines the case and preposition. */
  governanceIndex: number;
  nounIds: string[];
  number?: GrammaticalNumber;
  /** Exactly one complement per template must be drilled: true — that's the cloze blank. */
  drilled: boolean;
  /** Overrides governance[].case for this complement (genitive of negation). Only meaningful when drilled. */
  caseOverride?: Case;
  explanationOverride?: string;
}

export interface VerbClauseTemplate {
  kind: 'verb-clause';
  id: string;
  verbId: string;
  person: 'first' | 'third';
  /** e.g. "Nie " for negated clauses. */
  negatedPrefix?: string;
  /** Rendered as fixed, correct nominative text — never a blank. First-person clauses are pro-drop and omit this. */
  subjectNounIds?: string[];
  complements: ComplementSpec[];
  /** English gloss skeleton; {subj}, {c0}, {c1}... map to complements[] by index. */
  translationTemplate: string;
}

export interface VocativeAddressTemplate {
  kind: 'vocative-address';
  id: string;
  addresseeNounIds: string[];
  /** Fixed trailing text, e.g. ", chodź tu!" — imperatives aren't modeled, so this doesn't drill a verb form, only the vocative noun. */
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
    complements: [{ governanceIndex: 0, nounIds: ['n-kot', 'n-kobieta', 'n-stol', 'n-dlugopis', 'n-student', 'n-kon'], drilled: true }],
    translationTemplate: 'I see {c0}.',
  },
  {
    kind: 'verb-clause',
    id: 'see-object-third',
    verbId: 'v-widziec',
    person: 'third',
    subjectNounIds: ['n-kot', 'n-student', 'n-nauczyciel', 'n-kobieta'],
    complements: [{ governanceIndex: 0, nounIds: ['n-kobieta', 'n-student', 'n-stol', 'n-dlugopis', 'n-kon'], drilled: true }],
    translationTemplate: '{subj} sees {c0}.',
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
        drilled: true,
        caseOverride: 'genitive',
        explanationOverride: 'negated verb → genitive of negation (a general syntactic rule, not specific to mieć)',
      },
    ],
    translationTemplate: "I don't have {c0}.",
  },
  {
    kind: 'verb-clause',
    id: 'see-virile-plural',
    verbId: 'v-widziec',
    person: 'first',
    complements: [{ governanceIndex: 0, nounIds: ['n-student'], number: 'plural', drilled: true }],
    translationTemplate: 'I see {c0}.',
  },
  {
    kind: 'verb-clause',
    id: 'see-nonvirile-animate-plural',
    verbId: 'v-widziec',
    person: 'first',
    complements: [{ governanceIndex: 0, nounIds: ['n-kon'], number: 'plural', drilled: true }],
    translationTemplate: 'I see {c0}.',
  },
  {
    kind: 'verb-clause',
    id: 'go-to-university',
    verbId: 'v-isc',
    person: 'first',
    complements: [{ governanceIndex: 0, nounIds: ['n-uniwersytet'], drilled: true }],
    translationTemplate: "I'm going to {c0}.",
  },
  {
    kind: 'verb-clause',
    id: 'give-what',
    verbId: 'v-dawac',
    person: 'first',
    complements: [
      { governanceIndex: 1, nounIds: ['n-kot', 'n-nauczyciel', 'n-dziecko'], drilled: false },
      { governanceIndex: 0, nounIds: ['n-dlugopis'], drilled: true },
    ],
    translationTemplate: 'I give {c0} {c1}.',
  },

  // ---- tier 2 (instrumental / locative) ----
  {
    kind: 'verb-clause',
    id: 'think-about',
    verbId: 'v-myslec',
    person: 'first',
    complements: [{ governanceIndex: 0, nounIds: ['n-kot', 'n-kobieta', 'n-dziecko'], drilled: true }],
    translationTemplate: "I'm thinking about {c0}.",
  },
  {
    kind: 'verb-clause',
    id: 'be-predicate',
    verbId: 'v-byc',
    person: 'first',
    complements: [{ governanceIndex: 0, nounIds: ['n-nauczyciel', 'n-student'], drilled: true }],
    translationTemplate: 'I am {c0}.',
  },
  {
    kind: 'verb-clause',
    id: 'write-instrumental',
    verbId: 'v-pisac',
    person: 'first',
    complements: [{ governanceIndex: 1, nounIds: ['n-dlugopis'], drilled: true }],
    translationTemplate: "I'm writing with {c0}.",
  },
  {
    kind: 'verb-clause',
    id: 'be-at-university',
    verbId: 'v-byc',
    person: 'first',
    complements: [{ governanceIndex: 1, nounIds: ['n-uniwersytet'], drilled: true }],
    translationTemplate: 'I am at {c0}.',
  },

  // ---- tier 3 (dative) ----
  {
    kind: 'verb-clause',
    id: 'give-to-recipient',
    verbId: 'v-dawac',
    person: 'first',
    complements: [
      { governanceIndex: 1, nounIds: ['n-kot', 'n-nauczyciel', 'n-dziecko'], drilled: true },
      { governanceIndex: 0, nounIds: ['n-dlugopis'], drilled: false },
    ],
    translationTemplate: 'I give {c0} {c1}.',
  },

  // ---- tier 4 (vocative) ----
  {
    kind: 'vocative-address',
    id: 'vocative-kot',
    addresseeNounIds: ['n-kot'],
    interjection: ', chodź tu!',
    translationTemplate: '{addr}, come here!',
  },
  {
    kind: 'vocative-address',
    id: 'vocative-student',
    addresseeNounIds: ['n-student'],
    interjection: ', dziękuję!',
    translationTemplate: '{addr}, thank you!',
  },
  {
    kind: 'vocative-address',
    id: 'vocative-nauczyciel',
    addresseeNounIds: ['n-nauczyciel'],
    interjection: ', dzień dobry!',
    translationTemplate: '{addr}, hello!',
  },
];
