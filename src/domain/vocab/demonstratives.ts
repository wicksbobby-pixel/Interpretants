import { cell, type DemonstrativeEntry } from '../types';

/**
 * Seed demonstrative bank. Just "ten" (this/that) — it's the only
 * demonstrative needed to exercise coupled-slot drilling; "tamten"
 * (that, more distally marked) can be added later on this exact template.
 *
 * ten/ta/to takes the same pronominal-declension endings adjectives use
 * (tego~dobrego, temu~dobremu, tym~dobrym), with one prescriptive wrinkle
 * flagged below (feminine accusative singular).
 */
export const DEMONSTRATIVES: DemonstrativeEntry[] = [
  {
    id: 'd-ten',
    lemma: 'ten',
    translation: 'this / that',
    partOfSpeech: 'demonstrative',
    paradigm: {
      singular: {
        masculine: {
          nominative: cell('ten'),
          genitive: cell('tego'),
          dative: cell('temu'),
          accusative: cell('ten', { syncreticWith: ['nominative'] }),
          accusativeAnimate: cell('tego', { syncreticWith: ['genitive'] }),
          instrumental: cell('tym'),
          locative: cell('tym', { syncreticWith: ['instrumental'] }),
        },
        feminine: {
          nominative: cell('ta'),
          genitive: cell('tej'),
          dative: cell('tej', { syncreticWith: ['genitive', 'locative'] }),
          accusative: cell('tę', {
            uncertain: true,
            uncertainNote:
              'Prescriptive standard is "tę"; the colloquial variant "tą" (by analogy with the instrumental) is extremely common in speech and increasingly tolerated, but I don\'t want to bake a disputed form in as "the" answer without you weighing in on which register this app should teach.',
          }),
          instrumental: cell('tą'),
          locative: cell('tej', { syncreticWith: ['genitive', 'dative'] }),
        },
        neuter: {
          nominative: cell('to'),
          genitive: cell('tego'),
          dative: cell('temu'),
          accusative: cell('to', { syncreticWith: ['nominative'] }),
          instrumental: cell('tym'),
          locative: cell('tym', { syncreticWith: ['instrumental'] }),
        },
      },
      plural: {
        virile: {
          nominative: cell('ci'),
          genitive: cell('tych'),
          dative: cell('tym'),
          accusative: cell('tych', { syncreticWith: ['genitive'] }),
          instrumental: cell('tymi'),
          locative: cell('tych', { syncreticWith: ['genitive', 'accusative'] }),
        },
        nonvirile: {
          nominative: cell('te'),
          genitive: cell('tych'),
          dative: cell('tym'),
          accusative: cell('te', { syncreticWith: ['nominative'] }),
          instrumental: cell('tymi'),
          locative: cell('tych'),
        },
      },
    },
    notes: 'No vocative paradigm — demonstratives aren\'t used in direct address, so that case is omitted from the schema entirely rather than filled with a placeholder.',
  },
];
