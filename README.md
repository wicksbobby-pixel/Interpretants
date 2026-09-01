# Case Rush

Timed Polish declension/conjugation drilling game.

## Status

**Stage 2 of 5: core drilling loop.** `npm run dev` serves the actual game —
clauses generated from the vocabulary bank, single- and coupled-slot drills,
case-gating tiers, and phoneme-alternation feedback. The stage-1 data dump
is still available at `?debug` for inspecting the vocabulary bank directly.

Not yet implemented (later stages): pause/resume, end-of-round mistake
review, persistence, spaced resurfacing (stage 3); per-case color coding
(stage 4); accessibility pass and tier-unlock threshold tuning (stage 5).
The current round-end screen is a placeholder that says as much.

## Persistence

Vocabulary and paradigms are hand-authored TypeScript data (`src/domain/vocab/`),
diffable in git, one file per part of speech. Performance history and the
mistake log will live in the browser via IndexedDB (added in stage 3) — no
backend. Per-case gating stats currently live only in memory for the
duration of a session (reset on reload) — this is what stage 3 persists.

## Setup

```bash
npm install
npm run dev              # the game at http://localhost:5173, debug view at ?debug
npm run typecheck
npm run build
npm run verify-templates # generates every clause template several times, checks nothing throws
```

## Layout

```
src/domain/types.ts             # Case, Gender, Animacy, paradigm/entry schemas
src/domain/vocab/nouns.ts       # 12 seed nouns
src/domain/vocab/adjectives.ts  # 2 seed adjectives
src/domain/vocab/demonstratives.ts  # ten/ta/to
src/domain/vocab/verbs.ts       # 11 seed verbs
src/domain/vocab/index.ts       # aggregated exports + typed lookups by id

src/drill/gating.ts       # acquisition-order case tiers, unlock threshold (flagged tunable)
src/drill/templates.ts    # hand-authored clause skeletons (which verb, which nouns are plausible fillers)
src/drill/resolve.ts      # noun/adjective/demonstrative agreement resolution
src/drill/distractors.ts  # same-paradigm distractor selection
src/drill/engine.ts       # template eligibility/selection + clause generation
src/drill/session.ts      # pure round state (score/streak/stats), no DOM
src/drill/ui.ts           # the actual drilling loop UI
src/debug-view.ts         # stage-1 data dump, reachable at ?debug
src/main.ts               # routes between the game and the debug view
```

## Design notes worth knowing about

- **Coupled-slot pairs** (adjective/demonstrative + noun) are drilled as two
  sequential single-choice picks, not one two-word multiple choice — both
  have to be correct for the pair to count, but each word gets its own
  immediate feedback, which is more diagnostic than one verdict on the pair.
- **Case-gating thresholds and the coupled-slot weighting curve are
  placeholder tuning values**, flagged in `src/drill/gating.ts` and
  `coupledSlotRatio` in `src/drill/engine.ts` — not settled numbers.
- **Distractors are always other cells from the same paradigm**, never
  unrelated words, so answering correctly requires real case discrimination.
- **Vocative-address clauses don't drill a verb form.** Imperatives aren't
  modeled (`VerbEntry` only stores infinitive/1sg/3sg), so direct-address
  clauses use fixed interjection text and only drill the vocative noun (+
  optional adjective).

## Next stages

3. Round structure (pause/resume, end-of-round mistake summary, weighted resurfacing, persistence)
4. Visual pass (per-case color coding with redundant text labels)
5. Polish/edge cases (irregular handling, tier-unlock threshold tuning, accessibility)
