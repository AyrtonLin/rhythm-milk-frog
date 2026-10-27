/* 节奏小奶蛙 - 第三阶段机制原型：keys 下落音符多轨（钢琴/吉他/小提琴/笛/鼓/贝斯/二胡/小号/口琴）
   操作：点击轨道 / 键盘 A S D F G H J K 对应轨道 */
(function () {
  const U = RF.util, J = RF.judge;
  const M = RF.mech;

  M.keys = {
    init(r) {
      const p = r.cfg.params;
      r.m = {
        lanes: p.lanes || 4, skin: p.skin || 'piano',
        labels: p.labels || ['1', '2', '3', '4', '5', '6', '7', '8'],
        flash: [], drops: []
      };
      r.frog.prop = p.prop || null;
      r.frog.x = RF.view.w * 0.12;
      r.frog.y = r.groundY - 40 * RF.view.u;
      r.frog.s = RF.view.u * 0.85;
    },
    margin(r) { return RF.view.w * 0.1; },
    laneX(r, i) {
      const w = RF.view.w, m = this.margin(r), n = r.m.lanes;
      return m + (w - 2 * m) * (i + 0.5) / n;
    },
    laneW(r) { const w = RF.view.w, m = this.margin(r); return (w - 2 * m) / r.m.lanes; },
    lineY(r) { return RF.view.h * 0.74; },
    laneOfX(r, x) {
      const w = RF.view.w, m = this.margin(r), n = r.m.lanes;
      return U.clamp(Math.floor((x - m) / ((w - 2 * m) / n)), 0, n - 1);
    },
    update(r, dt) {
      const n = r.nextNote();
      if (n) { r.cueX = this.laneX(r, n.lane); r.cueY = this.lineY(r); }
      for (let i = r.m.flash.length - 1; i >= 0; i--) { r.m.flash[i].t += dt; if (r.m.flash[i].t > 0.4) r.m.flash.splice(i, 1); }
      for (let i = r.m.drops.length - 1; i >= 0; i--) { r.m.drops[i].t += dt; if (r.m.drops[i].t > 0.7) r.m.drops.splice(i, 1); }
    },
    down(r, e) {
      if (e.lane == null && e.dir != null) return;      // 方向键事件在本机制忽略
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
      r.submit(best, tier, { x: this.laneX(r, lane), y: this.lineY(r) - 46 * u });
      r.m.flash.push({ lane, t: 0, ok: tier !== 'M' });
      if (tier !== 'M') {
        RF.sfx.key(lane);
        r.setPose('play', 0.25);
        r.setExpr(tier === 'P' ? 'stars' : 'happy', 0.35);
        RF.fx.burst(this.laneX(r, lane), this.lineY(r), '#FFD34D', 8, { speed: 160, up: 120 });
      } else {
        r.setExpr('tense', 0.5);
        r.m.drops.push({ lane, t: 0 });
      }
    },
    up() { },
    miss(r, n) {
      r.setExpr('tense', 0.5);
      r.m.drops.push({ lane: n.lane, t: 0 });
      RF.sfx.miss();
    },
    draw(r, ctx) {
      const m = r.m, w = RF.view.w, h = RF.view.h, u = RF.view.u, now = r.now();
      const ly = this.lineY(r), lw = this.laneW(r);
      ctx.save();
      /* 轨道 */
      for (let i = 0; i < m.lanes; i++) {
        const x = this.laneX(r, i);
        ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.12)';
        ctx.fillRect(x - lw / 2 + 2, h * 0.16, lw - 4, ly - h * 0.16);
        if (m.skin === 'strings') {
          ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.5 * u;
          ctx.beginPath(); ctx.moveTo(x, h * 0.16); ctx.lineTo(x, ly); ctx.stroke();
        }
      }
      /* 判定线 */
      ctx.strokeStyle = 'rgba(255,211,77,0.9)'; ctx.lineWidth = 4 * u;
      ctx.beginPath(); ctx.moveTo(this.margin(r), ly); ctx.lineTo(w - this.margin(r), ly); ctx.stroke();
      /* 键位行 */
      for (let i = 0; i < m.lanes; i++) {
        const x = this.laneX(r, i);
        const fl = m.flash.find(f => f.lane === i);
        const on = fl && fl.t < 0.2;
        if (m.skin === 'piano') {
          ctx.fillStyle = on ? '#FFE082' : '#FFFDF4';
          U.roundRect(ctx, x - lw / 2 + 3, ly, lw - 6, h * 0.14, 6 * u); ctx.fill();
          ctx.strokeStyle = '#37474F'; ctx.lineWidth = 2 * u;
          U.roundRect(ctx, x - lw / 2 + 3, ly, lw - 6, h * 0.14, 6 * u); ctx.stroke();
          if (i < m.lanes - 1) { ctx.fillStyle = '#263238'; U.roundRect(ctx, x + lw / 2 - 8 * u, ly, 16 * u, h * 0.08, 4 * u); ctx.fill(); }
        } else if (m.skin === 'drums') {
          ctx.fillStyle = on ? '#FFE082' : ['#EF5350', '#42A5F5', '#FFD34D', '#66BB6A', '#BA68C8'][i % 5];
          U.ell(ctx, x, ly + 26 * u, lw * 0.36, 18 * u); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2.5 * u;
          U.ell(ctx, x, ly + 26 * u, lw * 0.36, 18 * u); ctx.stroke();
        } else if (m.skin === 'wind') {
          ctx.fillStyle = on ? '#FFE082' : 'rgba(255,253,244,0.85)';
          U.circle(ctx, x, ly + 22 * u, 16 * u); ctx.fill();
          ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 2.5 * u;
          U.circle(ctx, x, ly + 22 * u, 16 * u); ctx.stroke();
          ctx.fillStyle = '#5D4037'; U.circle(ctx, x, ly + 22 * u, 7 * u); ctx.fill();
        } else { /* strings */
          ctx.fillStyle = on ? '#FFE082' : 'rgba(255,253,244,0.8)';
          U.roundRect(ctx, x - lw * 0.3, ly, lw * 0.6, 34 * u, 8 * u); ctx.fill();
          ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 2 * u;
          U.roundRect(ctx, x - lw * 0.3, ly, lw * 0.6, 34 * u, 8 * u); ctx.stroke();
        }
        ctx.fillStyle = on ? '#5D4037' : 'rgba(255,255,255,0.85)';
        ctx.font = '800 ' + 13 * u + 'px system-ui,sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(m.labels[i] || '', x, ly + (m.skin === 'piano' ? h * 0.07 : 22 * u) + (m.skin === 'piano' ? 0 : 0));
      }
      /* 下落音符 */
      for (const n of r.chart.notes) {
        if (n.judged) continue;
        const dtN = n.t - now;
        if (dtN > 1.4 || dtN < -0.25) continue;
        const k = 1 - Math.max(0, dtN) / 1.4;
        const y = dtN >= 0 ? U.lerp(h * 0.14, ly, k) : ly + (-dtN) * 420 * u;
        const x = this.laneX(r, n.lane);
        ctx.save(); ctx.translate(x, y);
        const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 20 * u);
        g.addColorStop(0, '#FFF9C4'); g.addColorStop(1, '#FFB300');
        ctx.fillStyle = g;
        U.circle(ctx, 0, 0, 15 * u); ctx.fill();
        ctx.fillStyle = '#5D4037';
        ctx.font = '900 ' + 15 * u + 'px system-ui,sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('♪', 0, 1);
        ctx.restore();
      }
      /* 命中闪光 / 漏拍掉落 */
      for (const f of m.flash) {
        const x = this.laneX(r, f.lane);
        ctx.globalAlpha = 1 - f.t / 0.4;
        ctx.strokeStyle = f.ok ? '#FFD34D' : '#EF5350'; ctx.lineWidth = 4 * u;
        U.circle(ctx, x, ly, (18 + f.t * 140) * u); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      for (const d of m.drops) {
        const x = this.laneX(r, d.lane);
        ctx.globalAlpha = 1 - d.t / 0.7;
        ctx.fillStyle = '#90A4AE';
        U.circle(ctx, x, ly + d.t * 300 * u, 10 * u); ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      M.drawFrog(r, ctx);
    }
  };
})();
