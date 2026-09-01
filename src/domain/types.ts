/**
 * Domain model for Case Rush's vocabulary bank.
 *
 * Design stance: every inflected form is stored explicitly, never derived.
 * Polish morphology has enough productive-but-irregular subclasses (fleeting
 * vowels, velar/dental/labial palatalization triggered only in specific
 * cells, suppletive plurals) that a generative engine would silently get
 * edge cases wrong. Correctness over cleverness.
 */

// Listed in traditional Polish pedagogical order (N-G-D-A-I-L-V). This is
// NOT the acquisition-order tier sequence used for gating unlocks — that
// lives in the drilling module (stage 2) and reorders/groups these same
// seven values.
export const CASES = [
  'nominative',
  'genitive',
  'dative',
  'accusative',
  'instrumental',
  'locative',
  'vocative',
] as const;
export type Case = (typeof CASES)[number];

export const CASE_ABBREV: Record<Case, string> = {
  nominative: 'NOM',
  genitive: 'GEN',
  dative: 'DAT',
  accusative: 'ACC',
  instrumental: 'INS',
  locative: 'LOC',
  vocative: 'VOC',
};

export type GrammaticalNumber = 'singular' | 'plural';

export type Gender = 'masculine' | 'feminine' | 'neuter';

/**
 * Animacy subdivides the masculine gender in the singular (it governs the
 * accusative = genitive vs. accusative = nominative split). In the plural
 * it resurfaces as the virile/non-virile distinction: masculine PERSONAL
 * nouns get their own plural agreement pattern; masculine animate
 * (non-personal), masculine inanimate, feminine, and neuter all fall
 * together into "non-virile" plural morphology. That's why NounEntry and
 * AdjectiveEntry key their plural tables by virile/non-virile rather than
 * by gender.
 */
export type Animacy = 'personal' | 'animate' | 'inanimate';

/**
 * Present-tense ending pattern, used descriptively rather than as a
 * committed "conjugation number." Polish reference grammars disagree on
 * how many conjugation classes there are and how to number them (three-way
 * and four-way schemes both circulate); rather than assert one, each verb
 * just records its own 1sg/2sg ending shape.
 */
export type ConjugationPattern =
  | '-ę/-esz'
  | '-ę/-isz'
  | '-ę/-ysz'
  | '-am/-asz'
  | '-em/-esz'
  | 'irregular';

export type StemHardness = 'hard' | 'soft' | 'mixed';

/**
 * The phonological process behind a stem alternation. Kept distinct because
 * the seed data already needs three different ones and they're not
 * interchangeable for feedback purposes:
 *  - 'palatalization': a stem consonant softens before a front vowel/glide
 *    ending (t→ć, s→ś, n→ń, k→c, g→dz, r→rz — this bucket follows the
 *    pedagogical convention of grouping all of these together, though
 *    historically r→rz reflects a distinct Slavic sound change (iotation)
 *    from the t→ć/k→c type (first/second palatalization reflexes)).
 *  - 'l-hardening': historical ł→l before a following front vowel (stół →
 *    stole). Not consonant softening — if anything the opposite lineage —
 *    so lumping it in with palatalization would misname the mechanism in
 *    feedback text.
 *  - 'vowel-epenthesis': a vowel is inserted (not a consonant changed) to
 *    break up an otherwise-illegal cluster in a zero-ending cell, e.g.
 *    okno → okien (genitive plural) inserting -e- into okn-.
 */
export type StemAlternationMechanism = 'palatalization' | 'l-hardening' | 'vowel-epenthesis';

/**
 * A stem alternation attested in a specific paradigm cell, e.g.
 * kot → kocie (t → ć, spelled "ci") in the locative singular. `description`
 * is the human-readable annotation shown in post-answer feedback, per the
 * app's requirement to name the alternation, not just the case.
 */
export interface StemAlternation {
  from: string;
  to: string;
  mechanism: StemAlternationMechanism;
  description: string;
}

export interface FormCell {
  form: string;
  /** Other cases this form is surface-identical to, for syncretism callouts. */
  syncreticWith?: Case[];
  stemAlternation?: StemAlternation;
  /**
   * Set when I'm not fully confident in this specific cell and want it
   * confirmed rather than silently trusted. Surfaced in the debug dump and
   * intended to be surfaced in-app later (stage 2+) rather than buried.
   */
  uncertain?: boolean;
  uncertainNote?: string;
}

export type CaseTable = Record<Case, FormCell>;

export interface NounEntry {
  id: string;
  lemma: string;
  translation: string;
  partOfSpeech: 'noun';
  gender: Gender;
  /** Required in practice for masculine; not meaningful for fem/neut gender agreement, but still drives virile/non-virile plural when the noun is personal. */
  animacy?: Animacy;
  /**
   * Which plural agreement pattern predicates/adjectives modifying this
   * noun in the plural must use — 'virile' (e.g. past-tense -li, byli;
   * nominative-plural adjective -y/-i with the k→c/r→rz etc. alternations)
   * vs. 'nonvirile' (past-tense -ły, były; adjective -e, no alternation).
   *
   * Stored explicitly rather than derived from gender+animacy because it is
   * NOT a reliable function of those alone: dziecko ("child") denotes a
   * human referent but its plural (dzieci) is a lexically fixed exception
   * that takes non-virile agreement — "dzieci były grzeczne", not
   * "*dzieci byli grzeczni". A derive-from-animacy rule would get this
   * word wrong with full confidence, which is exactly the failure mode
   * this field exists to prevent. As a rule of thumb when adding new
   * nouns: personal animacy → virile, everything else → nonvirile, UNLESS
   * you know of a lexical exception like this one.
   */
  pluralAgreementClass: 'virile' | 'nonvirile';
  /** Free-text descriptive label, e.g. "masculine personal, hard stem". Not an enum — declension class taxonomies vary by source and I'd rather describe than misclassify. */
  declensionClass: string;
  stemHardness: StemHardness;
  irregular?: boolean;
  irregularNote?: string;
  paradigm: {
    singular: CaseTable;
    plural: CaseTable;
  };
  notes?: string;
}

export interface AdjectiveEntry {
  id: string;
  /** Masculine nominative singular citation form, e.g. "dobry". */
  lemma: string;
  translation: string;
  partOfSpeech: 'adjective';
  paradigm: {
    singular: {
      /**
       * `accusative` here is the default/inanimate value (syncretic with
       * nominative). `accusativeAnimate` holds the alternate form used when
       * modifying an animate or personal masculine noun (syncretic with
       * genitive) — adjectives mirror the same animacy-conditioned
       * accusative split their head noun shows.
       */
      masculine: CaseTable & { accusativeAnimate?: FormCell };
      feminine: CaseTable;
      neuter: CaseTable;
    };
    plural: {
      virile: CaseTable;
      nonvirile: CaseTable;
    };
  };
  irregular?: boolean;
  irregularNote?: string;
  notes?: string;
}

/**
 * Demonstratives (ten/ta/to) share the pronominal-declension endings that
 * adjectives also use in modern Polish, EXCEPT they have no vocative — you
 * don't address someone as "this!" — so their case table omits it rather
 * than storing a meaningless placeholder.
 */
export type NonVocativeCaseTable = Record<Exclude<Case, 'vocative'>, FormCell>;

export interface DemonstrativeEntry {
  id: string;
  /** Masculine nominative singular citation form, e.g. "ten". */
  lemma: string;
  translation: string;
  partOfSpeech: 'demonstrative';
  paradigm: {
    singular: {
      masculine: NonVocativeCaseTable & { accusativeAnimate?: FormCell };
      feminine: NonVocativeCaseTable;
      neuter: NonVocativeCaseTable;
    };
    plural: {
      virile: NonVocativeCaseTable;
      nonvirile: NonVocativeCaseTable;
    };
  };
  notes?: string;
}

export type GovernedComplement = 'direct-object' | 'indirect-object' | 'oblique' | 'predicate';

/**
 * Describes what case (and optional preposition) a verb assigns to one of
 * its complements. This is what stage 2's clause generator will read to
 * build grammatical single- and coupled-slot drills — it's not just
 * documentation.
 */
export interface GovernancePattern {
  complement: GovernedComplement;
  case: Case;
  preposition?: string;
  note?: string;
}

export interface VerbEntry {
  id: string;
  infinitive: string;
  translation: string;
  partOfSpeech: 'verb';
  aspect: 'imperfective' | 'perfective';
  /** id of the counterpart verb in the aspect pair, if one is seeded. */
  aspectPairId?: string;
  conjugationPattern: ConjugationPattern;
  principalParts: {
    infinitive: string;
    firstSingular: string;
    thirdSingular: string;
  };
  governance: GovernancePattern[];
  irregular?: boolean;
  irregularNote?: string;
  notes?: string;
}

export type VocabEntry = NounEntry | AdjectiveEntry | VerbEntry | DemonstrativeEntry;

/** Convenience constructor to keep seed-data files from repeating boilerplate. */
export function cell(form: string, extra?: Partial<Omit<FormCell, 'form'>>): FormCell {
  return { form, ...extra };
}
