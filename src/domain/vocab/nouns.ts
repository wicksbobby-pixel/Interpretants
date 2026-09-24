import { cell, type NounEntry } from '../types';

/**
 * Seed noun bank. Chosen to cover: all five noun classes (męskoosobowy,
 * męskozwierzęcy, męskorzeczowy, żeński, nijaki), hard vs. soft stems, the
 * dative=locative singular syncretism (fem. -a nouns), the
 * nominative=accusative (męskorzeczowy) vs. genitive=accusative
 * (męskoosobowy/męskozwierzęcy) singular syncretism, virile vs. non-virile
 * plural, and one suppletive/irregular paradigm (dziecko) to exercise the
 * irregular-flag path end to end.
 *
 * `provenance` tags below are checked against Bobby's 625-word Duolingo
 * export (a flat word list, not tagged sentences — see FormCell's doc
 * comment on what that does and doesn't let us claim). The pattern is
 * stark and consistent across every noun checked: NOM/GEN/ACC/INS show up
 * repeatedly, DAT/LOC/VOC never appear even once. That's not a sampling
 * artifact of which words I happened to check — it held for all 18 nouns
 * here, including ones the export apparently never touches at all
 * (nauczyciel, ziemia, mieszkanie, długopis, uniwersytet — every cell
 * 'supplied' for those five).
 *
 * Vocative note: vocative forms below follow the standard literary
 * paradigm. In casual speech the nominative frequently substitutes for the
 * vocative, especially for inanimates — flagging that generally here
 * rather than per-entry, since it's a register fact, not a paradigm error.
 */
export const NOUNS: NounEntry[] = [
  {
    id: 'n-kot',
    lemma: 'kot',
    translation: 'cat',
    partOfSpeech: 'noun',
    nounClass: 'męskozwierzęcy',
    pluralAgreementClass: 'nonvirile',
    declensionClass: 'masculine animate, hard stem',
    stemHardness: 'hard',
    paradigm: {
      singular: {
        nominative: cell('kot', { provenance: 'confirmed' }),
        genitive: cell('kota', { provenance: 'confirmed' }),
        dative: cell('kotu', { provenance: 'supplied' }),
        accusative: cell('kota', { syncreticWith: ['genitive'], provenance: 'confirmed' }),
        instrumental: cell('kotem', { provenance: 'confirmed' }),
        locative: cell('kocie', {
          stemAlternation: { from: 't', to: 'ć', mechanism: 'palatalization', description: 't → ć (spelled "ci") before locative/vocative -e' },
          provenance: 'supplied',
        }),
        vocative: cell('kocie', {
          syncreticWith: ['locative'],
          stemAlternation: { from: 't', to: 'ć', mechanism: 'palatalization', description: 't → ć (spelled "ci") before locative/vocative -e' },
          provenance: 'supplied',
        }),
      },
      plural: {
        nominative: cell('koty', { provenance: 'confirmed' }),
        genitive: cell('kotów', { provenance: 'supplied' }),
        dative: cell('kotom', { provenance: 'supplied' }),
        accusative: cell('koty', { syncreticWith: ['nominative'], provenance: 'confirmed' }),
        instrumental: cell('kotami', { provenance: 'supplied' }),
        locative: cell('kotach', { provenance: 'supplied' }),
        vocative: cell('koty', { provenance: 'confirmed' }),
      },
    },
    notes: 'Non-virile plural throughout — animals pattern with non-virile agreement even though they are grammatically animate in the singular.',
  },
  {
    id: 'n-kon',
    lemma: 'koń',
    translation: 'horse',
    partOfSpeech: 'noun',
    nounClass: 'męskozwierzęcy',
    pluralAgreementClass: 'nonvirile',
    declensionClass: 'masculine animate, soft stem',
    stemHardness: 'soft',
    paradigm: {
      singular: {
        nominative: cell('koń', { provenance: 'confirmed' }),
        genitive: cell('konia', { provenance: 'confirmed' }),
        dative: cell('koniowi', { provenance: 'supplied' }),
        accusative: cell('konia', { syncreticWith: ['genitive'], provenance: 'confirmed' }),
        instrumental: cell('koniem', { provenance: 'supplied' }),
        locative: cell('koniu', { provenance: 'supplied' }),
        vocative: cell('koniu', { syncreticWith: ['locative'], provenance: 'supplied' }),
      },
      plural: {
        nominative: cell('konie', { provenance: 'confirmed' }),
        genitive: cell('koni', { provenance: 'supplied' }),
        dative: cell('koniom', { provenance: 'supplied' }),
        accusative: cell('konie', { syncreticWith: ['nominative'], provenance: 'confirmed' }),
        instrumental: cell('końmi', { provenance: 'supplied' }),
        locative: cell('koniach', { provenance: 'supplied' }),
        vocative: cell('konie', { provenance: 'confirmed' }),
      },
    },
    notes:
      'The deliberate test case for the accusativePluralEqualsGenitive rule: koń is animate (męskozwierzęcy) so its SINGULAR accusative = genitive ("widzę konia"), but its PLURAL accusative reverts to nominative ("widzę konie") — it does NOT take the virile-looking "koni" (which is actually the genitive plural, not an accusative form at all). A generator that "generalizes" animacy from singular to plural gets exactly this wrong. Independently, "konia" and "konie" are both directly attested in the Duolingo export, which is a nice free confirmation of this exact contrast.',
  },
  {
    id: 'n-pies',
    lemma: 'pies',
    translation: 'dog',
    partOfSpeech: 'noun',
    nounClass: 'męskozwierzęcy',
    pluralAgreementClass: 'nonvirile',
    declensionClass: 'masculine animate, hard stem, fleeting vowel',
    stemHardness: 'hard',
    paradigm: {
      singular: {
        nominative: cell('pies', { provenance: 'confirmed' }),
        genitive: cell('psa', { provenance: 'confirmed' }),
        dative: cell('psu', { provenance: 'supplied' }),
        accusative: cell('psa', { syncreticWith: ['genitive'], provenance: 'confirmed' }),
        instrumental: cell('psem', { provenance: 'confirmed' }),
        locative: cell('psie', {
          stemAlternation: { from: 's', to: 'ś', mechanism: 'palatalization', description: 's → ś (spelled "si") before locative/vocative -e' },
          provenance: 'supplied',
        }),
        vocative: cell('psie', {
          syncreticWith: ['locative'],
          stemAlternation: { from: 's', to: 'ś', mechanism: 'palatalization', description: 's → ś (spelled "si") before locative/vocative -e' },
          provenance: 'supplied',
        }),
      },
      plural: {
        nominative: cell('psy', { provenance: 'confirmed' }),
        genitive: cell('psów', { provenance: 'supplied' }),
        dative: cell('psom', { provenance: 'supplied' }),
        accusative: cell('psy', { syncreticWith: ['nominative'], provenance: 'confirmed' }),
        instrumental: cell('psami', { provenance: 'supplied' }),
        locative: cell('psach', { provenance: 'supplied' }),
        vocative: cell('psy', { provenance: 'confirmed' }),
      },
    },
    notes:
      'Fleeting vowel: the nominative singular -e- (pies) drops everywhere else in the singular except the locative/vocative (psa, psu, psem — but psie, not "*pse"). This is a recognizable productive pattern (contrast with dziecko/być, which are lexically suppletive, not pattern-following), so not flagged irregular.',
  },
  {
    id: 'n-stol',
    lemma: 'stół',
    translation: 'table',
    partOfSpeech: 'noun',
    nounClass: 'męskorzeczowy',
    pluralAgreementClass: 'nonvirile',
    declensionClass: 'masculine inanimate, hard stem',
    stemHardness: 'hard',
    paradigm: {
      singular: {
        nominative: cell('stół', { provenance: 'confirmed' }),
        genitive: cell('stołu', { provenance: 'supplied' }),
        dative: cell('stołowi', { provenance: 'supplied' }),
        accusative: cell('stół', { syncreticWith: ['nominative'], provenance: 'confirmed' }),
        instrumental: cell('stołem', { provenance: 'supplied' }),
        locative: cell('stole', {
          stemAlternation: { from: 'ł', to: 'l', mechanism: 'l-hardening', description: 'ł → l before locative/vocative -e (historical hardening, not palatalization proper)' },
          provenance: 'supplied',
        }),
        vocative: cell('stole', { syncreticWith: ['locative'], provenance: 'supplied' }),
      },
      plural: {
        nominative: cell('stoły', { provenance: 'supplied' }),
        genitive: cell('stołów', { provenance: 'supplied' }),
        dative: cell('stołom', { provenance: 'supplied' }),
        accusative: cell('stoły', { syncreticWith: ['nominative'], provenance: 'supplied' }),
        instrumental: cell('stołami', { provenance: 'supplied' }),
        locative: cell('stołach', { provenance: 'supplied' }),
        vocative: cell('stoły', { provenance: 'supplied' }),
      },
    },
    notes: 'ó:o alternation: ó surfaces only in the nominative/accusative singular (closed-syllable outcome); every other cell has plain o.',
  },
  {
    id: 'n-student',
    lemma: 'student',
    translation: 'student',
    partOfSpeech: 'noun',
    nounClass: 'męskoosobowy',
    pluralAgreementClass: 'virile',
    declensionClass: 'masculine personal, hard stem',
    stemHardness: 'hard',
    paradigm: {
      singular: {
        nominative: cell('student', { provenance: 'confirmed' }),
        genitive: cell('studenta', { provenance: 'supplied' }),
        dative: cell('studentowi', { provenance: 'supplied' }),
        accusative: cell('studenta', { syncreticWith: ['genitive'], provenance: 'supplied' }),
        instrumental: cell('studentem', { provenance: 'supplied' }),
        locative: cell('studencie', {
          stemAlternation: { from: 't', to: 'ć', mechanism: 'palatalization', description: 't → ć (spelled "ci") before locative/vocative -e' },
          provenance: 'supplied',
        }),
        vocative: cell('studencie', { syncreticWith: ['locative'], provenance: 'supplied' }),
      },
      plural: {
        nominative: cell('studenci', {
          stemAlternation: { from: 't', to: 'ć', mechanism: 'palatalization', description: 't → ć (spelled "ci") in the virile nominative plural' },
          provenance: 'supplied',
        }),
        genitive: cell('studentów', { provenance: 'supplied' }),
        dative: cell('studentom', { provenance: 'supplied' }),
        accusative: cell('studentów', { syncreticWith: ['genitive'], provenance: 'supplied' }),
        instrumental: cell('studentami', { provenance: 'supplied' }),
        locative: cell('studentach', { provenance: 'supplied' }),
        vocative: cell('studenci', { provenance: 'supplied' }),
      },
    },
    notes: 'Virile plural: accusative = genitive plural (not nominative), unlike the non-virile pattern seen in kot/stół.',
  },
  {
    id: 'n-nauczyciel',
    lemma: 'nauczyciel',
    translation: 'teacher',
    partOfSpeech: 'noun',
    nounClass: 'męskoosobowy',
    pluralAgreementClass: 'virile',
    declensionClass: 'masculine personal, soft stem',
    stemHardness: 'soft',
    paradigm: {
      singular: {
        nominative: cell('nauczyciel', { provenance: 'supplied' }),
        genitive: cell('nauczyciela', { provenance: 'supplied' }),
        dative: cell('nauczycielowi', { provenance: 'supplied' }),
        accusative: cell('nauczyciela', { syncreticWith: ['genitive'], provenance: 'supplied' }),
        instrumental: cell('nauczycielem', { provenance: 'supplied' }),
        locative: cell('nauczycielu', { provenance: 'supplied' }),
        vocative: cell('nauczycielu', { syncreticWith: ['locative'], provenance: 'supplied' }),
      },
      plural: {
        nominative: cell('nauczyciele', { provenance: 'supplied' }),
        genitive: cell('nauczycieli', { provenance: 'supplied' }),
        dative: cell('nauczycielom', { provenance: 'supplied' }),
        accusative: cell('nauczycieli', { syncreticWith: ['genitive'], provenance: 'supplied' }),
        instrumental: cell('nauczycielami', { provenance: 'supplied' }),
        locative: cell('nauczycielach', { provenance: 'supplied' }),
        vocative: cell('nauczyciele', { provenance: 'supplied' }),
      },
    },
    notes:
      'Soft stems take locative/vocative -u rather than -e, so there is no consonant alternation to trigger here (contrast kot, student). Not attested anywhere in the Duolingo export — every cell here is supplied, not confirmed.',
  },
  {
    id: 'n-kobieta',
    lemma: 'kobieta',
    translation: 'woman',
    translationPlural: 'women',
    partOfSpeech: 'noun',
    nounClass: 'żeński',
    pluralAgreementClass: 'nonvirile',
    declensionClass: 'feminine, hard stem, -a',
    stemHardness: 'hard',
    paradigm: {
      singular: {
        nominative: cell('kobieta', { provenance: 'confirmed' }),
        genitive: cell('kobiety', { provenance: 'confirmed' }),
        dative: cell('kobiecie', {
          syncreticWith: ['locative'],
          stemAlternation: { from: 't', to: 'ć', mechanism: 'palatalization', description: 't → ć (spelled "ci") before dative/locative -e' },
          provenance: 'supplied',
        }),
        accusative: cell('kobietę', { provenance: 'confirmed' }),
        instrumental: cell('kobietą', { provenance: 'confirmed' }),
        locative: cell('kobiecie', {
          syncreticWith: ['dative'],
          stemAlternation: { from: 't', to: 'ć', mechanism: 'palatalization', description: 't → ć (spelled "ci") before dative/locative -e' },
          provenance: 'supplied',
        }),
        vocative: cell('kobieto', { provenance: 'supplied' }),
      },
      plural: {
        nominative: cell('kobiety', { provenance: 'confirmed' }),
        genitive: cell('kobiet', { provenance: 'supplied' }),
        dative: cell('kobietom', { provenance: 'supplied' }),
        accusative: cell('kobiety', { syncreticWith: ['nominative'], provenance: 'confirmed' }),
        instrumental: cell('kobietami', { provenance: 'confirmed' }),
        locative: cell('kobietach', { provenance: 'supplied' }),
        vocative: cell('kobiety', { provenance: 'confirmed' }),
      },
    },
    notes:
      'Genitive singular and nominative/accusative/vocative plural are the same string ("kobiety") by coincidence of this declension class, not by any deeper syncretism between singular and plural — worth noting since it means one attested export word ends up confirming four different cells at once.',
  },
  {
    id: 'n-dziewczynka',
    lemma: 'dziewczynka',
    translation: 'girl',
    partOfSpeech: 'noun',
    nounClass: 'żeński',
    pluralAgreementClass: 'nonvirile',
    declensionClass: 'feminine, hard stem, -a, velar-final (k)',
    stemHardness: 'hard',
    paradigm: {
      singular: {
        nominative: cell('dziewczynka', { provenance: 'confirmed' }),
        genitive: cell('dziewczynki', { provenance: 'confirmed' }),
        dative: cell('dziewczynce', {
          syncreticWith: ['locative'],
          stemAlternation: { from: 'k', to: 'c', mechanism: 'palatalization', description: 'k → c (spelled "ce") before dative/locative -e' },
          provenance: 'supplied',
        }),
        accusative: cell('dziewczynkę', { provenance: 'supplied' }),
        instrumental: cell('dziewczynką', { provenance: 'confirmed' }),
        locative: cell('dziewczynce', {
          syncreticWith: ['dative'],
          stemAlternation: { from: 'k', to: 'c', mechanism: 'palatalization', description: 'k → c (spelled "ce") before dative/locative -e' },
          provenance: 'supplied',
        }),
        vocative: cell('dziewczynko', { provenance: 'supplied' }),
      },
      plural: {
        nominative: cell('dziewczynki', { provenance: 'confirmed' }),
        genitive: cell('dziewczynek', {
          stemAlternation: {
            from: '∅',
            to: 'e',
            mechanism: 'vowel-epenthesis',
            description: 'fleeting -e- inserted to break up the nk cluster in the zero-ending genitive plural (dziewczynka → dziewczynek, not *dziewczynk)',
          },
          provenance: 'supplied',
        }),
        dative: cell('dziewczynkom', { provenance: 'supplied' }),
        accusative: cell('dziewczynki', { syncreticWith: ['nominative'], provenance: 'confirmed' }),
        instrumental: cell('dziewczynkami', { provenance: 'supplied' }),
        locative: cell('dziewczynkach', { provenance: 'supplied' }),
        vocative: cell('dziewczynki', { provenance: 'confirmed' }),
      },
    },
    notes:
      'A different declension subtype from kobieta: the stem ends in a velar (k), so dative/locative singular palatalize k→c (dziewczynce, not "*dziewczynkie") and the genitive plural needs the same fleeting-vowel epenthesis okno\'s does (dziewczynek, parallel to okno→okien). Genitive singular and nominative/accusative/vocative plural again coincide as the same string ("dziewczynki"), same pattern as kobieta/kobiety.',
  },
  {
    id: 'n-ziemia',
    lemma: 'ziemia',
    translation: 'earth / land',
    partOfSpeech: 'noun',
    nounClass: 'żeński',
    pluralAgreementClass: 'nonvirile',
    declensionClass: 'feminine, soft stem, -a',
    stemHardness: 'soft',
    paradigm: {
      singular: {
        nominative: cell('ziemia', { provenance: 'supplied' }),
        genitive: cell('ziemi', { provenance: 'supplied' }),
        dative: cell('ziemi', { syncreticWith: ['locative', 'genitive'], provenance: 'supplied' }),
        accusative: cell('ziemię', { provenance: 'supplied' }),
        instrumental: cell('ziemią', { provenance: 'supplied' }),
        locative: cell('ziemi', { syncreticWith: ['dative', 'genitive'], provenance: 'supplied' }),
        vocative: cell('ziemio', { provenance: 'supplied' }),
      },
      plural: {
        nominative: cell('ziemie', { provenance: 'supplied' }),
        genitive: cell('ziem', {
          uncertain: true,
          uncertainNote: 'Zero-ending genitive plural for soft -a stems in labial-final position (m) — confirm before treating as settled; attested in set phrases ("ziemie polskie" / "podział ziem"), but I want a second check on the general rule.',
          provenance: 'supplied',
        }),
        dative: cell('ziemiom', { provenance: 'supplied' }),
        accusative: cell('ziemie', { syncreticWith: ['nominative'], provenance: 'supplied' }),
        instrumental: cell('ziemiami', { provenance: 'supplied' }),
        locative: cell('ziemiach', { provenance: 'supplied' }),
        vocative: cell('ziemie', { provenance: 'supplied' }),
      },
    },
    notes:
      'Already-soft stem (palatal mi), so no orthographic consonant alternation shows up across the paradigm — contrast with kobieta, where -a is hard and t must palatalize. Not attested anywhere in the Duolingo export.',
  },
  {
    id: 'n-noc',
    lemma: 'noc',
    translation: 'night',
    partOfSpeech: 'noun',
    nounClass: 'żeński',
    pluralAgreementClass: 'nonvirile',
    declensionClass: 'feminine, consonant-stem (i-declension), soft/functionally-soft',
    stemHardness: 'soft',
    paradigm: {
      singular: {
        nominative: cell('noc', { provenance: 'confirmed' }),
        genitive: cell('nocy', { syncreticWith: ['dative', 'locative', 'vocative'], provenance: 'supplied' }),
        dative: cell('nocy', { syncreticWith: ['genitive', 'locative', 'vocative'], provenance: 'supplied' }),
        accusative: cell('noc', { syncreticWith: ['nominative'], provenance: 'confirmed' }),
        instrumental: cell('nocą', { provenance: 'supplied' }),
        locative: cell('nocy', { syncreticWith: ['genitive', 'dative', 'vocative'], provenance: 'supplied' }),
        vocative: cell('nocy', { syncreticWith: ['genitive', 'dative', 'locative'], provenance: 'supplied' }),
      },
      plural: {
        nominative: cell('noce', { provenance: 'supplied' }),
        genitive: cell('nocy', { provenance: 'supplied' }),
        dative: cell('nocom', { provenance: 'supplied' }),
        accusative: cell('noce', { syncreticWith: ['nominative'], provenance: 'supplied' }),
        instrumental: cell('nocami', { provenance: 'supplied' }),
        locative: cell('nocach', { provenance: 'supplied' }),
        vocative: cell('noce', { provenance: 'supplied' }),
      },
    },
    notes: 'Zero-ending nominative singular, no ending at all (not -a, not -i): this class is a separate feminine paradigm from kobieta/ziemia, not a variant of it.',
  },
  {
    id: 'n-okno',
    lemma: 'okno',
    translation: 'window',
    partOfSpeech: 'noun',
    nounClass: 'nijaki',
    pluralAgreementClass: 'nonvirile',
    declensionClass: 'neuter, hard stem, -o',
    stemHardness: 'hard',
    paradigm: {
      singular: {
        nominative: cell('okno', { provenance: 'confirmed' }),
        genitive: cell('okna', { provenance: 'supplied' }),
        dative: cell('oknu', { provenance: 'supplied' }),
        accusative: cell('okno', { syncreticWith: ['nominative'], provenance: 'confirmed' }),
        instrumental: cell('oknem', { provenance: 'supplied' }),
        locative: cell('oknie', {
          stemAlternation: { from: 'n', to: 'ń', mechanism: 'palatalization', description: 'n → ń (spelled "ni") before locative -e' },
          provenance: 'supplied',
        }),
        vocative: cell('okno', { syncreticWith: ['nominative'], provenance: 'confirmed' }),
      },
      plural: {
        nominative: cell('okna', { provenance: 'supplied' }),
        genitive: cell('okien', {
          stemAlternation: {
            from: '∅',
            to: 'e',
            mechanism: 'vowel-epenthesis',
            description: 'fleeting -e- inserted to break up the kn cluster in the zero-ending genitive plural (okno → okien, not *okn)',
          },
          provenance: 'supplied',
        }),
        dative: cell('oknom', { provenance: 'supplied' }),
        accusative: cell('okna', { syncreticWith: ['nominative'], provenance: 'supplied' }),
        instrumental: cell('oknami', { provenance: 'supplied' }),
        locative: cell('oknach', { provenance: 'supplied' }),
        vocative: cell('okna', { provenance: 'supplied' }),
      },
    },
  },
  {
    id: 'n-mieszkanie',
    lemma: 'mieszkanie',
    translation: 'apartment',
    partOfSpeech: 'noun',
    nounClass: 'nijaki',
    pluralAgreementClass: 'nonvirile',
    declensionClass: 'neuter, soft stem, -e (deverbal -anie type)',
    stemHardness: 'soft',
    paradigm: {
      singular: {
        nominative: cell('mieszkanie', { provenance: 'supplied' }),
        genitive: cell('mieszkania', { provenance: 'supplied' }),
        dative: cell('mieszkaniu', { syncreticWith: ['locative'], provenance: 'supplied' }),
        accusative: cell('mieszkanie', { syncreticWith: ['nominative'], provenance: 'supplied' }),
        instrumental: cell('mieszkaniem', { provenance: 'supplied' }),
        locative: cell('mieszkaniu', { syncreticWith: ['dative'], provenance: 'supplied' }),
        vocative: cell('mieszkanie', { syncreticWith: ['nominative'], provenance: 'supplied' }),
      },
      plural: {
        nominative: cell('mieszkania', { provenance: 'supplied' }),
        genitive: cell('mieszkań', { provenance: 'supplied' }),
        dative: cell('mieszkaniom', { provenance: 'supplied' }),
        accusative: cell('mieszkania', { syncreticWith: ['nominative'], provenance: 'supplied' }),
        instrumental: cell('mieszkaniami', { provenance: 'supplied' }),
        locative: cell('mieszkaniach', { provenance: 'supplied' }),
        vocative: cell('mieszkania', { provenance: 'supplied' }),
      },
    },
    notes:
      'Extremely productive pattern — any -anie/-enie deverbal noun (spotkanie, ćwiczenie, etc.) will follow this exact template, so it is worth treating as a "regular class" anchor when adding more vocabulary. Not attested anywhere in the Duolingo export.',
  },
  {
    id: 'n-dlugopis',
    lemma: 'długopis',
    translation: 'pen',
    partOfSpeech: 'noun',
    nounClass: 'męskorzeczowy',
    pluralAgreementClass: 'nonvirile',
    declensionClass: 'masculine inanimate, hard stem',
    stemHardness: 'hard',
    paradigm: {
      singular: {
        nominative: cell('długopis', { provenance: 'supplied' }),
        genitive: cell('długopisu', { provenance: 'supplied' }),
        dative: cell('długopisowi', { provenance: 'supplied' }),
        accusative: cell('długopis', { syncreticWith: ['nominative'], provenance: 'supplied' }),
        instrumental: cell('długopisem', { provenance: 'supplied' }),
        locative: cell('długopisie', {
          stemAlternation: { from: 's', to: 'ś', mechanism: 'palatalization', description: 's → ś (spelled "si") before locative/vocative -e' },
          provenance: 'supplied',
        }),
        vocative: cell('długopisie', { syncreticWith: ['locative'], provenance: 'supplied' }),
      },
      plural: {
        nominative: cell('długopisy', { provenance: 'supplied' }),
        genitive: cell('długopisów', { provenance: 'supplied' }),
        dative: cell('długopisom', { provenance: 'supplied' }),
        accusative: cell('długopisy', { syncreticWith: ['nominative'], provenance: 'supplied' }),
        instrumental: cell('długopisami', { provenance: 'supplied' }),
        locative: cell('długopisach', { provenance: 'supplied' }),
        vocative: cell('długopisy', { provenance: 'supplied' }),
      },
    },
    notes: 'Not attested anywhere in the Duolingo export.',
  },
  {
    id: 'n-uniwersytet',
    lemma: 'uniwersytet',
    translation: 'university',
    translationPlural: 'universities',
    partOfSpeech: 'noun',
    nounClass: 'męskorzeczowy',
    pluralAgreementClass: 'nonvirile',
    declensionClass: 'masculine inanimate, hard stem',
    stemHardness: 'hard',
    paradigm: {
      singular: {
        nominative: cell('uniwersytet', { provenance: 'supplied' }),
        genitive: cell('uniwersytetu', { provenance: 'supplied' }),
        dative: cell('uniwersytetowi', { provenance: 'supplied' }),
        accusative: cell('uniwersytet', { syncreticWith: ['nominative'], provenance: 'supplied' }),
        instrumental: cell('uniwersytetem', { provenance: 'supplied' }),
        locative: cell('uniwersytecie', {
          stemAlternation: { from: 't', to: 'ć', mechanism: 'palatalization', description: 't → ć (spelled "ci") before locative/vocative -e' },
          provenance: 'supplied',
        }),
        vocative: cell('uniwersytecie', { syncreticWith: ['locative'], provenance: 'supplied' }),
      },
      plural: {
        nominative: cell('uniwersytety', { provenance: 'supplied' }),
        genitive: cell('uniwersytetów', { provenance: 'supplied' }),
        dative: cell('uniwersytetom', { provenance: 'supplied' }),
        accusative: cell('uniwersytety', { syncreticWith: ['nominative'], provenance: 'supplied' }),
        instrumental: cell('uniwersytetami', { provenance: 'supplied' }),
        locative: cell('uniwersytetach', { provenance: 'supplied' }),
        vocative: cell('uniwersytety', { provenance: 'supplied' }),
      },
    },
    notes:
      'na + accusative for motion toward ("Idę na uniwersytet") vs. na + locative for static location ("Jestem na uniwersytecie") — the case alone doesn\'t disambiguate; the preposition-governed accusative/locative contrast does. Worth its own drill pair once prepositional government is in scope. Not attested anywhere in the Duolingo export.',
  },
  {
    id: 'n-dziecko',
    lemma: 'dziecko',
    translation: 'child',
    translationPlural: 'children',
    partOfSpeech: 'noun',
    nounClass: 'nijaki',
    pluralAgreementClass: 'nonvirile',
    declensionClass: 'neuter, velar stem, -o (irregular/suppletive plural)',
    stemHardness: 'hard',
    irregular: true,
    irregularNote:
      'Plural is suppletive ("dzieci", not a regular reflex of the singular stem). Worth noting for anyone reasoning by semantics rather than grammar: dzieci denotes people but is NOT a nounClass exception — dziecko is straightforwardly nijaki (neuter), and nijaki nouns are never virile, so "Dzieci były grzeczne" (były, not byli) is exactly what the grammatical class predicts. The trap is inferring virile agreement from "refers to humans" instead of from nounClass. Treat the whole entry as memorize-directly rather than pattern-generalizable regardless.',
    paradigm: {
      singular: {
        nominative: cell('dziecko', { provenance: 'confirmed' }),
        genitive: cell('dziecka', { provenance: 'supplied' }),
        dative: cell('dziecku', { syncreticWith: ['locative'], provenance: 'supplied' }),
        accusative: cell('dziecko', { syncreticWith: ['nominative'], provenance: 'confirmed' }),
        instrumental: cell('dzieckiem', { provenance: 'confirmed' }),
        locative: cell('dziecku', {
          syncreticWith: ['dative'],
          provenance: 'supplied',
        }),
        vocative: cell('dziecko', { syncreticWith: ['nominative'], provenance: 'confirmed' }),
      },
      plural: {
        nominative: cell('dzieci', { provenance: 'confirmed' }),
        genitive: cell('dzieci', {
          syncreticWith: ['nominative', 'accusative', 'vocative'],
          provenance: 'confirmed',
        }),
        dative: cell('dzieciom', { provenance: 'supplied' }),
        accusative: cell('dzieci', { syncreticWith: ['nominative', 'genitive', 'vocative'], provenance: 'confirmed' }),
        instrumental: cell('dziećmi', { provenance: 'confirmed' }),
        locative: cell('dzieciach', { provenance: 'supplied' }),
        vocative: cell('dzieci', { syncreticWith: ['nominative', 'genitive', 'accusative'], provenance: 'confirmed' }),
      },
    },
    notes:
      'Locative singular "dziecku" (not "*dziecce"): velar-final stems (k, g) take -u in the locative/vocative singular rather than -e, which sidesteps the k→c / g→dz alternation entirely — contrast this with the dental/alveolar stems above, which do palatalize. Unusually well attested for a dat/loc/voc-starved export: dziecko, dzieci, dzieckiem, and dziećmi are all directly confirmed.',
  },
  {
    id: 'n-jablko',
    lemma: 'jabłko',
    translation: 'apple',
    partOfSpeech: 'noun',
    nounClass: 'nijaki',
    pluralAgreementClass: 'nonvirile',
    declensionClass: 'neuter, hard stem, -o, velar-final (k)',
    stemHardness: 'hard',
    paradigm: {
      singular: {
        nominative: cell('jabłko', { provenance: 'confirmed' }),
        genitive: cell('jabłka', { provenance: 'confirmed' }),
        dative: cell('jabłku', { syncreticWith: ['locative'], provenance: 'supplied' }),
        accusative: cell('jabłko', { syncreticWith: ['nominative'], provenance: 'confirmed' }),
        instrumental: cell('jabłkiem', { provenance: 'supplied' }),
        locative: cell('jabłku', { syncreticWith: ['dative'], provenance: 'supplied' }),
        vocative: cell('jabłko', { syncreticWith: ['nominative'], provenance: 'confirmed' }),
      },
      plural: {
        nominative: cell('jabłka', { provenance: 'confirmed' }),
        genitive: cell('jabłek', {
          stemAlternation: {
            from: '∅',
            to: 'e',
            mechanism: 'vowel-epenthesis',
            description: 'fleeting -e- inserted to break up the łk cluster in the zero-ending genitive plural (jabłko → jabłek, not *jabłk)',
          },
          provenance: 'supplied',
        }),
        dative: cell('jabłkom', { provenance: 'supplied' }),
        accusative: cell('jabłka', { syncreticWith: ['nominative'], provenance: 'confirmed' }),
        instrumental: cell('jabłkami', { provenance: 'supplied' }),
        locative: cell('jabłkach', { provenance: 'supplied' }),
        vocative: cell('jabłka', { syncreticWith: ['nominative'], provenance: 'confirmed' }),
      },
    },
    notes:
      'Same velar-stem template as dziecko (locative -u sidesteps k→c) and the same fleeting-vowel genitive plural okno shows (jabłka → jabłek). Genitive singular and nominative/accusative/vocative plural coincide as the string "jabłka" — the same pattern already seen in kobieta and dziewczynka, here for a different declension class entirely (neuter, not feminine), which is worth noticing: it recurs across classes, not just within one.',
  },
  {
    id: 'n-mezczyzna',
    lemma: 'mężczyzna',
    translation: 'man',
    translationPlural: 'men',
    partOfSpeech: 'noun',
    nounClass: 'męskoosobowy',
    pluralAgreementClass: 'virile',
    declensionClass: 'masculine personal, -a declension (feminine-pattern singular endings, virile plural)',
    stemHardness: 'hard',
    paradigm: {
      singular: {
        nominative: cell('mężczyzna', { provenance: 'confirmed' }),
        genitive: cell('mężczyzny', { provenance: 'confirmed' }),
        dative: cell('mężczyźnie', { syncreticWith: ['locative'], provenance: 'supplied' }),
        accusative: cell('mężczyznę', { provenance: 'confirmed' }),
        instrumental: cell('mężczyzną', { provenance: 'confirmed' }),
        locative: cell('mężczyźnie', { syncreticWith: ['dative'], provenance: 'supplied' }),
        vocative: cell('mężczyzno', { provenance: 'supplied' }),
      },
      plural: {
        nominative: cell('mężczyźni', { provenance: 'confirmed' }),
        genitive: cell('mężczyzn', {
          uncertain: true,
          uncertainNote:
            'Zero-ending genitive plural ("wielu mężczyzn") is my best-confidence recollection, but this -a masculine-personal class isn\'t fully uniform across words — some take -ów instead (e.g. kolega → kolegów, not "*koleg"). Not attested in the export either way; flagging so you can confirm mężczyzn specifically rather than trusting the pattern to generalize.',
          provenance: 'supplied',
        }),
        dative: cell('mężczyznom', { provenance: 'supplied' }),
        accusative: cell('mężczyzn', {
          syncreticWith: ['genitive'],
          uncertain: true,
          uncertainNote: 'Inherits the genitive plural\'s uncertainty above via the virile accusative=genitive rule.',
          provenance: 'supplied',
        }),
        instrumental: cell('mężczyznami', { provenance: 'confirmed' }),
        locative: cell('mężczyznach', { provenance: 'supplied' }),
        vocative: cell('mężczyźni', { syncreticWith: ['nominative'], provenance: 'confirmed' }),
      },
    },
    notes:
      'The genuinely tricky class the addendum was after: mężczyzna is grammatically męskoosobowy (agreement is masculine — "dobry mężczyzna", not "*dobra mężczyzna"), but its OWN singular case endings follow the feminine -a pattern throughout, accusative -ę included (mężczyznę, not a genitive-based masc. accusative) — then the plural snaps back to ordinary virile morphology (mężczyźni, not a feminine-pattern plural). Unusually well attested for how irregular-looking it is: nom, gen, acc, ins singular and nom/voc, ins plural are all directly confirmed by the export, which is good independent support for a class I\'d otherwise want you to scrutinize closely.',
  },
  {
    id: 'n-chlopiec',
    lemma: 'chłopiec',
    translation: 'boy',
    partOfSpeech: 'noun',
    nounClass: 'męskoosobowy',
    pluralAgreementClass: 'virile',
    declensionClass: 'masculine personal, hard stem, fleeting vowel',
    stemHardness: 'hard',
    paradigm: {
      singular: {
        nominative: cell('chłopiec', { provenance: 'confirmed' }),
        genitive: cell('chłopca', { provenance: 'confirmed' }),
        dative: cell('chłopcowi', { provenance: 'supplied' }),
        accusative: cell('chłopca', { syncreticWith: ['genitive'], provenance: 'confirmed' }),
        instrumental: cell('chłopcem', { provenance: 'confirmed' }),
        locative: cell('chłopcu', {
          uncertain: true,
          uncertainNote:
            'Fairly confident ("o chłopcu") but flagging alongside the vocative below since the two aren\'t syncretic here — worth a second look given how marked the vocative form is.',
          provenance: 'supplied',
        }),
        vocative: cell('chłopcze', {
          uncertain: true,
          uncertainNote:
            'This is the distinctively archaic/literary-feeling vocative pattern (parallel to ojciec → ojcze), genuinely different from the locative ("chłopcu") rather than syncretic with it — unusual enough, and rare enough in casual speech, that I want you to confirm it\'s still what you want taught rather than a colloquial "chłopcu"-for-both simplification.',
          provenance: 'supplied',
        }),
      },
      plural: {
        nominative: cell('chłopcy', { provenance: 'confirmed' }),
        genitive: cell('chłopców', { provenance: 'supplied' }),
        dative: cell('chłopcom', { provenance: 'supplied' }),
        accusative: cell('chłopców', { syncreticWith: ['genitive'], provenance: 'supplied' }),
        instrumental: cell('chłopcami', { provenance: 'supplied' }),
        locative: cell('chłopcach', { provenance: 'supplied' }),
        vocative: cell('chłopcy', { syncreticWith: ['nominative'], provenance: 'confirmed' }),
      },
    },
    notes:
      'Fleeting vowel like pies (chłopiec → chłopca, e drops), plus a genuine dat/loc/voc three-way split (chłopcowi / chłopcu / chłopcze) rather than the usual loc=voc syncretism seen elsewhere in this bank — flagged both non-standard singular cells above rather than presenting them with false confidence. Not to be confused with "chłopak" (also glossed "boy/guy"), a separate lexical item with its own regular hard-stem declension that also appears in the export but wasn\'t part of the addendum\'s requested set.',
  },
];
