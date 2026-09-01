# Case Rush

Timed Polish declension/conjugation drilling game.

## Status

**Stage 1 of 5: scaffold + data model.** No drilling UI yet. `npm run dev`
serves a debug view (`src/main.ts`) that dumps the full vocabulary bank —
every noun/adjective/verb paradigm, consonant-alternation annotations, and
any cells flagged `uncertain` for review — so the schema and seed data can
be checked before any game logic is built on top of them.

## Persistence

Vocabulary and paradigms are hand-authored TypeScript data (`src/domain/vocab/`),
diffable in git, one file per part of speech. Performance history and the
mistake log will live in the browser via IndexedDB (added in stage 3) — no
backend.

## Setup

```bash
npm install
npm run dev        # debug data view at http://localhost:5173
npm run typecheck
npm run build
```

## Layout

```
src/domain/types.ts        # Case, Gender, Animacy, paradigm/entry schemas
src/domain/vocab/nouns.ts       # 12 seed nouns
src/domain/vocab/adjectives.ts  # 2 seed adjectives
src/domain/vocab/verbs.ts       # 10 seed verbs
src/domain/vocab/index.ts       # aggregated exports + lookup by id
src/main.ts                # stage-1 debug dump (not the game UI)
```

## Next stages

2. Core drilling loop (single- and coupled-slot clauses, case gating, phoneme-alternation feedback)
3. Round structure (pause/resume, end-of-round mistake summary, weighted resurfacing)
4. Visual pass (per-case color coding with redundant text labels)
5. Polish/edge cases (irregular handling, tier-unlock thresholds, accessibility)
