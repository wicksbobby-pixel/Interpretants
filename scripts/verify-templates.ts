import { CLAUSE_TEMPLATES } from '../src/drill/templates';
import { generateClause } from '../src/drill/engine';

let failures = 0;
for (const t of CLAUSE_TEMPLATES) {
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const clause = generateClause(t);
      const parts = clause.segments.map((s) => (s.kind === 'text' ? s.text : `[${s.slot.correctForm}]`));
      const explanations = clause.segments
        .filter((s): s is Extract<typeof s, { kind: 'slot' }> => s.kind === 'slot')
        .map((s) => `${s.slot.caseName} ${s.slot.number}${s.slot.alternationNote ? '; ' + s.slot.alternationNote : ''} — ${s.slot.explanation}`);
      console.log(`${t.id}: ${parts.join(' ')} | "${clause.translation}"`);
      for (const e of explanations) console.log(`    ${e}`);
    } catch (err) {
      failures++;
      console.error(`FAIL ${t.id}: ${(err as Error).message}`);
    }
  }
}
console.log(`\n${failures} failure(s) across ${CLAUSE_TEMPLATES.length} templates x 8 attempts each.`);
process.exit(failures > 0 ? 1 : 0);
