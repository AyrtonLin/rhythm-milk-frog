/* 节奏小奶蛙 - 画布与自适应（横竖屏 / DPR / 微信内置浏览器） */
(function () {
  const V = RF.view = { w: 0, h: 0, dpr: 1, u: 1, landscape: false, canvas: null, ctx: null };

  V.init = function (canvas) {
    V.canvas = canvas;
    V.ctx = canvas.getContext('2d');
    V.resize();
    window.addEventListener('resize', V.resize);
    window.addEventListener('orientationchange', () => setTimeout(V.resize, 120));
  };

  V.resize = function () {
    const c = V.canvas;
    V.dpr = Math.min(window.devicePixelRatio || 1, 2); // 移动端性能：DPR 上限 2
    V.w = window.innerWidth;
    V.h = window.innerHeight;
    c.width = Math.max(1, Math.round(V.w * V.dpr));
    c.height = Math.max(1, Math.round(V.h * V.dpr));
    c.style.width = V.w + 'px';
    c.style.height = V.h + 'px';
    V.ctx.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
    V.landscape = V.w > V.h;
    V.u = Math.min(V.w, V.h) / 720; // 布局单位
  };

  /* 游戏内安全边距（刘海屏） */
  V.margin = function () {
    const m = Math.max(10, Math.min(V.w, V.h) * 0.03);
    return m;
  };
})();
