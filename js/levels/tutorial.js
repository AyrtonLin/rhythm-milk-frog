/* 节奏小奶蛙 - 1-1 分步新手引导（4 步：点击 → 长按 → 力度条 → 评分规则） */
(function () {
  const T = RF.tutorial = {};
  const U = RF.util;

  T.start = function (r) {
    r.tut = { step: 0, taps: 0, charging: null, power: 0, pulse: 0, done: false, zone: { c: 60, p: 14, g: 26 }, flash: 0 };
  };
  T.update = function (r, dt) {
    const t = r.tut;
    t.pulse += dt;
    t.flash = Math.max(0, t.flash - dt * 3);
    if (t.pulse > 0.8) { t.pulse = 0; if (t.step === 0) RF.sfx.charge(0.3); }
    if (t.charging) {
      t.power = Math.min(100, (performance.now() - t.charging) / (RF.chart.FULL * 1000) * 100);
      r.frog.charge = t.power / 100;
      r.setPose('charge', 0.1);
      r.powerBar.show = 1; r.powerBar.power = t.power;
      r.powerBar.zone = t.step >= 2 ? t.zone : null;
    } else {
      r.powerBar.show = Math.max(0, r.powerBar.show - dt * 1.6);
      r.frog.charge = Math.max(0, r.frog.charge - dt * 3);
    }
  };
  T.down = function (r, e) {
    const t = r.tut;
    if (t.step === 3) { T.finish(r); return; }
    if (!t.charging) t.charging = performance.now();
    if (t.step === 0) {
      t.taps++;
      RF.sfx.pop();
      RF.fx.burst(e.x, e.y, '#FFD34D', 8, { speed: 160 });
      r.setExpr('happy', 0.4);
      if (t.taps >= 2) { t.step = 1; RF.sfx.ui(); }
    }
  };
  T.up = function (r, e) {
    const t = r.tut;
    if (!t.charging) return;
    const hold = (performance.now() - t.charging) / 1000;
    const power = t.power;
    t.charging = null;
    if (t.step === 1) {
      if (hold >= 0.7) { t.step = 2; RF.sfx.good(); RF.fx.confetti(r.frog.x, r.frog.y - 60, 10); }
      else RF.sfx.miss();
    } else if (t.step === 2) {
      const tier = RF.judge.powerTier(power, t.zone);
      if (tier) {
        t.step = 3; t.flash = 1; RF.sfx.perfect();
        RF.fx.confetti(RF.view.w / 2, RF.view.h * 0.4, 16);
      } else RF.sfx.miss();
    }
  };
  T.finish = function (r) {
    RF.save.get().flags.tutorialDone = true;
    RF.save.flush();
    RF.sfx.whistle();
    r.beginPlay();
  };

  const CARD = [
    ['第 1 步 · 点击', '跟着节拍圈，轻点屏幕任意位置 2 次'],
    ['第 2 步 · 长按', '按住屏幕蓄力：力度条 1 秒充满，先按住 1 秒再松开'],
    ['第 3 步 · 力度条', '蓄力让指针停在绿色区间内再松手（看提示的目标秒数按）'],
    ['第 4 步 · 评分', 'PERFECT ±80ms 得 300 分 / GOOD ±160ms 得 150 分 / MISS 断连\n连击每 +10 加成 +5%（上限 50%）· 得分率 S≥90% A≥80% B≥65% C≥50% 通关']
  ];

  T.draw = function (r, ctx) {
    const w = RF.view.w, h = RF.view.h, u = RF.view.u, t = r.tut;
    ctx.save();
    ctx.fillStyle = 'rgba(40,30,10,0.25)';
    ctx.fillRect(0, 0, w, h);
    /* 卡片 */
    const cw = Math.min(w * 0.86, 560 * u), ch = (t.step === 3 ? 210 : 130) * u;
    const cx = w / 2 - cw / 2, cy = h * 0.16;
    ctx.fillStyle = 'rgba(255,252,240,0.97)';
    U.roundRect(ctx, cx, cy, cw, ch, 18 * u); ctx.fill();
    ctx.strokeStyle = '#FFD34D'; ctx.lineWidth = 3 * u;
    U.roundRect(ctx, cx, cy, cw, ch, 18 * u); ctx.stroke();
    ctx.fillStyle = '#6b4a12';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.font = '900 ' + 22 * u + 'px system-ui,sans-serif';
    ctx.fillText(CARD[t.step][0], w / 2, cy + 16 * u);
    ctx.font = '600 ' + 15 * u + 'px system-ui,sans-serif';
    ctx.fillStyle = '#8a6a30';
    const lines = CARD[t.step][1].split('\n');
    lines.forEach((ln, i) => ctx.fillText(ln, w / 2, cy + 50 * u + i * 22 * u));
    if (t.step === 0) ctx.fillText('已点击 ' + t.taps + ' / 2', w / 2, cy + ch - 26 * u);
    if (t.step === 3) {
      ctx.font = '900 ' + 18 * u + 'px system-ui,sans-serif';
      ctx.fillStyle = '#EF5350';
      ctx.fillText('♪ 点击屏幕开始挑战 ♪', w / 2, cy + ch - 34 * u);
    }
    /* 步骤 0：节拍圈演示 */
    if (t.step === 0) {
      const px = w / 2, py = h * 0.55;
      const k = t.pulse / 0.8;
      ctx.strokeStyle = 'rgba(255,211,77,0.9)'; ctx.lineWidth = 5 * u;
      U.circle(ctx, px, py, 34 * u); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3 * u;
      U.circle(ctx, px, py, 34 * u + (1 - k) * 90 * u); ctx.stroke();
    }
    ctx.restore();
  };
})();
