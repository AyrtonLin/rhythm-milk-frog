/* 节奏小奶蛙 - 六阶段主题背景（程序化绘制 + 环境粒子，离屏缓存） */
(function () {
  const T = RF.themes = {};
  const U = RF.util;
  const cache = {};

  function crowdLayer(w, h, seed) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, w | 0); c.height = Math.max(1, (h * 0.3) | 0);
    const x = c.getContext('2d');
    const r = U.mulberry32(seed);
    const cols = ['#EF9A9A', '#90CAF9', '#A5D6A7', '#FFE082', '#CE93D8', '#FFCC80', '#80DEEA'];
    for (let row = 0; row < 4; row++) {
      for (let i = 0; i < w / 26; i++) {
        x.fillStyle = cols[(r() * cols.length) | 0];
        U.circle(x, 13 + i * 26 + r() * 8, 20 + row * 26 + r() * 6, 8 + r() * 3); x.fill();
      }
    }
    return c;
  }

  T.draw = function (stage, ctx, t, w, h) {
    if (stage === 1) {
      /* 运动场：晴空 + 看台 + 木地板 */
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#7ED3F7'); g.addColorStop(0.55, '#C9EEFB'); g.addColorStop(1, '#EAF9FF');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      /* 太阳 */
      ctx.fillStyle = 'rgba(255,236,150,0.9)';
      U.circle(ctx, w * 0.85, h * 0.12, 34 * RF.view.u); ctx.fill();
      ctx.fillStyle = 'rgba(255,236,150,0.35)';
      U.circle(ctx, w * 0.85, h * 0.12, 50 * RF.view.u); ctx.fill();
      /* 云 */
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (let i = 0; i < 3; i++) {
        const cx = ((t * 12 + i * 340) % (w + 260)) - 130;
        const cy = h * (0.1 + i * 0.07);
        U.ell(ctx, cx, cy, 46 * RF.view.u, 16 * RF.view.u); ctx.fill();
        U.ell(ctx, cx + 30 * RF.view.u, cy + 6 * RF.view.u, 32 * RF.view.u, 12 * RF.view.u); ctx.fill();
      }
      /* 看台人群（缓存） */
      const key = 'crowd' + w + 'x' + h;
      if (!cache[key]) cache[key] = crowdLayer(w, h, 7);
      ctx.fillStyle = 'rgba(96,125,139,0.28)';
      ctx.fillRect(0, h * 0.3, w, h * 0.3);
      ctx.drawImage(cache[key], 0, h * 0.3);
      /* 彩旗 */
      const cols = ['#EF5350', '#FFD34D', '#66BB6A', '#42A5F5', '#AB47BC'];
      for (let i = 0; i < Math.ceil(w / 60); i++) {
        const x = i * 60 + 10, sw = Math.sin(t * 2 + i) * 3;
        ctx.fillStyle = cols[i % cols.length];
        ctx.beginPath();
        ctx.moveTo(x, h * 0.26 + sw); ctx.lineTo(x + 26, h * 0.26 + sw); ctx.lineTo(x + 13, h * 0.26 + 20 + sw);
        ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, h * 0.26); ctx.lineTo(w, h * 0.26); ctx.stroke();
      /* 地板 */
      const fy = h * 0.78;
      const fg = ctx.createLinearGradient(0, fy, 0, h);
      fg.addColorStop(0, '#E8B87A'); fg.addColorStop(1, '#C98F4E');
      ctx.fillStyle = fg; ctx.fillRect(0, fy, w, h - fy);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, fy + 2); ctx.lineTo(w, fy + 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(120,70,20,0.25)'; ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath(); ctx.moveTo(w * i / 8, fy); ctx.lineTo(w * i / 8 - 30, h); ctx.stroke();
      }
      return;
    }
    if (stage === 2) {
      /* 温馨家居：暖墙 + 窗 + 挂钟 + 木地板 + 绿植 */
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#FFE3C0'); g.addColorStop(0.7, '#FFF6E8'); g.addColorStop(1, '#FFEFD8');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      /* 窗 */
      const wx = w * 0.7, wy = h * 0.14, ww = w * 0.22, wh = h * 0.24;
      ctx.fillStyle = '#B3E5FC'; ctx.fillRect(wx, wy, ww, wh);
      ctx.fillStyle = 'rgba(255,244,180,0.8)'; U.circle(ctx, wx + ww * 0.7, wy + wh * 0.3, 14 * RF.view.u); ctx.fill();
      ctx.strokeStyle = '#FFFDF4'; ctx.lineWidth = 6 * RF.view.u;
      ctx.strokeRect(wx, wy, ww, wh);
      ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh);
      ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();
      ctx.fillStyle = '#F48FB1';
      ctx.fillRect(wx - 10 * RF.view.u, wy - 8 * RF.view.u, 14 * RF.view.u, wh + 16 * RF.view.u);
      ctx.fillRect(wx + ww - 4 * RF.view.u, wy - 8 * RF.view.u, 14 * RF.view.u, wh + 16 * RF.view.u);
      /* 挂钟 */
      ctx.fillStyle = '#FFFDF4'; U.circle(ctx, w * 0.18, h * 0.16, 26 * RF.view.u); ctx.fill();
      ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 4 * RF.view.u; U.circle(ctx, w * 0.18, h * 0.16, 26 * RF.view.u); ctx.stroke();
      ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 3 * RF.view.u;
      ctx.beginPath(); ctx.moveTo(w * 0.18, h * 0.16); ctx.lineTo(w * 0.18, h * 0.16 - 16 * RF.view.u);
      ctx.moveTo(w * 0.18, h * 0.16); ctx.lineTo(w * 0.18 + Math.cos(t) * 10 * RF.view.u, h * 0.16 + Math.sin(t) * 10 * RF.view.u); ctx.stroke();
      /* 地板 */
      const fy = h * 0.72;
      const fg = ctx.createLinearGradient(0, fy, 0, h);
      fg.addColorStop(0, '#D7A86E'); fg.addColorStop(1, '#B9834B');
      ctx.fillStyle = fg; ctx.fillRect(0, fy, w, h - fy);
      ctx.strokeStyle = 'rgba(120,70,20,0.3)'; ctx.lineWidth = 2;
      for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(w * i / 7, fy); ctx.lineTo(w * i / 7 - 24, h); ctx.stroke(); }
      /* 地毯 */
      ctx.fillStyle = 'rgba(244,143,177,0.35)';
      U.ell(ctx, w * 0.5, h * 0.86, w * 0.3, h * 0.07); ctx.fill();
      /* 绿植 */
      ctx.fillStyle = '#BC6C25';
      ctx.beginPath(); ctx.moveTo(w * 0.06, fy - 4); ctx.lineTo(w * 0.12, fy - 4); ctx.lineTo(w * 0.11, fy + 30 * RF.view.u); ctx.lineTo(w * 0.07, fy + 30 * RF.view.u); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#66BB6A';
      for (let i = -2; i <= 2; i++) { U.ell(ctx, w * 0.09 + i * 8 * RF.view.u, fy - 26 * RF.view.u + Math.abs(i) * 6 * RF.view.u, 6 * RF.view.u, 16 * RF.view.u, i * 0.3); ctx.fill(); }
      /* 尘埃光斑 */
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (let i = 0; i < 6; i++) {
        U.circle(ctx, (i * 173 + t * 10) % w, h * (0.2 + (i * 0.13) % 0.4) + Math.sin(t + i) * 8, 2.5 * RF.view.u); ctx.fill();
      }
      return;
    }
    if (stage === 3) {
      /* 音乐厅：暗紫 + 舞台灯光 + 观众荧光棒 */
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#1A0B2E'); g.addColorStop(0.6, '#341B52'); g.addColorStop(1, '#24103A');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      /* 灯柱 */
      for (let i = 0; i < 4; i++) {
        const a = Math.sin(t * 0.8 + i * 1.7) * 0.35;
        const x0 = w * (0.15 + i * 0.23);
        ctx.save(); ctx.translate(x0, 0); ctx.rotate(a);
        const lg = ctx.createLinearGradient(0, 0, 0, h * 0.8);
        lg.addColorStop(0, 'rgba(255,211,77,0.35)'); lg.addColorStop(1, 'rgba(255,211,77,0)');
        ctx.fillStyle = lg;
        ctx.beginPath(); ctx.moveTo(-8 * RF.view.u, 0); ctx.lineTo(8 * RF.view.u, 0);
        ctx.lineTo(60 * RF.view.u, h * 0.8); ctx.lineTo(-60 * RF.view.u, h * 0.8); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      /* 舞台地板 */
      const fy = h * 0.76;
      const fg = ctx.createLinearGradient(0, fy, 0, h);
      fg.addColorStop(0, '#5D4037'); fg.addColorStop(1, '#3E2723');
      ctx.fillStyle = fg; ctx.fillRect(0, fy, w, h - fy);
      ctx.fillStyle = 'rgba(255,235,59,0.25)';
      U.ell(ctx, w * 0.5, fy + 6 * RF.view.u, w * 0.34, 10 * RF.view.u); ctx.fill();
      /* 观众荧光棒 */
      const r3 = U.mulberry32(11);
      for (let i = 0; i < 26; i++) {
        const x = r3() * w, y = h * 0.62 + r3() * h * 0.1;
        const sw = Math.sin(t * 3 + i) * 6 * RF.view.u;
        ctx.strokeStyle = ['rgba(90,200,250,0.7)', 'rgba(244,143,177,0.7)', 'rgba(129,199,132,0.7)'][i % 3];
        ctx.lineWidth = 3 * RF.view.u;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sw, y - 14 * RF.view.u); ctx.stroke();
      }
      return;
    }
    if (stage === 4) {
      /* 办公室：灰蓝格子间 + 窗 + 白板 */
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#CFD8DC'); g.addColorStop(0.7, '#ECEFF1'); g.addColorStop(1, '#B0BEC5');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      /* 窗带 */
      ctx.fillStyle = '#B3E5FC';
      ctx.fillRect(0, h * 0.1, w, h * 0.16);
      ctx.strokeStyle = '#FFFDF4'; ctx.lineWidth = 5 * RF.view.u;
      for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(w * i / 5, h * 0.1); ctx.lineTo(w * i / 5, h * 0.26); ctx.stroke(); }
      /* 城市剪影 */
      ctx.fillStyle = 'rgba(96,125,139,0.5)';
      const r4 = U.mulberry32(5);
      for (let i = 0; i < 10; i++) {
        const bw = w * 0.06 + r4() * w * 0.05, bh = h * (0.05 + r4() * 0.08);
        ctx.fillRect(i * w / 10 + 4, h * 0.26 - bh, bw, bh);
      }
      /* 地毯地面 */
      const fy = h * 0.72;
      ctx.fillStyle = '#78909C'; ctx.fillRect(0, fy, w, h - fy);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      for (let i = 0; i < 8; i++) ctx.fillRect(i * w / 8, fy, w / 16, h - fy);
      /* 格子间隔板 */
      ctx.fillStyle = 'rgba(84,110,122,0.55)';
      ctx.fillRect(w * 0.08, h * 0.42, 8 * RF.view.u, h * 0.3);
      ctx.fillRect(w * 0.9, h * 0.42, 8 * RF.view.u, h * 0.3);
      /* 白板 */
      ctx.fillStyle = '#FFFDF4'; U.roundRect(ctx, w * 0.72, h * 0.32, w * 0.18, h * 0.14, 6 * RF.view.u); ctx.fill();
      ctx.strokeStyle = '#90A4AE'; ctx.lineWidth = 3 * RF.view.u; U.roundRect(ctx, w * 0.72, h * 0.32, w * 0.18, h * 0.14, 6 * RF.view.u); ctx.stroke();
      ctx.strokeStyle = '#EF5350'; ctx.lineWidth = 2 * RF.view.u;
      ctx.beginPath(); ctx.moveTo(w * 0.74, h * 0.42); ctx.lineTo(w * 0.78, h * 0.37); ctx.lineTo(w * 0.82, h * 0.4); ctx.lineTo(w * 0.87, h * 0.34); ctx.stroke();
      return;
    }
    if (stage === 5) {
      /* 教室：黑板 + 窗户 + 课桌列 + 标语 */
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#FFF8E1'); g.addColorStop(1, '#FFECB3');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#33691E';
      U.roundRect(ctx, w * 0.22, h * 0.1, w * 0.56, h * 0.24, 6 * RF.view.u); ctx.fill();
      ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 5 * RF.view.u;
      U.roundRect(ctx, w * 0.22, h * 0.1, w * 0.56, h * 0.24, 6 * RF.view.u); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = '700 ' + 14 * RF.view.u + 'px system-ui,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('好好学习 · 天天向上', w * 0.5, h * 0.16);
      ctx.fillStyle = '#B3E5FC';
      ctx.fillRect(w * 0.04, h * 0.12, w * 0.14, h * 0.2);
      ctx.fillRect(w * 0.82, h * 0.12, w * 0.14, h * 0.2);
      ctx.strokeStyle = '#FFFDF4'; ctx.lineWidth = 4 * RF.view.u;
      ctx.strokeRect(w * 0.04, h * 0.12, w * 0.14, h * 0.2);
      ctx.strokeRect(w * 0.82, h * 0.12, w * 0.14, h * 0.2);
      const fy = h * 0.74;
      ctx.fillStyle = '#D7CCC8'; ctx.fillRect(0, fy, w, h - fy);
      ctx.fillStyle = 'rgba(141,110,99,0.35)';
      for (let r2 = 0; r2 < 2; r2++) for (let i = 0; i < 4; i++) {
        U.roundRect(ctx, w * (0.1 + i * 0.22), fy - 26 * RF.view.u + r2 * 30 * RF.view.u, w * 0.16, 10 * RF.view.u, 3 * RF.view.u); ctx.fill();
      }
      return;
    }
    if (stage === 6) {
      /* 人生：深邃星空 + 极光 + 浮岛 */
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0D0B2A'); g.addColorStop(0.55, '#241B4D'); g.addColorStop(1, '#120E33');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const rs = U.mulberry32(21);
      for (let i = 0; i < 60; i++) {
        const x = rs() * w, y = rs() * h * 0.7, tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.6 + rs()) + i));
        ctx.fillStyle = 'rgba(255,255,255,' + (0.25 + tw * 0.6).toFixed(3) + ')';
        U.circle(ctx, x, y, (0.8 + rs() * 1.4) * RF.view.u); ctx.fill();
      }
      for (let b = 0; b < 3; b++) {
        ctx.strokeStyle = ['rgba(129,212,250,0.22)', 'rgba(186,104,200,0.2)', 'rgba(129,199,132,0.18)'][b];
        ctx.lineWidth = 26 * RF.view.u;
        ctx.beginPath();
        for (let x = 0; x <= w; x += w / 12) {
          ctx.lineTo(x, h * (0.2 + b * 0.08) + Math.sin(x * 0.008 + t * 0.5 + b * 2) * 30 * RF.view.u);
        }
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(18,14,51,0.9)';
      U.ell(ctx, w * 0.2, h * 0.86, w * 0.24, h * 0.06); ctx.fill();
      U.ell(ctx, w * 0.78, h * 0.9, w * 0.3, h * 0.07); ctx.fill();
      return;
    }
    /* 其余阶段：占位渐变（后续阶段开发时补全） */
    const pal = {
      2: ['#FFE0B2', '#FFF3E0'], 3: ['#4A148C', '#7B1FA2'], 4: ['#B0BEC5', '#ECEFF1'],
      5: ['#C8E6C9', '#F1F8E9'], 6: ['#1A237E', '#4A148C']
    }[stage] || ['#FFF3D6', '#FFE9A8'];
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  };
})();
