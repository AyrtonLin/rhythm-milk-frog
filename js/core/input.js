/* 节奏小奶蛙 - 统一输入（Pointer Events 触摸+鼠标 / 键盘调试 / 多点触控 / 长按时长） */
(function () {
  const I = RF.input = { handlers: [] };
  I.on = function (fn) {
    I.handlers.push(fn);
    return () => { I.handlers = I.handlers.filter(f => f !== fn); };
  };
  const emit = e => { for (const f of I.handlers.slice()) f(e); };

  const downs = {};
  function pos(ev) {
    const r = RF.view.canvas.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  }
  function isCanvas(ev) { return ev.target === RF.view.canvas; }

  window.addEventListener('pointerdown', ev => {
    if (!isCanvas(ev)) return;
    ev.preventDefault();
    const p = pos(ev);
    downs[ev.pointerId] = { x: p.x, y: p.y, t: performance.now() };
    emit({ type: 'down', id: ev.pointerId, x: p.x, y: p.y });
  }, { passive: false });

  window.addEventListener('pointermove', ev => {
    if (!downs[ev.pointerId]) return;
    const p = pos(ev);
    emit({ type: 'move', id: ev.pointerId, x: p.x, y: p.y });
  }, { passive: true });

  function release(ev, cancel) {
    const d = downs[ev.pointerId];
    if (!d) return;
    delete downs[ev.pointerId];
    const p = pos(ev);
    emit({ type: cancel ? 'cancel' : 'up', id: ev.pointerId, x: p.x, y: p.y, hold: performance.now() - d.t });
  }
  window.addEventListener('pointerup', ev => release(ev, false));
  window.addEventListener('pointercancel', ev => release(ev, true));
  window.addEventListener('contextmenu', ev => { if (isCanvas(ev)) ev.preventDefault(); });

  /* 键盘：空格/回车 = 点击与长按；W A S D / 方向键 = 上下左右（方向类关卡通用） */
  const DIRK = { KeyW: 'U', ArrowUp: 'U', KeyS: 'D', ArrowDown: 'D', KeyA: 'L', ArrowLeft: 'L', KeyD: 'R', ArrowRight: 'R' };
  let kbT = 0;
  window.addEventListener('keydown', ev => {
    const d = DIRK[ev.code];
    if (d) {
      ev.preventDefault();
      if (ev.repeat) return;
      emit({ type: 'down', id: 'kb_' + d, dir: d, x: RF.view.w / 2, y: RF.view.h / 2 });
      return;
    }
    if (ev.code === 'Space' || ev.code === 'Enter') {
      ev.preventDefault();
      kbT = performance.now();
      emit({ type: 'down', id: 'kb', x: RF.view.w / 2, y: RF.view.h / 2 });
    }
  });
  window.addEventListener('keyup', ev => {
    const d = DIRK[ev.code];
    if (d) {
      emit({ type: 'up', id: 'kb_' + d, dir: d, x: RF.view.w / 2, y: RF.view.h / 2, hold: 0 });
      return;
    }
    if ((ev.code === 'Space' || ev.code === 'Enter') && kbT) {
      emit({ type: 'up', id: 'kb', x: RF.view.w / 2, y: RF.view.h / 2, hold: performance.now() - kbT });
      kbT = 0;
    }
  });
})();
