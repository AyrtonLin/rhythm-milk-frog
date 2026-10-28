/* 节奏小奶蛙 - 启动入口：主循环 + 输入路由 + 页面隐藏自动暂停 */
(function () {
  let last = 0, lastRaf = 0;
  function loop(ts) {
    requestAnimationFrame(loop);
    lastRaf = performance.now();
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
    last = ts;
    const ctx = RF.view.ctx;
    /* 清空整块物理画布（无视基础变换）：否则 Miss 震屏时场景溢出到逻辑区外的
       字框边带无法被清除，残影逐帧累积 */
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
    if (RF.play.active) {
      if (RF.play.state !== 'paused') RF.play.update(dt);
      RF.play.draw(ctx);
    } else {
      idle(ctx, ts / 1000);
    }
  }
  /* rAF 被节流时（部分 WebView / 后台标签）用定时器兜底驱动逻辑，判定不停摆 */
  setInterval(() => {
    if (RF.play && RF.play.active && RF.play.state !== 'paused' && performance.now() - lastRaf > 120) {
      RF.play.update(0.033);
    }
  }, 33);
  /* 非游戏状态的氛围背景 */
  function idle(ctx, t) {
    const w = RF.view.w, h = RF.view.h, u = RF.view.u;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#FFF6D8'); g.addColorStop(1, '#FFE9A8');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.save();
    for (let i = 0; i < 10; i++) {
      const x = (i * 137 + t * 18 * (1 + i % 3)) % (w + 60) - 30;
      const y = h * (0.15 + (i * 0.083) % 0.7) + Math.sin(t * 1.2 + i) * 12 * u;
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = i % 2 ? '#FFB300' : '#8a5a2b';
      ctx.font = (18 + (i % 4) * 8) * u + 'px system-ui,sans-serif';
      ctx.fillText(i % 3 ? '♪' : '♫', x, y);
    }
    ctx.restore();
  }

  document.addEventListener('DOMContentLoaded', () => {
    RF.view.init(document.getElementById('game'));
    RF.save.get();
    RF.frog.init();
    RF.ui.init();
    RF.input.on(e => {
      if (!RF.play.active) return;
      if (e.type === 'down') RF.play.down(e);
      else if (e.type === 'up' || e.type === 'cancel') RF.play.up(e);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && RF.play.active && RF.play.state === 'play') {
        RF.play.pause();
        RF.ui.showScreen('scr-pause');
      }
    });
    requestAnimationFrame(loop);
  });
})();
