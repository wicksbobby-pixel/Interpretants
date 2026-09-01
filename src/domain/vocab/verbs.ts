import type { VerbEntry } from '../types';

/**
 * Seed verb bank. `governance` is read by the stage-2 clause generator to
 * decide what case a slot in a drilled clause needs — it's the load-bearing
 * field here, not just documentation.
 *
 * General note (not repeated per-entry): under sentential negation, an
 * accusative direct object surfaces as genitive ("genitive of negation").
 * This is a general syntactic rule, not a lexical property of any one verb,
 * so it belongs in the stage-2 clause-generation logic rather than in every
 * verb's governance array. Flagged on `mieć` below only because that's the
 * example the original prototype already drilled ("Nie mam kota").
 */
export const VERBS: VerbEntry[] = [
  {
    id: 'v-widziec',
    infinitive: 'widzieć',
    translation: 'to see',
    partOfSpeech: 'verb',
    aspect: 'imperfective',
    aspectPairId: 'v-zobaczyc',
    conjugationPattern: '-ę/-isz',
    principalParts: { infinitive: 'widzieć', firstSingular: 'widzę', thirdSingular: 'widzi' },
    governance: [{ complement: 'direct-object', case: 'accusative' }],
  },
  {
    id: 'v-zobaczyc',
    infinitive: 'zobaczyć',
    translation: 'to see (perfective / catch sight of)',
    partOfSpeech: 'verb',
    aspect: 'perfective',
    aspectPairId: 'v-widziec',
    conjugationPattern: '-ę/-ysz',
    principalParts: { infinitive: 'zobaczyć', firstSingular: 'zobaczę', thirdSingular: 'zobaczy' },
    governance: [{ complement: 'direct-object', case: 'accusative' }],
  },
  {
    id: 'v-miec',
    infinitive: 'mieć',
    translation: 'to have',
    partOfSpeech: 'verb',
    aspect: 'imperfective',
    conjugationPattern: '-em/-esz',
    principalParts: { infinitive: 'mieć', firstSingular: 'mam', thirdSingular: 'ma' },
    governance: [
      {
        complement: 'direct-object',
        case: 'accusative',
        note: 'Under negation ("nie mam...") the object surfaces as genitive — genitive of negation, a general rule applied here because this is the verb the original prototype drilled it with.',
      },
    ],
    irregularNote: 'Present-tense stem (mam, masz, ma...) does not transparently derive from the infinitive mieć; treat the -em/-esz label as descriptive convenience, not a productive pattern to extend to other verbs.',
  },
  {
    id: 'v-byc',
    infinitive: 'być',
    translation: 'to be',
    partOfSpeech: 'verb',
    aspect: 'imperfective',
    conjugationPattern: 'irregular',
    principalParts: { infinitive: 'być', firstSingular: 'jestem', thirdSingular: 'jest' },
    governance: [
      { complement: 'predicate', case: 'instrumental', note: 'predicate nominal after być takes instrumental, e.g. "Jestem nauczycielem"' },
    ],
    irregular: true,
    irregularNote: 'Suppletive: jestem/jest bear no transparent phonological relation to the infinitive być (distinct historical roots). Memorize directly.',
  },
  {
    id: 'v-myslec',
    infinitive: 'myśleć',
    translation: 'to think',
    partOfSpeech: 'verb',
    aspect: 'imperfective',
    aspectPairId: 'v-pomyslec',
    conjugationPattern: '-ę/-isz',
    principalParts: { infinitive: 'myśleć', firstSingular: 'myślę', thirdSingular: 'myśli' },
    governance: [
      { complement: 'oblique', case: 'locative', preposition: 'o', note: '"myśleć o + Loc" = to think about' },
    ],
  },
  {
    id: 'v-pomyslec',
    infinitive: 'pomyśleć',
    translation: 'to think (perfective)',
    partOfSpeech: 'verb',
    aspect: 'perfective',
    aspectPairId: 'v-myslec',
    conjugationPattern: '-ę/-isz',
    principalParts: { infinitive: 'pomyśleć', firstSingular: 'pomyślę', thirdSingular: 'pomyśli' },
    governance: [{ complement: 'oblique', case: 'locative', preposition: 'o' }],
  },
  {
    id: 'v-dawac',
    infinitive: 'dawać',
    translation: 'to give',
    partOfSpeech: 'verb',
    aspect: 'imperfective',
    aspectPairId: 'v-dac',
    conjugationPattern: '-ę/-esz',
    principalParts: { infinitive: 'dawać', firstSingular: 'daję', thirdSingular: 'daje' },
    governance: [
      { complement: 'direct-object', case: 'accusative', note: 'co (what is given)' },
      { complement: 'indirect-object', case: 'dative', note: 'komu (to whom)' },
    ],
    notes: '-awać verbs drop the -wa- infix in the present tense (dawać → daję, not *dawę). This is a regular, productive subclass (sprzedawać → sprzedaję, etc.), not a lexical irregularity — labeled -ę/-esz descriptively rather than flagged irregular.',
  },
  {
    id: 'v-dac',
    infinitive: 'dać',
    translation: 'to give (perfective)',
    partOfSpeech: 'verb',
    aspect: 'perfective',
    aspectPairId: 'v-dawac',
    conjugationPattern: 'irregular',
    principalParts: { infinitive: 'dać', firstSingular: 'dam', thirdSingular: 'da' },
    governance: [
      { complement: 'direct-object', case: 'accusative' },
      { complement: 'indirect-object', case: 'dative' },
    ],
    irregular: true,
    irregularNote: 'Athematic-type present/future conjugation (dam, dasz, da, damy, dacie, dadzą) — same irregular pattern as wiedzieć\'s "wiem" class and jeść\'s "jem" class. Memorize directly.',
  },
  {
    id: 'v-pisac',
    infinitive: 'pisać',
    translation: 'to write',
    partOfSpeech: 'verb',
    aspect: 'imperfective',
    aspectPairId: 'v-napisac',
    conjugationPattern: '-ę/-esz',
    principalParts: { infinitive: 'pisać', firstSingular: 'piszę', thirdSingular: 'pisze' },
    governance: [
      { complement: 'direct-object', case: 'accusative', note: 'co (what is written)' },
      {
        complement: 'oblique',
        case: 'instrumental',
        note: 'bare instrumental of instrument ("piszę długopisem") — an optional adjunct, not obligatory valence like the direct object.',
      },
    ],
    notes: 'Stem consonant alternation is in the CONJUGATION here, not the declension: s → sz throughout the present tense (piszę, piszesz...) but the infinitive keeps s (pisać). Worth surfacing since the app\'s alternation annotations so far are all nominal; this is the verbal analog.',
  },
  {
    id: 'v-napisac',
    infinitive: 'napisać',
    translation: 'to write (perfective)',
    partOfSpeech: 'verb',
    aspect: 'perfective',
    aspectPairId: 'v-pisac',
    conjugationPattern: '-ę/-esz',
    principalParts: { infinitive: 'napisać', firstSingular: 'napiszę', thirdSingular: 'napisze' },
    governance: [
      { complement: 'direct-object', case: 'accusative' },
      { complement: 'oblique', case: 'instrumental', note: 'bare instrumental of instrument, optional adjunct' },
    ],
  },
];
