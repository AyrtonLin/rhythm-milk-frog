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
    this.song = RF.music.make({
      seed: U.hashStr(cfg.id + 'music'), bpm: cfg.bpm, bars: Math.round(cfg.beats / 4),
      style: cfg.style, accents: this.chart.notes.map(n => n.beat)
    });
    this.scoreState = RF.scoring.create(this.chart.maxScore);
    this.winS = cfg.params.judgeScale || 1;      // 判定窗口倍率（赛车等关放宽）
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
    if (P.state !== 'play') return;
    let ev = e;
    const d = e.dir || (P.cfg.params.dpad ? RF.hud.dpadDir(e.x, e.y) : null);
    if (d) { ev = Object.assign({}, e, { dir: d }); RF.hud._dpadActive = d; }
    P.mech.down(P, ev);
  };
  P.up = e => {
    if (e.dir || RF.hud._dpadActive) RF.hud._dpadActive = null;
    if (P.state === 'tutorial') RF.tutorial.up(P, e);
    else if (P.state === 'play') P.mech.up(P, e);
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
