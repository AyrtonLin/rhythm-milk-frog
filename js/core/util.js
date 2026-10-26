/* 节奏小奶蛙 - 通用工具 */
window.RF = window.RF || {};
(function () {
  const U = RF.util = {};
  U.TAU = Math.PI * 2;
  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.easeOut = t => 1 - (1 - t) * (1 - t);
  U.easeIn = t => t * t;
  U.easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  U.easeOutBack = t => { const c = 1.70158; const p = t - 1; return 1 + (c + 1) * p * p * p + c * p * p; };
  U.easeOutElastic = t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (U.TAU / 3)) + 1;

  /* 确定性随机（种子 = 关卡ID）→ 每次重玩谱面一致 */
  U.mulberry32 = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  U.hashStr = function (s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  U.pick = (r, arr) => arr[Math.floor(r() * arr.length) % arr.length];
  U.rr = (r, a, b) => a + r() * (b - a);
  U.ri = (r, a, b) => Math.floor(U.rr(r, a, b + 1));

  U.roundRect = function (ctx, x, y, w, h, rad) {
    const r2 = Math.min(rad, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r2, y);
    ctx.arcTo(x + w, y, x + w, y + h, r2);
    ctx.arcTo(x + w, y + h, x, y + h, r2);
    ctx.arcTo(x, y + h, x, y, r2);
    ctx.arcTo(x, y, x + w, y, r2);
    ctx.closePath();
  };
  U.circle = (ctx, x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, U.TAU); };
  U.ell = (ctx, x, y, rx, ry, rot) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, U.TAU); };
})();
