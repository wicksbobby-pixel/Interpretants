import { mountGame } from './drill/ui';
import { renderDebugView } from './debug-view';

/**
 * Stage 2: the actual drilling loop. The stage-1 data dump is still
 * reachable at ?debug for inspecting the vocabulary bank directly.
 */

const GAME_CSS = `
  :root {
    --bg: #12121a;
    --panel: #1a1a24;
    --line: #2c2c3a;
    --text: #f2f0e6;
    --muted: #8b8b99;
    --accent: #c81e3a;
    --good: #3fa66e;
    --bad: #8b4049;
    --gold: #c9a35c;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); }
  .pcr-root {
    background: var(--bg);
    color: var(--text);
    font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
  }
  .pcr-card { width: 100%; max-width: 560px; transition: max-width 0.2s; }
  .pcr-card.wide { max-width: 920px; }
  .pcr-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
  .pcr-dots { display: flex; gap: 7px; justify-content: center; margin-bottom: 28px; }
  .pcr-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--line); transition: background 0.3s; }
  .pcr-dot.done { background: var(--gold); }
  .pcr-dot.current { background: var(--accent); }

  .pcr-stage { text-align: center; min-height: 300px; display: flex; flex-direction: column; justify-content: center; }

  .pcr-sentence {
    font-size: 28px; line-height: 1.5; letter-spacing: 0.01em; min-height: 84px;
    display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
  }
  .pcr-blank { display: inline-block; border-bottom: 2px solid var(--muted); width: 1.4em; margin: 0 2px; }
  .pcr-fill-good { color: var(--good); }
  .pcr-fill-bad { color: var(--bad); text-decoration: line-through; }
  .pcr-fill-correction { color: var(--good); }

  .pcr-explain {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12.5px; color: var(--muted); min-height: 18px; margin-top: 10px; letter-spacing: 0.01em;
  }
  .pcr-case-badge {
    display: inline-block; border: 1px solid; border-radius: 3px; padding: 1px 6px;
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.04em; margin-right: 2px;
  }

  .pcr-timerwrap { height: 3px; background: var(--line); border-radius: 2px; margin: 22px auto 26px; max-width: 340px; overflow: hidden; }
  .pcr-timerbar { height: 100%; background: var(--accent); width: 100%; transform-origin: left; }

  .pcr-options { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .pcr-opt {
    position: relative; background: var(--panel); border: 1px solid var(--line); color: var(--text);
    font-family: inherit; font-size: 18px; padding: 14px 18px 14px 34px; border-radius: 3px; cursor: pointer;
    min-width: 120px; text-align: left; animation: pcr-arrive 0.28s ease-out backwards;
    transition: border-color 0.15s, transform 0.1s;
  }
  .pcr-opt:hover:not(:disabled) { border-color: var(--gold); }
  .pcr-opt:active:not(:disabled) { transform: scale(0.98); }
  .pcr-opt:disabled { cursor: default; }
  .pcr-opt.correct { border-color: var(--good); background: rgba(63,166,110,0.12); }
  .pcr-opt.incorrect { border-color: var(--bad); background: rgba(139,64,73,0.14); }
  .pcr-opt .pcr-key {
    position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; color: var(--muted);
  }
  .pcr-opt:nth-child(1) { animation-delay: 0s; }
  .pcr-opt:nth-child(2) { animation-delay: 0.05s; }
  .pcr-opt:nth-child(3) { animation-delay: 0.1s; }

  @keyframes pcr-arrive { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
  @media (prefers-reduced-motion: reduce) { .pcr-opt { animation: none; } }

  .pcr-footer {
    display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px 14px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; color: var(--muted);
    margin-top: 30px; max-width: 420px; margin-left: auto; margin-right: auto;
  }

  .pcr-translation { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; color: var(--gold); margin-top: 18px; }

  .pcr-btn {
    background: transparent; border: 1px solid var(--gold); color: var(--gold);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px;
    padding: 10px 22px; border-radius: 3px; cursor: pointer; margin-top: 22px;
  }
  .pcr-btn:hover { background: rgba(201,163,92,0.1); }
  .pcr-btn-secondary { border-color: var(--line); color: var(--muted); margin-left: 10px; }
  .pcr-btn-secondary:hover { background: rgba(255,255,255,0.04); border-color: var(--muted); }

  .pcr-intro h1 { font-size: 26px; font-weight: 500; margin: 0 0 10px; text-align: center; letter-spacing: 0.01em; }
  .pcr-intro p { color: var(--muted); font-size: 15px; line-height: 1.6; text-align: center; max-width: 420px; margin: 0 auto; }
  .pcr-intro-center { text-align: center; }

  .pcr-final-score { font-size: 52px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: var(--gold); text-align: center; margin: 6px 0; }
  .pcr-final-stats {
    display: flex; justify-content: center; gap: 22px; flex-wrap: wrap;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; color: var(--muted); margin-bottom: 6px;
  }

  .sc-root { padding: 4px 0 20px; }
  .sc-head { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 4px; }
  .sc-head h1 { font-size: 22px; font-weight: 500; margin: 0; letter-spacing: 0.01em; }
  .sc-total { font-size: 12px; color: var(--gold); }
  .sc-hint { color: var(--muted); font-size: 13px; margin: 4px 0 24px; line-height: 1.5; }
  .sc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
  .sc-card { border: 1px solid var(--line); background: var(--panel); border-radius: 4px; padding: 14px 16px; }
  .sc-card-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
  .sc-lemma { font-size: 17px; }
  .sc-gloss { color: var(--muted); font-size: 12.5px; }
  .sc-progress { color: var(--gold); font-size: 11px; margin-left: auto; }
  .sc-table-wrap { overflow-x: auto; }
  .sc-table { border-collapse: collapse; width: 100%; font-size: 12px; }
  .sc-table th.sc-row-label {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10px; color: var(--muted);
    text-align: left; padding: 4px 6px 4px 0; font-weight: 400;
  }
  .sc-cell { padding: 4px 6px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; white-space: nowrap; }
  .sc-cell.sc-unseen { color: var(--line); }
  .sc-abbr { display: block; font-size: 8.5px; letter-spacing: 0.03em; color: var(--muted); border-bottom: 1px solid transparent; margin-bottom: 1px; }
  .sc-unseen .sc-abbr { color: var(--line); }
`;

function mount() {
  const app = document.getElementById('app')!;
  const debug = new URLSearchParams(location.search).has('debug');

  if (debug) {
    renderDebugView(app);
    return;
  }

  const style = document.createElement('style');
  style.textContent = GAME_CSS;
  document.head.appendChild(style);

  app.innerHTML = `<div class="pcr-root"><div class="pcr-card" id="pcr-app"></div></div>`;
  mountGame(document.getElementById('pcr-app')!);
}

mount();
