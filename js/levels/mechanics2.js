/* 节奏小奶蛙 - 第二阶段机制原型：target 移动目标 / beattap 踩拍家务 / fall 三轨接物 / choice 四桶选择
   接口同 mechanics.js：init/update/draw/down/up/miss */
(function () {
  const U = RF.util, J = RF.judge;
  const M = RF.mech;

  /* ============ target：踩拍点击目标（苍蝇/裂口/衣架/菜篮/花盆） ============ */
  M.target = {
    init(r) {
      r.m = { kind: r.cfg.params.kind, done: {}, splats: [], hung: [] };
      r.frog.prop = r.cfg.params.prop || null;
    },
    posAt(r, n, t) {
      const w = RF.view.w, h = RF.view.h, u = RF.view.u, k = r.m.kind;
      if (k === 'fly') return { x: n.px * w + Math.sin(t * 2.2 + n.ph) * 46 * u, y: n.py * h + Math.cos(t * 1.6 + n.ph) * 34 * u };
      if (k === 'hanger') return { x: w * 0.5 + (t - n.t) * w * 0.28, y: h * 0.34 };
      if (k === 'veg') return { x: (n.side ? 0.68 : 0.32) * w, y: h * 0.46 };
      if (k === 'pipe') return { x: n.px * w, y: h * 0.42 };
      return { x: n.px * w, y: n.py * h };
    },
    rad(r) { const k = r.m.kind; return (k === 'veg' ? 92 : k === 'fly' ? 66 : 72) * RF.view.u; },
    update(r, dt) {
      const n = r.nextNote();
      if (n) { const p = this.posAt(r, n, r.now()); r.cueX = p.x; r.cueY = p.y; }
      for (let i = r.m.splats.length - 1; i >= 0; i--) { r.m.splats[i].t += dt; if (r.m.splats[i].t > 0.8) r.m.splats.splice(i, 1); }
    },
    down(r, e) {
      const now = r.now(), u = RF.view.u;
      const note = r.pending(r.winG);
      if (!note) { RF.sfx.whoosh(); r.setPose('swing', 0.3); return; }
      const p = this.posAt(r, note, now);
      const ok = Math.hypot(e.x - p.x, e.y - p.y) <= this.rad(r);
      const tier = ok ? J.timeTier(now - note.t, r.winS) : 'M';
      r.submit(note, tier, { x: p.x, y: p.y - 44 * u });
      r.m.done[note.i] = tier;
      if (tier !== 'M') {
        r.setPose(r.m.kind === 'veg' || r.m.kind === 'water' ? 'catch' : 'swing', 0.35);
        r.setExpr(tier === 'P' ? 'stars' : 'happy', 0.5);
        RF.sfx.hit();
        RF.fx.burst(p.x, p.y, r.m.kind === 'water' ? '#4FC3F7' : '#FFD34D', 10, { speed: 180 });
        if (r.m.kind === 'hanger') r.m.hung.push({ t: 0, c: note.i % 4 });
      } else {
        r.setExpr('sad', 0.6);
        if (r.m.kind === 'veg') RF.ui.toast('🤢 烂菜不能要哦！', 1200);
        r.m.splats.push({ x: e.x, y: e.y, t: 0 });
      }
    },
    up() { },
    miss(r, n) {
      r.setExpr('tense', 0.6);
      const p = this.posAt(r, n, n.t);
      r.m.splats.push({ x: p.x, y: p.y, t: 0 });
    },
    draw(r, ctx) {
      const m = r.m, w = RF.view.w, h = RF.view.h, u = RF.view.u, now = r.now();
      ctx.save();
      const upcoming = r.chart.notes.filter(n => !n.judged && n.t - now < 2.4 && n.t - now > -0.3);
      if (m.kind === 'fly') {
        for (const n of upcoming) {
          const p = this.posAt(r, n, now);
          ctx.save(); ctx.translate(p.x, p.y);
          ctx.fillStyle = '#37474F'; U.ell(ctx, 0, 0, 7 * u, 5 * u); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.75)';
          const fl = Math.sin(now * 40 + n.ph) * 0.5;
          U.ell(ctx, -6 * u, -5 * u, 6 * u, 3 * u, -0.5 + fl); ctx.fill();
          U.ell(ctx, 6 * u, -5 * u, 6 * u, 3 * u, 0.5 - fl); ctx.fill();
          ctx.restore();
        }
      } else if (m.kind === 'pipe') {
        ctx.fillStyle = '#90A4AE';
        ctx.fillRect(0, h * 0.42 - 12 * u, w, 24 * u);
        ctx.fillStyle = '#78909C';
        for (let i = 0; i < w / 90; i++) ctx.fillRect(i * 90, h * 0.42 - 14 * u, 8 * u, 28 * u);
        for (const n of upcoming) {
          const p = this.posAt(r, n, now);
          if (!m.done[n.i]) {
            ctx.strokeStyle = 'rgba(79,195,247,0.9)'; ctx.lineWidth = 3 * u;
            for (let i = -1; i <= 1; i++) {
              ctx.beginPath(); ctx.moveTo(p.x + i * 5 * u, p.y - 10 * u);
              ctx.lineTo(p.x + i * 9 * u, p.y - 34 * u - Math.sin(now * 10 + i) * 6 * u); ctx.stroke();
            }
            ctx.fillStyle = '#546E7A'; U.circle(ctx, p.x, p.y, 6 * u); ctx.fill();
          } else {
            ctx.fillStyle = '#FFD34D'; U.roundRect(ctx, p.x - 12 * u, p.y - 10 * u, 24 * u, 20 * u, 4 * u); ctx.fill();
          }
        }
      } else if (m.kind === 'hanger') {
        ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 3 * u;
        ctx.beginPath(); ctx.moveTo(w * 0.08, h * 0.34); ctx.lineTo(w * 0.92, h * 0.34); ctx.stroke();
        /* 中心判定区 */
        ctx.strokeStyle = 'rgba(255,211,77,0.9)'; ctx.lineWidth = 4 * u;
        ctx.beginPath(); ctx.moveTo(w * 0.5 - 30 * u, h * 0.34 - 16 * u); ctx.lineTo(w * 0.5 - 30 * u, h * 0.34 + 16 * u);
        ctx.moveTo(w * 0.5 + 30 * u, h * 0.34 - 16 * u); ctx.lineTo(w * 0.5 + 30 * u, h * 0.34 + 16 * u); ctx.stroke();
        for (const n of upcoming) {
          const p = this.posAt(r, n, now);
          ctx.strokeStyle = '#546E7A'; ctx.lineWidth = 2.4 * u;
          ctx.beginPath(); ctx.arc(p.x, p.y - 10 * u, 7 * u, Math.PI, 0); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(p.x, p.y - 17 * u); ctx.lineTo(p.x, p.y - 24 * u); ctx.stroke();
          const cols = ['#F48FB1', '#81D4FA', '#FFF59D', '#A5D6A7'];
          ctx.fillStyle = cols[n.i % 4];
          ctx.beginPath(); ctx.moveTo(p.x - 16 * u, p.y - 8 * u); ctx.lineTo(p.x + 16 * u, p.y - 8 * u);
          ctx.lineTo(p.x + 12 * u, p.y + 22 * u); ctx.lineTo(p.x - 12 * u, p.y + 22 * u); ctx.closePath(); ctx.fill();
        }
        for (const hg of m.hung) {
          const cols = ['#F48FB1', '#81D4FA', '#FFF59D', '#A5D6A7'];
          ctx.fillStyle = cols[hg.c];
          const x = w * 0.5 + (hg.c - 1.5) * 40 * u;
          ctx.beginPath(); ctx.moveTo(x - 14 * u, h * 0.34 + 6 * u); ctx.lineTo(x + 14 * u, h * 0.34 + 6 * u);
          ctx.lineTo(x + 10 * u, h * 0.34 + 34 * u); ctx.lineTo(x - 10 * u, h * 0.34 + 34 * u); ctx.closePath(); ctx.fill();
        }
      } else if (m.kind === 'veg') {
        for (const side of [0, 1]) {
          const x = (side ? 0.68 : 0.32) * w, y = h * 0.46;
          ctx.fillStyle = '#A1887F';
          ctx.beginPath(); ctx.moveTo(x - 34 * u, y); ctx.lineTo(x + 34 * u, y); ctx.lineTo(x + 26 * u, y + 30 * u); ctx.lineTo(x - 26 * u, y + 30 * u); ctx.closePath(); ctx.fill();
          const n = upcoming[0];
          const fresh = n ? (n.side === side) : true;
          ctx.save(); ctx.translate(x, y - 12 * u);
          if (fresh) { RF.props.draw(ctx, 'carrot', u * 1.1); } else { RF.props.draw(ctx, 'rotten', u * 1.1); }
          ctx.restore();
        }
        ctx.textAlign = 'center'; ctx.font = '700 ' + 13 * u + 'px system-ui,sans-serif';
        ctx.fillStyle = 'rgba(90,60,20,0.7)';
        ctx.fillText('新鲜', 0.32 * w, h * 0.46 + 48 * u);
        ctx.fillText('腐烂', 0.68 * w, h * 0.46 + 48 * u);
      } else if (m.kind === 'water') {
        for (const n of upcoming) {
          const p = this.posAt(r, n, now);
          const wilt = U.clamp(1 - (n.t - now) / 2.4, 0, 1);
          ctx.fillStyle = '#BC6C25';
          ctx.beginPath(); ctx.moveTo(p.x - 20 * u, p.y); ctx.lineTo(p.x + 20 * u, p.y); ctx.lineTo(p.x + 14 * u, p.y + 26 * u); ctx.lineTo(p.x - 14 * u, p.y + 26 * u); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#66BB6A'; ctx.lineWidth = 3 * u;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(p.x + wilt * 14 * u, p.y - 18 * u, p.x + wilt * 22 * u, p.y - 26 * u + wilt * 10 * u); ctx.stroke();
          ctx.fillStyle = wilt > 0.6 ? '#C0CA33' : '#F48FB1';
          U.circle(ctx, p.x + wilt * 22 * u, p.y - 26 * u + wilt * 10 * u, 8 * u); ctx.fill();
        }
      }
      for (const s of m.splats) {
        ctx.globalAlpha = 1 - s.t / 0.8;
        ctx.strokeStyle = '#EF5350'; ctx.lineWidth = 4 * u;
        ctx.beginPath(); ctx.moveTo(s.x - 10 * u, s.y - 10 * u); ctx.lineTo(s.x + 10 * u, s.y + 10 * u);
        ctx.moveTo(s.x + 10 * u, s.y - 10 * u); ctx.lineTo(s.x - 10 * u, s.y + 10 * u); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      M.drawFrog(r, ctx);
    }
  };

  /* ============ beattap：踩拍家务（洗碗/扫地） ============ */
  M.beattap = {
    init(r) {
      r.m = { kind: r.cfg.params.kind, clean: 0, left: r.chart.notes.length, anims: [] };
      r.frog.prop = r.cfg.params.prop || null;
    },
    update(r, dt) {
      const n = r.nextNote();
      if (n && r.m.kind === 'sweep') { r.cueX = n.px * RF.view.w; r.cueY = n.py * RF.view.h; }
      else { r.cueX = RF.view.w * 0.5; r.cueY = RF.view.h * 0.52; }
      for (let i = r.m.anims.length - 1; i >= 0; i--) { r.m.anims[i].t += dt; if (r.m.anims[i].t > 0.6) r.m.anims.splice(i, 1); }
    },
    down(r, e) {
      const now = r.now(), u = RF.view.u, m = r.m;
      const note = r.pending(r.winG);
      if (!note) { r.setPose('swing', 0.25); RF.sfx.whoosh(); return; }
      const tier = J.timeTier(now - note.t, r.winS);
      const at = m.kind === 'sweep' ? { x: note.px * RF.view.w, y: note.py * RF.view.h } : { x: RF.view.w * 0.5, y: RF.view.h * 0.52 };
      r.submit(note, tier, { x: at.x, y: at.y - 40 * u });
      r.setPose('swing', 0.3);
      if (tier !== 'M') {
        m.clean++; m.left--;
        m.anims.push({ x: at.x, y: at.y, t: 0, ok: true });
        RF.sfx.swish();
        RF.fx.burst(at.x, at.y, m.kind === 'dish' ? '#81D4FA' : '#FFE082', 8, { speed: 150 });
        r.setExpr(tier === 'P' ? 'smile' : 'happy', 0.4);
      } else {
        m.anims.push({ x: at.x, y: at.y, t: 0, ok: false });
        if (m.kind === 'dish') { RF.sfx.shatter(); RF.fx.burst(at.x, at.y, '#ECEFF1', 14, { speed: 240, grav: 700 }); }
        else { r.setPose('slip', 0.7); r.setExpr('dizzy', 0.9); }
      }
    },
    up() { },
    miss(r, n) {
      const m = r.m;
      m.left--;
      if (m.kind === 'dish') { RF.sfx.shatter(); RF.fx.burst(RF.view.w * 0.5, RF.view.h * 0.52, '#ECEFF1', 14, { speed: 240, grav: 700 }); }
      else { r.setPose('slip', 0.7); r.setExpr('dizzy', 0.9); }
    },
    draw(r, ctx) {
      const m = r.m, w = RF.view.w, h = RF.view.h, u = RF.view.u, now = r.now();
      ctx.save();
      if (m.kind === 'dish') {
        /* 水槽 */
        ctx.fillStyle = '#B0BEC5';
        U.roundRect(ctx, w * 0.5 - 70 * u, h * 0.52 - 30 * u, 140 * u, 70 * u, 12 * u); ctx.fill();
        ctx.fillStyle = '#90A4AE';
        U.roundRect(ctx, w * 0.5 - 58 * u, h * 0.52 - 20 * u, 116 * u, 50 * u, 10 * u); ctx.fill();
        ctx.fillStyle = 'rgba(129,212,250,0.5)';
        U.roundRect(ctx, w * 0.5 - 58 * u, h * 0.52 - 6 * u, 116 * u, 36 * u, 8 * u); ctx.fill();
        /* 脏碗堆 / 干净堆 */
        for (let i = 0; i < Math.min(6, m.left); i++) { ctx.fillStyle = '#FFF9C4'; U.ell(ctx, w * 0.24, h * 0.56 - i * 7 * u, 26 * u, 9 * u); ctx.fill(); ctx.strokeStyle = '#E0C060'; ctx.lineWidth = 1.4 * u; ctx.stroke(); }
        for (let i = 0; i < Math.min(6, m.clean); i++) { ctx.fillStyle = '#FFFDE7'; U.ell(ctx, w * 0.76, h * 0.56 - i * 7 * u, 26 * u, 9 * u); ctx.fill(); ctx.strokeStyle = '#81C784'; ctx.lineWidth = 1.4 * u; ctx.stroke(); }
        ctx.textAlign = 'center'; ctx.font = '700 ' + 12 * u + 'px system-ui,sans-serif'; ctx.fillStyle = 'rgba(90,60,20,0.7)';
        ctx.fillText('待洗 ' + m.left, w * 0.24, h * 0.62);
        ctx.fillText('洗净 ' + m.clean, w * 0.76, h * 0.62);
      } else {
        for (const n of r.chart.notes) {
          if (n.judged) continue;
          if (n.t - now > 2.4) continue;
          ctx.fillStyle = 'rgba(121,85,72,0.55)';
          U.ell(ctx, n.px * w, n.py * h, 26 * u, 14 * u, 0.3); ctx.fill();
          U.ell(ctx, n.px * w + 14 * u, n.py * h + 6 * u, 12 * u, 7 * u, -0.4); ctx.fill();
        }
      }
      for (const a of m.anims) {
        ctx.globalAlpha = 1 - a.t / 0.6;
        ctx.strokeStyle = a.ok ? '#81C784' : '#EF5350'; ctx.lineWidth = 4 * u;
        U.circle(ctx, a.x, a.y, (16 + a.t * 90) * u); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      M.drawFrog(r, ctx);
    }
  };

  /* ============ fall：三轨下落接物（接菜/接快递） ============ */
  M.fall = {
    init(r) {
      r.m = { kind: r.cfg.params.kind, laneX: [0.3, 0.5, 0.7], caught: 0, splats: [], flash: [-9, -9, -9] };
      r.frog.prop = r.cfg.params.prop || null;
    },
    laneOf(x) { const w = RF.view.w; return x < w * 0.4 ? 0 : x < w * 0.62 ? 1 : 2; },
    update(r, dt) {
      const n = r.nextNote();
      if (n) { r.cueX = r.m.laneX[n.lane] * RF.view.w; r.cueY = RF.view.h * 0.62; }
      for (let i = r.m.splats.length - 1; i >= 0; i--) { r.m.splats[i].t += dt; if (r.m.splats[i].t > 0.8) r.m.splats.splice(i, 1); }
    },
    down(r, e) {
      const now = r.now(), u = RF.view.u, m = r.m;
      const lane = this.laneOf(e.x);
      const note = r.pending(r.winG);
      if (!note) { r.setPose('catch', 0.25); return; }
      const ok = lane === note.lane;
      const tier = ok ? J.timeTier(now - note.t, r.winS) : 'M';
      const cx = m.laneX[note.lane] * RF.view.w;
      r.submit(note, tier, { x: cx, y: RF.view.h * 0.56 });
      if (ok && tier !== 'M') {
        m.caught++; m.flash[note.lane] = now;
        r.setPose('catch', 0.35);
        r.setExpr(tier === 'P' ? 'stars' : 'happy', 0.4);
        RF.sfx.pop();
        RF.fx.burst(cx, RF.view.h * 0.6, '#FFD34D', 10, { speed: 170 });
      } else {
        r.setExpr('sad', 0.6);
      }
    },
    up() { },
    miss(r, n) {
      r.setExpr('sad', 0.6);
      r.m.splats.push({ lane: n.lane, t: 0 });
      RF.sfx.bounce();
    },
    draw(r, ctx) {
      const m = r.m, w = RF.view.w, h = RF.view.h, u = RF.view.u, now = r.now();
      const cy = h * 0.62;
      ctx.save();
      /* 轨道 */
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.fillRect(m.laneX[i] * w - w * 0.09, h * 0.2, w * 0.18, cy - h * 0.2 + 20 * u);
      }
      ctx.strokeStyle = 'rgba(139,69,19,0.5)'; ctx.lineWidth = 4 * u;
      ctx.beginPath(); ctx.moveTo(w * 0.16, cy); ctx.lineTo(w * 0.84, cy); ctx.stroke();
      /* 接物区闪光 */
      for (let i = 0; i < 3; i++) {
        const dtF = now - m.flash[i];
        if (dtF >= 0 && dtF < 0.3) {
          ctx.strokeStyle = 'rgba(255,211,77,' + (1 - dtF / 0.3) + ')'; ctx.lineWidth = 5 * u;
          U.circle(ctx, m.laneX[i] * w, cy, (24 + dtF * 120) * u); ctx.stroke();
        }
      }
      /* 下落物 */
      for (const n of r.chart.notes) {
        if (n.judged) continue;
        const dtN = n.t - now;
        if (dtN > 1.15 || dtN < -0.35) continue;
        const k = 1 - Math.max(0, dtN) / 1.15;
        const y = dtN >= 0 ? U.lerp(-30 * u, cy, k) : cy + (-dtN) * 500 * u;
        ctx.save(); ctx.translate(m.laneX[n.lane] * w, y); ctx.rotate(Math.sin(now * 4 + n.i) * 0.2);
        if (m.kind === 'parcel') RF.props.draw(ctx, 'parcel', u);
        else RF.props.draw(ctx, n.i % 2 ? 'carrot' : 'cabbage', u);
        ctx.restore();
      }
      /* 落地碎 */
      for (const s of m.splats) {
        ctx.globalAlpha = 1 - s.t / 0.8;
        ctx.fillStyle = m.kind === 'parcel' ? '#A1887F' : '#8BC34A';
        for (let i = 0; i < 5; i++) U.circle(ctx, m.laneX[s.lane] * w + (i - 2) * 10 * u, cy + 8 * u, 4 * u), ctx.fill();
        ctx.globalAlpha = 1;
      }
      /* 饭碗进度（接菜关） */
      if (m.kind === 'veg') {
        const bx = w - 60 * u, by = 70 * u;
        ctx.fillStyle = '#FFFDE7';
        ctx.beginPath(); ctx.arc(bx, by, 24 * u, 0, Math.PI); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#E0C060'; ctx.lineWidth = 2 * u; ctx.stroke();
        const fill = r.chart.count ? m.caught / r.chart.count : 0;
        ctx.fillStyle = '#FFF9C4';
        ctx.beginPath(); ctx.arc(bx, by, 24 * u * fill, Math.PI, 0); ctx.closePath(); ctx.fill();
        ctx.textAlign = 'center'; ctx.font = '700 ' + 11 * u + 'px system-ui,sans-serif'; ctx.fillStyle = 'rgba(90,60,20,0.7)';
        ctx.fillText('饭碗', bx, by + 38 * u);
      }
      ctx.restore();
      M.drawFrog(r, ctx);
    }
  };

  /* ============ choice：垃圾分类四桶选择 ============ */
  M.choice = {
    ITEMS: [['香蕉皮', '🍌', 0], ['塑料瓶', '🧴', 1], ['废旧电池', '🔋', 2], ['烟头', '🚬', 3], ['苹果核', '🍎', 0], ['旧报纸', '📰', 1], ['过期药品', '💊', 2], ['碎瓷碗', '🥣', 3]],
    BINS: [['厨余垃圾', '#66BB6A', '🥬'], ['可回收物', '#42A5F5', '♻'], ['有害垃圾', '#EF5350', '☠'], ['其他垃圾', '#9E9E9E', '🗑']],
    answer(n) { return this.ITEMS[n.item % 8][2]; },
    init(r) { r.m = { flashBin: -1, flashT: -9 }; r.frog.prop = null; },
    binX(i) { return RF.view.w * (0.2 + 0.2 * i); },
    update(r, dt) { r.cueX = RF.view.w / 2; r.cueY = RF.view.h * 0.3; },
    down(r, e) {
      const now = r.now(), u = RF.view.u;
      const note = r.pending(r.winG);
      if (!note) return;
      const bi = U.clamp(Math.floor(e.x / (RF.view.w / 4)), 0, 3);
      const ans = this.answer(note);
      const ok = bi === ans;
      const tier = ok ? J.timeTier(now - note.t, r.winS) : 'M';
      r.submit(note, tier, { x: this.binX(ans), y: RF.view.h * 0.56 });
      r.m.flashBin = bi; r.m.flashT = now;
      if (ok && tier !== 'M') {
        RF.sfx.pop();
        RF.fx.confetti(this.binX(bi), RF.view.h * 0.6, 10);
        r.setPose('cheer', 0.35); r.setExpr('happy', 0.4);
      } else {
        const it = this.ITEMS[note.item % 8];
        RF.ui.toast('💡 ' + it[0] + ' 属于「' + this.BINS[ans][0] + '」', 1600);
        r.setExpr('sad', 0.6);
      }
    },
    up() { },
    miss(r, n) {
      const it = this.ITEMS[n.item % 8];
      RF.ui.toast('💡 ' + it[0] + ' 属于「' + this.BINS[this.answer(n)][0] + '」', 1600);
      r.setExpr('tense', 0.6);
    },
    draw(r, ctx) {
      const w = RF.view.w, h = RF.view.h, u = RF.view.u, now = r.now();
      ctx.save();
      /* 物品卡 */
      const n = r.chart.notes.find(nn => !nn.judged && nn.t - now < 2.6 && nn.t - now > -0.2);
      if (n) {
        const it = this.ITEMS[n.item % 8];
        ctx.fillStyle = 'rgba(255,253,244,0.95)';
        U.roundRect(ctx, w / 2 - 70 * u, h * 0.24, 140 * u, 76 * u, 14 * u); ctx.fill();
        ctx.strokeStyle = '#FFD34D'; ctx.lineWidth = 3 * u;
        U.roundRect(ctx, w / 2 - 70 * u, h * 0.24, 140 * u, 76 * u, 14 * u); ctx.stroke();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = (34 * u) + 'px system-ui,sans-serif';
        ctx.fillText(it[1], w / 2, h * 0.24 + 30 * u);
        ctx.font = '800 ' + 16 * u + 'px system-ui,sans-serif'; ctx.fillStyle = '#6b4a12';
        ctx.fillText(it[0], w / 2, h * 0.24 + 58 * u);
      }
      /* 四桶 */
      for (let i = 0; i < 4; i++) {
        const b = this.BINS[i], x = this.binX(i), y = h * 0.66;
        const fl = now - r.m.flashT < 0.3 && r.m.flashBin === i;
        ctx.fillStyle = b[1];
        U.roundRect(ctx, x - 30 * u, y - 34 * u, 60 * u, 68 * u, 8 * u); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        U.roundRect(ctx, x - 34 * u, y - 42 * u, 68 * u, 12 * u, 5 * u); ctx.fill();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = (20 * u) + 'px system-ui,sans-serif';
        ctx.fillText(b[2], x, y - 8 * u);
        ctx.font = '800 ' + 11 * u + 'px system-ui,sans-serif'; ctx.fillStyle = '#fff';
        ctx.fillText(b[0], x, y + 18 * u);
        if (fl) {
          ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 4 * u;
          U.roundRect(ctx, x - 36 * u, y - 48 * u, 72 * u, 88 * u, 10 * u); ctx.stroke();
        }
      }
      ctx.restore();
      M.drawFrog(r, ctx);
    }
  };
})();
