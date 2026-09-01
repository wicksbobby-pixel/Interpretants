import { CASE_ABBREV } from '../domain/types';
import { generateClause, pickTemplate, type GeneratedClause, type ResolvedSlot } from './engine';
import { unlockedTierIndex, CASE_TIERS } from './gating';
import { createSession, recordSlotAnswer, recordUnitResult, type SessionState } from './session';
import { capitalizeWord } from './text';

/**
 * Round length is a placeholder like the gating/ratio constants elsewhere
 * in this module — not a value with pedagogical grounding yet.
 */
const ROUND_LENGTH = 8;

interface RevealedItem {
  html: string;
  attach?: boolean;
}

export function mountGame(root: HTMLElement) {
  let session: SessionState = createSession();
  let clause: GeneratedClause | null = null;
  let segIndex = 0;
  let revealed: RevealedItem[] = [];
  let pendingPairCorrect: boolean | null = null;
  let slotActive = false;
  let currentOptions: { form: string; isCorrect: boolean }[] = [];
  let timerHandle: ReturnType<typeof setTimeout> | null = null;

  function joinRevealed(): string {
    return revealed.map((item, i) => (i === 0 || item.attach ? '' : ' ') + item.html).join('');
  }

  function renderShell(stageInner: string) {
    const tierIdx = unlockedTierIndex(session.stats);
    const doneUnits = Math.min(session.totalUnits, ROUND_LENGTH);
    root.innerHTML = `
      <div class="pcr-dots">
        ${Array.from({ length: ROUND_LENGTH })
          .map((_, i) => `<div class="pcr-dot ${i < doneUnits ? 'done' : i === doneUnits ? 'current' : ''}"></div>`)
          .join('')}
      </div>
      <div class="pcr-stage">${stageInner}</div>
      <div class="pcr-footer">
        <span>score ${session.score}</span>
        <span>streak ${session.streak}</span>
        <span>tier ${tierIdx + 1}/${CASE_TIERS.length}</span>
        <span>${doneUnits}/${ROUND_LENGTH}</span>
      </div>
    `;
  }

  function renderIntro() {
    root.innerHTML = `
      <div class="pcr-intro">
        <h1>Case Rush</h1>
        <p>Clauses build word by word from the vocabulary bank. When a slot needs declining, three forms arrive — pick the right one before the bar runs out. Adjective/demonstrative pairs are drilled as two linked picks: both have to be right to count.</p>
        <div class="pcr-intro-center">
          <button class="pcr-btn pcr-mono" id="pcr-start">start · ${ROUND_LENGTH} items</button>
        </div>
      </div>
    `;
    document.getElementById('pcr-start')!.onclick = startRound;
  }

  function startRound() {
    session = createSession();
    loadClause();
  }

  function loadClause() {
    const template = pickTemplate(session.stats);
    clause = generateClause(template);
    segIndex = 0;
    revealed = [];
    pendingPairCorrect = null;
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
    const timerDuration = Math.max(3, 6 - Math.floor(session.totalUnits / 3));

    const displayForm = (form: string) => (segIndex === 0 ? capitalizeWord(form) : form);
    const optsHTML = slot.options
      .map((o, i) => `<button class="pcr-opt pcr-mono" data-idx="${i}"><span class="pcr-key">${i + 1}</span>${displayForm(o.form)}</button>`)
      .join('');
    updateSentence('', optsHTML, true);

    const bar = document.querySelector<HTMLElement>('.pcr-timerbar');
    if (bar) {
      bar.style.transition = 'none';
      bar.style.transform = 'scaleX(1)';
      // force reflow so the transition below actually animates from scaleX(1)
      void bar.offsetWidth;
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

    session = recordSlotAnswer(session, slot.caseName, correct);

    if (slot.pairId) {
      if (slot.pairRole === 'modifier') {
        pendingPairCorrect = correct;
      } else {
        const pairCorrect = correct && (pendingPairCorrect ?? false);
        session = recordUnitResult(session, pairCorrect);
        pendingPairCorrect = null;
      }
    } else {
      session = recordUnitResult(session, correct);
    }

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
    if (sentenceEl) sentenceEl.innerHTML = joinRevealed() + (segIndex === 0 || revealed.length === 0 ? '' : ' ') + fillHtml;

    const caseLabel = `${CASE_ABBREV[slot.caseName]} · ${slot.explanation}`;
    const explainEl = document.querySelector('.pcr-explain');
    if (explainEl) {
      explainEl.innerHTML = slot.alternationNote ? `${caseLabel}; ${slot.alternationNote}` : caseLabel;
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
      if (session.totalUnits >= ROUND_LENGTH) finishRound();
      else loadClause();
    }, 1600);
  }

  function finishRound() {
    const accuracy = session.totalUnits ? Math.round((session.correctUnits / session.totalUnits) * 100) : 0;
    const tierIdx = unlockedTierIndex(session.stats);
    root.innerHTML = `
      <div class="pcr-intro">
        <h1>Round complete</h1>
        <div class="pcr-final-score pcr-mono">${session.score}</div>
        <div class="pcr-final-stats">
          <span>${session.correctUnits}/${session.totalUnits} correct</span>
          <span>${accuracy}% accuracy</span>
          <span>tier ${tierIdx + 1}/${CASE_TIERS.length} unlocked</span>
        </div>
        <p class="pcr-note">Mistake-by-mistake review, spaced resurfacing, and persistence across rounds land in stage 3 — this summary is the stage-2 placeholder.</p>
        <div class="pcr-intro-center">
          <button class="pcr-btn pcr-mono" id="pcr-again">play again</button>
        </div>
      </div>
    `;
    document.getElementById('pcr-again')!.onclick = startRound;
  }

  document.addEventListener('keydown', (e) => {
    if (!slotActive || !clause) return;
    const idx = { '1': 0, '2': 1, '3': 2 }[e.key];
    const seg = clause.segments[segIndex];
    if (idx !== undefined && seg?.kind === 'slot' && currentOptions[idx]) handleAnswer(seg.slot, idx);
  });

  renderIntro();
}
