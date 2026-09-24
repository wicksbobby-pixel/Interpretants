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

/**
 * Grammatical gender as adjectives/demonstratives see it: three buckets for
 * agreement-table selection. This is coarser than NounClass on purpose —
 * an adjective's masculine singular table doesn't itself split by animacy,
 * only its ACCUSATIVE CELL does (accusativeAnimate vs. accusative), which
 * is a lookup keyed off the noun's full NounClass, not off Gender alone.
 */
export type Gender = 'masculine' | 'feminine' | 'neuter';

/**
 * The traditional five-way Polish noun-class system, formalized as a
 * single enum rather than a gender+animacy pair. This is the real
 * classification (rodzaj męskoosobowy/męskozwierzęcy/męskorzeczowy/
 * żeński/nijaki), not a simplification of it — collapsing "masculine" +
 * an animacy flag loses the fact that all three masculine subclasses
 * behave identically for adjective/demonstrative TABLE selection but
 * differently for the accusative rule and for plural agreement.
 */
export type NounClass = 'męskoosobowy' | 'męskozwierzęcy' | 'męskorzeczowy' | 'żeński' | 'nijaki';

/** Which of the three agreement tables (adjective/demonstrative gender tables) a noun class selects. */
export function nounClassGender(nc: NounClass): Gender {
  switch (nc) {
    case 'męskoosobowy':
    case 'męskozwierzęcy':
    case 'męskorzeczowy':
      return 'masculine';
    case 'żeński':
      return 'feminine';
    case 'nijaki':
      return 'neuter';
  }
}

/**
 * The accusative rule, formalized once so it can be asserted against
 * (validating hand-entered noun cells) or actually computed from (Structure
 * Mode's rule-generated content, which has no lexical irregularity to get
 * wrong). Two independent facts, not one — singular and plural genuinely
 * diverge: męskozwierzęcy takes acc=gen in the SINGULAR only ("widzę
 * konia") and reverts to acc=nom in the PLURAL ("widzę konie", not the
 * virile "*konie" pattern "koni") — only męskoosobowy keeps acc=gen in
 * the plural. Treating animacy as if it "just generalizes" from singular
 * to plural is exactly the bug this split exists to prevent.
 */
export function accusativeSingularEqualsGenitive(nc: NounClass): boolean {
  return nc === 'męskoosobowy' || nc === 'męskozwierzęcy';
}
export function accusativePluralEqualsGenitive(nc: NounClass): boolean {
  return nc === 'męskoosobowy';
}

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
  /**
   * A different axis from `uncertain`: this is about attestation against a
   * specific external source (Bobby's 625-word Duolingo export), not about
   * grammatical confidence. 'confirmed' means the exact surface string
   * appears somewhere in that export; 'supplied' means it doesn't and the
   * cell was filled in by me. A cell can be 'supplied' and still be a form
   * I'm fully confident is correct (most regular endings) — attestation
   * and correctness confidence are independent. Only populated where the
   * noun has actually been checked against that export; its absence means
   * "not checked," not "supplied." A form marked confirmed for one case
   * cell is marked confirmed for every other cell that happens to share
   * the exact same surface string (syncretism), since attestation is about
   * the string, not the grammatical role Duolingo originally used it for
   * — a flat word-list export can't tell us that role anyway.
   */
  provenance?: 'confirmed' | 'supplied';
}

export type CaseTable = Record<Case, FormCell>;

export interface NounEntry {
  id: string;
  lemma: string;
  translation: string;
  /** English gloss for plural-number clauses, e.g. "children" for dziecko. Defaults to `translation + 's'` when omitted — set this explicitly for any noun whose English plural isn't regular. */
  translationPlural?: string;
  partOfSpeech: 'noun';
  nounClass: NounClass;
  /**
   * Which plural agreement pattern predicates/adjectives modifying this
   * noun in the plural must use — 'virile' (e.g. past-tense -li, byli;
   * nominative-plural adjective -y/-i with the k→c/r→rz etc. alternations)
   * vs. 'nonvirile' (past-tense -ły, były; adjective -e, no alternation).
   *
   * Under the NounClass system this rule has no known exception — virile
   * agreement applies iff nounClass is 'męskoosobowy', full stop — so this
   * COULD now be derived rather than stored. Kept explicit anyway,
   * matching the project's general stance of storing grammatical facts
   * rather than deriving them, and because it's cheap insurance against a
   * genuine exception surfacing later. dziecko ("child") is worth noting
   * here even though it's NOT actually a nounClass exception: it's
   * grammatically nijaki (neuter), and nijaki is never virile — its
   * nonvirile plural ("dzieci były grzeczne", not "*byli grzeczni") only
   * looks surprising if you reason from "refers to a human" instead of
   * from grammatical class. That semantic trap is exactly what nounClass,
   * as a formal category rather than a semantic one, is supposed to
   * prevent.
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
