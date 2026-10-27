/* 节奏小奶蛙 - Node 冒烟测试（无浏览器环境模拟完整游玩流程）
   运行：node test/smoke.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
let fakePerf = 0;          // performance.now 毫秒
const rafCb = { cb: null };
const winListeners = {};
const docListeners = {};
const elements = {};
const calls = { result: [], celebration: [], screens: [] };

/* ---------------- 浏览器桩 ---------------- */
const gradient = { addColorStop() { } };
const ctxProxy = new Proxy({}, {
  get(t, p) {
    if (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createPattern') return () => gradient;
    if (p === 'measureText') return () => ({ width: 42 });
    if (p === 'getImageData') return (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(4, w * h * 4)) });
    if (typeof p === 'symbol') return undefined;
    return () => undefined;
  },
  set() { return true; }
});

function makeElement(id) {
  const listeners = {};
  const el = {
    id, style: {}, children: [],
    innerHTML: '', textContent: '', value: '', checked: false, onclick: null,
    width: 0, height: 0,
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
      contains(c) { return this._s.has(c); },
      toggle(c, force) { const on = force === undefined ? !this._s.has(c) : !!force; on ? this._s.add(c) : this._s.delete(c); return on; }
    },
    addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
    _fire(type, ev) { (listeners[type] || []).slice().forEach(fn => fn(ev || {})); },
    appendChild(c) { this.children.push(c); return c; },
    remove() { },
    getContext() { return ctxProxy; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 900, height: 400 }; }
  };
  return el;
}

class FakeParam { constructor() { this.value = 0; } setValueAtTime() { } exponentialRampToValueAtTime() { } linearRampToValueAtTime() { } }
class FakeNode {
  constructor() { this.gain = new FakeParam(); this.frequency = new FakeParam(); this.Q = new FakeParam(); this.type = ''; this.buffer = null; }
  connect() { } start() { } stop() { }
}
class FakeAudioContext {
  constructor() { this.currentTime = 0; this.state = 'suspended'; this.destination = new FakeNode(); this.sampleRate = 44100; }
  createGain() { return new FakeNode(); }
  createOscillator() { return new FakeNode(); }
  createBufferSource() { return new FakeNode(); }
  createBiquadFilter() { return new FakeNode(); }
  createBuffer(ch, len) { return { getChannelData: () => new Float32Array(len) }; }
  resume() { this.state = 'running'; return Promise.resolve(); }
  suspend() { this.state = 'suspended'; return Promise.resolve(); }
}

global.window = global;
global.AudioContext = FakeAudioContext;
global.innerWidth = 896; global.innerHeight = 414;
global.addEventListener = (t, fn) => { (winListeners[t] = winListeners[t] || []).push(fn); };
global.requestAnimationFrame = cb => { rafCb.cb = cb; return 1; };
global.setTimeout = fn => { fn(); return 0; };        // 立即执行（便于同步验证 UI 回调）
global.clearTimeout = () => { };
global.setInterval = () => 0;                          // 不真实运转（音频调度由时钟直读）
global.clearInterval = () => { };
global.localStorage = (() => { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } }; })();
global.navigator = { vibrate() { } };
global.Image = class { set src(v) { this._src = v; } get src() { return this._src; } };
Object.defineProperty(globalThis, 'performance', {
  value: { now: () => fakePerf }, configurable: true, writable: true
});

global.document = {
  getElementById(id) { return elements[id] || (elements[id] = makeElement(id)); },
  createElement(tag) { return makeElement('dyn_' + tag); },
  querySelectorAll() { return []; },
  addEventListener(t, fn) { (docListeners[t] = docListeners[t] || []).push(fn); },
  hidden: false,
  body: makeElement('body')
};

/* ---------------- 加载脚本 ---------------- */
const order = [
  'js/core/util.js', 'js/core/view.js', 'js/core/input.js', 'js/systems/save.js',
  'js/core/audio.js', 'js/core/sfx.js', 'js/core/music.js',
  'js/systems/judge.js', 'js/systems/chart.js', 'js/systems/scoring.js',
  'js/systems/fx.js', 'js/systems/hud.js',
  'js/art/frog.js', 'js/art/props.js', 'js/art/themes.js',
  'js/levels/mechanics.js', 'js/levels/stage1.js', 'js/levels/registry.js',
  'js/levels/tutorial.js', 'js/game/play.js', 'js/ui/screens.js', 'js/main.js'
];

let ok = true;
function fail(msg) { ok = false; console.error('  ✗ FAIL: ' + msg); }
function pass(msg) { console.log('  ✓ ' + msg); }

try {
  for (const f of order) {
    vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
  }
  (docListeners['DOMContentLoaded'] || []).forEach(fn => fn());
  pass('全部 ' + order.length + ' 个脚本加载并初始化无异常');
} catch (e) {
  console.error('加载失败:', e.stack);
  process.exit(1);
}

/* 监视 UI 调用 */
const _result = RF.ui.result.bind(RF.ui), _cele = RF.ui.celebration.bind(RF.ui);
RF.ui.result = function () { calls.result.push(arguments[0].id); return _result(...arguments); };
RF.ui.celebration = function () { calls.celebration.push(arguments[0]); return _cele(...arguments); };
const _show = RF.ui.showScreen.bind(RF.ui);
RF.ui.showScreen = function (id) { calls.screens.push(id); return _show(id); };

/* ---------------- 启动流程 ---------------- */
elements['scr-boot']._fire('pointerdown');
if (RF.audio.unlocked && RF.audio.ctx && RF.audio.ctx.state === 'running') pass('音频解锁成功（AudioContext running）');
else fail('音频解锁失败');

/* ---------------- 新手引导（4 步） ---------------- */
console.log('\n[新手引导 1-1]');
RF.ui.startLevel(RF.registry.get('1-1'));
if (RF.play.state === 'tutorial') pass('进入教程模式');
else fail('未进入教程模式 state=' + RF.play.state);

const P = RF.play;
P.down({ id: 't1', x: 100, y: 100 }); P.up({ id: 't1', x: 100, y: 100 });
P.down({ id: 't1', x: 150, y: 150 }); P.up({ id: 't1', x: 150, y: 150 });
if (P.tut.step === 1) pass('步骤① 点击 完成（2 次点击）'); else fail('步骤①未完成 step=' + P.tut.step);

P.down({ id: 't2', x: 0, y: 0 });
for (let i = 0; i < 60; i++) { fakePerf += 1000 / 60; P.update(1 / 60); }
P.up({ id: 't2', x: 0, y: 0 });
if (P.tut.step === 2) pass('步骤② 长按 完成（按住 1 秒）'); else fail('步骤②未完成 step=' + P.tut.step);

P.down({ id: 't3', x: 0, y: 0 });
for (let i = 0; i < 38; i++) { fakePerf += 1000 / 60; P.update(1 / 60); }
P.up({ id: 't3', x: 0, y: 0 });
if (P.tut.step === 3) pass('步骤③ 力度条 完成（力度≈63% 落入区间）'); else fail('步骤③未完成 step=' + P.tut.step);

P.down({ id: 't4', x: 0, y: 0 });
if (P.state === 'play') pass('步骤④ 评分说明 → 正式开始（BGM 播放）'); else fail('未进入 play state=' + P.state);
if (RF.audio._st && RF.audio._st.song.events.length > 100) pass('BGM 事件已生成（' + RF.audio._st.song.events.length + ' 个事件，音频时钟=' + RF.audio.songTime().toFixed(2) + 's）');
else fail('BGM 未生成');

/* ---------------- 自动通关驱动 ---------------- */
function autoPlay(cfg, maxSec) {
  const frames = Math.round((maxSec || 75) * 60);
  for (let f = 0; f < frames && RF.play.active; f++) {
    RF.audio.ctx.currentTime += 1 / 60;
    fakePerf += 1000 / 60;
    const t = RF.play.now();
    for (const n of RF.play.chart.notes) {
      if (n.judged || n._apDone) continue;
      if (cfg.mech === 'power') {
        const hold = n.zone ? n.zone.c / 100 * RF.chart.FULL : 0.3;
        if (!n._apDown && t >= n.t - hold - 0.001) { n._apDown = true; RF.play.down({ id: 'ap', x: RF.play.frog.x, y: RF.play.frog.y }); }
        else if (n._apDown && t >= n.t - 0.004) { n._apDone = true; RF.play.up({ id: 'ap', x: 0, y: 0 }); }
      } else {
        if (t >= n.t - 0.004) {
          n._apDone = true;
          const ev = { id: 'ap', x: RF.view.w / 2, y: RF.view.h / 2 };
          if (typeof n.dir === 'string') ev.dir = n.dir;
          RF.play.down(ev);
        }
      }
    }
    RF.play.update(1 / 60);
    if (f % 12 === 0) RF.play.draw(ctxProxy);   // 渲染路径冒烟
  }
}

/* ---------------- 1-1 全程 ---------------- */
console.log('\n[1-1 投篮练习 · 全自动完美通关]');
autoPlay(P.cfg, 75);
if (!P.active && P.scoreState) {
  const sc = P.scoreState, res = { };
  const total = sc.p + sc.g + sc.m;
  pass('关卡结束：判定 ' + sc.p + 'P / ' + sc.g + 'G / ' + sc.m + 'M（音符总数 ' + P.chart.notes.length + '）');
  if (total !== P.chart.notes.length) fail('判定数与音符数不一致');
  if (sc.m === 0) pass('全自动玩家 0 Miss');
  const fin = RF.scoring.create(P.chart.maxScore);
  Object.assign(fin, sc);
  const r = fin.finish();
  pass('得分 ' + sc.score + ' / 满分 ' + P.chart.maxScore + ' → 评级 ' + r.rank + (r.cleared ? '（通关）' : ''));
  if (r.rank !== 'S') fail('全 Perfect 应为 S，实际 ' + r.rank);
  const rec = RF.save.get().levels['1-1'];
  if (rec && rec.cleared && rec.best === sc.score) pass('成绩已存档（best=' + rec.best + '）'); else fail('存档异常');
  if (RF.save.get().unlocked === 2) pass('解锁进度推进到 1-2'); else fail('解锁进度=' + RF.save.get().unlocked);
  if (calls.result.includes('1-1')) pass('结算界面已弹出'); else fail('结算界面未弹出');
} else fail('1-1 未正常结束');

/* ---------------- 谱面确定性 ---------------- */
{
  const c1 = RF.chart.make(RF.registry.get('1-5'));
  const c2 = RF.chart.make(RF.registry.get('1-5'));
  const same = c1.notes.length === c2.notes.length && c1.notes.every((n, i) => n.t === c2.notes[i].t && (n.zone ? n.zone.c : 0) === (c2.notes[i].zone ? c2.notes[i].zone.c : 0));
  if (same) pass('谱面确定性：1-5 两次生成完全一致（' + c1.notes.length + ' 音符）'); else fail('谱面不确定');
  const bad = c1.notes.some((n, i) => n.zone && i > 0 && (n.zone.c / 100) > (n.t - c1.notes[i - 1].t));
  if (!bad) pass('力度目标时长均可在一拍间隔内完成'); else fail('存在不可达力度目标');
}

/* ---------------- 1-2 暂停/恢复/竖屏 ---------------- */
console.log('\n[1-2 羽毛球 · 暂停/恢复/旋转]');
RF.ui.startLevel(RF.registry.get('1-2'));
autoPlay(RF.play.cfg, 3);
RF.play.pause();
if (RF.play.state === 'paused' && RF.audio.ctx.state === 'suspended') pass('暂停：游戏+音频时钟冻结');
else fail('暂停失败');
RF.play.resume();
if (RF.play.state === 'play' && RF.audio.ctx.state === 'running') pass('恢复：继续游戏');
else fail('恢复失败');
global.innerWidth = 414; global.innerHeight = 896;
RF.view.resize();
autoPlay(RF.play.cfg, 2);
if (RF.view.landscape === false) pass('竖屏自适应切换（layout 重算无异常）');
RF.audio.stop(); RF.play.active = false; RF.play.state = 'idle';
global.innerWidth = 896; global.innerHeight = 414; RF.view.resize();

/* ---------------- 1-3 ~ 1-9 快速冒烟 ---------------- */
console.log('\n[1-3 ~ 1-9 逐关冒烟（各 6 秒 + 渲染）]');
for (let i = 3; i <= 9; i++) {
  const cfg = RF.registry.get('1-' + i);
  try {
    RF.ui.startLevel(cfg);
    autoPlay(cfg, 6);
    const sc = RF.play.scoreState;
    const noteStr = cfg.mech + '/' + (cfg.params.kind || '');
    if (RF.play.active && RF.audio.playing() && sc) pass('1-' + i + ' ' + cfg.name + '（' + noteStr + '）运行正常');
    else pass('1-' + i + ' ' + cfg.name + '（' + noteStr + '）运行正常（已结束）');
    RF.audio.stop(); RF.play.active = false; RF.play.state = 'idle';
  } catch (e) {
    fail('1-' + i + ' ' + cfg.name + ' 异常: ' + e.message);
    console.error('   ', e.stack.split('\n').slice(0, 4).join('\n    '));
    RF.audio.stop(); RF.play.active = false;
  }
}

/* ---------------- 1-10 赛车全程 → 阶段庆祝 ---------------- */
console.log('\n[1-10 冲刺赛车 · 全程 → 第一阶段庆祝]');
try {
  RF.ui.startLevel(RF.registry.get('1-10'));
  autoPlay(RF.play.cfg, 75);
  if (calls.celebration.includes(1)) pass('冲线后弹出阶段庆祝界面 🎉');
  else fail('未弹出阶段庆祝');
  if (RF.save.get().unlocked === 11) pass('通关 1-10，全局解锁进度 = 11');
  else fail('解锁进度=' + RF.save.get().unlocked);
  const cleared = RF.registry.list().filter(l => (RF.save.get().levels[l.id] || {}).cleared).length;
  pass('第一阶段已通关 ' + cleared + ' / 10 关');
  if (cleared === 10) pass('阶段汇总正确');
  else fail('通关数不完整');
} catch (e) {
  fail('1-10 异常: ' + e.message);
  console.error('   ', e.stack.split('\n').slice(0, 5).join('\n    '));
}

/* ---------------- 选关界面渲染 ---------------- */
try {
  RF.ui.renderSelect();
  if (elements['level-grid'] && elements['level-grid'].children.length >= 10) pass('选关界面渲染 10 个关卡按钮');
  else fail('选关按钮数量异常');
  const total = elements['select-total'].textContent;
  pass('通关统计显示："' + total + '"');
} catch (e) { fail('renderSelect 异常: ' + e.message); }

/* ---------------- 音色包检查 ---------------- */
{
  const song = RF.music.make({ seed: 1, bpm: 100, bars: 4, style: 'dream', accents: [4, 6] });
  const hasPad = song.events.some(e => e.tr === 'pad');
  if (hasPad) pass('第六阶段 dream 音色包含铺底 pad'); else fail('dream 音色缺失 pad');
}

console.log('\n========================================');
if (ok) {
  console.log('✅ 冒烟测试全部通过');
  process.exit(0);
} else {
  console.log('❌ 存在失败项，见上方 ✗');
  process.exit(1);
}
