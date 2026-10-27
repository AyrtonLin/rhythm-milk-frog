/* 节奏小奶蛙 - 第三阶段机制原型：keys 下落音符多轨（完整乐器画面版）
   皮肤：piano 钢琴键盘 / strings 弦乐器(吉他/贝斯/小提琴/二胡) / wind 管乐(笛/小号/口琴) / drums 架子鼓套件
   操作：点击轨道或键盘 A S D F G H J K；命中奏出对应乐器音色 */
(function () {
  const U = RF.util, J = RF.judge;
  const M = RF.mech;

  M.keys = {
    init(r) {
      const p = r.cfg.params;
      r.m = {
        lanes: p.lanes || 4, skin: p.skin || 'piano', voice: p.voice || 'piano',
        labels: p.labels || ['1', '2', '3', '4', '5', '6', '7', '8'],
        flash: [], drops: []
      };
      r.frog.prop = p.prop || null;
      r.frog.x = RF.view.w * 0.09;
      r.frog.y = r.groundY - 42 * RF.view.u;
      r.frog.s = RF.view.u * 0.8;
    },
    margin(r) { return RF.view.w * 0.1; },
    laneW(r) { const w = RF.view.w, m = this.margin(r); return (w - 2 * m) / r.m.lanes; },
    laneX(r, i) { const w = RF.view.w, m = this.margin(r), n = r.m.lanes; return m + (w - 2 * m) * (i + 0.5) / n; },
    laneY(r, i) {
      const h = RF.view.h;
      if (r.m.skin === 'drums') return h * [0.68, 0.56, 0.44, 0.6, 0.5][i % 5];
      if (r.m.skin === 'stairs') return h * 0.72 - i * h * 0.07;
      return h * 0.72;
    },
    lineY(r) { return RF.view.h * 0.72; },
    laneOfX(r, x) {
      const w = RF.view.w, m = this.margin(r), n = r.m.lanes;
      return U.clamp(Math.floor((x - m) / ((w - 2 * m) / n)), 0, n - 1);
    },
    update(r, dt) {
      const n = r.nextNote();
      if (n) { r.cueX = this.laneX(r, n.lane); r.cueY = this.laneY(r, n.lane); }
      for (let i = r.m.flash.length - 1; i >= 0; i--) { r.m.flash[i].t += dt; if (r.m.flash[i].t > 0.4) r.m.flash.splice(i, 1); }
      for (let i = r.m.drops.length - 1; i >= 0; i--) { r.m.drops[i].t += dt; if (r.m.drops[i].t > 0.7) r.m.drops.splice(i, 1); }
    },
    down(r, e) {
      if (e.lane == null && e.dir != null) return;
      const now = r.now(), u = RF.view.u;
      const lane = e.lane != null ? e.lane : this.laneOfX(r, e.x);
      let best = null, bd = 1e9;
      for (const n of r.chart.notes) {
        if (n.judged || n.lane !== lane) continue;
        const d = now - n.t;
        if (Math.abs(d) <= r.winG && Math.abs(d) < Math.abs(bd)) { bd = d; best = n; }
      }
      if (!best) { r.m.flash.push({ lane, t: 0, ok: false }); RF.sfx.whoosh(); return; }
      const tier = J.timeTier(bd, r.winS);
      r.submit(best, tier, { x: this.laneX(r, lane), y: this.laneY(r, lane) - 46 * u });
      r.m.flash.push({ lane, t: 0, ok: tier !== 'M' });
      if (tier !== 'M') {
        RF.sfx.inst(r.m.voice, lane);
        r.setPose('play', 0.25);
        r.setExpr(tier === 'P' ? 'stars' : 'happy', 0.35);
        RF.fx.burst(this.laneX(r, lane), this.laneY(r, lane), '#FFD34D', 8, { speed: 160, up: 120 });
      } else {
        r.setExpr('tense', 0.5);
        r.m.drops.push({ lane, t: 0 });
      }
    },
    up() { },
    miss(r, n) {
      r.setExpr('tense', 0.5);
      r.m.drops.push({ lane: n.lane, t: 0 });
    },
    draw(r, ctx) {
      const m = r.m, w = RF.view.w, h = RF.view.h, u = RF.view.u, now = r.now();
      const lw = this.laneW(r);
      ctx.save();
      /* 轨道背景 */
      for (let i = 0; i < m.lanes; i++) {
        const x = this.laneX(r, i), y = this.laneY(r, i);
        ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)';
        ctx.fillRect(x - lw / 2 + 2, h * 0.12, lw - 4, y - h * 0.12);
      }
      /* ---- 完整乐器画面 ---- */
      const kp = RF.scenes && RF.scenes['keys_' + m.skin];
      if (kp) { kp(ctx, r); }
      else if (m.skin === 'piano') {
        const ly = this.lineY(r);
        /* 琴身 */
        ctx.fillStyle = '#263238';
        U.roundRect(ctx, this.margin(r) - 10 * u, ly - 6 * u, w - 2 * this.margin(r) + 20 * u, h * 0.2, 10 * u); ctx.fill();
        for (let i = 0; i < m.lanes; i++) {
          const x = this.laneX(r, i);
          const on = m.flash.find(f => f.lane === i && f.t < 0.2);
          ctx.fillStyle = on ? '#FFE082' : '#FFFDF4';
          U.roundRect(ctx, x - lw / 2 + 4, ly + (on ? 4 * u : 0), lw - 8, h * 0.17, 5 * u); ctx.fill();
          ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5 * u;
          U.roundRect(ctx, x - lw / 2 + 4, ly + (on ? 4 * u : 0), lw - 8, h * 0.17, 5 * u); ctx.stroke();
          if (i < m.lanes - 1) { ctx.fillStyle = '#111'; U.roundRect(ctx, x + lw / 2 - 9 * u, ly, 18 * u, h * 0.1, 4 * u); ctx.fill(); }
          ctx.fillStyle = '#546E7A'; ctx.font = '700 ' + 12 * u + 'px system-ui,sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(m.labels[i], x, ly + h * 0.14);
        }
      } else if (m.skin === 'strings') {
        const ly = this.lineY(r);
        const voice = m.voice;
        /* 琴头（顶） */
        ctx.fillStyle = '#5D4037';
        U.roundRect(ctx, this.margin(r), h * 0.1, w - 2 * this.margin(r), 16 * u, 6 * u); ctx.fill();
        for (let i = 0; i < m.lanes; i++) {
          const x = this.laneX(r, i);
          ctx.fillStyle = '#FFD34D'; U.circle(ctx, x, h * 0.1 + 8 * u, 4 * u); ctx.fill();
        }
        /* 琴身（底） */
        const bw = w * (voice === 'violin' || voice === 'erhu' ? 0.4 : 0.56), bx = w / 2, by = ly + h * 0.1;
        ctx.fillStyle = voice === 'erhu' ? '#6D4C41' : '#8D6E63';
        ctx.beginPath();
        ctx.ellipse(bx, by, bw / 2, h * 0.11, 0, 0, U.TAU); ctx.fill();
        ctx.fillStyle = '#5D4037';
        ctx.beginPath(); ctx.ellipse(bx, by, bw / 2, h * 0.11, 0, Math.PI, 0); ctx.fill();
        if (voice === 'guitar' || voice === 'bass') {
          ctx.fillStyle = '#3E2723'; U.circle(ctx, bx, by - h * 0.02, 16 * u); ctx.fill();
        }
        /* 琴桥=判定线 */
        ctx.fillStyle = '#3E2723';
        U.roundRect(ctx, this.margin(r), ly - 4 * u, w - 2 * this.margin(r), 8 * u, 4 * u); ctx.fill();
        /* 琴弦 */
        for (let i = 0; i < m.lanes; i++) {
          const x = this.laneX(r, i);
          const vib = m.flash.find(f => f.lane === i && f.t < 0.3);
          ctx.strokeStyle = 'rgba(255,249,196,0.85)'; ctx.lineWidth = (1 + i * 0.4) * u;
          ctx.beginPath(); ctx.moveTo(x, h * 0.1 + 14 * u);
          if (vib) {
            for (let yy = h * 0.12; yy < ly; yy += 14 * u) {
              ctx.lineTo(x + Math.sin(yy * 0.15 + vib.t * 60) * 5 * u * (1 - vib.t / 0.3), yy);
            }
          }
          ctx.lineTo(x, ly); ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '700 ' + 12 * u + 'px system-ui,sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(m.labels[i], x, by + h * 0.02);
        }
      } else if (m.skin === 'wind') {
        const ly = this.lineY(r) + 26 * u;
        const voice = m.voice;
        if (voice === 'trumpet') {
          ctx.strokeStyle = '#FFC107'; ctx.lineWidth = 14 * u; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(this.margin(r), ly); ctx.lineTo(w - this.margin(r) - 30 * u, ly); ctx.stroke();
          ctx.fillStyle = '#FFC107';
          ctx.beginPath(); ctx.moveTo(w - this.margin(r) - 34 * u, ly - 8 * u);
          ctx.lineTo(w - this.margin(r), ly - 26 * u); ctx.lineTo(w - this.margin(r), ly + 26 * u);
          ctx.lineTo(w - this.margin(r) - 34 * u, ly + 8 * u); ctx.closePath(); ctx.fill();
        } else if (voice === 'harmonica') {
          ctx.fillStyle = '#B0BEC5';
          U.roundRect(ctx, this.margin(r), ly - 12 * u, w - 2 * this.margin(r), 24 * u, 6 * u); ctx.fill();
          ctx.fillStyle = '#78909C';
          U.roundRect(ctx, this.margin(r), ly - 12 * u, w - 2 * this.margin(r), 8 * u, 4 * u); ctx.fill();
        } else { /* flute */
          ctx.strokeStyle = '#FFCA28'; ctx.lineWidth = 10 * u; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(this.margin(r), ly); ctx.lineTo(w - this.margin(r), ly); ctx.stroke();
        }
        for (let i = 0; i < m.lanes; i++) {
          const x = this.laneX(r, i);
          const on = m.flash.find(f => f.lane === i && f.t < 0.25);
          ctx.fillStyle = on ? '#FFF9C4' : '#4E342E';
          U.circle(ctx, x, ly, (voice === 'harmonica' ? 7 : 9) * u); ctx.fill();
          if (on) {
            ctx.strokeStyle = 'rgba(255,255,255,' + (1 - on.t / 0.25).toFixed(3) + ')'; ctx.lineWidth = 3 * u;
            U.circle(ctx, x, ly - 16 * u, (8 + on.t * 60) * u); ctx.stroke();
          }
          ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '700 ' + 12 * u + 'px system-ui,sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(m.labels[i], x, ly + 26 * u);
        }
      } else if (m.skin === 'drums') {
        /* 架子鼓套件：每轨一件鼓/镲 */
        for (let i = 0; i < m.lanes; i++) {
          const x = this.laneX(r, i), y = this.laneY(r, i);
          const on = m.flash.find(f => f.lane === i && f.t < 0.2);
          const kind = i % 5;
          if (kind === 2 || kind === 4) {  /* 镲 */
            ctx.fillStyle = on ? '#FFF59D' : '#FFD34D';
            U.ell(ctx, x, y, lw * 0.34, 8 * u); ctx.fill();
            ctx.strokeStyle = '#B8860B'; ctx.lineWidth = 2 * u;
            U.ell(ctx, x, y, lw * 0.34, 8 * u); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 40 * u); ctx.stroke();
          } else {                          /* 鼓 */
            const rr2 = kind === 0 ? lw * 0.4 : lw * 0.3;
            ctx.fillStyle = kind === 0 ? '#B71C1C' : kind === 1 ? '#1565C0' : '#6A1B9A';
            U.ell(ctx, x, y + 10 * u, rr2, rr2 * 0.75); ctx.fill();
            ctx.fillStyle = on ? '#FFF9C4' : '#ECEFF1';
            U.ell(ctx, x, y, rr2, rr2 * 0.42); ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2 * u;
            U.ell(ctx, x, y, rr2, rr2 * 0.42); ctx.stroke();
          }
          ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '800 ' + 12 * u + 'px system-ui,sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(m.labels[i], x, y + (kind === 2 || kind === 4 ? 52 : 34) * u);
        }
      }
      /* 下落音符 */
      for (const n of r.chart.notes) {
        if (n.judged) continue;
        const dtN = n.t - now;
        if (dtN > 1.4 || dtN < -0.25) continue;
        const ly2 = this.laneY(r, n.lane);
        const k = 1 - Math.max(0, dtN) / 1.4;
        const y = dtN >= 0 ? U.lerp(h * 0.1, ly2, k) : ly2 + (-dtN) * 420 * u;
        const x = this.laneX(r, n.lane);
        ctx.save(); ctx.translate(x, y);
        const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 20 * u);
        g.addColorStop(0, '#FFF9C4'); g.addColorStop(1, '#FFB300');
        ctx.fillStyle = g;
        U.circle(ctx, 0, 0, 15 * u); ctx.fill();
        ctx.fillStyle = '#5D4037'; ctx.font = '900 ' + 15 * u + 'px system-ui,sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('♪', 0, 1);
        ctx.restore();
      }
      /* 命中闪光 / 漏拍 */
      for (const f of m.flash) {
        const x = this.laneX(r, f.lane), y = this.laneY(r, f.lane);
        ctx.globalAlpha = 1 - f.t / 0.4;
        ctx.strokeStyle = f.ok ? '#FFD34D' : '#EF5350'; ctx.lineWidth = 4 * u;
        U.circle(ctx, x, y, (18 + f.t * 140) * u); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      for (const d of m.drops) {
        const x = this.laneX(r, d.lane);
        ctx.globalAlpha = 1 - d.t / 0.7;
        ctx.fillStyle = '#90A4AE';
        U.circle(ctx, x, this.laneY(r, d.lane) + d.t * 300 * u, 10 * u); ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      M.drawFrog(r, ctx);
    }
  };
})();
