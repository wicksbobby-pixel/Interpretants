import type { Case } from '../domain/types';

/**
 * Per-case colors for the drilling UI. Muted/desaturated to fit the dark
 * serif/mono aesthetic rather than a bright rainbow tagging scheme, and
 * chosen to stay clear of hues already claimed elsewhere in the UI for
 * something else (crimson = incorrect/accent chrome, green = correct,
 * gold = CTA/timer chrome) — a case color and a correctness color should
 * never visually collide.
 *
 * Color is ALWAYS paired with the CASE_ABBREV text label (NOM/GEN/...)
 * wherever it's used — never the only signal — per the accessibility
 * requirement that seven hues alone aren't reliably fast to distinguish.
 *
 * Deliberately never applied to live, unanswered option buttons: coloring
 * an option by its true case before the player has chosen would leak the
 * answer. Post-answer explanation text and the scorecard (both places the
 * form is already revealed) are the only places this gets used.
 */
export const CASE_COLOR: Record<Case, string> = {
  nominative: '#7C9CD6',
  genitive: '#A98CD9',
  dative: '#D98CB8',
  accusative: '#D9925C',
  instrumental: '#5CBFB0',
  locative: '#6B7FD1',
  vocative: '#B5C46A',
};
