import type {
  AdjectiveEntry,
  Case,
  DemonstrativeEntry,
  FormCell,
  GrammaticalNumber,
  NounEntry,
} from '../domain/types';

export function resolveNounForm(noun: NounEntry, num: GrammaticalNumber, caseName: Case): FormCell {
  return noun.paradigm[num][caseName];
}

function isMasculineAnimateOrPersonal(noun: NounEntry): boolean {
  return noun.gender === 'masculine' && (noun.animacy === 'personal' || noun.animacy === 'animate');
}

export function resolveAdjectiveForm(adj: AdjectiveEntry, noun: NounEntry, num: GrammaticalNumber, caseName: Case): FormCell {
  if (num === 'plural') {
    const table = noun.pluralAgreementClass === 'virile' ? adj.paradigm.plural.virile : adj.paradigm.plural.nonvirile;
    return table[caseName];
  }
  if (noun.gender === 'masculine') {
    const table = adj.paradigm.singular.masculine;
    if (caseName === 'accusative' && isMasculineAnimateOrPersonal(noun)) {
      return table.accusativeAnimate ?? table.accusative;
    }
    return table[caseName];
  }
  return adj.paradigm.singular[noun.gender][caseName];
}

/**
 * `caseName` is typed to exclude vocative at compile time — demonstratives
 * have no vocative paradigm cell (see DemonstrativeEntry), and this keeps
 * that a type error rather than a runtime surprise if a future template
 * tries to pair "ten" with an addressee slot.
 */
export function resolveDemonstrativeForm(
  dem: DemonstrativeEntry,
  noun: NounEntry,
  num: GrammaticalNumber,
  caseName: Exclude<Case, 'vocative'>
): FormCell {
  if (num === 'plural') {
    const table = noun.pluralAgreementClass === 'virile' ? dem.paradigm.plural.virile : dem.paradigm.plural.nonvirile;
    return table[caseName];
  }
  if (noun.gender === 'masculine') {
    const table = dem.paradigm.singular.masculine;
    if (caseName === 'accusative' && isMasculineAnimateOrPersonal(noun)) {
      return table.accusativeAnimate ?? table.accusative;
    }
    return table[caseName];
  }
  return dem.paradigm.singular[noun.gender][caseName];
}
