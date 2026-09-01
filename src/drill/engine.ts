import type {
  AdjectiveEntry,
  Case,
  DemonstrativeEntry,
  FormCell,
  GrammaticalNumber,
} from '../domain/types';
import { getAdjective, getDemonstrative, getNoun, getVerb } from '../domain/vocab';
import { pickModifierDistractors, pickNounDistractors, pick, shuffle } from './distractors';
import { resolveAdjectiveForm, resolveDemonstrativeForm, resolveNounForm } from './resolve';
import { capitalizeWord } from './text';
import { CASE_TIERS, GATING_CONFIG, unlockedCases, unlockedTierIndex, type CaseStats } from './gating';
import { CLAUSE_TEMPLATES, type ClauseTemplate, type NpSlotSpec } from './templates';

export interface SlotOption {
  form: string;
  isCorrect: boolean;
}

export interface ResolvedSlot {
  id: string;
  caseName: Case;
  number: GrammaticalNumber;
  options: SlotOption[];
  correctForm: string;
  explanation: string;
  alternationNote?: string;
  /** Present when this slot is one half of a coupled (modifier + noun) agreement pair; both must be answered correctly for the pair to count as correct. */
  pairId?: string;
  pairRole?: 'modifier' | 'noun';
}

export type ClauseSegment = { kind: 'text'; text: string; attach?: boolean } | { kind: 'slot'; slot: ResolvedSlot };

export interface GeneratedClause {
  templateId: string;
  segments: ClauseSegment[];
  translation: string;
}

// ---- template eligibility / selection ----

function templateCases(t: ClauseTemplate): Case[] {
  if (t.kind === 'vocative-address') return ['vocative'];
  const verb = getVerb(t.verbId);
  const cases: Case[] = [];
  if (t.subject) cases.push('nominative');
  for (const c of t.complements) {
    cases.push(c.caseOverride ?? verb.governance[c.governanceIndex].case);
  }
  return cases;
}

function templateHasCoupledSlot(t: ClauseTemplate): boolean {
  if (t.kind === 'vocative-address') return t.addressee.modifier != null;
  return t.subject?.modifier != null || t.complements.some((c) => c.modifier != null);
}

export function eligibleTemplates(unlocked: Case[]): ClauseTemplate[] {
  const unlockedSet = new Set(unlocked);
  return CLAUSE_TEMPLATES.filter((t) => templateCases(t).every((c) => unlockedSet.has(c)));
}

/**
 * Coupled-slot ratio scales with tier progress: more single-slot drilling
 * early (pure case recall), shifting toward coupled agreement drilling as
 * later tiers unlock — per the spec's "weighted more toward single-slot
 * early and more toward coupled-slot as the user progresses." The specific
 * curve (0.25 at tier 0, +0.15 per tier, capped at 0.7) is a starting
 * guess, not a value with any grammatical grounding — same caveat as
 * GATING_CONFIG in gating.ts, sanity-check before trusting it.
 */
export function coupledSlotRatio(tierIndex: number): number {
  return Math.min(0.7, 0.25 + 0.15 * tierIndex);
}

export function pickTemplate(stats: CaseStats): ClauseTemplate {
  const unlocked = unlockedCases(stats);
  const eligible = eligibleTemplates(unlocked);
  if (eligible.length === 0) {
    throw new Error('No clause templates eligible for the currently unlocked cases — check CASE_TIERS/CLAUSE_TEMPLATES coverage.');
  }
  const tierIdx = unlockedTierIndex(stats);
  const ratio = coupledSlotRatio(tierIdx);
  const coupled = eligible.filter(templateHasCoupledSlot);
  const single = eligible.filter((t) => !templateHasCoupledSlot(t));
  const useCoupled = coupled.length > 0 && (single.length === 0 || Math.random() < ratio);
  return pick(useCoupled ? coupled : single);
}

// ---- generation ----

function describeCase(caseName: Case, number: GrammaticalNumber): string {
  return `${caseName} ${number}`;
}

function allAdjectiveCells(adj: AdjectiveEntry): FormCell[] {
  return [
    ...Object.values(adj.paradigm.singular.masculine),
    ...Object.values(adj.paradigm.singular.feminine),
    ...Object.values(adj.paradigm.singular.neuter),
    ...Object.values(adj.paradigm.plural.virile),
    ...Object.values(adj.paradigm.plural.nonvirile),
  ];
}

function allDemonstrativeCells(dem: DemonstrativeEntry): FormCell[] {
  return [
    ...Object.values(dem.paradigm.singular.masculine),
    ...Object.values(dem.paradigm.singular.feminine),
    ...Object.values(dem.paradigm.singular.neuter),
    ...Object.values(dem.paradigm.plural.virile),
    ...Object.values(dem.paradigm.plural.nonvirile),
  ];
}

function makeSlotSegment(
  id: string,
  caseName: Case,
  number: GrammaticalNumber,
  correctCell: FormCell,
  distractorCells: FormCell[],
  explanation: string,
  pairId: string | undefined,
  pairRole: 'modifier' | 'noun' | undefined
): ClauseSegment {
  const options: SlotOption[] = shuffle([
    { form: correctCell.form, isCorrect: true },
    ...distractorCells.map((d) => ({ form: d.form, isCorrect: false })),
  ]);
  const alternationNote = correctCell.stemAlternation
    ? `stem consonant ${correctCell.stemAlternation.from} → ${correctCell.stemAlternation.to} (${correctCell.stemAlternation.mechanism.replace('-', ' ')})`
    : undefined;
  return {
    kind: 'slot',
    slot: { id, caseName, number, options, correctForm: correctCell.form, explanation, alternationNote, pairId, pairRole },
  };
}

function resolveNp(
  spec: NpSlotSpec,
  caseName: Case,
  idPrefix: string,
  opts?: { explanationOverride?: string; governanceNote?: string; noArticle?: boolean }
): { segments: ClauseSegment[]; gloss: string } {
  const noun = getNoun(pick(spec.nounIds));
  const number = spec.number ?? 'singular';
  const segments: ClauseSegment[] = [];
  const pairId = spec.modifier ? idPrefix : undefined;
  const isMasculineAnimateOrPersonal = noun.gender === 'masculine' && (noun.animacy === 'personal' || noun.animacy === 'animate');
  let adjectiveGloss = '';

  if (spec.modifier) {
    const agreementNote = `agrees with the noun: ${describeCase(caseName, number)}${isMasculineAnimateOrPersonal ? ', animate/personal' : ''}`;
    if (spec.modifier.kind === 'adjective') {
      const adj = getAdjective(pick(spec.modifier.ids));
      const correctCell = resolveAdjectiveForm(adj, noun, number, caseName);
      const agreementTable =
        number === 'plural'
          ? noun.pluralAgreementClass === 'virile'
            ? adj.paradigm.plural.virile
            : adj.paradigm.plural.nonvirile
          : adj.paradigm.singular[noun.gender];
      const distractors = pickModifierDistractors(agreementTable, allAdjectiveCells(adj), correctCell.form, 2);
      segments.push(makeSlotSegment(`${idPrefix}-mod`, caseName, number, correctCell, distractors, `adjective ${agreementNote}`, pairId, 'modifier'));
      adjectiveGloss = adj.translation;
    } else {
      if (caseName === 'vocative') {
        throw new Error(`Demonstrative modifier used in a vocative slot (${idPrefix}) — demonstratives have no vocative form.`);
      }
      const dem = getDemonstrative(pick(spec.modifier.ids));
      const correctCell = resolveDemonstrativeForm(dem, noun, number, caseName);
      const agreementTable =
        number === 'plural'
          ? noun.pluralAgreementClass === 'virile'
            ? dem.paradigm.plural.virile
            : dem.paradigm.plural.nonvirile
          : dem.paradigm.singular[noun.gender];
      const distractors = pickModifierDistractors(agreementTable, allDemonstrativeCells(dem), correctCell.form, 2);
      segments.push(makeSlotSegment(`${idPrefix}-mod`, caseName, number, correctCell, distractors, `demonstrative ${agreementNote}`, pairId, 'modifier'));
    }
  }

  const nounCorrectCell = resolveNounForm(noun, number, caseName);
  const nounDistractors = pickNounDistractors(noun, number, nounCorrectCell.form, 2);
  const nounExplanation = opts?.explanationOverride ?? `${describeCase(caseName, number)}${opts?.governanceNote ? ' — ' + opts.governanceNote : ''}`;
  segments.push(
    makeSlotSegment(`${idPrefix}-noun`, caseName, number, nounCorrectCell, nounDistractors, nounExplanation, pairId, spec.modifier ? 'noun' : undefined)
  );

  const gloss = spec.modifier
    ? spec.modifier.kind === 'demonstrative'
      ? opts?.noArticle
        ? noun.translation
        : `this ${noun.translation}`
      : opts?.noArticle
        ? `${adjectiveGloss} ${noun.translation}`
        : `the ${adjectiveGloss} ${noun.translation}`
    : opts?.noArticle
      ? noun.translation
      : `the ${noun.translation}`;

  return { segments, gloss };
}

function generateVerbClause(t: Extract<ClauseTemplate, { kind: 'verb-clause' }>): GeneratedClause {
  const verb = getVerb(t.verbId);
  const verbForm = t.person === 'first' ? verb.principalParts.firstSingular : verb.principalParts.thirdSingular;
  const segments: ClauseSegment[] = [];
  const translationParts: Record<string, string> = {};

  if (t.subject) {
    const { segments: subjSegs, gloss } = resolveNp(t.subject, 'nominative', 'subj');
    segments.push(...subjSegs);
    translationParts.subj = gloss;
  }

  segments.push({ kind: 'text', text: (t.negatedPrefix ?? '') + verbForm });

  t.complements.forEach((comp, i) => {
    const governance = verb.governance[comp.governanceIndex];
    const caseName = comp.caseOverride ?? governance.case;
    if (governance.preposition) {
      segments.push({ kind: 'text', text: governance.preposition });
    }
    const { segments: compSegs, gloss } = resolveNp(comp, caseName, `obj${i}`, {
      explanationOverride: comp.explanationOverride,
      governanceNote: governance.note,
    });
    segments.push(...compSegs);
    translationParts[`obj${i}`] = gloss;
  });

  segments.push({ kind: 'text', text: '.', attach: true });

  let translation = t.translationTemplate;
  for (const [key, value] of Object.entries(translationParts)) {
    translation = translation.replace(`{${key}}`, value);
  }

  return { templateId: t.id, segments, translation };
}

function generateVocativeAddress(t: Extract<ClauseTemplate, { kind: 'vocative-address' }>): GeneratedClause {
  const { segments, gloss } = resolveNp(t.addressee, 'vocative', 'addr', { noArticle: true });
  const allSegments: ClauseSegment[] = [...segments, { kind: 'text', text: t.interjection, attach: true }];
  const translation = t.translationTemplate.replace('{addr}', capitalizeWord(gloss));
  return { templateId: t.id, segments: allSegments, translation };
}

export function generateClause(t: ClauseTemplate): GeneratedClause {
  return t.kind === 'vocative-address' ? generateVocativeAddress(t) : generateVerbClause(t);
}

export { CASE_TIERS, GATING_CONFIG };
