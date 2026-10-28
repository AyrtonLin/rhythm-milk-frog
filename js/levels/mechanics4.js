/* 节奏小奶蛙 - 第五/六阶段场景画家 + 拍照姿势机制 + 关卡场景注册表 RF.scenes */
(function () {
  const U = RF.util;
  const M = RF.mech;
  const S = RF.scenes = {};

  /* ---------- 第五阶段 ---------- */
  S.chalk = function (ctx, r, upcoming) {   // 躲粉笔：黑板+讲台+飞来的粉笔
    const w = RF.view.w, h = RF.view.h, u = RF.view.u, now = r.now();
    ctx.fillStyle = '#2E7D32';
    U.roundRect(ctx, w * 0.08, h * 0.14, w * 0.84, h * 0.3, 8 * u); ctx.fill();
    ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 6 * u;
    U.roundRect(ctx, w * 0.08, h * 0.14, w * 0.84, h * 0.3, 8 * u); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2 * u;
    ctx.beginPath(); ctx.moveTo(w * 0.14, h * 0.22); ctx.lineTo(w * 0.4, h * 0.22); ctx.moveTo(w * 0.14, h * 0.3); ctx.lineTo(w * 0.34, h * 0.3); ctx.stroke();
    /* 老师 */
    ctx.fillStyle = '#5D4037';
    U.ell(ctx, w * 0.16, h * 0.5, 16 * u, 26 * u); ctx.fill();
    ctx.fillStyle = '#FFCC80'; U.circle(ctx, w * 0.16, h * 0.5 - 30 * u, 12 * u); ctx.fill();
    for (const n of upcoming) {
      const k = U.clamp(1 - (n.t - now) / 0.9, 0, 1);
      const x = U.lerp(w * 0.18, r.frog.x, k), y = U.lerp(h * 0.46, r.frog.y - 40 * u, k) - Math.sin(k * Math.PI) * 60 * u;
      ctx.save(); ctx.translate(x, y); ctx.rotate(k * 12);
      ctx.fillStyle = '#FFFDF4'; U.roundRect(ctx, -8 * u, -3 * u, 16 * u, 6 * u, 3 * u); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2 * u;
      ctx.beginPath(); ctx.moveTo(x - 20 * u, y - 8 * u); ctx.lineTo(x, y); ctx.stroke();
    }
  };
  S.note = function (ctx, r, upcoming) {   // 传纸条：教室课桌阵+举手同学+讲台老师
    const w = RF.view.w, h = RF.view.h, u = RF.view.u, now = r.now();
    ctx.fillStyle = '#8D6E63'; U.roundRect(ctx, w * 0.78, h * 0.2, w * 0.14, h * 0.12, 4 * u); ctx.fill();
    ctx.fillStyle = '#5D4037'; U.ell(ctx, w * 0.85, h * 0.19, 12 * u, 18 * u); ctx.fill();
    ctx.fillStyle = '#FFCC80'; U.circle(ctx, w * 0.85, h * 0.16, 9 * u); ctx.fill();
    for (let gy = 0; gy < 2; gy++) for (let gx = 0; gx < 3; gx++) {
      const idx = gy * 3 + gx;
      const x = [0.3, 0.5, 0.7][gx] * w, y = [0.42, 0.56][gy] * h;
      ctx.fillStyle = '#A1887F'; U.roundRect(ctx, x - 30 * u, y + 8 * u, 60 * u, 16 * u, 4 * u); ctx.fill();
      ctx.fillStyle = ['#42A5F5', '#F48FB1', '#66BB6A', '#FFB300', '#BA68C8', '#4DB6AC'][idx];
      U.ell(ctx, x, y, 12 * u, 14 * u); ctx.fill();
      ctx.fillStyle = '#FFCC80'; U.circle(ctx, x, y - 16 * u, 9 * u); ctx.fill();
      const n0 = upcoming[0];
      if (n0 && n0.aim % 6 === idx && !r.m.done[n0.i]) {
        ctx.strokeStyle = '#FFCC80'; ctx.lineWidth = 4 * u; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x + 10 * u, y - 4 * u); ctx.lineTo(x + 16 * u, y - 30 * u - Math.sin(now * 8) * 4 * u); ctx.stroke();
        ctx.fillStyle = '#FFFDF4';
        ctx.save(); ctx.translate(x + 17 * u, y - 34 * u); ctx.rotate(0.2); ctx.fillRect(-6 * u, -4 * u, 12 * u, 8 * u); ctx.restore();
      }
    }
  };
  S.exam = function (ctx, r, upcoming) {   // 考试：试卷+四选项
    const w = RF.view.w, h = RF.view.h, u = RF.view.u;
    ctx.fillStyle = '#FFFDF4';
    U.roundRect(ctx, w * 0.28, h * 0.3, w * 0.44, h * 0.34, 8 * u); ctx.fill();
    ctx.strokeStyle = '#B0BEC5'; ctx.lineWidth = 2 * u;
    U.roundRect(ctx, w * 0.28, h * 0.3, w * 0.44, h * 0.34, 8 * u); ctx.stroke();
    ctx.fillStyle = '#37474F'; ctx.font = '800 ' + 13 * u + 'px system-ui,sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('期末试卷 · 第 1 题', w / 2, h * 0.335);
    const pos = [[0.38, 0.42], [0.62, 0.42], [0.38, 0.56], [0.62, 0.56]];
    const n0 = upcoming[0];
    for (let i = 0; i < 4; i++) {
      const x = pos[i][0] * w, y = pos[i][1] * h;
      const act = n0 && n0.aim % 4 === i && !r.m.done[n0.i];
      ctx.save(); ctx.translate(x, y);
      if (act) { const sc = 1 + Math.sin(r.now() * 10) * 0.06; ctx.scale(sc, sc); ctx.fillStyle = 'rgba(255,211,77,0.9)'; }
      else ctx.fillStyle = 'rgba(176,190,197,0.5)';
      U.roundRect(ctx, -44 * u, -16 * u, 88 * u, 32 * u, 8 * u); ctx.fill();
      ctx.fillStyle = '#37474F'; ctx.font = '800 ' + 14 * u + 'px system-ui,sans-serif';
      ctx.fillText('ABCD'[i] + '. ' + (act ? '？' : '…'), 0, 0);
      ctx.restore();
    }
  };
  S.balloon = function (ctx, r, upcoming) {  // 懵懂：发光气球
    const w = RF.view.w, h = RF.view.h, u = RF.view.u, now = r.now();
    const pos = [[0.2, 0.34], [0.35, 0.42], [0.5, 0.32], [0.65, 0.42], [0.8, 0.34]];
    const cols = ['#EF5350', '#42A5F5', '#FFD34D', '#66BB6A', '#BA68C8'];
    const n0 = upcoming[0];
    for (let i = 0; i < 5; i++) {
      const x = pos[i][0] * w, y = pos[i][1] * h + Math.sin(now * 1.5 + i) * 8 * u;
      const act = n0 && n0.aim % 5 === i && !r.m.done[n0.i];
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.5 * u;
      ctx.beginPath(); ctx.moveTo(x, y + 22 * u); ctx.quadraticCurveTo(x + 6 * u, y + 40 * u, x, y + 56 * u); ctx.stroke();
      if (act) { ctx.fillStyle = 'rgba(255,249,196,' + (0.5 + Math.sin(now * 9) * 0.3).toFixed(3) + ')'; U.circle(ctx, x, y, 34 * u); ctx.fill(); }
      ctx.fillStyle = cols[i];
      U.ell(ctx, x, y, 18 * u, 22 * u); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      U.ell(ctx, x - 6 * u, y - 8 * u, 5 * u, 7 * u, -0.4); ctx.fill();
    }
  };
  S.spark = function (ctx, r, upcoming) {   // 迷茫：空白世界闪光
    const w = RF.view.w, h = RF.view.h, u = RF.view.u, now = r.now();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(0, 0, w, h);
    for (const n of upcoming) {
      const x = n.px * w, y = n.py * h;
      const pl = 0.6 + Math.sin(now * 8 + n.i) * 0.4;
      ctx.fillStyle = 'rgba(255,193,7,' + (0.5 + pl * 0.4).toFixed(3) + ')';
      ctx.save(); ctx.translate(x, y); ctx.rotate(now * 2);
      ctx.beginPath();
      for (let i = 0; i < 8; i++) { const rr = i % 2 ? 8 * u : 20 * u * pl; const a = i / 8 * U.TAU; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  };
  S.firefly = function (ctx, r, upcoming) { // 星火：萤火虫
    const w = RF.view.w, h = RF.view.h, u = RF.view.u, now = r.now();
    for (const n of upcoming) {
      const x = n.px * w + Math.sin(now * 2 + n.ph) * 14 * u, y = n.py * h + Math.cos(now * 1.6 + n.ph) * 10 * u;
      const g = ctx.createRadialGradient(x, y, 1, x, y, 26 * u);
      g.addColorStop(0, 'rgba(255,241,118,0.95)'); g.addColorStop(1, 'rgba(255,241,118,0)');
      ctx.fillStyle = g; U.circle(ctx, x, y, 26 * u); ctx.fill();
      ctx.fillStyle = '#FFF9C4'; U.circle(ctx, x, y, 4 * u); ctx.fill();
    }
  };
  S.lamp = function (ctx, r, upcoming) {    // 勇气：路灯逐一点亮
    const w = RF.view.w, h = RF.view.h, u = RF.view.u;
    const n0 = upcoming[0];
    for (let i = 0; i < 5; i++) {
      const x = [0.2, 0.35, 0.5, 0.65, 0.8][i] * w;
      const lit = r.m.lit && r.m.lit[i];
      const act = n0 && n0.aim % 5 === i && !r.m.done[n0.i];
      ctx.strokeStyle = '#455A64'; ctx.lineWidth = 5 * u;
      ctx.beginPath(); ctx.moveTo(x, h * 0.62); ctx.lineTo(x, h * 0.4); ctx.quadraticCurveTo(x, h * 0.36, x + 10 * u, h * 0.36); ctx.stroke();
      if (lit || act) {
        const g = ctx.createRadialGradient(x + 10 * u, h * 0.37, 2, x + 10 * u, h * 0.37, 60 * u);
        g.addColorStop(0, 'rgba(255,236,150,0.9)'); g.addColorStop(1, 'rgba(255,236,150,0)');
        ctx.fillStyle = g; U.circle(ctx, x + 10 * u, h * 0.37, 60 * u); ctx.fill();
      }
      ctx.fillStyle = lit || act ? '#FFEC9D' : '#78909C';
      U.circle(ctx, x + 10 * u, h * 0.36, 7 * u); ctx.fill();
    }
  };
  S.boat = function (ctx, r, upcoming) {    // 思念：纸船护航
    const w = RF.view.w, h = RF.view.h, u = RF.view.u, now = r.now();
    ctx.fillStyle = 'rgba(79,195,247,0.5)';
    ctx.fillRect(0, h * 0.5, w, h * 0.16);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2 * u;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(i * w / 5, h * 0.54 + Math.sin(now * 2 + i) * 3 * u); ctx.lineTo(i * w / 5 + w / 10, h * 0.54 + Math.sin(now * 2 + i) * 3 * u); ctx.stroke(); }
    for (const n of upcoming) {
      const x = n.px * w, y = h * 0.55 + Math.sin(now * 3 + n.i) * 3 * u;
      ctx.save(); ctx.translate(x, y);
      ctx.fillStyle = '#FFFDF4';
      ctx.beginPath(); ctx.moveTo(-16 * u, 0); ctx.lineTo(16 * u, 0); ctx.lineTo(10 * u, 8 * u); ctx.lineTo(-10 * u, 8 * u); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -16 * u); ctx.lineTo(10 * u, -2 * u); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#546E7A';
      U.circle(ctx, x + 40 * u, y + 6 * u, 7 * u); ctx.fill();
    }
  };
  S.tap_hide = function (ctx, r) {          // 写作业藏手机
    const w = RF.view.w, h = RF.view.h, u = RF.view.u, now = r.now();
    const n = r.nextNote();
    ctx.fillStyle = '#8D6E63'; U.roundRect(ctx, w * 0.24, h * 0.56, w * 0.52, 14 * u, 5 * u); ctx.fill();
    ctx.fillStyle = '#6D4C41'; ctx.fillRect(w * 0.28, h * 0.56 + 12 * u, 10 * u, h * 0.16); ctx.fillRect(w * 0.7, h * 0.56 + 12 * u, 10 * u, h * 0.16);
    /* 门 + 巡查身影 */
    ctx.fillStyle = '#5D4037'; U.roundRect(ctx, w * 0.04, h * 0.24, w * 0.1, h * 0.4, 4 * u); ctx.fill();
    if (n && n.t - now < 1.2) {
      const k = 1 - (n.t - now) / 1.2;
      ctx.fillStyle = '#37474F';
      U.ell(ctx, w * 0.04 + k * w * 0.05, h * 0.44, 12 * u, 24 * u); ctx.fill();
      ctx.fillStyle = '#FFCC80'; U.circle(ctx, w * 0.04 + k * w * 0.05, h * 0.44 - 28 * u, 9 * u); ctx.fill();
    }
    /* 桌上书本与手机 */
    const hidden = r.m.clean > 0 && (now - (r.m.lastHide || -9)) < 0.8;
    ctx.fillStyle = '#42A5F5'; U.roundRect(ctx, w * 0.42, h * 0.53, w * 0.16, 8 * u, 2 * u); ctx.fill();
    if (!hidden) { ctx.save(); ctx.translate(w * 0.56, h * 0.52); RF.props.draw(ctx, 'phone', u * 0.9); ctx.restore(); }
  };
  S.tap_sing = function (ctx, r) {          // 班歌比赛
    const w = RF.view.w, h = RF.view.h, u = RF.view.u, now = r.now();
    for (let row = 0; row < 2; row++) for (let i = 0; i < 5; i++) {
      const x = w * (0.2 + i * 0.15), y = h * (0.3 + row * 0.09);
      ctx.fillStyle = ['rgba(66,165,245,0.6)', 'rgba(244,143,177,0.6)', 'rgba(129,199,132,0.6)'][(i + row) % 3];
      U.ell(ctx, x, y + Math.sin(now * 4 + i) * 3 * u, 12 * u, 15 * u); ctx.fill();
      ctx.fillStyle = '#FFCC80'; U.circle(ctx, x, y - 16 * u + Math.sin(now * 4 + i) * 3 * u, 9 * u); ctx.fill();
    }
    ctx.save(); ctx.translate(w * 0.5, h * 0.52); RF.props.draw(ctx, 'mic', u * 1.2); ctx.restore();
  };
  S.tap_cloud = function (ctx, r) {         // 风暴驱云
    const w = RF.view.w, h = RF.view.h, u = RF.view.u;
    const clear = U.clamp(r.m.clean / Math.max(1, r.chart.count), 0, 1);
    ctx.fillStyle = 'rgba(255,236,150,' + (0.25 + clear * 0.5).toFixed(3) + ')';
    U.circle(ctx, w * 0.8, h * 0.16, 30 * u); ctx.fill();
    const cg = 1 - clear;
    if (cg > 0.05) {
      ctx.fillStyle = 'rgba(96,125,139,' + (0.85 * cg).toFixed(3) + ')';
      for (let i = 0; i < 5; i++) { U.ell(ctx, w * (0.15 + i * 0.18), h * 0.2 + (i % 2) * h * 0.05, 60 * u, 26 * u); ctx.fill(); }
    }
  };
  S.fall_petal = function (ctx, r) {        // 离别：花瓣雨+伞
    const w = RF.view.w, h = RF.view.h, u = RF.view.u;
    ctx.strokeStyle = '#6D4C41'; ctx.lineWidth = 8 * u;
    ctx.beginPath(); ctx.moveTo(w * 0.1, h * 0.12); ctx.quadraticCurveTo(w * 0.4, h * 0.06, w * 0.7, h * 0.14); ctx.stroke();
    ctx.fillStyle = '#F48FB1';
    for (let i = 0; i < 12; i++) { U.circle(ctx, w * (0.12 + i * 0.06), h * (0.1 + (i % 3) * 0.02), 6 * u); ctx.fill(); }
    const ux = r.frog.x;
    ctx.fillStyle = '#7E57C2';
    ctx.beginPath(); ctx.arc(ux, h * 0.6, 46 * u, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 3 * u;
    ctx.beginPath(); ctx.moveTo(ux, h * 0.6); ctx.lineTo(ux, h * 0.68); ctx.stroke();
  };
  S.item_petal = function (ctx, r, n, u) {
    ctx.fillStyle = '#F8BBD0';
    U.ell(ctx, 0, 0, 8 * u, 5 * u, n.i); ctx.fill();
    ctx.fillStyle = '#F48FB1';
    U.ell(ctx, 2 * u, -2 * u, 4 * u, 2.5 * u, n.i); ctx.fill();
  };
  S.keys_arrows = function (ctx, r) {       // 拉拉舞箭头垫
    const w = RF.view.w, h = RF.view.h, u = RF.view.u;
    const ly = r.mech === undefined ? h * 0.72 : RF.mech.keys.lineY(r);
    for (let i = 0; i < r.m.lanes; i++) {
      const x = RF.mech.keys.laneX(r, i);
      const on = r.m.flash.find(f => f.lane === i && f.t < 0.2);
      ctx.fillStyle = on ? '#FFE082' : ['rgba(239,83,80,0.8)', 'rgba(66,165,245,0.8)', 'rgba(129,199,132,0.8)', 'rgba(255,179,0,0.8)'][i % 4];
      U.roundRect(ctx, x - 30 * u, ly - 30 * u, 60 * u, 60 * u, 10 * u); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 5 * u; ctx.lineCap = 'round';
      const d = [-1, 0, 1, 2][i % 4]; // ← ↑ → ↓
      ctx.save(); ctx.translate(x, ly);
      ctx.rotate(d === -1 ? -Math.PI / 2 : d === 1 ? Math.PI / 2 : d === 2 ? Math.PI : 0);
      ctx.beginPath(); ctx.moveTo(0, -14 * u); ctx.lineTo(0, 12 * u); ctx.moveTo(0, -14 * u); ctx.lineTo(-8 * u, -4 * u); ctx.moveTo(0, -14 * u); ctx.lineTo(8 * u, -4 * u); ctx.stroke();
      ctx.restore();
    }
  };
  S.keys_stairs = function (ctx, r) {       // 成长：发光楼梯
    const w = RF.view.w, h = RF.view.h, u = RF.view.u;
    for (let i = 0; i < r.m.lanes; i++) {
      const x = RF.mech.keys.laneX(r, i);
      const y = h * 0.72 - i * h * 0.07;
      const on = r.m.flash.find(f => f.lane === i && f.t < 0.25);
      const g = ctx.createLinearGradient(x - 34 * u, y, x + 34 * u, y + 18 * u);
      g.addColorStop(0, on ? '#FFF9C4' : 'rgba(179,157,255,0.75)');
      g.addColorStop(1, on ? '#FFE082' : 'rgba(103,58,183,0.75)');
      ctx.fillStyle = g;
      U.roundRect(ctx, x - 34 * u, y, 68 * u, 18 * u, 5 * u); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2 * u;
      U.roundRect(ctx, x - 34 * u, y, 68 * u, 18 * u, 5 * u); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '800 ' + 12 * u + 'px system-ui,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(r.m.labels[i], x, y + 9 * u);
    }
    /* 顶端门 */
    const dx = w * 0.86, dy = h * 0.72 - r.m.lanes * h * 0.07;
    ctx.fillStyle = '#4E342E'; U.roundRect(ctx, dx - 20 * u, dy - 40 * u, 40 * u, 56 * u, 4 * u); ctx.fill();
    ctx.fillStyle = 'rgba(255,236,150,0.8)'; U.roundRect(ctx, dx - 14 * u, dy - 34 * u, 28 * u, 48 * u, 3 * u); ctx.fill();
  };
  S.pow_plane = function (ctx, r, L) {      // 天台扔纸飞机
    const w = RF.view.w, h = RF.view.h, u = RF.view.u;
    ctx.fillStyle = '#78909C'; ctx.fillRect(0, h * 0.62, w, h * 0.06);
    ctx.strokeStyle = '#546E7A'; ctx.lineWidth = 3 * u;
    for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(i * w / 12, h * 0.62); ctx.lineTo(i * w / 12, h * 0.68); ctx.stroke(); }
    ctx.fillStyle = 'rgba(129,199,132,0.6)'; ctx.fillRect(0, h * 0.68, w, h * 0.32);
    ctx.save(); ctx.translate(L.tx, L.ty);
    RF.props.draw(ctx, 'flag', u * 1.4);
    ctx.restore();
    ctx.strokeStyle = 'rgba(239,83,80,0.7)'; ctx.lineWidth = 2.5 * u; ctx.setLineDash([8 * u, 6 * u]);
    ctx.beginPath(); ctx.moveTo(L.tx, L.ty - 20 * u); ctx.lineTo(L.tx, L.ty + 40 * u); ctx.stroke();
    ctx.setLineDash([]);
  };
  S.pow_star = function (ctx, r, L) {       // 星河升星
    const w = RF.view.w, h = RF.view.h, u = RF.view.u;
    const prog = U.clamp(r.scoreState.p / Math.max(1, r.chart.count), 0, 1);
    const g = ctx.createLinearGradient(0, h * 0.2, w, h * 0.35);
    g.addColorStop(0, 'rgba(179,157,255,0)'); g.addColorStop(0.5, 'rgba(179,157,255,' + (0.2 + prog * 0.5).toFixed(3) + ')'); g.addColorStop(1, 'rgba(179,157,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, h * 0.18, w, h * 0.2);
    ctx.strokeStyle = 'rgba(255,241,118,0.8)'; ctx.lineWidth = 2.5 * u; ctx.setLineDash([10 * u, 8 * u]);
    ctx.beginPath(); ctx.moveTo(w * 0.15, L.ty); ctx.lineTo(w * 0.85, L.ty); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,241,118,0.9)'; ctx.font = '700 ' + 12 * u + 'px system-ui,sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText('目标星高度', w * 0.15, L.ty - 6 * u);
  };
  S.race_walk = function (ctx, r) {         // 归家：四季流转
    const w = RF.view.w, h = RF.view.h, u = RF.view.u;
    const prog = U.clamp(r.now() / r.chart.duration, 0, 1);
    const seasons = [['#C8E6C9', '#66BB6A'], ['#B3E5FC', '#4FC3F7'], ['#FFE0B2', '#FB8C00'], ['#ECEFF1', '#B0BEC5']];
    const sIdx = Math.min(3, Math.floor(prog * 4));
    ctx.fillStyle = seasons[sIdx][0] + '';
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, h * 0.3, w, h * 0.42);
    ctx.globalAlpha = 1;
    ctx.fillStyle = seasons[sIdx][1];
    for (let i = 0; i < 5; i++) { U.circle(ctx, w * (0.1 + i * 0.2), h * 0.34, 16 * u); ctx.fill(); ctx.fillRect(w * (0.1 + i * 0.2) - 3 * u, h * 0.34, 6 * u, 26 * u); }
    ctx.fillStyle = 'rgba(93,64,55,0.8)'; ctx.font = '800 ' + 14 * u + 'px system-ui,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(['春', '夏', '秋', '冬'][sIdx], w * 0.9, h * 0.36);
  };

  /* ---------- 拍照姿势机制（毕业合照） ---------- */
  const J = RF.judge;
  RF.mech.pose = {
    POSES: [['剪刀手', '✌'], ['比心', '🫶'], ['点赞', '👍'], ['敬礼', '🫡']],
    answer(n) { return n.item % 4; },
    init(r) { r.m = { fb: -1, ft: -9, flashT: -9 }; r.frog.prop = null; },
    btnX(i) { return RF.view.w * (0.2 + 0.2 * i); },
    update(r, dt) {
      r.cueX = RF.view.w / 2; r.cueY = RF.view.h * 0.32;
      const n = r.nextNote();
      if (n && n.t - r.now() < 0.3 && r.m.flashT < 0) r.m.flashT = r.now();
    },
    down(r, e) {
      const now = r.now(), u = RF.view.u;
      const note = r.pending(r.winG);
      if (!note) return;
      let bi = 0, bd = 1e9;
      for (let i = 0; i < 4; i++) { const d = Math.abs(e.x - this.btnX(i)); if (d < bd) { bd = d; bi = i; } }
      const ok = bi === this.answer(note);
      const tier = ok ? J.timeTier(now - note.t, r.winS) : 'M';
      r.submit(note, tier, { x: this.btnX(bi), y: RF.view.h * 0.62 });
      r.m.fb = bi; r.m.ft = now;
      if (ok && tier !== 'M') { RF.sfx.pop(); RF.fx.confetti(this.btnX(bi), RF.view.h * 0.6, 8); r.setPose('cheer', 0.35); r.setExpr('stars', 0.5); }
      else r.setExpr('sad', 0.6);
    },
    up() { },
    miss(r, n) { r.setExpr('tense', 0.6); },
    draw(r, ctx) {
      const w = RF.view.w, h = RF.view.h, u = RF.view.u, now = r.now();
      ctx.save();
      /* 合照人群 */
      for (let row = 0; row < 2; row++) for (let i = 0; i < 6; i++) {
        const x = w * (0.16 + i * 0.136), y = h * (0.3 + row * 0.1);
        ctx.fillStyle = ['rgba(66,165,245,0.55)', 'rgba(244,143,177,0.55)', 'rgba(129,199,132,0.55)', 'rgba(255,179,0,0.55)'][(i + row) % 4];
        U.ell(ctx, x, y, 13 * u, 16 * u); ctx.fill();
        ctx.fillStyle = '#FFCC80'; U.circle(ctx, x, y - 18 * u, 10 * u); ctx.fill();
      }
      /* 姿势提示卡 */
      const n = r.chart.notes.find(nn => !nn.judged && nn.t - now < 2.4 && nn.t - now > -0.2);
      if (n) {
        const p = this.POSES[this.answer(n)];
        ctx.fillStyle = 'rgba(255,253,244,0.96)';
        U.roundRect(ctx, w / 2 - 60 * u, h * 0.14, 120 * u, 62 * u, 12 * u); ctx.fill();
        ctx.strokeStyle = '#F48FB1'; ctx.lineWidth = 3 * u;
        U.roundRect(ctx, w / 2 - 60 * u, h * 0.14, 120 * u, 62 * u, 12 * u); ctx.stroke();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = (26 * u) + 'px system-ui,sans-serif';
        ctx.fillText(p[1], w / 2, h * 0.14 + 26 * u);
        ctx.font = '800 ' + 14 * u + 'px system-ui,sans-serif'; ctx.fillStyle = '#6b4a12';
        ctx.fillText('全班比：' + p[0], w / 2, h * 0.14 + 50 * u);
      }
      /* 四姿势按钮 */
      for (let i = 0; i < 4; i++) {
        const x = this.btnX(i), y = h * 0.66;
        const fl = now - r.m.ft < 0.3 && r.m.fb === i;
        ctx.fillStyle = fl ? '#FFE082' : 'rgba(255,253,244,0.85)';
        U.roundRect(ctx, x - 36 * u, y - 30 * u, 72 * u, 60 * u, 12 * u); ctx.fill();
        ctx.strokeStyle = '#F48FB1'; ctx.lineWidth = 2.5 * u;
        U.roundRect(ctx, x - 36 * u, y - 30 * u, 72 * u, 60 * u, 12 * u); ctx.stroke();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = (22 * u) + 'px system-ui,sans-serif';
        ctx.fillText(this.POSES[i][1], x, y - 8 * u);
        ctx.font = '700 ' + 11 * u + 'px system-ui,sans-serif'; ctx.fillStyle = '#8a6a30';
        ctx.fillText(this.POSES[i][0], x, y + 16 * u);
      }
      /* 结束快门定格 */
      if (r.m.flashT > 0 && now > r.chart.duration - 1.2) {
        const k = now - (r.chart.duration - 1.2);
        if (k < 0.5) { ctx.fillStyle = 'rgba(255,255,255,' + (1 - k * 2).toFixed(3) + ')'; ctx.fillRect(0, 0, w, h); }
        ctx.fillStyle = 'rgba(60,40,10,0.85)';
        U.roundRect(ctx, w / 2 - 110 * u, h * 0.44, 220 * u, 44 * u, 10 * u); ctx.fill();
        ctx.fillStyle = '#FFF6D8'; ctx.font = '900 ' + 18 * u + 'px system-ui,sans-serif';
        ctx.fillText(' 咔嚓！毕业快乐', w / 2, h * 0.44 + 22 * u);
      }
      ctx.restore();
      M.drawFrog(r, ctx);
    }
  };
})();
