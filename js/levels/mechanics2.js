/* 节奏小奶蛙 - 第二阶段机制原型：target 移动目标 / beattap 踩拍家务 / fall 三轨接物 / choice 四桶选择
   接口同 mechanics.js：init/update/draw/down/up/miss */
(function () {
  const U = RF.util, J = RF.judge;
  const M = RF.mech;

  /* ============ target：踩拍点击目标（苍蝇/裂口/衣架/菜篮/花盆） ============ */
  M.target = {
    init(r) {
      r.m = { kind: r.cfg.params.kind, done: {}, doneAt: {}, splats: [], hung: [] };
      r.frog.prop = r.cfg.params.prop || null;
    },
    /* 点击放大反馈 */
    pop(r, n) {
      const dt = r.now() - (r.m.doneAt[n.i] == null ? -9 : r.m.doneAt[n.i]);
      if (dt < 0 || dt > 0.35) return 1;
      return 1 + 0.35 * RF.util.easeOutBack(1 - dt / 0.35) * 0.9;
    },
    /* 办公桌场景（写实：木纹桌+显示器+键盘鼠标+马克杯+文件+笔筒） */
    _desk(ctx, w, h, u, noMonitor) {
      const dg = ctx.createLinearGradient(0, h * 0.6, 0, h * 0.66);
      dg.addColorStop(0, '#A1887F'); dg.addColorStop(1, '#8D6E63');
      ctx.fillStyle = dg;
      U.roundRect(ctx, w * 0.1, h * 0.6, w * 0.8, 16 * u, 6 * u); ctx.fill();
      ctx.fillStyle = '#6D4C41';
      U.roundRect(ctx, w * 0.12, h * 0.6 + 14 * u, w * 0.76, h * 0.05, 4 * u); ctx.fill();
      ctx.fillRect(w * 0.15, h * 0.65 + h * 0.05, 12 * u, h * 0.14);
      ctx.fillRect(w * 0.81, h * 0.65 + h * 0.05, 12 * u, h * 0.14);
      if (!noMonitor) {
        ctx.fillStyle = '#455A64';
        U.ell(ctx, w * 0.5, h * 0.6, 34 * u, 6 * u); ctx.fill();
        ctx.fillStyle = '#546E7A'; U.roundRect(ctx, w * 0.5 - 6 * u, h * 0.52, 12 * u, 26 * u, 3 * u); ctx.fill();
        const bz = ctx.createLinearGradient(w * 0.34, h * 0.28, w * 0.66, h * 0.52);
        bz.addColorStop(0, '#37474F'); bz.addColorStop(1, '#263238');
        ctx.fillStyle = bz; U.roundRect(ctx, w * 0.34, h * 0.28, w * 0.32, h * 0.24, 6 * u); ctx.fill();
        const sc = ctx.createLinearGradient(w * 0.35, h * 0.29, w * 0.65, h * 0.51);
        sc.addColorStop(0, '#4FC3F7'); sc.addColorStop(0.55, '#29B6F6'); sc.addColorStop(1, '#0288D1');
        ctx.fillStyle = sc; U.roundRect(ctx, w * 0.352, h * 0.292, w * 0.296, h * 0.208, 3 * u); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        U.roundRect(ctx, w * 0.37, h * 0.31, w * 0.16, h * 0.1, 3 * u); ctx.fill();
        ctx.fillStyle = '#EF5350'; U.roundRect(ctx, w * 0.37, h * 0.31, w * 0.16, h * 0.022, 2 * u); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        for (let i = 0; i < 3; i++) { U.roundRect(ctx, w * 0.55, h * (0.32 + i * 0.03), w * 0.08, h * 0.016, 2 * u); ctx.fill(); }
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath(); ctx.moveTo(w * 0.352, h * 0.292); ctx.lineTo(w * 0.45, h * 0.292); ctx.lineTo(w * 0.352, h * 0.42); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = '#B0BEC5';
      U.roundRect(ctx, w * 0.4, h * 0.615, w * 0.2, 8 * u, 3 * u); ctx.fill();
      ctx.fillStyle = '#78909C';
      for (let r2 = 0; r2 < 2; r2++) for (let c = 0; c < 12; c++) { U.roundRect(ctx, w * 0.405 + c * w * 0.016, h * 0.617 + r2 * 3.4 * u, w * 0.013, 2.4 * u, 1 * u); ctx.fill(); }
      ctx.fillStyle = '#ECEFF1'; U.ell(ctx, w * 0.63, h * 0.625, 6 * u, 8 * u); ctx.fill();
      ctx.fillStyle = '#EF5350'; U.roundRect(ctx, w * 0.68, h * 0.565, 13 * u, 16 * u, 3 * u); ctx.fill();
      ctx.strokeStyle = '#EF5350'; ctx.lineWidth = 2.5 * u;
      ctx.beginPath(); ctx.arc(w * 0.68 + 15 * u, h * 0.572 + 4 * u, 5 * u, -1.2, 1.2); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.6 * u;
      ctx.beginPath(); ctx.moveTo(w * 0.686 + 4 * u, h * 0.56); ctx.quadraticCurveTo(w * 0.686 + 7 * u, h * 0.548, w * 0.686 + 4 * u, h * 0.536); ctx.stroke();
      ctx.fillStyle = '#FFFDF4';
      U.roundRect(ctx, w * 0.2, h * 0.585, w * 0.1, 3 * u, 1 * u); ctx.fill();
      U.roundRect(ctx, w * 0.205, h * 0.578, w * 0.09, 3 * u, 1 * u); ctx.fill();
      ctx.fillStyle = '#90A4AE'; U.roundRect(ctx, w * 0.76, h * 0.55, 10 * u, 14 * u, 2 * u); ctx.fill();
      ctx.strokeStyle = '#FFD34D'; ctx.lineWidth = 1.6 * u;
      ctx.beginPath(); ctx.moveTo(w * 0.762 + 3 * u, h * 0.55); ctx.lineTo(w * 0.762 + 2 * u, h * 0.52); ctx.moveTo(w * 0.762 + 6 * u, h * 0.55); ctx.lineTo(w * 0.762 + 7 * u, h * 0.515); ctx.stroke();
    },
    posAt(r, n, t) {
      const w = RF.view.w, h = RF.view.h, u = RF.view.u, k = r.m.kind;
      if (k === 'fly') return { x: n.px * w + Math.sin(t * 2.2 + n.ph) * 46 * u, y: n.py * h + Math.cos(t * 1.6 + n.ph) * 34 * u };
      if (k === 'hanger') return { x: w * 0.5 + (t - n.t) * w * 0.28, y: h * 0.34 };
      if (k === 'veg') return { x: (n.side ? 0.68 : 0.32) * w, y: h * 0.46 };
      if (k === 'pipe') return { x: n.px * w, y: h * 0.42 };
      if (k === 'clock') return [{ x: w * 0.26, y: h * 0.56 }, { x: w * 0.5, y: h * 0.4 }, { x: w * 0.74, y: h * 0.56 }][n.i % 3];
      if (k === 'phone') return [{ x: w * 0.3, y: h * 0.56 }, { x: w * 0.5, y: h * 0.6 }, { x: w * 0.7, y: h * 0.56 }][n.i % 3];
      if (k === 'gate') return { x: [0.3, 0.5, 0.7][n.i % 3] * w, y: h * 0.42 };
      if (k === 'code') return { x: (n.side ? 0.57 : 0.43) * w, y: h * 0.395 };
      if (k === 'note') return { x: [0.3, 0.5, 0.7][n.aim % 3] * w, y: [0.42, 0.56][Math.floor(n.aim / 3) % 2] * h };
      if (k === 'exam') return { x: [0.38, 0.62, 0.38, 0.62][n.aim % 4] * w, y: [0.42, 0.42, 0.56, 0.56][n.aim % 4] * h };
      if (k === 'balloon') return { x: [0.2, 0.35, 0.5, 0.65, 0.8][n.aim % 5] * w, y: (0.34 + (n.aim % 2) * 0.08) * h };
      if (k === 'lamp') return { x: [0.2, 0.35, 0.5, 0.65, 0.8][n.aim % 5] * w + 10 * u, y: h * 0.36 };
      if (k === 'chalk') return { x: r.frog.x + 30 * u * r.frog.face, y: r.frog.y - 40 * u };
      if (k === 'data') return { x: w * 0.5 + (n.px - 0.5) * w * 0.24, y: h * 0.4 + (n.py - 0.5) * h * 0.14 };
      if (k === 'wire') return { x: n.px * w, y: h * 0.38 };
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
      r.m.doneAt[note.i] = now;
      if (tier !== 'M') {
        r.setPose(r.m.kind === 'veg' || r.m.kind === 'water' ? 'catch' : 'swing', 0.35);
        r.setExpr(tier === 'P' ? 'stars' : 'happy', 0.5);
        RF.sfx.hit();
        if (r.m.kind === 'lamp') { (r.m.lit = r.m.lit || [])[note.aim % 5] = true; }
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
      if (RF.scenes && RF.scenes[m.kind]) {
        RF.scenes[m.kind](ctx, r, upcoming);
      } else if (m.kind === 'fly') {
        /* 厨房台面 + 餐盘 */
        ctx.fillStyle = '#8D6E63'; U.roundRect(ctx, 0, h * 0.66, w, 12 * u, 4 * u); ctx.fill();
        ctx.fillStyle = '#FFFDF4'; U.ell(ctx, w * 0.5, h * 0.66, 42 * u, 8 * u); ctx.fill();
        ctx.fillStyle = '#FFCC80'; U.ell(ctx, w * 0.5, h * 0.645, 26 * u, 6 * u); ctx.fill();
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
            ctx.fillStyle = '#4FC3F7'; U.roundRect(ctx, p.x - 12 * u, h * 0.6, 24 * u, 18 * u, 4 * u); ctx.fill();
            ctx.strokeStyle = '#0288D1'; ctx.lineWidth = 1.5 * u; U.roundRect(ctx, p.x - 12 * u, h * 0.6, 24 * u, 18 * u, 4 * u); ctx.stroke();
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
        /* 菜摊：雨棚 + 摊桌 */
        for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#EF5350' : '#FFFDF4'; ctx.fillRect(w * 0.16 + i * w * 0.085, h * 0.22, w * 0.085, 16 * u); }
        ctx.fillStyle = '#8D6E63';
        U.roundRect(ctx, w * 0.18, h * 0.52, w * 0.64, 12 * u, 4 * u); ctx.fill();
        ctx.fillRect(w * 0.22, h * 0.52, 8 * u, h * 0.16);
        ctx.fillRect(w * 0.74, h * 0.52, 8 * u, h * 0.16);
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
      } else if (m.kind === 'clock') {
        /* 工位打卡：手机(小)左 / 电脑显示器(大)中 / 平板(中)右 */
        this._desk(ctx, w, h, u);
        const n0 = upcoming[0];
        const actI = n0 && !m.done[n0.i] ? n0.i % 3 : -1;
        const sc0 = n0 ? this.pop(r, n0) : 1;
        /* 左：手机 */
        ctx.save(); ctx.translate(w * 0.26, h * 0.56); ctx.scale(actI === 0 ? sc0 : 1, actI === 0 ? sc0 : 1);
        if (actI === 0) { ctx.fillStyle = 'rgba(255,211,77,' + (0.5 + Math.sin(now * 10) * 0.3).toFixed(3) + ')'; U.circle(ctx, 0, -6 * u, 34 * u); ctx.fill(); }
        RF.props.draw(ctx, 'phone', u * 1.15);
        ctx.restore();
        /* 中：显示器亮屏 */
        if (actI === 1) {
          ctx.save(); ctx.translate(w * 0.5, h * 0.4); ctx.scale(sc0, sc0);
          ctx.fillStyle = 'rgba(255,211,77,' + (0.45 + Math.sin(now * 10) * 0.25).toFixed(3) + ')';
          U.roundRect(ctx, -w * 0.17, -h * 0.13, w * 0.34, h * 0.26, 8 * u); ctx.fill();
          ctx.restore();
        }
        /* 右：平板 */
        ctx.save(); ctx.translate(w * 0.74, h * 0.56); ctx.scale(actI === 2 ? sc0 : 1, actI === 2 ? sc0 : 1);
        if (actI === 2) { ctx.fillStyle = 'rgba(255,211,77,' + (0.5 + Math.sin(now * 10) * 0.3).toFixed(3) + ')'; U.circle(ctx, 0, -6 * u, 40 * u); ctx.fill(); }
        RF.props.draw(ctx, 'tablet', u * 1.25);
        ctx.restore();
      } else if (m.kind === 'phone') {
        /* 桌面三部话机弧形摆放 */
        this._desk(ctx, w, h, u, true);
        const n0 = upcoming[0];
        for (let i = 0; i < 3; i++) {
          const p = this.posAt(r, { i: i }, now);
          const act = n0 && n0.i % 3 === i && !m.done[n0.i];
          const sc = n0 && n0.i % 3 === i ? this.pop(r, n0) : 1;
          ctx.save(); ctx.translate(p.x + (act ? Math.sin(now * 30) * 3 * u : 0), p.y); ctx.scale(sc, sc);
          RF.props.draw(ctx, 'handset', u * 1.4);
          if (act) { ctx.fillStyle = '#fff'; ctx.font = '700 ' + 16 * u + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('♫', 0, -36 * u); }
          ctx.restore();
        }
      } else if (m.kind === 'gate') {
        /* 水管 + 水箱水位 + 三闸门阀轮 */
        ctx.fillStyle = 'rgba(179,229,252,0.5)';
        U.roundRect(ctx, w * 0.86, h * 0.3, w * 0.1, h * 0.24, 6 * u); ctx.fill();
        ctx.strokeStyle = '#90A4AE'; ctx.lineWidth = 3 * u;
        U.roundRect(ctx, w * 0.86, h * 0.3, w * 0.1, h * 0.24, 6 * u); ctx.stroke();
        ctx.fillStyle = '#90A4AE'; ctx.fillRect(0, h * 0.42 - 10 * u, w * 0.86, 20 * u);
        const n0 = upcoming[0];
        for (let i = 0; i < 3; i++) {
          const x = [0.3, 0.5, 0.7][i] * w, y = h * 0.42;
          const act = n0 && n0.i % 3 === i && !m.done[n0.i];
          const sc = n0 && n0.i % 3 === i ? this.pop(r, n0) : 1;
          ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
          ctx.fillStyle = act ? '#EF5350' : '#66BB6A';
          U.roundRect(ctx, -16 * u, -26 * u, 32 * u, 50 * u, 6 * u); ctx.fill();
          ctx.strokeStyle = '#37474F'; ctx.lineWidth = 4 * u;
          U.circle(ctx, 0, -34 * u, 10 * u); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-10 * u, -34 * u); ctx.lineTo(10 * u, -34 * u); ctx.moveTo(0, -44 * u); ctx.lineTo(0, -24 * u); ctx.stroke();
          ctx.fillStyle = '#fff'; ctx.font = '800 ' + 12 * u + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(act ? '开' : '关', 0, -2 * u);
          if (act) { ctx.strokeStyle = 'rgba(79,195,247,0.9)'; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(0, 24 * u); ctx.lineTo(0, 52 * u); ctx.stroke(); }
          ctx.restore();
        }
      } else if (m.kind === 'code') {
        /* 显示器内左右代码面板 */
        this._desk(ctx, w, h, u);
        const n0 = upcoming[0];
        for (const side of [0, 1]) {
          const p = this.posAt(r, { i: 0, side: side }, now);
          const good = n0 ? (n0.side === side) : true;
          const sc = n0 && n0.side === side ? this.pop(r, n0) : 1;
          ctx.save(); ctx.translate(p.x, p.y); ctx.scale(sc, sc);
          ctx.fillStyle = good ? 'rgba(27,94,32,0.94)' : 'rgba(183,28,28,0.94)';
          U.roundRect(ctx, -w * 0.065, -h * 0.085, w * 0.13, h * 0.17, 6 * u); ctx.fill();
          ctx.strokeStyle = good ? '#81C784' : '#EF9A9A'; ctx.lineWidth = 2 * u;
          U.roundRect(ctx, -w * 0.065, -h * 0.085, w * 0.13, h * 0.17, 6 * u); ctx.stroke();
          ctx.fillStyle = '#E8F5E9'; ctx.font = '700 ' + 10 * u + 'px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(good ? 'fn ok() {' : 'fn bug() {', -w * 0.055, -h * 0.045);
          ctx.fillText(good ? '  return 1' : '  crash!', -w * 0.055, -h * 0.005);
          ctx.fillText('}', -w * 0.055, h * 0.035);
          ctx.restore();
        }
      } else if (m.kind === 'data') {
        /* 显示器内表单 + 浮现数据卡 */
        this._desk(ctx, w, h, u);
        for (const n of upcoming) {
          const p = this.posAt(r, n, now);
          const sc = this.pop(r, n);
          ctx.save(); ctx.translate(p.x, p.y); ctx.scale(sc, sc);
          ctx.fillStyle = 'rgba(255,211,77,0.96)';
          U.roundRect(ctx, -38 * u, -18 * u, 76 * u, 36 * u, 7 * u); ctx.fill();
          ctx.strokeStyle = '#F57F17'; ctx.lineWidth = 1.6 * u;
          U.roundRect(ctx, -38 * u, -18 * u, 76 * u, 36 * u, 7 * u); ctx.stroke();
          ctx.fillStyle = '#37474F'; ctx.font = '800 ' + 14 * u + 'px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText((n.i * 37 % 90 + 10) + '.' + (n.i * 17 % 10), 0, -4 * u);
          ctx.font = '600 ' + 8.5 * u + 'px system-ui,sans-serif'; ctx.fillStyle = '#6b4a12';
          ctx.fillText('点击留存', 0, 10 * u);
          ctx.restore();
        }
      } else if (m.kind === 'wire') {
        /* 墙面桥架 + 两端接线箱 + 断点 */
        ctx.fillStyle = '#78909C';
        U.roundRect(ctx, 0, h * 0.38 - 8 * u, w, 16 * u, 4 * u); ctx.fill();
        ctx.fillStyle = '#546E7A';
        U.roundRect(ctx, w * 0.02, h * 0.34, w * 0.06, h * 0.1, 4 * u); ctx.fill();
        U.roundRect(ctx, w * 0.92, h * 0.34, w * 0.06, h * 0.1, 4 * u); ctx.fill();
        for (const n of upcoming) {
          const p = this.posAt(r, n, now);
          const sc = this.pop(r, n);
          ctx.save(); ctx.translate(p.x, p.y); ctx.scale(sc, sc);
          ctx.strokeStyle = '#37474F'; ctx.lineWidth = 5 * u;
          ctx.beginPath(); ctx.moveTo(-62 * u, 0); ctx.lineTo(-10 * u, 0); ctx.moveTo(10 * u, 0); ctx.lineTo(62 * u, 0); ctx.stroke();
          if (!m.done[n.i]) {
            ctx.fillStyle = 'rgba(255,235,59,' + (0.6 + Math.sin(now * 20) * 0.4).toFixed(3) + ')';
            for (let i = 0; i < 4; i++) { const a = now * 8 + i * 1.57; U.circle(ctx, Math.cos(a) * 9 * u, Math.sin(a) * 9 * u, 3 * u); ctx.fill(); }
          } else {
            ctx.fillStyle = '#FFD34D'; U.roundRect(ctx, -11 * u, -9 * u, 22 * u, 18 * u, 4 * u); ctx.fill();
          }
          ctx.restore();
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
        if (m.kind === 'tri') RF.sfx.ting();
        else if (m.kind === 'dish' || m.kind === 'sweep') RF.sfx.swish();
        else RF.sfx.pop();
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
      else if (m.kind === 'sweep') { r.setPose('slip', 0.7); r.setExpr('dizzy', 0.9); }
      else if (m.kind === 'tri') { RF.sfx.bounce(); r.setExpr('tense', 0.6); }
      else { r.setPose('hide', 0.5); r.setExpr('tense', 0.8); }
    },
    draw(r, ctx) {
      const m = r.m, w = RF.view.w, h = RF.view.h, u = RF.view.u, now = r.now();
      ctx.save();
      if (RF.scenes && RF.scenes['tap_' + m.kind]) {
        RF.scenes['tap_' + m.kind](ctx, r);
      } else if (m.kind === 'dish') {
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
      } else if (m.kind === 'sweep') {
        for (const n of r.chart.notes) {
          if (n.judged) continue;
          if (n.t - now > 2.4) continue;
          ctx.fillStyle = 'rgba(121,85,72,0.55)';
          U.ell(ctx, n.px * w, n.py * h, 26 * u, 14 * u, 0.3); ctx.fill();
          U.ell(ctx, n.px * w + 14 * u, n.py * h + 6 * u, 12 * u, 7 * u, -0.4); ctx.fill();
        }
      } else if (m.kind === 'tri') {
        /* 三角铁 */
        const cx = w / 2, cy = h * 0.48;
        ctx.strokeStyle = '#B0BEC5'; ctx.lineWidth = 6 * u;
        ctx.beginPath(); ctx.moveTo(cx, cy - 34 * u); ctx.lineTo(cx + 34 * u, cy + 24 * u); ctx.lineTo(cx - 34 * u, cy + 24 * u); ctx.closePath(); ctx.stroke();
        ctx.strokeStyle = '#78909C'; ctx.lineWidth = 2 * u;
        ctx.beginPath(); ctx.moveTo(cx, cy - 46 * u); ctx.lineTo(cx, cy - 34 * u); ctx.stroke();
        const hit = m.anims.find(a => a.ok && a.t < 0.3);
        if (hit) {
          ctx.strokeStyle = 'rgba(255,255,255,' + (1 - hit.t / 0.3).toFixed(3) + ')'; ctx.lineWidth = 3 * u;
          for (let i = 0; i < 6; i++) {
            const a = i / 6 * U.TAU + hit.t * 6;
            ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 40 * u, cy + Math.sin(a) * 40 * u);
            ctx.lineTo(cx + Math.cos(a) * 56 * u, cy + Math.sin(a) * 56 * u); ctx.stroke();
          }
        }
      } else if (m.kind === 'slack') {
        /* 工位显示器 */
        const cx = w / 2, cy = h * 0.46;
        ctx.fillStyle = '#37474F'; U.roundRect(ctx, cx - 70 * u, cy - 46 * u, 140 * u, 92 * u, 8 * u); ctx.fill();
        ctx.fillStyle = m.clean % 2 ? '#81C784' : '#4FC3F7';
        U.roundRect(ctx, cx - 62 * u, cy - 38 * u, 124 * u, 76 * u, 4 * u); ctx.fill();
        ctx.fillStyle = '#263238'; U.roundRect(ctx, cx - 10 * u, cy + 46 * u, 20 * u, 14 * u, 3 * u); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '700 ' + 12 * u + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(m.clean % 2 ? 'WORK.EXE' : 'GAME.EXE', cx, cy);
        /* 经理巡查 */
        const n2 = r.nextNote();
        if (n2 && n2.t - now < 1.2) {
          const mx = w * 0.1 + (1 - (n2.t - now) / 1.2) * w * 0.12;
          ctx.fillStyle = '#455A64';
          U.ell(ctx, mx, h * 0.52, 14 * u, 26 * u); ctx.fill();
          ctx.fillStyle = '#FFCC80'; U.circle(ctx, mx, h * 0.52 - 30 * u, 10 * u); ctx.fill();
          ctx.fillStyle = '#EF5350'; ctx.font = '800 ' + 12 * u + 'px system-ui,sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('经理', mx, h * 0.52 - 48 * u);
        }
      } else if (m.kind === 'boss') {
        /* 主管回头 */
        const n = r.nextNote();
        const turning = n && n.t - now < 1.0;
        const bx = w / 2, by = h * 0.3;
        ctx.fillStyle = '#546E7A';
        U.ell(ctx, bx, by + 16 * u, 26 * u, 30 * u); ctx.fill();
        ctx.fillStyle = '#FFCC80'; U.circle(ctx, bx, by - 18 * u, 16 * u); ctx.fill();
        ctx.fillStyle = '#37474F';
        if (turning) { U.circle(ctx, bx - 5 * u, by - 20 * u, 2.5 * u); ctx.fill(); U.circle(ctx, bx + 5 * u, by - 20 * u, 2.5 * u); ctx.fill(); }
        else { U.ell(ctx, bx, by - 18 * u, 14 * u, 10 * u); ctx.fill(); }
        ctx.fillStyle = turning ? '#EF5350' : 'rgba(255,255,255,0.6)';
        ctx.font = '800 ' + 13 * u + 'px system-ui,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(turning ? '回头了!' : '工作中…', bx, by - 44 * u);
        ctx.fillStyle = '#78909C'; U.roundRect(ctx, w * 0.2, h * 0.56, w * 0.6, 12 * u, 4 * u); ctx.fill();
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
      if (RF.scenes && RF.scenes['fall_' + m.kind]) {
        RF.scenes['fall_' + m.kind](ctx, r);
      } else if (m.kind === 'parcel') {
        /* 快递柜墙 */
        for (let ry = 0; ry < 3; ry++) for (let cx2 = 0; cx2 < 6; cx2++) {
          ctx.fillStyle = (ry + cx2) % 2 ? '#B0BEC5' : '#90A4AE';
          U.roundRect(ctx, w * 0.1 + cx2 * w * 0.135, h * 0.14 + ry * h * 0.1, w * 0.12, h * 0.085, 4 * u); ctx.fill();
          ctx.strokeStyle = '#607D8B'; ctx.lineWidth = 1.5 * u;
          U.roundRect(ctx, w * 0.1 + cx2 * w * 0.135, h * 0.14 + ry * h * 0.1, w * 0.12, h * 0.085, 4 * u); ctx.stroke();
        }
      } else {
        /* 打菜窗口 + 阿姨 + 接菜台 */
        ctx.fillStyle = '#8D6E63'; U.roundRect(ctx, w * 0.2, h * 0.1, w * 0.6, 14 * u, 4 * u); ctx.fill();
        ctx.fillStyle = '#F48FB1'; U.circle(ctx, w * 0.5, h * 0.075, 16 * u); ctx.fill();
        ctx.fillStyle = '#FFFDF4'; U.circle(ctx, w * 0.5, h * 0.068, 10 * u); ctx.fill();
        ctx.fillStyle = '#8D6E63'; U.roundRect(ctx, w * 0.14, h * 0.68, w * 0.72, 12 * u, 4 * u); ctx.fill();
      }
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
        if (RF.scenes && RF.scenes['item_' + m.kind]) RF.scenes['item_' + m.kind](ctx, r, n, u);
        else if (m.kind === 'parcel') RF.props.draw(ctx, 'parcel', u);
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

  /* ============ tri：开会三键选择（电话/闹钟/消息） ============ */
  M.tri = {
    SCEN: [['电话铃', '📞', 0], ['闹钟响', '⏰', 1], ['消息弹窗', '💬', 2]],
    BTNS: [['接电话', '#66BB6A'], ['关闹钟', '#42A5F5'], ['稍后读', '#FFB300']],
    answer(n) { return n.item % 3; },
    init(r) { r.m = { fb: -1, ft: -9 }; r.frog.prop = null; },
    btnX(i) { return RF.view.w * (0.3 + 0.2 * i); },
    update(r, dt) { r.cueX = RF.view.w / 2; r.cueY = RF.view.h * 0.3; },
    down(r, e) {
      const now = r.now(), u = RF.view.u;
      const note = r.pending(r.winG);
      if (!note) return;
      let bi = 0, bd = 1e9;
      for (let i = 0; i < 3; i++) { const d = Math.abs(e.x - this.btnX(i)); if (d < bd) { bd = d; bi = i; } }
      const ok = bi === this.answer(note);
      const tier = ok ? J.timeTier(now - note.t, r.winS) : 'M';
      r.submit(note, tier, { x: this.btnX(bi), y: RF.view.h * 0.6 });
      r.m.fb = bi; r.m.ft = now;
      if (ok && tier !== 'M') {
        RF.sfx.pop(); RF.fx.confetti(this.btnX(bi), RF.view.h * 0.62, 8);
        r.setPose('cheer', 0.3); r.setExpr('happy', 0.4);
      } else {
        const sc = this.SCEN[note.item % 3];
        RF.ui.toast('💡 ' + sc[0] + ' 应点「' + this.BTNS[this.answer(note)][0] + '」', 1500);
        r.setExpr('sad', 0.6);
      }
    },
    up() { },
    miss(r, n) {
      const sc = this.SCEN[n.item % 3];
      RF.ui.toast('💡 ' + sc[0] + ' 应点「' + this.BTNS[this.answer(n)][0] + '」', 1500);
      r.setExpr('tense', 0.7);
    },
    draw(r, ctx) {
      const w = RF.view.w, h = RF.view.h, u = RF.view.u, now = r.now();
      ctx.save();
      const n = r.chart.notes.find(nn => !nn.judged && nn.t - now < 2.6 && nn.t - now > -0.2);
      if (n) {
        const sc = this.SCEN[n.item % 3];
        ctx.fillStyle = 'rgba(255,253,244,0.95)';
        U.roundRect(ctx, w / 2 - 84 * u, h * 0.24, 168 * u, 70 * u, 14 * u); ctx.fill();
        ctx.strokeStyle = '#EF5350'; ctx.lineWidth = 3 * u;
        U.roundRect(ctx, w / 2 - 84 * u, h * 0.24, 168 * u, 70 * u, 14 * u); ctx.stroke();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = (26 * u) + 'px system-ui,sans-serif';
        ctx.fillText(sc[1], w / 2 - 40 * u, h * 0.24 + 35 * u);
        ctx.font = '900 ' + 18 * u + 'px system-ui,sans-serif'; ctx.fillStyle = '#6b4a12';
        ctx.fillText(sc[0] + '！', w / 2 + 18 * u, h * 0.24 + 35 * u);
      }
      /* 会议桌 */
      ctx.fillStyle = '#6D4C41';
      U.ell(ctx, w / 2, h * 0.68, w * 0.36, h * 0.1); ctx.fill();
      ctx.fillStyle = '#8D6E63';
      U.ell(ctx, w / 2, h * 0.66, w * 0.36, h * 0.1); ctx.fill();
      for (let i = 0; i < 3; i++) {
        const b = this.BTNS[i], x = this.btnX(i), y = h * 0.64;
        const fl = now - r.m.ft < 0.3 && r.m.fb === i;
        ctx.fillStyle = b[1];
        U.roundRect(ctx, x - 46 * u, y - 27 * u, 92 * u, 54 * u, 12 * u); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '800 ' + 15 * u + 'px system-ui,sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(b[0], x, y);
        if (fl) { ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 4 * u; U.roundRect(ctx, x - 52 * u, y - 33 * u, 104 * u, 66 * u, 14 * u); ctx.stroke(); }
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
      const n = r.chart.notes.find(nn => !nn.judged && nn.t - now < 2.6 && nn.t - now > -0.2);
      /* 背景对照表：物品 → 垃圾桶（当前物品金框高亮） */
      const fs = Math.max(10, 9.5 * u);
      ctx.fillStyle = 'rgba(255,253,244,0.6)';
      U.roundRect(ctx, w * 0.03, h * 0.075, w * 0.94, h * 0.155, 10 * u); ctx.fill();
      ctx.strokeStyle = 'rgba(139,110,99,0.5)'; ctx.lineWidth = 2 * u;
      U.roundRect(ctx, w * 0.03, h * 0.075, w * 0.94, h * 0.155, 10 * u); ctx.stroke();
      const actItem = n ? n.item % 8 : -1;
      for (let i = 0; i < 8; i++) {
        const col = i % 2, row = Math.floor(i / 2);
        const cx0 = w * 0.05 + col * w * 0.47;
        const cy0 = h * 0.093 + row * h * 0.036;
        const it = this.ITEMS[i], bin = this.BINS[it[2]];
        if (i === actItem) {
          ctx.strokeStyle = '#FFB300'; ctx.lineWidth = 3 * u;
          U.roundRect(ctx, cx0 - 6 * u, cy0 - h * 0.017, w * 0.44, h * 0.034, 6 * u); ctx.stroke();
          ctx.fillStyle = 'rgba(255,211,77,0.25)';
          U.roundRect(ctx, cx0 - 6 * u, cy0 - h * 0.017, w * 0.44, h * 0.034, 6 * u); ctx.fill();
        }
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.font = (fs + 2) + 'px system-ui,sans-serif';
        ctx.fillText(it[1], cx0, cy0);
        ctx.font = '700 ' + fs + 'px system-ui,sans-serif'; ctx.fillStyle = '#5D4037';
        ctx.fillText(it[0], cx0 + fs + 6 * u, cy0);
        ctx.fillStyle = bin[1];
        U.circle(ctx, cx0 + w * 0.24, cy0, 5 * u); ctx.fill();
        ctx.font = '700 ' + fs + 'px system-ui,sans-serif'; ctx.fillStyle = '#5D4037';
        ctx.fillText(bin[0], cx0 + w * 0.24 + 8 * u, cy0);
      }
      /* 物品卡 */
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
      /* 分类站台面 + 标牌 */
      ctx.fillStyle = 'rgba(141,110,99,0.6)';
      U.roundRect(ctx, w * 0.1, h * 0.72, w * 0.8, 10 * u, 4 * u); ctx.fill();
      /* 分类站标牌（下移避免遮挡对照表） */
      ctx.fillStyle = '#FFFDF4'; U.roundRect(ctx, w * 0.36, h * 0.5, w * 0.28, h * 0.055, 8 * u); ctx.fill();
      ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 2.5 * u; U.roundRect(ctx, w * 0.36, h * 0.5, w * 0.28, h * 0.055, 8 * u); ctx.stroke();
      ctx.fillStyle = '#6b4a12'; ctx.font = '800 ' + 13 * u + 'px system-ui,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('垃圾分类站', w / 2, h * 0.5275);
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
