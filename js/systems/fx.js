/* 节奏小奶蛙 - 特效：粒子 / 飘字 / 震屏 / 闪光（对象池，移动端友好） */
(function () {
  const F = RF.fx = { parts: [], floats: [], shake: 0, flash: 0, flashColor: '#fff' };
  const MAXP = 140;
  F.reset = () => { F.parts.length = 0; F.floats.length = 0; F.shake = 0; F.flash = 0; };
  F.burst = function (x, y, color, n, opt) {
    opt = opt || {};
    for (let i = 0; i < (n || 10); i++) {
      if (F.parts.length >= MAXP) F.parts.shift();
      const a = RF.util.rr(Math.random, 0, RF.util.TAU);
      const sp = RF.util.rr(Math.random, 60, opt.speed || 260);
      F.parts.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (opt.up || 60),
        life: 0, max: RF.util.rr(Math.random, 0.4, opt.life || 0.8),
        size: RF.util.rr(Math.random, 3, opt.size || 7), color, grav: opt.grav == null ? 500 : opt.grav,
        shape: opt.shape || (Math.random() < 0.5 ? 'c' : 'r'), rot: Math.random() * 6
      });
    }
  };
  F.confetti = function (x, y, n) {
    const cols = ['#FFD34D', '#FF8A65', '#5AC8FA', '#81C784', '#F48FB1', '#BA68C8'];
    F.burst(x, y, cols, n || 16, { speed: 320, life: 1.1, size: 8, grav: 420, up: 160 });
  };
  F.float = function (text, x, y, color, size) {
    if (F.floats.length > 12) F.floats.shift();
    F.floats.push({ text, x, y, color: color || '#fff', size: size || 30, life: 0, max: 0.8 });
  };
  F.shakeIt = m => { F.shake = Math.max(F.shake, m); };
  F.flashIt = (c, v) => { F.flashColor = c || '#fff'; F.flash = Math.max(F.flash, v || 0.5); };
  F.update = function (dt) {
    for (let i = F.parts.length - 1; i >= 0; i--) {
      const p = F.parts[i];
      p.life += dt;
      if (p.life >= p.max) { F.parts.splice(i, 1); continue; }
      p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 6;
    }
    for (let i = F.floats.length - 1; i >= 0; i--) {
      const f = F.floats[i];
      f.life += dt;
      if (f.life >= f.max) F.floats.splice(i, 1);
    }
    F.shake = Math.max(0, F.shake - dt * 22);
    F.flash = Math.max(0, F.flash - dt * 2.2);
  };
  F.draw = function (ctx) {
    for (const p of F.parts) {
      const a = 1 - p.life / p.max;
      ctx.globalAlpha = a;
      ctx.fillStyle = Array.isArray(p.color) ? p.color[(p.rot | 0) % p.color.length] : p.color;
      if (p.shape === 'c') { RF.util.circle(ctx, p.x, p.y, p.size * a); ctx.fill(); }
      else { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6); ctx.restore(); }
    }
    ctx.globalAlpha = 1;
    for (const f of F.floats) {
      const k = f.life / f.max;
      const sc = k < 0.2 ? RF.util.easeOutBack(k / 0.2) : 1;
      ctx.save();
      ctx.translate(f.x, f.y - k * 46);
      ctx.scale(sc, sc);
      ctx.globalAlpha = 1 - k * k;
      ctx.font = '900 ' + f.size + 'px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.strokeText(f.text, 0, 0);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  };
})();
