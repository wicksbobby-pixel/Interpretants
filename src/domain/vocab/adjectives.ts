import { cell, type AdjectiveEntry } from '../types';

/**
 * Seed adjective bank. Two entries, deliberately chosen to each surface a
 * different virile-plural palatalization: dobry → dobrzy (r → rz) and
 * wysoki → wysocy (k → c). Full paradigms are large (35 cells each across
 * 3 singular genders + 2 plural categories, plus the animacy-conditioned
 * masculine accusative), so depth over breadth here — more entries are a
 * copy-paste-and-adjust job once the pattern is confirmed correct.
 */
export const ADJECTIVES: AdjectiveEntry[] = [
  {
    id: 'a-dobry',
    lemma: 'dobry',
    translation: 'good',
    partOfSpeech: 'adjective',
    paradigm: {
      singular: {
        masculine: {
          nominative: cell('dobry'),
          genitive: cell('dobrego'),
          dative: cell('dobremu'),
          accusative: cell('dobry', { syncreticWith: ['nominative'] }),
          accusativeAnimate: cell('dobrego', { syncreticWith: ['genitive'] }),
          instrumental: cell('dobrym'),
          locative: cell('dobrym', { syncreticWith: ['instrumental'] }),
          vocative: cell('dobry', { syncreticWith: ['nominative'] }),
        },
        feminine: {
          nominative: cell('dobra'),
          genitive: cell('dobrej'),
          dative: cell('dobrej', { syncreticWith: ['genitive', 'locative'] }),
          accusative: cell('dobrą', { syncreticWith: ['instrumental'] }),
          instrumental: cell('dobrą', { syncreticWith: ['accusative'] }),
          locative: cell('dobrej', { syncreticWith: ['genitive', 'dative'] }),
          vocative: cell('dobra', { syncreticWith: ['nominative'] }),
        },
        neuter: {
          nominative: cell('dobre'),
          genitive: cell('dobrego'),
          dative: cell('dobremu'),
          accusative: cell('dobre', { syncreticWith: ['nominative'] }),
          instrumental: cell('dobrym'),
          locative: cell('dobrym', { syncreticWith: ['instrumental'] }),
          vocative: cell('dobre', { syncreticWith: ['nominative'] }),
        },
      },
      plural: {
        virile: {
          nominative: cell('dobrzy', {
            stemAlternation: { from: 'r', to: 'rz', mechanism: 'palatalization', description: 'r → rz in the virile nominative/vocative plural' },
          }),
          genitive: cell('dobrych'),
          dative: cell('dobrym'),
          accusative: cell('dobrych', { syncreticWith: ['genitive'] }),
          instrumental: cell('dobrymi'),
          locative: cell('dobrych', { syncreticWith: ['genitive', 'accusative'] }),
          vocative: cell('dobrzy', {
            syncreticWith: ['nominative'],
            stemAlternation: { from: 'r', to: 'rz', mechanism: 'palatalization', description: 'r → rz in the virile nominative/vocative plural' },
          }),
        },
        nonvirile: {
          nominative: cell('dobre'),
          genitive: cell('dobrych'),
          dative: cell('dobrym'),
          accusative: cell('dobre', { syncreticWith: ['nominative'] }),
          instrumental: cell('dobrymi'),
          locative: cell('dobrych'),
          vocative: cell('dobre', { syncreticWith: ['nominative'] }),
        },
      },
    },
    notes: 'Canonical hard-stem adjective paradigm; use as the template/regression check when adding other -y adjectives with a plain (non-velar, non-dental) stem-final consonant.',
  },
  {
    id: 'a-wysoki',
    lemma: 'wysoki',
    translation: 'tall',
    partOfSpeech: 'adjective',
    paradigm: {
      singular: {
        masculine: {
          nominative: cell('wysoki'),
          genitive: cell('wysokiego'),
          dative: cell('wysokiemu'),
          accusative: cell('wysoki', { syncreticWith: ['nominative'] }),
          accusativeAnimate: cell('wysokiego', { syncreticWith: ['genitive'] }),
          instrumental: cell('wysokim'),
          locative: cell('wysokim', { syncreticWith: ['instrumental'] }),
          vocative: cell('wysoki', { syncreticWith: ['nominative'] }),
        },
        feminine: {
          nominative: cell('wysoka'),
          genitive: cell('wysokiej'),
          dative: cell('wysokiej', { syncreticWith: ['genitive', 'locative'] }),
          accusative: cell('wysoką', { syncreticWith: ['instrumental'] }),
          instrumental: cell('wysoką', { syncreticWith: ['accusative'] }),
          locative: cell('wysokiej', { syncreticWith: ['genitive', 'dative'] }),
          vocative: cell('wysoka', { syncreticWith: ['nominative'] }),
        },
        neuter: {
          nominative: cell('wysokie'),
          genitive: cell('wysokiego'),
          dative: cell('wysokiemu'),
          accusative: cell('wysokie', { syncreticWith: ['nominative'] }),
          instrumental: cell('wysokim'),
          locative: cell('wysokim', { syncreticWith: ['instrumental'] }),
          vocative: cell('wysokie', { syncreticWith: ['nominative'] }),
        },
      },
      plural: {
        virile: {
          nominative: cell('wysocy', {
            stemAlternation: { from: 'k', to: 'c', mechanism: 'palatalization', description: 'k → c in the virile nominative/vocative plural (parallel to Polak → Polacy)' },
          }),
          genitive: cell('wysokich'),
          dative: cell('wysokim'),
          accusative: cell('wysokich', { syncreticWith: ['genitive'] }),
          instrumental: cell('wysokimi'),
          locative: cell('wysokich', { syncreticWith: ['genitive', 'accusative'] }),
          vocative: cell('wysocy', {
            syncreticWith: ['nominative'],
            stemAlternation: { from: 'k', to: 'c', mechanism: 'palatalization', description: 'k → c in the virile nominative/vocative plural' },
          }),
        },
        nonvirile: {
          nominative: cell('wysokie'),
          genitive: cell('wysokich'),
          dative: cell('wysokim'),
          accusative: cell('wysokie', { syncreticWith: ['nominative'] }),
          instrumental: cell('wysokimi'),
          locative: cell('wysokich'),
          vocative: cell('wysokie', { syncreticWith: ['nominative'] }),
        },
      },
    },
    notes: 'Velar-stem adjective: the k → c alternation is confined to the virile nominative/vocative plural — every other cell keeps plain k, including before the -ie/-im endings elsewhere (no palatalization there because those are not front-vowel-triggering environments for this alternation class).',
  },
];
