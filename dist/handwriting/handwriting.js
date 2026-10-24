import { kanaStrokes } from './strokes.js';
import { pointInBoard, pathFromPoints, strokeLength, countFeedback } from './model.js';

const NS = 'http://www.w3.org/2000/svg';
const grid = '<path d="M54.5 0V109M0 54.5H109" class="hw-grid-line"/><path d="M0 0L109 109M109 0L0 109" class="hw-diagonal"/>';
const modes = { watch: '看筆順', trace: '跟著描', free: '自己寫' };
let active = null;
export const hasHandwriting = char => Object.hasOwn(kanaStrokes, char);
export function openHandwriting(options) {
  if (!hasHandwriting(options.char)) return;
  active?.close();
  active = new WritingPractice(options);
}

class WritingPractice {
  constructor(options) {
    this.options = options;
    this.char = options.char;
    this.mode = 'watch';
    this.drafts = new Map();
    this.abort = new AbortController();
    this.frame = null;
    this.playing = false;
    this.paused = false;
    this.currentStroke = null;
    this.demoStep = 0;
    this.hint = false;
    this.result = false;
    this.speed = 1;
    this.dialog = document.createElement('dialog');
    this.dialog.className = 'hw-dialog';
    this.dialog.setAttribute('aria-labelledby', 'hw-title');
    document.body.append(this.dialog);
    this.render();
    const signal = this.abort.signal;
    this.dialog.addEventListener('click', e => this.click(e), { signal });
    this.dialog.addEventListener('change', e => this.change(e), { signal });
    this.dialog.addEventListener('keydown', e => {
      if (!e.target.matches('[role="tab"]') || !['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
      e.preventDefault();
      const names = Object.keys(modes), index = names.indexOf(this.mode);
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : (index + (e.key === 'ArrowRight' ? 1 : 2)) % 3;
      this.switchMode(names[next]);
    }, { signal });
    this.dialog.addEventListener('cancel', e => { e.preventDefault(); this.close(); }, { signal });
    this.dialog.addEventListener('close', () => this.destroy(), { signal });
    this.dialog.showModal();
  }

  get template() { return kanaStrokes[this.char]; }
  get draft() {
    const key = `${this.char}:${this.mode}`;
    if (!this.drafts.has(key)) this.drafts.set(key, { strokes: [], recorded: false, hinted: false });
    return this.drafts.get(key);
  }
  query(selector) { return this.dialog.querySelector(selector); }
  paths(cls, paths = this.template.paths) {
    return paths.map(d => `<path d="${d}" class="${cls}"/>`).join('');
  }
  svg(content, label) {
    return `<svg viewBox="0 0 109 109" role="img" aria-label="${label}">${grid}${content}</svg>`;
  }
  message(text) { this.query('#hw-status').textContent = text; }
  progressText() {
    const p = this.options.getProgress(this.char) || {};
    return `描寫 ${p.trace || 0} 次 · 自由書寫 ${p.free || 0} 次`;
  }
  render() {
    const seq = this.options.sequence;
    const idx = seq.indexOf(this.char);
    const progress = this.progressText();
    this.dialog.innerHTML = `<div class="hw-top"><span class="eyebrow">五十音 / 手寫練習</span><button class="hw-close" data-hw="close" aria-label="關閉手寫練習">×</button></div>
      <div class="hw-heading"><div><h2 id="hw-title">一筆一畫，記住 <span lang="ja">${this.char}</span></h2><p id="hw-progress">${progress}</p></div><span class="pill">${this.template.paths.length} 筆 · ${this.char.charCodeAt(0) < 0x30a0 ? '平假名' : '片假名'}</span></div>
      <div class="hw-tabs" role="tablist" aria-label="練習模式">${Object.entries(modes).map(([m, label], i) => `<button id="hw-tab-${m}" role="tab" aria-selected="${m === this.mode}" aria-controls="hw-workspace" data-mode="${m}" class="${m === this.mode ? 'selected' : ''}"><span>0${i + 1}</span>${label}</button>`).join('')}</div>
      <div class="hw-layout" id="hw-workspace" role="tabpanel" aria-labelledby="hw-tab-${this.mode}"><div class="hw-drawing-column"><div class="hw-board-wrap ${this.mode === 'watch' ? 'watch' : ''}"><svg id="hw-board" viewBox="0 0 109 109" aria-label="${this.char} ${modes[this.mode]}寫字板" role="img">${grid}<g id="hw-guide"></g><g id="hw-ink"></g><g id="hw-demo"></g><g id="hw-markers"></g></svg><span class="hw-board-note">${this.mode === 'watch' ? '看起筆位置，跟著箭頭方向' : '手指、滑鼠、觸控筆皆可書寫'}</span></div><div class="hw-board-tools"><button class="secondary" data-hw="undo" ${this.mode === 'watch' ? 'disabled' : ''}>↶ 復原上一筆</button><button class="secondary" data-hw="clear" ${this.mode === 'watch' ? 'disabled' : ''}>清空</button><button class="secondary" data-hw="hint" ${this.mode !== 'free' ? 'disabled' : ''}>${this.hint ? '隱藏' : '顯示'}提示</button></div></div>
      <aside class="hw-side"><p class="eyebrow">${this.mode === 'watch' ? '先看，再動筆' : this.mode === 'trace' ? '跟著淡色路徑慢慢寫' : '給自己一點回想時間'}</p><h3>${this.mode === 'watch' ? '每一筆，都有自己的方向。' : this.mode === 'trace' ? '從圓點起筆，跟著箭頭走。' : '想一想，它的形狀。'}</h3><p class="hw-description">${this.mode === 'watch' ? '先看完整示範，也可以逐筆觀看。深綠色是已寫的筆畫，橘色圓點是目前的起筆位置。' : this.mode === 'trace' ? '每次放開，就記下一筆。綠色路徑提示接下來的一筆；你寫下的筆跡會保留下來。' : '先不看範字，在田字格裡寫一次。需要幫忙時，可以顯示提示。'}</p>
      <div class="hw-demo-tools"><button class="primary" data-hw="play">▶ 播放筆順</button><button class="secondary" data-hw="step">逐筆觀看</button><button class="secondary" data-hw="pause" disabled>暫停</button><label>示範速度 <select id="hw-speed"><option value="1" ${this.speed === 1 ? 'selected' : ''}>一般</option><option value="0.6" ${this.speed === .6 ? 'selected' : ''}>慢速</option></select></label></div>
      <p id="hw-status" class="hw-status" role="status" aria-live="polite">${this.mode === 'watch' ? `共 ${this.template.paths.length} 筆，按播放開始。` : `已寫 ${this.draft.strokes.length} 筆。${this.mode === 'trace' ? '跟著下一筆的起筆提示繼續。' : '不急，慢慢回想。'}`}</p>
      <div class="hw-action-stack"><button class="primary" data-hw="complete" ${this.mode === 'watch' ? 'hidden' : ''}>完成，對照看看</button><button class="primary" data-mode="trace" ${this.mode !== 'watch' ? 'hidden' : ''}>換我跟著描 →</button><button class="secondary" data-hw="replay" ${this.mode === 'watch' ? 'hidden' : ''}>重播我的筆跡</button><button class="hw-sound" data-hw="sound">♪ 聽發音</button></div>
      <p class="hw-note">${['き','さ'].includes(this.char) ? '範例採用分開收筆的寫法；請留意與部分印刷字形的差別。' : this.char === 'を' || this.char === 'ヲ' ? '這個假名常作助詞使用，讀作「お」。' : '先觀察筆順與字的比例，不需要和範例完全一樣。'}</p></aside></div>
      <section id="hw-comparison" class="hw-comparison" hidden></section>
      <div class="hw-bottom"><button class="secondary" data-hw="prev" ${idx === 0 ? 'disabled' : ''}>← 上一個</button><label class="hw-picker">選擇假名<select id="hw-character">${seq.map(c => `<option ${c === this.char ? 'selected' : ''}>${c}</option>`).join('')}</select></label><button class="secondary" data-hw="next" ${idx === seq.length - 1 ? 'disabled' : ''}>下一個 ${seq[idx + 1] || ''} →</button></div>
      <p class="hw-credit">範本：<a href="https://kanjivg.tagaini.net/" target="_blank" rel="noopener">KanjiVG</a> · © Ulrich Apel / <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener">CC BY-SA 3.0</a> · <a href="./vendor/kanjivg/CREDITS.md" target="_blank" rel="noopener">來源說明</a><br>保存練習次數；本次筆跡在關閉練習後清除。</p>`;
    // Keep playback controls next to the board so phones can see the animation
    // immediately after pressing Play, without scrolling back up.
    this.query('.hw-drawing-column').prepend(this.query('.hw-demo-tools'));
    this.bindBoard();
    this.paint();
  }

  paint() {
    const show = this.mode !== 'free' || this.hint;
    this.query('#hw-guide').innerHTML = show ? this.paths('hw-ghost') : '';
    this.query('#hw-demo').innerHTML = '';
    this.query('#hw-markers').innerHTML = '';
    this.paintInk();
    if (this.mode === 'trace' && !this.result) this.markNext();
    if (this.mode === 'free' && this.hint) this.markNext();
  }
  paintInk() {
    const strokes = this.mode === 'watch' ? [] : this.draft.strokes;
    this.query('#hw-ink').innerHTML = strokes.map(s => `<path d="${pathFromPoints(s)}" class="hw-user-stroke"/>`).join('');
  }
  markNext() {
    const index = this.draft.strokes.length;
    if (index >= this.template.paths.length) return;
    const path = this.makePath(this.template.paths[index], 'hw-next-stroke');
    this.query('#hw-demo').append(path);
    this.mark(path, index);
  }
  makePath(d, cls) {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d); p.setAttribute('class', cls);
    return p;
  }
  mark(path, index) {
    const start = path.getPointAtLength(0), tip = path.getPointAtLength(Math.min(8, path.getTotalLength()));
    const angle = Math.atan2(tip.y - start.y, tip.x - start.x);
    const a = { x: tip.x - 2.8 * Math.cos(angle - .5), y: tip.y - 2.8 * Math.sin(angle - .5) };
    const b = { x: tip.x - 2.8 * Math.cos(angle + .5), y: tip.y - 2.8 * Math.sin(angle + .5) };
    this.query('#hw-markers').innerHTML = `<circle cx="${start.x}" cy="${start.y}" r="1.7" class="hw-start"/><path d="M${start.x} ${start.y}L${tip.x} ${tip.y}M${a.x} ${a.y}L${tip.x} ${tip.y}L${b.x} ${b.y}" class="hw-arrow"/><text x="${Math.max(4, start.x - 6)}" y="${Math.max(7, start.y - 4)}" class="hw-stroke-number">${index + 1}</text>`;
  }

  bindBoard() {
    const board = this.query('#hw-board');
    board.addEventListener('pointerdown', e => {
      if (this.mode === 'watch' || this.result || this.playing || this.currentStroke || !e.isPrimary || e.button !== 0) return;
      if (this.draft.strokes.length >= 40) { this.message('已寫了很多筆，可以先清空再練習一次。'); return; }
      e.preventDefault();
      const p = pointInBoard(e.clientX, e.clientY, board.getBoundingClientRect());
      this.currentStroke = { pointer: e.pointerId, start: performance.now(), points: [{ ...p, t: 0 }] };
      this.query('#hw-markers').innerHTML = '';
      board.setPointerCapture(e.pointerId);
      this.livePath = this.makePath(pathFromPoints(this.currentStroke.points), 'hw-user-stroke');
      this.query('#hw-ink').append(this.livePath);
    });
    board.addEventListener('pointermove', e => {
      if (this.currentStroke?.pointer !== e.pointerId) return;
      e.preventDefault();
      const rect = board.getBoundingClientRect();
      const events = e.getCoalescedEvents?.();
      for (const ev of events?.length ? events : [e]) this.appendPoint(ev, rect);
      this.livePath.setAttribute('d', pathFromPoints(this.currentStroke.points));
    });
    const finish = (e, cancelled = false) => {
      if (this.currentStroke?.pointer !== e.pointerId) return;
      if (!cancelled) this.appendPoint(e, board.getBoundingClientRect());
      const points = this.currentStroke.points;
      this.currentStroke = null;
      if (board.hasPointerCapture(e.pointerId)) board.releasePointerCapture(e.pointerId);
      if (!cancelled && strokeLength(points) >= 1.5) this.draft.strokes.push(points);
      this.paint();
      this.message(cancelled ? '這一筆被中斷，請重新寫一次。' : `已寫 ${this.draft.strokes.length} 筆，範例共 ${this.template.paths.length} 筆。`);
    };
    board.addEventListener('pointerup', e => finish(e));
    board.addEventListener('pointercancel', e => finish(e, true));
    board.addEventListener('lostpointercapture', e => finish(e, true));
    board.addEventListener('contextmenu', e => e.preventDefault());
  }
  appendPoint(e, rect) {
    if (!this.currentStroke) return;
    const p = pointInBoard(e.clientX, e.clientY, rect), pts = this.currentStroke.points;
    const previous = pts.at(-1);
    if (Math.hypot(p.x - previous.x, p.y - previous.y) < .2 || pts.length >= 2500) return;
    pts.push({ ...p, t: performance.now() - this.currentStroke.start });
  }

  cancelAnimation() {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null; this.playing = false; this.paused = false;
    const pause = this.query('[data-hw="pause"]');
    if (pause) { pause.disabled = true; pause.textContent = '暫停'; }
  }
  animate(paths, own = false, startIndex = 0) {
    this.cancelAnimation();
    this.query('#hw-demo').innerHTML = '';
    this.query('#hw-markers').innerHTML = '';
    if (own) this.query('#hw-ink').innerHTML = '';
    this.playing = true;
    this.query('[data-hw="pause"]').disabled = false;
    const layer = this.query(own ? '#hw-ink' : '#hw-demo');
    let i = 0, elapsed = 0, last = null, path = null, length = 0, duration = 0;
    const nextPath = () => {
      path = this.makePath(paths[i], own ? 'hw-user-stroke' : 'hw-demo-stroke');
      layer.append(path);
      length = path.getTotalLength();
      duration = own ? Math.max(300, Math.min(2500, this.draft.strokes[i].at(-1).t)) : Math.max(550, length * 13) / this.speed;
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
      this.mark(path, startIndex + i);
      this.message(`${own ? '你的筆跡' : '筆順示範'}：第 ${startIndex + i + 1} 筆 / ${own ? paths.length : this.template.paths.length} 筆`);
    };
    nextPath();
    const tick = time => {
      if (last === null) last = time;
      if (!this.paused) elapsed += Math.min(50, time - last);
      last = time;
      path.style.strokeDashoffset = String(Math.max(0, length * (1 - elapsed / duration)));
      if (elapsed >= duration + 200) {
        i++; elapsed = 0;
        if (i === paths.length) {
          this.cancelAnimation();
          this.message(own ? '你的筆跡重播完成。' : paths.length === 1 ? `第 ${startIndex + 1} 筆示範完成。再按「逐筆觀看」繼續。` : `示範完成，共 ${this.template.paths.length} 筆。可以再看一次，或換你寫寫看。`);
          this.query('#hw-markers').innerHTML = '';
          return;
        }
        nextPath();
      }
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }
  playDemo(single = false) {
    if (this.currentStroke) return;
    if (single) {
      const index = this.demoStep++ % this.template.paths.length;
      this.animate([this.template.paths[index]], false, index);
      const layer = this.query('#hw-demo');
      for (let i = index - 1; i >= 0; i--) layer.prepend(this.makePath(this.template.paths[i], 'hw-demo-stroke'));
    } else { this.demoStep = 0; this.animate(this.template.paths); }
  }
  complete() {
    if (this.currentStroke) return;
    if (!this.draft.strokes.length) { this.message('先在格子裡寫下至少一筆，再來對照。'); return; }
    this.cancelAnimation();
    this.result = true;
    this.paint();
    this.query('#hw-guide').innerHTML = this.paths('hw-compare-guide');
    this.query('#hw-demo').innerHTML = '';
    if (!this.draft.recorded) {
      this.options.onComplete(this.char, this.mode);
      this.draft.recorded = true;
    }
    this.query('#hw-progress').textContent = this.progressText();
    this.query('[data-hw="complete"]').disabled = true;
    const comparison = this.query('#hw-comparison');
    comparison.hidden = false;
    comparison.innerHTML = `<p class="eyebrow">完成一次練習，就是進步</p><h3>把你的筆跡，和範例放在一起。</h3><p>${countFeedback(this.draft.strokes.length, this.template.paths.length)}</p><div class="hw-compare-pair"><figure>${this.svg(this.paths('hw-demo-stroke'), '標準筆順範例')}<figcaption>範例</figcaption></figure><figure>${this.svg(this.draft.strokes.map(s => `<path d="${pathFromPoints(s)}" class="hw-user-stroke"/>`).join(''), '你的手寫筆跡')}<figcaption>你的筆跡</figcaption></figure></div><p class="hw-note">上方寫字板也疊上範字，方便比較。本次只記錄練習與筆畫數，不判定字形正確或熟練。</p><div class="button-row"><button class="secondary" data-hw="again">再寫一次</button>${this.mode === 'trace' ? '<button class="primary" data-mode="free">試試自己寫 →</button>' : '<button class="primary" data-hw="next">練習下一個 →</button>'}</div>`;
    this.message('已保存本次練習次數。向下看看範字對照。');
    comparison.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  switchMode(mode) {
    this.cancelAnimation(); this.currentStroke = null;
    this.mode = mode; this.hint = false; this.result = false; this.demoStep = 0;
    this.render(); this.query(`[data-mode="${mode}"]`).focus();
  }
  choose(char) {
    if (!hasHandwriting(char)) return;
    this.cancelAnimation(); this.currentStroke = null;
    this.char = char; this.result = false; this.hint = false; this.demoStep = 0;
    this.render(); this.dialog.scrollTop = 0;
    this.query('#hw-character').focus();
  }
  click(e) {
    const button = e.target.closest('button');
    if (!button) return;
    e.stopPropagation();
    if (button.dataset.mode) { this.switchMode(button.dataset.mode); return; }
    const action = button.dataset.hw;
    if (action === 'close') { this.close(); return; }
    if (action === 'play' || action === 'step') { this.playDemo(action === 'step'); return; }
    if (action === 'pause') { this.paused = !this.paused; button.textContent = this.paused ? '繼續播放' : '暫停'; return; }
    if (action === 'sound') { this.options.speak(this.char === 'を' || this.char === 'ヲ' ? 'お' : this.char, button); return; }
    if (action === 'complete') { this.complete(); return; }
    if (action === 'replay') {
      if (!this.draft.strokes.length) { this.message('先寫幾筆，再看看自己的書寫過程。'); return; }
      this.animate(this.draft.strokes.map(pathFromPoints), true); return;
    }
    if (action === 'next' || action === 'prev') {
      const i = this.options.sequence.indexOf(this.char) + (action === 'next' ? 1 : -1);
      if (i >= this.options.sequence.length) { this.message('已經是最後一個假名，可以選擇其他假名繼續練習。'); return; }
      if (i >= 0) this.choose(this.options.sequence[i]); return;
    }
    this.cancelAnimation();
    if (action === 'hint') { this.hint = !this.hint; if (this.hint) this.draft.hinted = true; }
    if (action === 'undo') this.draft.strokes.pop();
    if (action === 'clear' || action === 'again') { this.draft.strokes = []; this.draft.recorded = false; this.draft.hinted = false; }
    this.result = false; this.render();
  }
  change(e) {
    if (e.target.id === 'hw-character') this.choose(e.target.value);
    if (e.target.id === 'hw-speed') { this.speed = Number(e.target.value); this.cancelAnimation(); this.paint(); this.message('示範速度已更新，按播放開始。'); }
  }
  close() { this.dialog.close(); }
  destroy() {
    this.cancelAnimation(); this.abort.abort(); this.dialog.remove();
    if (active === this) active = null;
    this.options.onClose();
  }
}
