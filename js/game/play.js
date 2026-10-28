/* 节奏小奶蛙 - 关卡运行器：音乐时钟驱动 → 机制 + 判定 + HUD + 结算 */
(function () {
  const U = RF.util, J = RF.judge;
  const P = RF.play = {
    active: false, state: 'idle', cfg: null, chart: null, song: null,
    scoreState: null, mech: null, m: null, tut: null,
    frog: null, powerBar: { show: 0, power: 0, zone: null },
    _comboAt: -9, _cardT: 0, _blinkT: 2, groundY: 0
  };

  P.now = () => RF.audio.songTime();
  P.beatPhase = function () {
    const b = this.chart ? this.chart.beatSec : 0.6;
    const p = (this.now() / b) % 1;
    return p < 0 ? p + 1 : p;
  };
  P.pending = function (win) {
    const now = this.now();
    let best = null, bd = 1e9;
    for (const n of this.chart.notes) {
      if (n.judged) continue;
      const d = now - n.t;
      if (Math.abs(d) <= win && Math.abs(d) < Math.abs(bd)) { bd = d; best = n; }
    }
    return best;
  };
  P.nextNote = function () {
    for (const n of this.chart.notes) if (!n.judged) return n;
    return null;
  };
  P.setPose = function (p, d) { const f = this.frog; f.pose = p; f.poseT = 0; f.poseDur = d || 0.4; };
  P.setExpr = function (e, d) { const f = this.frog; f.expr = e; f.exprT = d || 0.5; };
  P.cdSegAt = function (now) { return (this._cdSegs || []).find(s => now >= s.a && now < s.b) || null; };

  P.submit = function (note, tier, opt) {
    opt = opt || {};
    note.judged = true; note.tier = tier;
    this.scoreState.add(tier);
    this._comboAt = this.now();
    const x = opt.x != null ? opt.x : this.frog.x;
    const y = opt.y != null ? opt.y : this.frog.y - 90 * this.frog.s;
    RF.fx.float(J.label[tier], x, y, J.color[tier], tier === 'P' ? 34 * RF.view.u : 28 * RF.view.u);
    if (tier === 'P') { RF.sfx.perfect(); RF.fx.burst(x, y + 20, '#FFD34D', 10, { speed: 200 }); RF.save.vibrate(28); }
    else if (tier === 'G') { RF.sfx.good(); RF.save.vibrate(15); }
    else { RF.sfx.miss(); RF.fx.shakeIt(6); RF.save.vibrate(60); }
    return tier;
  };

  P.start = function (cfg) {
    this.cfg = cfg;
    this.chart = RF.chart.make(cfg);
    /* 蓄力关：倒计时段（每个“按住!”提示前 3 秒） */
    this._cdLast = 0;
    this._cdSegs = this.chart.cdSegs || [];
    this.song = RF.music.make({
      seed: U.hashStr(cfg.id + 'music'), bpm: cfg.bpm,
      bars: Math.max(1, Math.ceil(this.chart.duration / (4 * this.chart.beatSec))),
      style: cfg.style, voice: cfg.params.voice, accents: this.chart.notes.map(n => n.beat)
    });
    this.scoreState = RF.scoring.create(this.chart.maxScore);
    /* 难度曲线：阶段系数（1→6 递减 1.3→0.9） × 关内微收（每关 -1.5%） × 机制无障碍倍率（race 键盘关等）
       音符密度 COUNTS 本就随关递增；判定窗随之从宽到严，确保由易到难 */
    const SDF = { 1: 1.3, 2: 1.2, 3: 1.1, 4: 0.94, 5: 0.74, 6: 0.62 };
    const fIdx = 1 - (cfg.idx - 1) * 0.015;
    this.winS = U.clamp((cfg.params.judgeScale || 1) * (SDF[cfg.stage] || 1) * fIdx, 0.6, 2.0);
    this.winG = J.G * this.winS;
    this.mech = RF.mech[cfg.mech];
    this.m = null; this.tut = null;
    this.powerBar = { show: 0, power: 0, zone: null };
    this._comboAt = -9; this._cardT = 2.2;
    RF.fx.reset();
    const w = RF.view.w, h = RF.view.h, u = RF.view.u;
    this.groundY = h * 0.8;
    const s = u * 1.05;
    let fx = w * 0.5, face = 1;
    if (cfg.mech === 'power' && cfg.params.kind !== 'jianzi') fx = w * 0.24;
    else if (cfg.mech === 'swing') {
      if (cfg.params.kind === 'vb' || cfg.params.kind === 'frisbee') { fx = w * 0.5; face = 1; }
      else { fx = w * 0.7; face = -1; }
    } else if (cfg.mech === 'race') { fx = w / 2; }
    this.frog = {
      x: fx, y: this.groundY - 52 * s, s, face, pose: 'idle', poseT: 0, poseDur: 0,
      expr: 'normal', exprT: 0, charge: 0, blink: 1,
      prop: cfg.params.prop || null, propHand: 'R', propAngle: 0
    };
    this.mech.init(this);
    this._cin = null;
    this.active = true;
    /* 新机制轻量提示（首次出现一次） */
    const flags = RF.save.get().flags;
    if (cfg.tip && !flags.hints[cfg.id] && !cfg.tutorial) {
      flags.hints[cfg.id] = true; RF.save.flush();
      RF.ui.toast('💡 ' + cfg.tip, 2600);
    }
    if (cfg.tutorial && !RF.save.get().flags.tutorialDone) {
      this.state = 'tutorial';
      RF.tutorial.start(this);
    } else {
      this.beginPlay();
    }
    RF.ui.showPauseBtn(this.state === 'play');
  };

  P.beginPlay = function () {
    this.state = 'play';
    RF.audio.play(this.song);
    this._cardT = 2.0;
    RF.ui.showPauseBtn(true);
  };

  P.update = function (dt) {
    const f = this.frog;
    f.poseT += dt; f.exprT -= dt;
    if (f.poseDur && f.poseT > f.poseDur && f.pose !== 'charge') { f.pose = 'idle'; f.poseT = 0; f.poseDur = 0; }
    if (f.exprT <= 0 && f.expr !== 'normal') f.expr = 'normal';
    this._blinkT -= dt;
    if (f.blink === 0) {
      f.blinkT2 = (f.blinkT2 || 0) + dt;
      if (f.blinkT2 > 0.12) { f.blink = 1; f.blinkT2 = 0; this._blinkT = U.rr(Math.random, 1.6, 3.6); }
    } else if (this._blinkT <= 0) {
      f.blink = 0;
    }

    if (this.state === 'tutorial') { RF.tutorial.update(this, dt); RF.fx.update(dt); return; }
    if (this.state !== 'play') return;

    const now = this.now();
    this._cardT = Math.max(0, this._cardT - dt);
    /* 剧情片尾（6-3 推门 / 6-10 归家） */
    if (this.cfg.params.ending && !this._cin && now > this.chart.duration - 0.15) {
      this._cin = { t: 0 };
      RF.audio.stop();
      RF.ui.showPauseBtn(false);
    }
    if (this._cin) {
      this._cin.t += dt;
      RF.fx.update(dt);
      if (this._cin.t > 11) this.finish();
      return;
    }
    /* 倒计时滴声（每音符前 1 秒快闪 3-2-1） */
    const seg = this.cdSegAt(now);
    if (seg) {
      const c = Math.min(3, Math.ceil((seg.b - now) * 3));
      if (c !== this._cdLast) { this._cdLast = c; RF.sfx.count(false); }
    } else if (this._cdLast > 0) {
      this._cdLast = 0; RF.sfx.count(true);
    }
    /* 漏拍自动 Miss */
    for (const n of this.chart.notes) {
      if (!n.judged && now > n.t + J.G * this.winS + 0.02) {
        n.judged = true; n.tier = 'M';
        this.scoreState.add('M');
        RF.fx.float('MISS', this.frog.x, this.frog.y - 90 * this.frog.s, J.color.M, 26 * RF.view.u);
        RF.sfx.miss(); RF.fx.shakeIt(5);
        this.mech.miss && this.mech.miss(this, n);
      }
    }
    this.mech.update(this, dt);
    RF.fx.update(dt);
    if (now > this.chart.duration + 0.9) this.finish();
  };

  P.draw = function (ctx) {
    const w = RF.view.w, h = RF.view.h, u = RF.view.u;
    ctx.save();
    if (RF.fx.shake > 0) ctx.translate(U.rr(Math.random, -1, 1) * RF.fx.shake, U.rr(Math.random, -1, 1) * RF.fx.shake);
    RF.themes.draw(this.cfg.stage, ctx, Math.max(0, this.now()), w, h);
    if (this._cin) {
      this.drawCinema(ctx);
      ctx.restore();
      return;
    }
    if (this.state === 'tutorial') {
      RF.mech.drawFrog(this, ctx);
      RF.fx.draw(ctx);
      RF.tutorial.draw(this, ctx);
      RF.hud.draw(this, ctx);
    } else {
      this.mech.draw(this, ctx);
      RF.fx.draw(ctx);
      if (this.state === 'play') {
        RF.hud.drawCue(this, ctx,
          this.cueX != null ? this.cueX : this.frog.x,
          this.cueY != null ? this.cueY : this.frog.y - 46 * this.frog.s);
      }
      RF.hud.draw(this, ctx);
      if (this.cfg.params.dpad) RF.hud.drawDpad(ctx);
      /* 蓄力关：每波前 3 秒倒计时 */
      const seg = this.state === 'play' ? this.cdSegAt(this.now()) : null;
      if (this.cfg.mech === 'power' && seg) {
        const tn = this.now();
        const rem = seg.b - tn;
        const num = Math.min(3, Math.ceil(rem * 3));
        const phase = 1 - (rem * 3 - (num - 1));
        const sc = 1 + 0.6 * (1 - Math.min(1, phase * 2.5));
        ctx.save();
        ctx.translate(w / 2, h * 0.42);
        ctx.scale(sc, sc);
        ctx.globalAlpha = phase < 0.8 ? 1 : (1 - phase) / 0.2;
        ctx.font = '900 ' + 92 * u + 'px system-ui,sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(255,255,255,0.95)';
        ctx.strokeText(num, 0, 0);
        ctx.fillStyle = '#FFB300';
        ctx.fillText(num, 0, 0);
        ctx.restore();
        ctx.globalAlpha = 1;
        ctx.font = '700 ' + 16 * u + 'px system-ui,sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillStyle = 'rgba(90,60,20,0.85)';
        ctx.fillText(seg.i === 0 ? '准备… 黄圈出现时按住' : '第 ' + (seg.i + 1) + ' 次蓄力…', w / 2, h * 0.42 + 62 * u);
      }
      if (this._cardT > 0) {
        const a = Math.min(1, this._cardT / 0.4);
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(255,252,240,0.92)';
        const cw = Math.min(w * 0.8, 420 * u), chh = 74 * u;
        U.roundRect(ctx, w / 2 - cw / 2, h * 0.3, cw, chh, 14 * u); ctx.fill();
        ctx.fillStyle = '#6b4a12'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '900 ' + 24 * u + 'px system-ui,sans-serif';
        ctx.fillText(this.cfg.name, w / 2, h * 0.3 + 28 * u);
        ctx.font = '600 ' + 13 * u + 'px system-ui,sans-serif';
        ctx.fillStyle = '#8a6a30';
        ctx.fillText('第' + this.cfg.stage + '阶段 · 第 ' + this.cfg.idx + ' 关 · BPM ' + this.cfg.bpm, w / 2, h * 0.3 + 52 * u);
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
    if (RF.fx.flash > 0) {
      ctx.fillStyle = RF.fx.flashColor;
      ctx.globalAlpha = RF.fx.flash * 0.5;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
  };

  P.down = e => {
    if (P.state === 'tutorial') { RF.tutorial.down(P, e); return; }
    if (P.state !== 'play' || P._cin) return;
    if (e.lane != null && P.cfg.mech !== 'keys') return;      // 轨道事件只给音游关
    if (e.dir != null && P.cfg.mech === 'keys') return;       // 方向事件不给音游关
    let ev = e;
    const d = e.dir || (P.cfg.params.dpad ? RF.hud.dpadDir(e.x, e.y) : null);
    if (d) { ev = Object.assign({}, e, { dir: d }); RF.hud._dpadActive = d; }
    P.mech.down(P, ev);
  };
  P.up = e => {
    if (e.lane != null && P.cfg.mech !== 'keys') return;
    if (e.dir || RF.hud._dpadActive) RF.hud._dpadActive = null;
    if (P.state === 'tutorial') RF.tutorial.up(P, e);
    else if (P.state === 'play') P.mech.up(P, e);
  };

  /* ---------- 剧情片尾演出 ---------- */
  P.drawCinema = function (ctx) {
    const U = RF.util;
    const w = RF.view.w, h = RF.view.h, u = RF.view.u, t = this._cin.t;
    const kind = this.cfg.params.ending;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    if (kind === 'door') {
      const open = U.clamp(t / 2.5, 0, 1);
      const dw = w * 0.34, dh = h * 0.5, dx = w / 2 - dw / 2, dy = h * 0.22;
      const lg = ctx.createLinearGradient(0, dy, 0, dy + dh);
      lg.addColorStop(0, 'rgba(255,236,150,' + (0.25 + open * 0.7).toFixed(2) + ')');
      lg.addColorStop(1, 'rgba(255,183,77,' + (0.15 + open * 0.5).toFixed(2) + ')');
      ctx.fillStyle = lg;
      ctx.fillRect(dx, dy, dw, dh);
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(dx - open * dw / 2, dy, dw / 2, dh);
      ctx.fillRect(dx + dw / 2 + open * dw / 2, dy, dw / 2, dh);
      if (t > 2.5) {
        const labels = ['出生照', '家人合照', '同学合照', '同事合照'];
        const idx = Math.min(3, Math.floor((t - 2.5) / 1.8));
        const k = ((t - 2.5) % 1.8) / 1.8;
        const cw = w * 0.42, chh = h * 0.3;
        const cx = w * 0.5 + (0.5 - k) * w * 0.1;
        ctx.save();
        ctx.globalAlpha = U.clamp(Math.sin(Math.min(1, k) * Math.PI) * 1.4, 0.05, 1);
        ctx.fillStyle = '#FFFDF4';
        U.roundRect(ctx, cx - cw / 2, h * 0.3, cw, chh, 8 * u); ctx.fill();
        ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 4 * u;
        U.roundRect(ctx, cx - cw / 2, h * 0.3, cw, chh, 8 * u); ctx.stroke();
        ctx.fillStyle = '#5D4037';
        const cnt = idx + 1;
        for (let i = 0; i < cnt; i++) {
          const px = cx - (cnt - 1) * 14 * u + i * 28 * u;
          const hh = idx === 0 && i === 0 ? 16 * u : 28 * u;
          U.ell(ctx, px, h * 0.3 + chh * 0.66, 10 * u, hh * 0.6); ctx.fill();
          U.circle(ctx, px, h * 0.3 + chh * 0.66 - hh, 8 * u); ctx.fill();
        }
        ctx.fillStyle = '#6b4a12'; ctx.font = '800 ' + 16 * u + 'px system-ui,sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(labels[idx], cx, h * 0.3 + chh - 16 * u);
        ctx.restore();
      }
      if (t > 9.4) {
        ctx.fillStyle = 'rgba(0,0,0,' + U.clamp((t - 9.4) / 1.2, 0, 1).toFixed(2) + ')';
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = U.clamp((t - 9.8) / 0.8, 0, 1);
        ctx.fillStyle = '#FFF6D8'; ctx.font = '900 ' + 30 * u + 'px system-ui,sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('感谢游玩', w / 2, h * 0.46);
        ctx.font = '600 ' + 14 * u + 'px system-ui,sans-serif';
        ctx.fillText('节奏小奶蛙 · 人生的每一拍都值得铭记', w / 2, h * 0.53);
        ctx.globalAlpha = 1;
      }
    } else {
      const cols = [['#C8E6C9', '#66BB6A'], ['#B3E5FC', '#4FC3F7'], ['#FFE0B2', '#FB8C00'], ['#ECEFF1', '#90A4AE']];
      const si = Math.min(3, Math.floor(t / 1.6));
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, cols[si][0]); g.addColorStop(1, cols[si][1]);
      ctx.globalAlpha = 0.92; ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(62,39,35,0.85)';
      ctx.fillRect(0, h * 0.72, w, h * 0.28);
      ctx.strokeStyle = 'rgba(62,39,35,0.9)'; ctx.lineWidth = 6 * u;
      ctx.beginPath(); ctx.moveTo(w * 0.78, h * 0.72); ctx.lineTo(w * 0.78, h * 0.4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.78, h * 0.44); ctx.lineTo(w * 0.66, h * 0.44); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.66, h * 0.44, 14 * u, 5 * u, 0, 0, U.TAU); ctx.stroke();
      if (t > 6.4) {
        ctx.fillStyle = 'rgba(62,39,35,0.95)';
        U.ell(ctx, w * 0.4, h * 0.66, 16 * u, 22 * u); ctx.fill();
        U.circle(ctx, w * 0.4, h * 0.66 - 26 * u, 12 * u); ctx.fill();
        U.ell(ctx, w * 0.55, h * 0.68, 12 * u, 16 * u); ctx.fill();
        U.circle(ctx, w * 0.55, h * 0.68 - 20 * u, 9 * u); ctx.fill();
        ctx.strokeStyle = 'rgba(62,39,35,0.95)'; ctx.lineWidth = 5 * u; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(w * 0.4 + 12 * u, h * 0.66 - 10 * u);
        ctx.lineTo(w * 0.4 + 26 * u, h * 0.66 - 30 * u - Math.sin(t * 6) * 4 * u); ctx.stroke();
      }
      if (t > 8.6) {
        ctx.fillStyle = 'rgba(255,255,255,' + U.clamp((t - 8.6) / 0.4, 0, 1).toFixed(2) + ')';
        ctx.fillRect(0, 0, w, h);
      }
      if (t > 9.2) {
        ctx.fillStyle = '#5D4037'; ctx.font = '900 ' + 28 * u + 'px system-ui,sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('感谢游玩 · 节奏小奶蛙', w / 2, h * 0.46);
        ctx.font = '600 ' + 14 * u + 'px system-ui,sans-serif';
        ctx.fillText('下一个节拍，再见', w / 2, h * 0.53);
      }
    }
  };

  P.pause = function () {
    if (this.state !== 'play') return;
    this.state = 'paused';
    RF.audio.pause();
  };
  P.resume = function () {
    if (this.state !== 'paused') return;
    this.state = 'play';
    RF.audio.resume();
  };

  P.finish = function () {
    RF.audio.stop();
    this.state = 'idle';
    RF.ui.showPauseBtn(false);
    const res = this.scoreState.finish();
    const gi = RF.registry.gi(this.cfg);
    const rec = RF.save.record(this.cfg.id, Object.assign({ rankRank: res.rankRank }, res, { score: this.scoreState.score }));
    if (res.cleared && RF.save.get().unlocked < gi + 1) RF.save.get().unlocked = gi + 1;
    RF.save.flush();
    if (res.cleared) RF.sfx.score(); else RF.sfx.fail();
    const stageDone = res.cleared && this.cfg.idx === 10;
    setTimeout(() => {
      if (stageDone) RF.ui.celebration(this.cfg.stage, res, this.scoreState);
      else RF.ui.result(this.cfg, res, this.scoreState, rec);
    }, 500);
    this.active = false;
  };
})();
