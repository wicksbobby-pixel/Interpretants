import { CASES, CASE_ABBREV } from '../domain/types';
import { NOUNS } from '../domain/vocab';
import { CASE_COLOR } from './colors';
import { generateClause, pickTemplate, type GeneratedClause, type ResolvedSlot } from './engine';
import { unlockedTierIndex, CASE_TIERS } from './gating';
import {
  createAppState,
  createRoundState,
  encounterKey,
  markEncountered,
  recordSlotAnswer,
  recordUnitResult,
  type AppState,
  type RoundState,
} from './session';
import { capitalizeWord } from './text';

/** Placeholder like the gating constants elsewhere — not pedagogically tuned. */
const ROUND_LENGTH = 8;

interface RevealedItem {
  html: string;
  attach?: boolean;
}

export function mountGame(root: HTMLElement) {
  let app: AppState = createAppState();
  let round: RoundState = createRoundState();
  let clause: GeneratedClause | null = null;
  let segIndex = 0;
  let revealed: RevealedItem[] = [];
  let slotActive = false;
  let currentOptions: { form: string; isCorrect: boolean }[] = [];
  let timerHandle: ReturnType<typeof setTimeout> | null = null;

  function joinRevealed(): string {
    return revealed.map((item, i) => (i === 0 || item.attach ? '' : ' ') + item.html).join('');
  }

  function renderShell(stageInner: string) {
    const tierIdx = unlockedTierIndex(app.stats);
    const doneUnits = Math.min(round.totalUnits, ROUND_LENGTH);
    root.innerHTML = `
      <div class="pcr-dots">
        ${Array.from({ length: ROUND_LENGTH })
          .map((_, i) => `<div class="pcr-dot ${i < doneUnits ? 'done' : i === doneUnits ? 'current' : ''}"></div>`)
          .join('')}
      </div>
      <div class="pcr-stage">${stageInner}</div>
      <div class="pcr-footer">
        <span>score ${round.score}</span>
        <span>streak ${round.streak}</span>
        <span>tier ${tierIdx + 1}/${CASE_TIERS.length}</span>
        <span>${doneUnits}/${ROUND_LENGTH}</span>
      </div>
    `;
  }

  function renderIntro() {
    root.classList.remove('wide');
    root.innerHTML = `
      <div class="pcr-intro">
        <h1>Case Rush</h1>
        <p>A sentence builds word by word. When it needs a noun declined, three case-forms of that same noun arrive — pick the right one before the bar runs out.</p>
        <div class="pcr-intro-center">
          <button class="pcr-btn pcr-mono" id="pcr-start">start · ${ROUND_LENGTH} items</button>
          <button class="pcr-btn pcr-btn-secondary pcr-mono" id="pcr-scorecard">scorecard</button>
        </div>
      </div>
    `;
    document.getElementById('pcr-start')!.onclick = startRound;
    document.getElementById('pcr-scorecard')!.onclick = () => renderScorecard(renderIntro);
  }

  function startRound() {
    round = createRoundState();
    loadClause();
  }

  function loadClause() {
    const template = pickTemplate(app.stats);
    clause = generateClause(template);
    segIndex = 0;
    revealed = [];
    renderShell(`<div class="pcr-sentence"></div><div class="pcr-explain"></div><div class="pcr-timerwrap"><div class="pcr-timerbar"></div></div><div class="pcr-options"></div>`);
    processSegment();
  }

  function processSegment() {
    if (!clause) return;
    if (segIndex >= clause.segments.length) {
      finishClause();
      return;
    }
    const seg = clause.segments[segIndex];
    if (seg.kind === 'text') {
      const text = segIndex === 0 ? capitalizeWord(seg.text) : seg.text;
      revealed.push({ html: text, attach: seg.attach });
      updateSentence('', '');
      segIndex++;
      setTimeout(processSegment, 260);
    } else {
      setupSlot(seg.slot);
    }
  }

  function updateSentence(explain: string, optionsHTML: string, blank = false) {
    const sentenceEl = document.querySelector('.pcr-sentence');
    const explainEl = document.querySelector('.pcr-explain');
    const optionsEl = document.querySelector('.pcr-options');
    if (sentenceEl) sentenceEl.innerHTML = joinRevealed() + (blank ? ' <span class="pcr-blank"></span>' : '');
    if (explainEl) explainEl.innerHTML = explain;
    if (optionsEl) optionsEl.innerHTML = optionsHTML;
  }

  function setupSlot(slot: ResolvedSlot) {
    slotActive = true;
    currentOptions = slot.options;
    const timerDuration = Math.max(3, 6 - Math.floor(round.totalUnits / 3));

    const displayForm = (form: string) => (segIndex === 0 ? capitalizeWord(form) : form);
    const optsHTML = slot.options
      .map((o, i) => `<button class="pcr-opt pcr-mono" data-idx="${i}"><span class="pcr-key">${i + 1}</span>${displayForm(o.form)}</button>`)
      .join('');
    updateSentence('', optsHTML, true);

    const bar = document.querySelector<HTMLElement>('.pcr-timerbar');
    if (bar) {
      bar.style.transition = 'none';
      bar.style.transform = 'scaleX(1)';
      void bar.offsetWidth; // force reflow so the transition below animates from scaleX(1)
      bar.style.transition = `transform ${timerDuration}s linear`;
      requestAnimationFrame(() => {
        bar.style.transform = 'scaleX(0)';
      });
    }

    document.querySelectorAll<HTMLButtonElement>('.pcr-opt').forEach((btn) => {
      btn.onclick = () => handleAnswer(slot, Number(btn.dataset.idx));
    });

    timerHandle = setTimeout(() => {
      if (slotActive) handleAnswer(slot, null);
    }, timerDuration * 1000);
  }

  function handleAnswer(slot: ResolvedSlot, chosenIdx: number | null) {
    if (!slotActive) return;
    slotActive = false;
    if (timerHandle) clearTimeout(timerHandle);

    const chosen = chosenIdx === null ? null : currentOptions[chosenIdx];
    const correct = chosen?.isCorrect ?? false;

    app = recordSlotAnswer(app, slot.caseName, correct);
    app = markEncountered(app, slot.nounId, slot.number, slot.caseName);
    round = recordUnitResult(round, correct);

    document.querySelectorAll<HTMLButtonElement>('.pcr-opt').forEach((btn, i) => {
      btn.disabled = true;
      if (currentOptions[i].isCorrect) btn.classList.add('correct');
      else if (i === chosenIdx) btn.classList.add('incorrect');
    });

    const displayForm = (form: string) => (segIndex === 0 ? capitalizeWord(form) : form);
    const fillClass = correct ? 'pcr-fill-good' : 'pcr-fill-bad';
    const fillWord = chosen ? displayForm(chosen.form) : '—';
    let fillHtml = `<span class="${fillClass}">${fillWord}</span>`;
    if (!correct) fillHtml += ` <span class="pcr-fill-correction">(${displayForm(slot.correctForm)})</span>`;

    const sentenceEl = document.querySelector('.pcr-sentence');
    if (sentenceEl) sentenceEl.innerHTML = joinRevealed() + (revealed.length === 0 ? '' : ' ') + fillHtml;

    const color = CASE_COLOR[slot.caseName];
    const badge = `<span class="pcr-case-badge" style="color:${color};border-color:${color}">${CASE_ABBREV[slot.caseName]}</span>`;
    const explainEl = document.querySelector('.pcr-explain');
    if (explainEl) {
      explainEl.innerHTML = `${badge} ${slot.explanation}${slot.alternationNote ? '; ' + slot.alternationNote : ''}`;
    }

    revealed.push({ html: displayForm(slot.correctForm), attach: false });
    segIndex++;

    setTimeout(processSegment, 1150);
  }

  function finishClause() {
    if (!clause) return;
    renderShell(`
      <div class="pcr-sentence">${joinRevealed()}</div>
      <div class="pcr-translation pcr-mono">"${clause.translation}"</div>
    `);
    setTimeout(() => {
      if (round.totalUnits >= ROUND_LENGTH) finishRound();
      else loadClause();
    }, 1600);
  }

  function finishRound() {
    const accuracy = round.totalUnits ? Math.round((round.correctUnits / round.totalUnits) * 100) : 0;
    const tierIdx = unlockedTierIndex(app.stats);
    root.innerHTML = `
      <div class="pcr-intro">
        <h1>Round complete</h1>
        <div class="pcr-final-score pcr-mono">${round.score}</div>
        <div class="pcr-final-stats">
          <span>${round.correctUnits}/${round.totalUnits} correct</span>
          <span>${accuracy}% accuracy</span>
          <span>tier ${tierIdx + 1}/${CASE_TIERS.length} unlocked</span>
        </div>
        <div class="pcr-intro-center">
          <button class="pcr-btn pcr-mono" id="pcr-again">play again</button>
          <button class="pcr-btn pcr-btn-secondary pcr-mono" id="pcr-scorecard">scorecard</button>
        </div>
      </div>
    `;
    document.getElementById('pcr-again')!.onclick = startRound;
    document.getElementById('pcr-scorecard')!.onclick = () => renderScorecard(finishRound);
  }

  function renderNounCard(nounId: string): string {
    const noun = NOUNS.find((n) => n.id === nounId)!;
    const rows: [string, 'singular' | 'plural'][] = [
      ['SG', 'singular'],
      ['PL', 'plural'],
    ];
    let seenCount = 0;
    const rowsHtml = rows
      .map(([rowLabel, num]) => {
        const cellsHtml = CASES.map((c) => {
          const seen = app.encountered.has(encounterKey(noun.id, num, c));
          if (seen) seenCount++;
          const color = CASE_COLOR[c];
          return seen
            ? `<td class="sc-cell sc-seen" style="color:${color}"><span class="sc-abbr" style="border-color:${color}">${CASE_ABBREV[c]}</span>${noun.paradigm[num][c].form}</td>`
            : `<td class="sc-cell sc-unseen"><span class="sc-abbr">${CASE_ABBREV[c]}</span>···</td>`;
        }).join('');
        return `<tr><th class="sc-row-label">${rowLabel}</th>${cellsHtml}</tr>`;
      })
      .join('');
    return `
      <div class="sc-card">
        <div class="sc-card-head">
          <span class="sc-lemma">${noun.lemma}</span>
          <span class="sc-gloss">"${noun.translation}"</span>
          <span class="sc-progress pcr-mono">${seenCount}/14</span>
        </div>
        <div class="sc-table-wrap"><table class="sc-table">${rowsHtml}</table></div>
      </div>
    `;
  }

  function renderScorecard(onBack: () => void) {
    root.classList.add('wide');
    const totalCells = NOUNS.length * 14;
    const totalSeen = app.encountered.size;
    root.innerHTML = `
      <div class="sc-root">
        <div class="sc-head">
          <h1>Scorecard</h1>
          <span class="pcr-mono sc-total">${totalSeen}/${totalCells} forms encountered</span>
        </div>
        <p class="sc-hint">Case-forms reveal here the first time you meet them in a drill, right or wrong.</p>
        <div class="sc-grid">${NOUNS.map((n) => renderNounCard(n.id)).join('')}</div>
        <div class="pcr-intro-center">
          <button class="pcr-btn pcr-mono" id="pcr-sc-back">back</button>
        </div>
      </div>
    `;
    document.getElementById('pcr-sc-back')!.onclick = () => {
      root.classList.remove('wide');
      onBack();
    };
  }

  document.addEventListener('keydown', (e) => {
    if (!slotActive || !clause) return;
    const idx = { '1': 0, '2': 1, '3': 2 }[e.key];
    const seg = clause.segments[segIndex];
    if (idx !== undefined && seg?.kind === 'slot' && currentOptions[idx]) handleAnswer(seg.slot, idx);
  });

  renderIntro();
}
