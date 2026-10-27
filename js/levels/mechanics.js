/* 节奏小奶蛙 - 机制原型库（每个原型实现一次，各关参数+皮肤差异化）
   机制接口：init(r) / update(r,dt) / draw(r,ctx) / down(r,e) / up(r,e) / miss(r,note)
   runner(r) 提供：cfg chart notes now() pending(win) nextNote() submit(note,tier,opt)
                  frog setPose setExpr powerBar w h u groundY */
(function () {
  const U = RF.util, J = RF.judge;
  const M = RF.mech = {};

  /* 通用：画小奶蛙（含眨眼/影子） */
  M.drawFrog = function (r, ctx, opt) {
    opt = opt || {};
    const f = r.frog;
    if (!opt.noShadow) RF.frog.shadow(ctx, f.x, f.y + 52 * f.s * (opt.shadowK || 1), f.s, opt.jump || 0);
    RF.frog.draw(ctx, {
      x: f.x, y: f.y, s: f.s, face: f.face, pose: f.pose, poseT: f.poseT,
      expr: f.expr, charge: f.charge, beatPhase: r.beatPhase(), prop: f.prop,
      propHand: f.propHand, propAngle: f.propAngle || 0, blink: f.blink
    });
  };

  /* ============ 原型 1：PowerThrow 力量投掷（长按蓄力 + 踩拍松手） ============ */
  M.power = {
    init(r) {
      r.m = { kind: r.cfg.params.kind, charging: null, power: 0, flights: [], sticks: [], netWig: 0, keeper: null, lineFlash: 0 };
      r.frog.prop = r.cfg.params.prop || null;
    },
    layout(r, note) {
      const w = RF.view.w, h = RF.view.h, u = RF.view.u, gy = r.groundY;
      const k = r.m.kind, z = note ? note.zone.c : 60;
      if (k === 'basket') return { tx: U.lerp(w * 0.52, w * 0.86, z / 100), ty: h * 0.34 + (note ? (note.aim % 2) * h * 0.05 : 0) };
      if (k === 'goal') return { tx: w * 0.82, ty: gy - h * 0.1, corner: note ? note.aim % 4 : 0 };
      if (k === 'jianzi') return { ty: gy - (z / 100) * h * 0.52 };
      if (k === 'dart') return { tx: U.lerp(w * 0.5, w * 0.87, z / 100), ty: h * 0.4 };
      return { tx: w * 0.7, ty: h * 0.4 };
    },
    update(r, dt) {
      const m = r.m, now = r.now();
      if (m.charging) {
        m.power = Math.min(100, (now - m.charging.t0) / RF.chart.FULL * 100);
        r.frog.charge = m.power / 100;
        r.setPose('charge', 0.1);
        if (m.power >= 100 && Math.random() < 0.2) RF.sfx.charge(1);
      } else {
        m.power = 0;
        r.frog.charge = Math.max(0, r.frog.charge - dt * 3);
      }
      /* 蓄力条常驻：始终显示当前力度与下一音符目标区间 */
      r.powerBar.show = 1;
      r.powerBar.power = m.power;
      const nn = r.nextNote();
      r.powerBar.zone = nn ? nn.zone : null;
      m.netWig = Math.max(0, m.netWig - dt * 2);
      m.lineFlash = Math.max(0, m.lineFlash - dt * 2);
      /* 飞行物 */
      for (let i = m.flights.length - 1; i >= 0; i--) {
        const f = m.flights[i];
        f.t += dt;
        const k = f.t / f.dur;
        if (k >= 1) {
          this._land(r, f);
          m.flights.splice(i, 1);
        }
      }
      if (m.keeper) { m.keeper.t += dt; if (m.keeper.t > 1) m.keeper = null; }
    },
    _land(r, f) {
      const m = r.m, u = RF.view.u;
      if (f.ok) {
        if (m.kind === 'basket') { RF.sfx.swish(); m.netWig = 1; RF.fx.burst(f.tx, f.ty + 10 * u, '#FFD34D', 10, { speed: 160 }); }
        else if (m.kind === 'goal') { RF.sfx.hit(); RF.fx.confetti(f.tx, f.ty, 14); }
        else if (m.kind === 'jianzi') { RF.sfx.pop(); m.lineFlash = 1; RF.fx.burst(f.tx, f.ty, '#81C784', 12, { speed: 180 }); }
        else if (m.kind === 'dart') { RF.sfx.dart(); RF.fx.burst(f.tx, f.ty, '#EF5350', 8, { speed: 120 }); m.sticks.push({ x: f.tx, y: f.ty, a: f.stickA || 0 }); if (m.sticks.length > 6) m.sticks.shift(); }
      } else {
        RF.sfx.bounce();
        RF.fx.burst(f.tx, f.ty, '#B0BEC5', 6, { speed: 120 });
      }
    },
    down(r, e) {
      if (r.m.charging) return;
      r.m.charging = { id: e.id, t0: r.now() };
      r.m.power = 0;
    },
    up(r, e) {
      const m = r.m;
      if (!m.charging || m.charging.id !== e.id) return;
      const power = m.power;
      m.charging = null;
      const now = r.now();
      const note = r.pending(r.winG);
      const L = this.layout(r, note);
      const from = { x: r.frog.x + 20 * r.frog.s * r.frog.face, y: r.frog.y - 20 * r.frog.s };
      if (note) {
        const tTier = J.timeTier(now - note.t, r.winS);
        const pTier = J.powerTier(power, note.zone);
        const tier = J.worse(tTier, pTier);
        r.submit(note, tier, { x: r.frog.x, y: r.frog.y - 90 * r.frog.s });
        const ok = tier !== 'M';
        const diff = power - note.zone.c;
        if (m.kind === 'basket') {
          r.setPose('throw', 0.45);
          m.flights.push({ kind: 'ball', prop: 'basketball', t: 0, dur: 0.6, fx: from.x, fy: from.y, tx: ok ? L.tx : L.tx + U.clamp(diff, -30, 30) * RF.view.u * 1.6, ty: ok ? L.ty : L.ty + (diff < 0 ? 90 : -40) * RF.view.u, ok });
        } else if (m.kind === 'goal') {
          r.setPose('kick', 0.45);
          const cw = RF.view.w * 0.14, ch = RF.view.h * 0.16;
          const cx = L.tx + ((L.corner % 2) - 0.5) * cw * 0.7;
          const cy = L.ty - (L.corner < 2 ? ch * 0.32 : -ch * 0.32);
          m.keeper = { t: 0, dir: ok ? -(note.dir === 'L' ? 1 : -1) : ((L.corner % 2) - 0.5), save: !ok };
          m.flights.push({ kind: 'ball', prop: 'football', t: 0, dur: 0.55, fx: from.x, fy: from.y, tx: ok ? cx : L.tx + U.clamp(diff, -25, 25) * RF.view.u * 2, ty: ok ? cy : L.ty - ch, ok });
        } else if (m.kind === 'jianzi') {
          r.setPose('kick', 0.4);
          const apex = r.groundY - (power / 100) * RF.view.h * 0.55;
          m.flights.push({ kind: 'up', prop: 'jianzi', t: 0, dur: 0.8, fx: r.frog.x, fy: r.groundY - 20 * RF.view.u, tx: r.frog.x + U.rr(Math.random, -30, 30), ty: 0, apex, lineY: L.ty, ok });
        } else if (m.kind === 'dart') {
          r.setPose('throw', 0.4);
          m.flights.push({ kind: 'flat', prop: 'dart', t: 0, dur: 0.45, fx: from.x, fy: from.y, tx: L.tx, ty: ok ? L.ty + U.rr(Math.random, -8, 8) : L.ty + U.clamp(diff, -40, 40) * RF.view.u * 1.4, ok, stickA: U.rr(Math.random, -0.2, 0.2) });
        }
        if (ok) r.setExpr(tier === 'P' ? 'stars' : 'happy', 0.5); else r.setExpr('sad', 0.7);
      } else {
        /* 空挥 */
        RF.sfx.whoosh();
        r.setPose(m.kind === 'goal' || m.kind === 'jianzi' ? 'kick' : 'throw', 0.35);
      }
    },
    miss(r, note) { r.setExpr('tense', 0.6); },
    draw(r, ctx) {
      const m = r.m, w = RF.view.w, h = RF.view.h, u = RF.view.u, gy = r.groundY;
      const n = r.nextNote();
      ctx.save();
      if (m.kind === 'basket') {
        const L = this.layout(r, n);
        ctx.save(); ctx.translate(L.tx, L.ty);
        if (m.netWig > 0) ctx.translate(Math.sin(m.netWig * 30) * 4 * u * m.netWig, 0);
        RF.props.draw(ctx, 'hoop', u * 1.1); ctx.restore();
      } else if (m.kind === 'goal') {
        const cw = w * 0.16, ch = h * 0.17, gx = w * 0.82 - cw / 2, gyy = gy - ch;
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 5 * u;
        ctx.strokeRect(gx, gyy, cw, ch);
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.2 * u;
        for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(gx + cw * i / 5, gyy); ctx.lineTo(gx + cw * i / 5, gy); ctx.stroke(); }
        for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(gx, gyy + ch * i / 4); ctx.lineTo(gx + cw, gyy + ch * i / 4); ctx.stroke(); }
        /* 目标角提示 */
        if (n) {
          const c = n.aim % 4;
          const cx = gx + ((c % 2) + 0.5) * cw / 2, cy = gyy + (c < 2 ? 0.25 : 0.75) * ch;
          const pl = 0.6 + Math.sin(r.now() * 8) * 0.4;
          ctx.strokeStyle = 'rgba(255,211,77,' + pl + ')'; ctx.lineWidth = 3 * u;
          RF.util.circle(ctx, cx, cy, 14 * u); ctx.stroke();
        }
        /* 守门员 */
        const kp = m.keeper;
        const kx = gx + cw / 2 + (kp ? kp.dir * cw * 0.4 * Math.min(1, kp.t * 4) : 0);
        const ky = gy - 26 * u - (kp ? Math.sin(Math.min(1, kp.t * 3) * Math.PI) * 20 * u : 0);
        ctx.fillStyle = '#7E57C2';
        RF.util.ell(ctx, kx, ky, 14 * u, 20 * u); ctx.fill();
        ctx.fillStyle = '#5E35B1';
        RF.util.circle(ctx, kx, ky - 22 * u, 10 * u); ctx.fill();
        ctx.fillStyle = '#fff';
        RF.util.circle(ctx, kx - 3 * u, ky - 24 * u, 2.4 * u); ctx.fill();
        RF.util.circle(ctx, kx + 3 * u, ky - 24 * u, 2.4 * u); ctx.fill();
      } else if (m.kind === 'jianzi') {
        const L = this.layout(r, n);
        const ly = n ? L.ty : gy - h * 0.3;
        ctx.strokeStyle = 'rgba(239,83,80,' + (0.6 + m.lineFlash * 0.4) + ')';
        ctx.lineWidth = (2.5 + m.lineFlash * 3) * u;
        ctx.setLineDash([10 * u, 8 * u]);
        ctx.beginPath(); ctx.moveTo(w * 0.15, ly); ctx.lineTo(w * 0.85, ly); ctx.stroke();
        ctx.setLineDash([]);
        RF.props.draw(ctx, 'flag', u, 0); ctx.save(); ctx.translate(w * 0.85, ly - 5 * u); RF.props.draw(ctx, 'flag', u); ctx.restore();
        ctx.fillStyle = 'rgba(90,60,20,0.7)';
        ctx.font = '700 ' + 13 * u + 'px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
        ctx.fillText('目标高度线', w * 0.15, ly - 6 * u);
      } else if (m.kind === 'dart') {
        const L = this.layout(r, n);
        ctx.save(); ctx.translate(L.tx, L.ty);
        const rings = [['#EF5350', 34], ['#fff', 26], ['#42A5F5', 18], ['#fff', 10], ['#EF5350', 4]];
        for (const [c, rr] of rings) { ctx.fillStyle = c; RF.util.circle(ctx, 0, 0, rr * u); ctx.fill(); }
        ctx.restore();
        for (const s of m.sticks) {
          ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(Math.PI / 2 + s.a); RF.props.draw(ctx, 'dart', u * 0.9); ctx.restore();
        }
      }
      /* 飞行物 */
      for (const f of m.flights) {
        const k = f.t / f.dur;
        let x, y, rot = 0;
        if (f.kind === 'up') {
          x = U.lerp(f.fx, f.tx, k);
          y = k < 0.5 ? U.lerp(f.fy, f.apex, U.easeOut(k * 2)) : U.lerp(f.apex, f.fy, U.easeIn((k - 0.5) * 2));
          rot = k * 8;
        } else if (f.kind === 'flat') {
          x = U.lerp(f.fx, f.tx, k); y = U.lerp(f.fy, f.ty, k) - Math.sin(k * Math.PI) * 20 * u;
          rot = Math.PI / 2;
        } else {
          x = U.lerp(f.fx, f.tx, k); y = U.lerp(f.fy, f.ty, k) - Math.sin(k * Math.PI) * (Math.abs(f.tx - f.fx) * 0.3 + 60 * u);
          rot = k * 12;
        }
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
        RF.props.draw(ctx, f.prop, u);
        ctx.restore();
      }
      ctx.restore();
      M.drawFrog(r, ctx);
    }
  };

  /* ============ 原型 2：SwingHit 挥拍击球（来球踩拍点击） ============ */
  M.swing = {
    init(r) {
      const k = r.cfg.params.kind;
      r.m = {
        kind: k, returns: [], drops: [], flash: 0, marks: [],
        ballProp: r.cfg.params.ballProp || { badminton: 'shuttle', tt: 'ttball', vb: 'volleyball', tennis: 'tennisball', frisbee: 'frisbee' }[k],
        ballScale: r.cfg.params.ballScale || 1
      };
      r.frog.prop = r.cfg.params.prop || null;
      r.m.incoming = r.chart.notes.map(n => this._spawn(r, n));
    },
    _spawn(r, n) {
      const w = RF.view.w, h = RF.view.h, u = RF.view.u;
      const hp = this.hitPoint(r);
      let sx, sy;
      const k = r.m ? r.m.kind : r.cfg.params.kind;
      if (k === 'frisbee') {
        const fromLeft = n.dir === 0 ? true : n.dir === 2 ? false : (n.i % 2 === 0);
        sy = h * U.rr(U.mulberry32(n.i + 5), 0.25, 0.5);
        sx = fromLeft ? -50 * u : w + 50 * u;
        return { n, sx, sy, hx: w / 2, hy: sy, fromLeft, A: 1.0 };
      }
      if (n.dir === 0) { sx = -40 * u; sy = hp.y - h * 0.18; }
      else if (n.dir === 2) { sx = w + 40 * u; sy = hp.y - h * 0.22; }
      else { sx = hp.x + U.rr(U.mulberry32(n.i + 3), -w * 0.2, w * 0.2); sy = -40 * u; }
      return { n, sx, sy, hx: hp.x, hy: hp.y, A: 0.9 };
    },
    hitPoint(r) {
      const w = RF.view.w, h = RF.view.h, u = RF.view.u;
      const k = r.m.kind;
      if (k === 'vb') return { x: r.frog.x, y: r.frog.y - 70 * u };
      if (k === 'frisbee') return { x: w / 2, y: h * 0.4 };
      return { x: r.frog.x + 60 * u * r.frog.face, y: r.frog.y - 40 * u };
    },
    update(r, dt) {
      const m = r.m, now = r.now();
      m.flash = Math.max(0, m.flash - dt * 6);
      for (let i = m.returns.length - 1; i >= 0; i--) {
        const b = m.returns[i]; b.t += dt;
        if (b.t > b.dur) m.returns.splice(i, 1);
      }
      for (let i = m.drops.length - 1; i >= 0; i--) {
        const b = m.drops[i]; b.t += dt; b.vy += 900 * dt; b.y += b.vy * dt; b.x += b.vx * dt;
        if (b.t > 1.2) m.drops.splice(i, 1);
      }
      for (let i = m.marks.length - 1; i >= 0; i--) { m.marks[i].t += dt; if (m.marks[i].t > 0.8) m.marks.splice(i, 1); }
      const hp = this.hitPoint(r);
      r.cueX = hp.x; r.cueY = hp.y;
    },
    down(r, e) {
      const m = r.m, now = r.now();
      const note = r.pending(r.winG);
      if (!note) { RF.sfx.whoosh(); r.setPose(m.kind === 'vb' ? 'catch' : 'swing', 0.3); return; }
      const tier = J.timeTier(now - note.t, r.winS);
      r.submit(note, tier, { x: r.frog.x, y: r.frog.y - 95 * r.frog.s });
      const hp = this.hitPoint(r);
      if (m.kind === 'vb') r.setPose(note.dir === 1 ? 'jump' : 'catch', 0.4);
      else r.setPose('swing', 0.35);
      r.setExpr(tier === 'M' ? 'tense' : tier === 'P' ? 'stars' : 'happy', 0.5);
      if (tier !== 'M') {
        RF.sfx.whoosh(); RF.sfx.hit();
        m.flash = 1;
        const sp = tier === 'P' ? 0.35 : 0.5;
        if (m.kind === 'frisbee') {
          RF.fx.confetti(hp.x, hp.y, 12);
        } else {
          m.returns.push({ prop: m.ballProp, sc: m.ballScale, t: 0, dur: sp + 0.3, x: hp.x, y: hp.y, dx: (note.ret - 1) * RF.view.w * 0.5, dy: -RF.view.h * 0.5, arc: tier === 'P' ? 60 : 140 });
          if (m.kind === 'tennis') m.marks.push({ t: 0, x: RF.view.w * 0.25 + (note.ret) * RF.view.w * 0.12, y: r.groundY - 30 * RF.view.u, ok: true });
        }
      } else {
        if (m.kind === 'tennis') m.marks.push({ t: 0, x: RF.view.w * 0.1, y: r.groundY - 60 * RF.view.u, ok: false });
      }
    },
    up() { },
    miss(r, note) {
      const m = r.m;
      const inc = m.incoming.find(o => o.n === note);
      if (inc) m.drops.push({ prop: m.ballProp || 'frisbee', sc: m.ballScale, t: 0, x: inc.hx, y: inc.hy, vx: U.rr(Math.random, -60, 60), vy: 80 });
      r.setExpr('sad', 0.6);
      if (r.m.kind === 'tt' || r.m.kind === 'badminton') RF.sfx.bounce();
    },
    draw(r, ctx) {
      const m = r.m, w = RF.view.w, h = RF.view.h, u = RF.view.u, gy = r.groundY, now = r.now();
      ctx.save();
      /* 记分牌 */
      ctx.fillStyle = 'rgba(38,50,56,0.85)';
      U.roundRect(ctx, w * 0.03, h * 0.12, 96 * u, 42 * u, 6 * u); ctx.fill();
      ctx.fillStyle = '#FFD34D'; ctx.font = '800 ' + 14 * u + 'px system-ui,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(r.scoreState.combo + ' COMBO', w * 0.03 + 48 * u, h * 0.12 + 14 * u);
      ctx.fillStyle = '#fff'; ctx.font = '700 ' + 11 * u + 'px system-ui,sans-serif';
      ctx.fillText('P' + r.scoreState.p + ' G' + r.scoreState.g + ' M' + r.scoreState.m, w * 0.03 + 48 * u, h * 0.12 + 30 * u);
      /* 场地 */
      if (m.kind === 'badminton' || m.kind === 'tennis') {
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3 * u;
        ctx.beginPath(); ctx.moveTo(w * 0.06, gy); ctx.lineTo(w * 0.94, gy); ctx.stroke();
        ctx.strokeStyle = '#ECEFF1'; ctx.lineWidth = 3 * u;
        ctx.beginPath(); ctx.moveTo(w * 0.45, gy); ctx.lineTo(w * 0.45, gy - h * 0.22); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5 * u;
        for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(w * 0.45 - 8 * u, gy - h * 0.22 + i * h * 0.036); ctx.lineTo(w * 0.45 + 8 * u, gy - h * 0.22 + i * h * 0.036); ctx.stroke(); }
      } else if (m.kind === 'tt') {
        ctx.fillStyle = '#1565C0';
        RF.util.roundRect(ctx, w * 0.18, gy - h * 0.16, w * 0.64, h * 0.035, 4 * u); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2 * u;
        ctx.beginPath(); ctx.moveTo(w * 0.5, gy - h * 0.16); ctx.lineTo(w * 0.5, gy - h * 0.21); ctx.stroke();
        ctx.fillStyle = '#0D47A1';
        ctx.fillRect(w * 0.24, gy - h * 0.13, 6 * u, h * 0.13);
        ctx.fillRect(w * 0.74, gy - h * 0.13, 6 * u, h * 0.13);
      } else if (m.kind === 'vb') {
        ctx.fillStyle = 'rgba(255,224,130,0.8)';
        ctx.fillRect(0, gy, w, h - gy);
      }
      /* 落点标记（网球） */
      for (const mk of m.marks) {
        ctx.globalAlpha = 1 - mk.t / 0.8;
        ctx.strokeStyle = mk.ok ? '#81C784' : '#EF5350'; ctx.lineWidth = 3 * u;
        RF.util.circle(ctx, mk.x, mk.y, 12 * u + mk.t * 20 * u); ctx.stroke();
        if (!mk.ok) {
          ctx.fillStyle = '#EF5350'; ctx.font = '900 ' + 16 * u + 'px system-ui,sans-serif';
          ctx.textAlign = 'center'; ctx.fillText('OUT!', mk.x, mk.y - 20 * u);
        }
        ctx.globalAlpha = 1;
      }
      /* 来球 */
      for (const o of m.incoming) {
        const n = o.n;
        if (n.judged) continue;
        const dtIn = n.t - now;
        if (dtIn > o.A || dtIn < -0.25) continue;
        const k = 1 - Math.max(0, dtIn) / o.A;
        const x = U.lerp(o.sx, o.hx, k), y = U.lerp(o.sy, o.hy, k) - (m.kind === 'frisbee' ? 0 : Math.sin(k * Math.PI) * 40 * u);
        ctx.save(); ctx.translate(x, y); ctx.rotate(k * 6);
        RF.props.draw(ctx, m.ballProp, u * (m.ballScale || 1));
        ctx.restore();
      }
      /* 回球 */
      for (const b of m.returns) {
        const k = b.t / b.dur;
        const x = b.x + b.dx * k, y = b.y + b.dy * k + Math.sin(k * Math.PI) * b.arc * u;
        ctx.save(); ctx.translate(x, y); ctx.rotate(k * 10);
        RF.props.draw(ctx, b.prop, u * (b.sc || 1));
        ctx.restore();
      }
      /* 掉落 */
      for (const b of m.drops) {
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.t * 5);
        RF.props.draw(ctx, b.prop, u * (b.sc || 1));
        ctx.restore();
      }
      /* 击球闪光 */
      if (m.flash > 0) {
        const hp = this.hitPoint(r);
        ctx.strokeStyle = 'rgba(255,255,255,' + m.flash + ')';
        ctx.lineWidth = 4 * u * m.flash;
        for (let i = 0; i < 6; i++) {
          const a = i / 6 * U.TAU;
          ctx.beginPath();
          ctx.moveTo(hp.x + Math.cos(a) * 10 * u, hp.y + Math.sin(a) * 10 * u);
          ctx.lineTo(hp.x + Math.cos(a) * (24 + (1 - m.flash) * 20) * u, hp.y + Math.sin(a) * (24 + (1 - m.flash) * 20) * u);
          ctx.stroke();
        }
      }
      ctx.restore();
      M.drawFrog(r, ctx);
    }
  };

  /* ============ 原型 3：Race 赛车剧本（点击左右踩拍过弯） ============ */
  M.race = {
    init(r) {
      r.m = { carX: RF.view.w / 2, tilt: 0, speed: 1, scroll: 0, wobble: 0, boost: 0, finished: false, run: r.cfg.params.kind === 'run' };
      r.frog.prop = r.cfg.params.prop || (r.m.run ? null : 'wheel');
    },
    roadCenter(r, t) {
      const w = RF.view.w;
      let c = w / 2;
      for (const n of r.chart.notes) {
        const k = (t - n.t) / 1.2;
        if (k > 0) c += (n.dir === 'L' ? -1 : 1) * w * 0.16 * U.easeInOut(U.clamp(k, 0, 1));
      }
      return U.clamp(c, w * 0.28, w * 0.72);
    },
    update(r, dt) {
      const m = r.m, now = r.now(), w = RF.view.w;
      const rc = this.roadCenter(r, now);
      m.boost = Math.max(0, m.boost - dt * 1.5);
      m.wobble = Math.max(0, m.wobble - dt * 2);
      m.speed = U.lerp(m.speed, 1 + m.boost * 0.5 - m.wobble * 0.4, dt * 3);
      m.scroll += dt * 420 * m.speed;
      const off = Math.abs(m.carX - rc);
      m.carX = U.lerp(m.carX, rc, dt * (off > w * 0.12 ? 1.2 : 4));
      m.tilt = U.lerp(m.tilt, U.clamp((rc - m.carX) / (w * 0.1), -1, 1) * 0.3, dt * 8);
      if (off > w * 0.14 && Math.random() < 0.3) RF.fx.burst(m.carX, r.groundY - 10, '#B0BEC5', 2, { speed: 60, grav: 200 });
      if (m.run) { r.frog.pose = 'run'; r.frog.poseDur = 0; }
      r.cueX = m.carX; r.cueY = r.groundY - 105 * RF.view.u;
      if (now > r.chart.duration - 0.6 && !m.finished) { m.finished = true; RF.sfx.whistle(); RF.fx.confetti(w / 2, RF.view.h * 0.4, 24); }
    },
    down(r, e) {
      const m = r.m, now = r.now();
      const side = e.dir || (e.x < RF.view.w / 2 ? 'L' : 'R');
      const note = r.pending(r.winG);
      if (!note) { if (side === 'L' || side === 'R') m.tilt += (side === 'L' ? -0.12 : 0.12); return; }
      const correct = note.dir === side;
      const tier = J.timeTier(now - note.t, r.winS);
      const final = correct ? tier : 'M';
      r.submit(note, final, { x: m.carX, y: r.groundY - 120 * RF.view.u });
      if (correct && final !== 'M') {
        if (side === 'U') r.setPose('jump', 0.5);
        else if (side === 'D') r.setPose('hide', 0.4);
        m.boost = 1; m.tilt = (side === 'L' ? -0.35 : side === 'R' ? 0.35 : 0);
        RF.sfx.drift();
        RF.fx.burst(m.carX + (side === 'L' ? 30 : side === 'R' ? -30 : 0), r.groundY - 8 * RF.view.u, '#FFE082', 8, { speed: 140, grav: 300 });
        r.setExpr(final === 'P' ? 'stars' : 'happy', 0.4);
      } else {
        m.wobble = 1;
        r.setExpr('tense', 0.6);
      }
    },
    up() { },
    miss(r, note) { r.m.wobble = 1; r.setExpr('tense', 0.6); },
    draw(r, ctx) {
      const m = r.m, w = RF.view.w, h = RF.view.h, u = RF.view.u, now = r.now();
      const gy = r.groundY;
      ctx.save();
      /* 赛道（俯视竖卷） */
      const rw = w * 0.42;
      const rc = this.roadCenter(r, now);
      ctx.fillStyle = m.run ? '#9E9E9E' : '#607D8B';
      ctx.beginPath();
      ctx.moveTo(rc - rw / 2, h); ctx.lineTo(rc + rw / 2, h);
      const top = h * 0.32, rct = this.roadCenter(r, now + 2.2);
      ctx.lineTo(rct + rw * 0.18, top); ctx.lineTo(rct - rw * 0.18, top);
      ctx.closePath(); ctx.fill();
      /* 边线 */
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 4 * u;
      ctx.beginPath(); ctx.moveTo(rc - rw / 2, h); ctx.lineTo(rct - rw * 0.18, top); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rc + rw / 2, h); ctx.lineTo(rct + rw * 0.18, top); ctx.stroke();
      /* 中线滚动 */
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 5 * u;
      ctx.setLineDash([26 * u, 30 * u]);
      ctx.lineDashOffset = -m.scroll % (56 * u);
      ctx.beginPath(); ctx.moveTo(rc, h); ctx.lineTo(rct, top); ctx.stroke();
      ctx.setLineDash([]);
      /* 终点线 */
      const dtF = r.chart.duration - 0.6 - now;
      if (dtF < 2.4 && dtF > -0.5) {
        const k = 1 - U.clamp(dtF, 0, 2.4) / 2.4;
        const y = U.lerp(top, h * 0.8, k);
        const cx = this.roadCenter(r, now + Math.max(0, dtF) * 1.1);
        const halfW = U.lerp(rw * 0.18, rw / 2, k);
        for (let i = 0; i < 10; i++) {
          ctx.fillStyle = i % 2 ? '#fff' : '#212121';
          ctx.fillRect(cx - halfW + (halfW * 2) * i / 10, y, halfW * 2 / 10, 10 * u);
          ctx.fillStyle = i % 2 ? '#212121' : '#fff';
          ctx.fillRect(cx - halfW + (halfW * 2) * i / 10, y + 10 * u, halfW * 2 / 10, 10 * u);
        }
      }
      /* 弯道指示牌（提前 2 秒逼近） */
      for (const n of r.chart.notes) {
        const dtN = n.t - now;
        if (dtN > 2.2 || dtN < -0.3 || n.judged) continue;
        const k = 1 - U.clamp(dtN, 0, 2.2) / 2.2;
        const y = U.lerp(top + 10 * u, h * 0.62, k);
        const cx = this.roadCenter(r, n.t);
        const sc = U.lerp(0.5, 1.3, k);
        ctx.save(); ctx.translate(cx, y); ctx.scale(sc, sc);
        ctx.fillStyle = 'rgba(255,211,77,0.95)';
        RF.util.roundRect(ctx, -22 * u, -16 * u, 44 * u, 32 * u, 8 * u); ctx.fill();
        ctx.save();
        ctx.rotate({ R: Math.PI / 2, U: 0, D: Math.PI, L: -Math.PI / 2 }[n.dir] || 0);
        ctx.fillStyle = '#8a5a2b';
        ctx.beginPath(); ctx.moveTo(11 * u, 0); ctx.lineTo(-8 * u, -9 * u); ctx.lineTo(-8 * u, 9 * u); ctx.closePath(); ctx.fill();
        ctx.restore();
        /* 障碍预示：U=路面栏（跳），D=头顶杆（蹲） */
        if (n.dir === 'U') { ctx.fillStyle = 'rgba(239,83,80,0.9)'; ctx.fillRect(-rw * 0.16, 20 * u, rw * 0.32, 7 * u); }
        if (n.dir === 'D') { ctx.fillStyle = 'rgba(66,165,245,0.9)'; ctx.fillRect(-rw * 0.16, -36 * u, rw * 0.32, 7 * u); }
        ctx.restore();
      }
      /* 公交（赶公交关） */
      if (m.run) {
        const bx = this.roadCenter(r, now + 1.6), by = top + 50 * u;
        ctx.fillStyle = '#66BB6A';
        U.roundRect(ctx, bx - 42 * u, by - 30 * u, 84 * u, 48 * u, 8 * u); ctx.fill();
        ctx.fillStyle = '#B3E5FC';
        for (let i = 0; i < 3; i++) { U.roundRect(ctx, bx - 34 * u + i * 23 * u, by - 24 * u, 17 * u, 13 * u, 3 * u); ctx.fill(); }
        ctx.fillStyle = '#212121';
        U.circle(ctx, bx - 26 * u, by + 18 * u, 7 * u); ctx.fill();
        U.circle(ctx, bx + 26 * u, by + 18 * u, 7 * u); ctx.fill();
        const left = Math.max(0, Math.round((r.chart.count - r.scoreState.p - r.scoreState.g) * 3));
        ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.font = '800 ' + 13 * u + 'px system-ui,sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('距公交 ' + left + ' 米', bx, by - 42 * u);
      }
      /* 卡丁车 + 奶蛙 */
      if (!m.run) {
      ctx.save();
      ctx.translate(m.carX, gy - 6 * u);
      ctx.rotate(m.tilt + Math.sin(now * 40) * m.wobble * 0.06);
      const ks = u * 1.05;
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; RF.util.ell(ctx, 0, 26 * ks, 46 * ks, 10 * ks); ctx.fill();
      ctx.fillStyle = '#212121';
      RF.util.roundRect(ctx, -40 * ks, 6 * ks, 18 * ks, 22 * ks, 5 * ks); ctx.fill();
      RF.util.roundRect(ctx, 22 * ks, 6 * ks, 18 * ks, 22 * ks, 5 * ks); ctx.fill();
      RF.util.roundRect(ctx, -34 * ks, -8 * ks, 14 * ks, 18 * ks, 4 * ks); ctx.fill();
      RF.util.roundRect(ctx, 20 * ks, -8 * ks, 14 * ks, 18 * ks, 4 * ks); ctx.fill();
      ctx.fillStyle = '#EF5350';
      RF.util.roundRect(ctx, -26 * ks, -2 * ks, 52 * ks, 24 * ks, 8 * ks); ctx.fill();
      ctx.fillStyle = '#FFCDD2';
      RF.util.roundRect(ctx, -14 * ks, 2 * ks, 28 * ks, 10 * ks, 4 * ks); ctx.fill();
      ctx.restore();
      }
      if (m.run) { r.frog.x = m.carX; r.frog.y = gy - 50 * u; r.frog.s = u; M.drawFrog(r, ctx); }
      else { r.frog.x = m.carX; r.frog.y = gy - 34 * u; r.frog.s = u * 0.85; M.drawFrog(r, ctx, { noShadow: true }); }
      ctx.restore();
    }
  };
})();
