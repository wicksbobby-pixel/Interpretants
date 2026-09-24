import type { Case, GrammaticalNumber, NounEntry } from '../domain/types';
import { getNoun, getVerb } from '../domain/vocab';
import { pick, pickNounDistractors, shuffle } from './distractors';
import { resolveNounForm } from './resolve';
import { capitalizeWord } from './text';
import { unlockedCases, type CaseStats } from './gating';
import { CLAUSE_TEMPLATES, type ClauseTemplate, type VerbClauseTemplate, type VocativeAddressTemplate } from './templates';

export interface SlotOption {
  form: string;
  isCorrect: boolean;
}

export interface ResolvedSlot {
  id: string;
  /** Which noun this slot drills — needed for the scorecard's "encountered" tracking. */
  nounId: string;
  caseName: Case;
  number: GrammaticalNumber;
  options: SlotOption[];
  correctForm: string;
  explanation: string;
  alternationNote?: string;
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
  const drilled = t.complements.find((c) => c.drilled);
  if (!drilled) throw new Error(`Template "${t.id}" has no drilled complement — exactly one is required.`);
  return [drilled.caseOverride ?? verb.governance[drilled.governanceIndex].case];
}

export function eligibleTemplates(unlocked: Case[]): ClauseTemplate[] {
  const unlockedSet = new Set(unlocked);
  return CLAUSE_TEMPLATES.filter((t) => templateCases(t).every((c) => unlockedSet.has(c)));
}

export function pickTemplate(stats: CaseStats): ClauseTemplate {
  const eligible = eligibleTemplates(unlockedCases(stats));
  if (eligible.length === 0) {
    throw new Error('No clause templates eligible for the currently unlocked cases — check CASE_TIERS/CLAUSE_TEMPLATES coverage.');
  }
  return pick(eligible);
}

// ---- generation ----

function describeCase(caseName: Case, number: GrammaticalNumber): string {
  return `${caseName} ${number}`;
}

/** English gloss for a noun at a given number — "the cat" / "the cats", falling back to naive +s pluralization unless the noun overrides it (e.g. dziecko → "children", kobieta → "women"). */
function nounGloss(noun: NounEntry, number: GrammaticalNumber): string {
  const word = number === 'plural' ? (noun.translationPlural ?? `${noun.translation}s`) : noun.translation;
  return `the ${word}`;
}

/** A complement shown as fixed, already-correct text — never a drill target. */
function resolveFixedNp(nounIds: string[], caseName: Case, number: GrammaticalNumber): { text: string; gloss: string } {
  const noun = getNoun(pick(nounIds));
  const text = resolveNounForm(noun, number, caseName).form;
  return { text, gloss: nounGloss(noun, number) };
}

/** The one cloze blank in a clause: a noun-only slot with same-paradigm distractors. */
function resolveDrilledNp(
  nounIds: string[],
  caseName: Case,
  number: GrammaticalNumber,
  id: string,
  explanation: string
): { segment: ClauseSegment; gloss: string } {
  const noun = getNoun(pick(nounIds));
  const correctCell = resolveNounForm(noun, number, caseName);
  const distractors = pickNounDistractors(noun, number, correctCell.form, 2);
  const options: SlotOption[] = shuffle([
    { form: correctCell.form, isCorrect: true },
    ...distractors.map((d) => ({ form: d.form, isCorrect: false })),
  ]);
  const alternationNote = correctCell.stemAlternation
    ? `stem consonant ${correctCell.stemAlternation.from} → ${correctCell.stemAlternation.to} (${correctCell.stemAlternation.mechanism.replace('-', ' ')})`
    : undefined;
  return {
    segment: { kind: 'slot', slot: { id, nounId: noun.id, caseName, number, options, correctForm: correctCell.form, explanation, alternationNote } },
    gloss: nounGloss(noun, number),
  };
}

function generateVerbClause(t: VerbClauseTemplate): GeneratedClause {
  const verb = getVerb(t.verbId);
  const verbForm = t.person === 'first' ? verb.principalParts.firstSingular : verb.principalParts.thirdSingular;
  const segments: ClauseSegment[] = [];
  const parts: Record<string, string> = {};

  if (t.subjectNounIds) {
    const { text, gloss } = resolveFixedNp(t.subjectNounIds, 'nominative', 'singular');
    segments.push({ kind: 'text', text });
    parts.subj = gloss;
  }

  segments.push({ kind: 'text', text: (t.negatedPrefix ?? '') + verbForm });

  t.complements.forEach((comp, i) => {
    const governance = verb.governance[comp.governanceIndex];
    const caseName = comp.caseOverride ?? governance.case;
    const number = comp.number ?? 'singular';
    if (governance.preposition) {
      segments.push({ kind: 'text', text: governance.preposition });
    }
    if (comp.drilled) {
      const explanation = comp.explanationOverride ?? `${describeCase(caseName, number)}${governance.note ? ' — ' + governance.note : ''}`;
      const { segment, gloss } = resolveDrilledNp(comp.nounIds, caseName, number, `c${i}`, explanation);
      segments.push(segment);
      parts[`c${i}`] = gloss;
    } else {
      const { text, gloss } = resolveFixedNp(comp.nounIds, caseName, number);
      segments.push({ kind: 'text', text });
      parts[`c${i}`] = gloss;
    }
  });

  segments.push({ kind: 'text', text: '.', attach: true });

  let translation = t.translationTemplate;
  for (const [key, value] of Object.entries(parts)) {
    translation = translation.replace(`{${key}}`, value);
  }

  return { templateId: t.id, segments, translation: capitalizeWord(translation) };
}

function generateVocativeAddress(t: VocativeAddressTemplate): GeneratedClause {
  const noun = getNoun(pick(t.addresseeNounIds));
  const correctCell = resolveNounForm(noun, 'singular', 'vocative');
  const distractors = pickNounDistractors(noun, 'singular', correctCell.form, 2);
  const options: SlotOption[] = shuffle([
    { form: correctCell.form, isCorrect: true },
    ...distractors.map((d) => ({ form: d.form, isCorrect: false })),
  ]);
  const alternationNote = correctCell.stemAlternation
    ? `stem consonant ${correctCell.stemAlternation.from} → ${correctCell.stemAlternation.to} (${correctCell.stemAlternation.mechanism.replace('-', ' ')})`
    : undefined;
  const segments: ClauseSegment[] = [
    {
      kind: 'slot',
      slot: {
        id: 'addr',
        nounId: noun.id,
        caseName: 'vocative',
        number: 'singular',
        options,
        correctForm: correctCell.form,
        explanation: describeCase('vocative', 'singular'),
        alternationNote,
      },
    },
    { kind: 'text', text: t.interjection, attach: true },
  ];
  const translation = capitalizeWord(t.translationTemplate.replace('{addr}', noun.translation));
  return { templateId: t.id, segments, translation };
}

export function generateClause(t: ClauseTemplate): GeneratedClause {
  return t.kind === 'vocative-address' ? generateVocativeAddress(t) : generateVerbClause(t);
}
