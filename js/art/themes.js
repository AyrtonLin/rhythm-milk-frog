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
