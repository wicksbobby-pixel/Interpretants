import { NOUNS, ADJECTIVES, VERBS, DEMONSTRATIVES, VOCABULARY } from './domain/vocab';
import { CASE_ABBREV, type FormCell } from './domain/types';

/**
 * Data dump for inspecting the vocabulary bank directly, independent of
 * the drilling UI. Reachable at ?debug — see main.ts.
 */

function collectUncertain(): { entryId: string; lemma: string; path: string; cell: FormCell }[] {
  const flagged: { entryId: string; lemma: string; path: string; cell: FormCell }[] = [];
  for (const entry of VOCABULARY) {
    if (entry.partOfSpeech === 'noun') {
      for (const num of ['singular', 'plural'] as const) {
        for (const [caseName, c] of Object.entries(entry.paradigm[num])) {
          if (c.uncertain) flagged.push({ entryId: entry.id, lemma: entry.lemma, path: `${num}.${caseName}`, cell: c });
        }
      }
    }
    if (entry.partOfSpeech === 'demonstrative') {
      for (const num of ['singular', 'plural'] as const) {
        const genders = num === 'singular' ? entry.paradigm.singular : entry.paradigm.plural;
        for (const [bucket, table] of Object.entries(genders)) {
          for (const [caseName, c] of Object.entries(table as Record<string, FormCell>)) {
            if (c.uncertain) flagged.push({ entryId: entry.id, lemma: entry.lemma, path: `${num}.${bucket}.${caseName}`, cell: c });
          }
        }
      }
    }
  }
  return flagged;
}

function renderCaseTable(title: string, table: Record<string, FormCell>): string {
  const rows = Object.entries(table)
    .map(([caseName, c]) => {
      const abbrev = CASE_ABBREV[caseName as keyof typeof CASE_ABBREV] ?? caseName.slice(0, 3).toUpperCase();
      const flags = [
        c.uncertain ? '<span class="flag uncertain">unconfirmed</span>' : '',
        c.stemAlternation
          ? `<span class="flag alt">${c.stemAlternation.from}→${c.stemAlternation.to} (${c.stemAlternation.mechanism})</span>`
          : '',
      ].join(' ');
      return `<tr><td class="case">${abbrev}</td><td class="form">${c.form}</td><td class="flags">${flags}</td></tr>`;
    })
    .join('');
  return `<div class="table-block"><h4>${title}</h4><table>${rows}</table></div>`;
}

export function renderDebugView(app: HTMLElement) {
  const uncertain = collectUncertain();

  app.innerHTML = `
    <style>
      :root {
        --bg: #12121a; --panel: #1a1a24; --line: #2c2c3a; --text: #f2f0e6;
        --muted: #8b8b99; --accent: #c81e3a; --gold: #c9a35c; --good: #3fa66e;
      }
      * { box-sizing: border-box; }
      body { margin: 0; }
      .dbg-root {
        background: var(--bg); color: var(--text);
        font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;
        min-height: 100vh; padding: 32px 24px 80px;
      }
      .dbg-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
      h1 { font-weight: 500; letter-spacing: 0.01em; margin-bottom: 4px; }
      .subtitle { color: var(--muted); font-size: 14px; margin-bottom: 28px; }
      .counts { display: flex; gap: 20px; margin-bottom: 28px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; color: var(--gold); }
      .warn-block { border: 1px solid var(--accent); background: rgba(200,30,58,0.08); border-radius: 4px; padding: 14px 18px; margin-bottom: 32px; }
      .warn-block h3 { margin: 0 0 8px; font-size: 14px; color: var(--accent); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
      .warn-block ul { margin: 0; padding-left: 18px; font-size: 13px; color: var(--text); line-height: 1.6; }
      .entry { border: 1px solid var(--line); background: var(--panel); border-radius: 4px; padding: 16px 20px; margin-bottom: 18px; }
      .entry-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 4px; }
      .entry-head .lemma { font-size: 20px; }
      .entry-head .pos { font-size: 11px; color: var(--muted); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; text-transform: uppercase; }
      .entry-meta { color: var(--muted); font-size: 12.5px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; margin-bottom: 10px; }
      .entry-notes { color: var(--gold); font-size: 12.5px; margin-bottom: 10px; line-height: 1.5; }
      .tables { display: flex; flex-wrap: wrap; gap: 16px; }
      .table-block h4 { font-size: 11px; color: var(--muted); margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.04em; }
      table { border-collapse: collapse; font-size: 13px; }
      td { padding: 2px 8px; border-bottom: 1px solid var(--line); }
      td.case { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: var(--muted); font-size: 11px; }
      td.form { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
      td.flags { font-size: 10px; }
      .flag { display: inline-block; padding: 1px 5px; border-radius: 2px; margin-left: 4px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
      .flag.uncertain { background: rgba(200,30,58,0.25); color: #ff8a97; }
      .flag.alt { background: rgba(201,163,92,0.2); color: var(--gold); }
      section { margin-bottom: 40px; }
      section > h2 { font-size: 16px; color: var(--muted); border-bottom: 1px solid var(--line); padding-bottom: 6px; }
      a.debug-link { color: var(--gold); }
    </style>
    <div class="dbg-root">
      <h1>Case Rush — data model debug view</h1>
      <div class="subtitle dbg-mono">vocabulary bank inspector · <a class="debug-link" href="/">← back to the game</a></div>
      <div class="counts">
        <span>${NOUNS.length} nouns</span>
        <span>${ADJECTIVES.length} adjectives</span>
        <span>${VERBS.length} verbs</span>
        <span>${DEMONSTRATIVES.length} demonstratives</span>
        <span>${VOCABULARY.length} total entries</span>
      </div>

      ${
        uncertain.length
          ? `<div class="warn-block">
              <h3>⚑ ${uncertain.length} unconfirmed paradigm cell${uncertain.length === 1 ? '' : 's'} — please review</h3>
              <ul>
                ${uncertain
                  .map((u) => `<li><strong>${u.lemma}</strong> (${u.entryId}) — ${u.path}: <span class="dbg-mono">${u.cell.form}</span> — ${u.cell.uncertainNote ?? 'flagged uncertain'}</li>`)
                  .join('')}
              </ul>
            </div>`
          : ''
      }

      <section>
        <h2>Nouns</h2>
        ${NOUNS.map(
          (n) => `
          <div class="entry">
            <div class="entry-head"><span class="lemma">${n.lemma}</span><span class="pos">${n.partOfSpeech}</span></div>
            <div class="entry-meta">${n.gender}${n.animacy ? ` · ${n.animacy}` : ''} · plural agreement: ${n.pluralAgreementClass} · ${n.declensionClass} · "${n.translation}"${n.irregular ? ' · IRREGULAR' : ''}</div>
            ${n.irregularNote ? `<div class="entry-notes">⚑ ${n.irregularNote}</div>` : ''}
            ${n.notes ? `<div class="entry-notes">${n.notes}</div>` : ''}
            <div class="tables">
              ${renderCaseTable('singular', n.paradigm.singular)}
              ${renderCaseTable('plural', n.paradigm.plural)}
            </div>
          </div>`
        ).join('')}
      </section>

      <section>
        <h2>Adjectives</h2>
        ${ADJECTIVES.map(
          (a) => `
          <div class="entry">
            <div class="entry-head"><span class="lemma">${a.lemma}</span><span class="pos">${a.partOfSpeech}</span></div>
            <div class="entry-meta">"${a.translation}"</div>
            ${a.notes ? `<div class="entry-notes">${a.notes}</div>` : ''}
            <div class="tables">
              ${renderCaseTable('masc. sg', a.paradigm.singular.masculine)}
              ${renderCaseTable('fem. sg', a.paradigm.singular.feminine)}
              ${renderCaseTable('neut. sg', a.paradigm.singular.neuter)}
              ${renderCaseTable('virile pl.', a.paradigm.plural.virile)}
              ${renderCaseTable('non-virile pl.', a.paradigm.plural.nonvirile)}
            </div>
            ${a.paradigm.singular.masculine.accusativeAnimate ? `<div class="entry-meta">masc. sg. accusative (animate referent): <span class="dbg-mono">${a.paradigm.singular.masculine.accusativeAnimate.form}</span></div>` : ''}
          </div>`
        ).join('')}
      </section>

      <section>
        <h2>Demonstratives</h2>
        ${DEMONSTRATIVES.map(
          (d) => `
          <div class="entry">
            <div class="entry-head"><span class="lemma">${d.lemma}</span><span class="pos">${d.partOfSpeech}</span></div>
            <div class="entry-meta">"${d.translation}" · no vocative paradigm</div>
            ${d.notes ? `<div class="entry-notes">${d.notes}</div>` : ''}
            <div class="tables">
              ${renderCaseTable('masc. sg', d.paradigm.singular.masculine)}
              ${renderCaseTable('fem. sg', d.paradigm.singular.feminine)}
              ${renderCaseTable('neut. sg', d.paradigm.singular.neuter)}
              ${renderCaseTable('virile pl.', d.paradigm.plural.virile)}
              ${renderCaseTable('non-virile pl.', d.paradigm.plural.nonvirile)}
            </div>
            ${d.paradigm.singular.masculine.accusativeAnimate ? `<div class="entry-meta">masc. sg. accusative (animate referent): <span class="dbg-mono">${d.paradigm.singular.masculine.accusativeAnimate.form}</span></div>` : ''}
          </div>`
        ).join('')}
      </section>

      <section>
        <h2>Verbs</h2>
        ${VERBS.map(
          (v) => `
          <div class="entry">
            <div class="entry-head"><span class="lemma">${v.infinitive}</span><span class="pos">${v.partOfSpeech} · ${v.aspect}</span></div>
            <div class="entry-meta dbg-mono">${v.principalParts.infinitive} / ${v.principalParts.firstSingular} / ${v.principalParts.thirdSingular} · ${v.conjugationPattern}${v.irregular ? ' · IRREGULAR' : ''}</div>
            <div class="entry-meta">"${v.translation}"</div>
            ${v.irregularNote ? `<div class="entry-notes">⚑ ${v.irregularNote}</div>` : ''}
            ${v.notes ? `<div class="entry-notes">${v.notes}</div>` : ''}
            <div class="entry-meta">governance: ${v.governance
              .map((g) => `${g.complement} → ${g.preposition ? g.preposition + ' + ' : ''}${CASE_ABBREV[g.case]}${g.note ? ` (${g.note})` : ''}`)
              .join(' · ')}</div>
          </div>`
        ).join('')}
      </section>
    </div>
  `;
}
