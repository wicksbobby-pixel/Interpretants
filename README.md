# Case Rush

Timed Polish case-declension drilling game.

## Status

**Stage 2 of 5 (rescoped): core drilling loop.** `npm run dev` serves the
game — a cloze sentence with one blank, three case-forms of the same noun
to choose from, timed. Sentence *content* varies (different verbs,
prepositions, subjects) but every sentence has exactly one blank. The
stage-1 data dump is still available at `?debug`.

**Scope note:** stage 2 originally included coupled-slot agreement drills
(adjective/demonstrative + noun pairs) and case-gating tiers together. The
coupled-slot mechanic was cut back out after review — it added real
complexity (agreement resolution, paired scoring, a second UI mode) for a
feature that wasn't the core ask. What's live now is deliberately smaller:
single-blank cloze only. Case-gating tiers stayed, since that wasn't the
complexity in question and was already working. The adjective/demonstrative
vocabulary data (`src/domain/vocab/adjectives.ts`, `demonstratives.ts`)
is untouched and still shown in the debug view — it's just not wired into
the drilling engine right now, and would be the natural place to resume if
coupled-slot drilling comes back later.

Not yet implemented (later stages): pause/resume, end-of-round mistake
review, persistence across page loads, spaced resurfacing (stage 3); full
per-case color coding beyond the post-answer explanation badge (stage 4,
though a first cut of it landed early — see below); accessibility pass and
tier-unlock threshold tuning (stage 5).

**Addendum, in progress:** noun class is now the real five-way Polish
system (`NounClass` in `src/domain/types.ts`: męskoosobowy/męskozwierzęcy/
męskorzeczowy/żeński/nijaki) rather than a collapsed gender+animacy pair,
with the accusative rule formalized as `accusativeSingularEqualsGenitive`/
`accusativePluralEqualsGenitive`. `koń` (`n-kon`) was added as the
addendum's explicit test case — męskozwierzęcy, so its plural accusative
reverts to nominative (`konie`), not the virile-looking `koni` (which is
actually its genitive plural) — and is now drilled in-game (`see-object`,
`see-object-third`, `see-nonvirile-animate-plural`). Structure Mode, dual
gating thresholds, and the Duolingo-export reseed from the same addendum
are not yet built — the reseed specifically needs the actual export file
to tag forms confirmed vs. supplied, and Structure Mode is a large enough
second mode that it's worth confirming sequencing before building it.

## Scorecard

A menu screen (`scorecard` button on the intro and round-complete
screens) shows every seed noun's full paradigm — 7 cases × singular/plural.
Cells stay masked (`···`) until you've encountered that exact case+number
in a drill (right or wrong); once seen, the form is revealed permanently
for the rest of the browser session, color-coded by case. This is why
case stats and the "encountered" set live in app-level state that
survives "play again" — only a page reload clears it (see Persistence).

## Persistence

Vocabulary and paradigms are hand-authored TypeScript data (`src/domain/vocab/`),
diffable in git, one file per part of speech. Performance history, the
mistake log, and the scorecard's encountered-forms set will move to
IndexedDB in stage 3 — no backend. Right now, case-gating stats and the
scorecard both live in memory for the browser session (reset on reload,
but *not* reset between rounds within a session — see `src/drill/session.ts`).

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
src/domain/types.ts             # Case, NounClass, paradigm/entry schemas
src/domain/vocab/nouns.ts       # 13 seed nouns
src/domain/vocab/adjectives.ts  # 2 seed adjectives (not currently drilled — see scope note)
src/domain/vocab/demonstratives.ts  # ten/ta/to (not currently drilled — see scope note)
src/domain/vocab/verbs.ts       # 11 seed verbs
src/domain/vocab/index.ts       # aggregated exports + typed lookups by id

src/drill/gating.ts       # acquisition-order case tiers, unlock threshold (flagged tunable)
src/drill/templates.ts    # hand-authored clause skeletons, exactly one drilled blank each
src/drill/resolve.ts      # noun paradigm-cell lookup
src/drill/distractors.ts  # same-paradigm distractor selection
src/drill/colors.ts       # per-case color palette (explanation badge + scorecard only, never live options)
src/drill/engine.ts       # template eligibility/selection + clause generation
src/drill/session.ts      # AppState (persists across rounds: stats, scorecard) vs. RoundState (resets each round)
src/drill/ui.ts           # the drilling loop UI + the scorecard view
src/debug-view.ts         # stage-1 data dump, reachable at ?debug
src/main.ts               # routes between the game and the debug view
```

## Design notes worth knowing about

- **Color is post-answer only.** The case badge in the explanation line
  and the scorecard's revealed cells are colored; live, unanswered option
  buttons never are — coloring an option by its true case before you've
  chosen would give away the answer.
- **Distractors are always other cells from the same noun's paradigm**,
  never unrelated words, so answering correctly requires real case
  discrimination, not vocabulary recognition.
- **Case-gating thresholds are placeholder tuning values**, flagged in
  `src/drill/gating.ts` — not settled numbers.
- **Sentence variety without a second blank:** a verb like "dawać" that
  governs two cases (accusative + dative) gets two separate templates —
  one blanks the accusative and shows the dative recipient as fixed
  correct text, the other does the reverse — rather than ever drilling
  both in one sentence.
- **Vocative-address clauses don't drill a verb form.** Imperatives aren't
  modeled (`VerbEntry` only stores infinitive/1sg/3sg), so those clauses
  test the vocative noun against fixed interjection text only.

## Next stages

3. Round structure (pause/resume, end-of-round mistake summary, weighted resurfacing, persistence — including the scorecard and gating stats surviving a reload)
4. Full visual pass (redundant color coding extended beyond the explanation badge, per the original spec)
5. Polish/edge cases (irregular handling, tier-unlock threshold tuning, accessibility)
