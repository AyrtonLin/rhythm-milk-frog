/* 节奏小奶蛙 - 主角「小奶蛙」程序化骨骼动画
   draw(ctx, o) o:{x,y,s,face(1|-1),pose,poseT,expr,charge(0~1),beatPhase,prop,propAngle}
   表情×10 / 动作×12 / 手持道具随关卡切换 */
(function () {
  const G = RF.frog = {};
  const SKIN = '#F6E9A4', SKIN_D = '#E8D483', SKIN_L = '#FBF4C4', BELLY = '#FCF6D0';

  /* ---------- 原图精灵：优先加载预抠图 frog-cut.png；缺失时运行时抠底；再失败回退矢量 ---------- */
  G.mode = 'vector';
  G.img = null; G.imgW = 0; G.imgH = 0;
  G.init = function () {
    if (G.img) return;
    const cut = new Image();
    cut.onload = () => { G.img = cut; G.imgW = cut.naturalWidth; G.imgH = cut.naturalHeight; G.mode = 'photo'; };
    cut.onerror = () => G._tryProcess();
    cut.src = 'assets/character/frog-cut.png';
  };
  G._tryProcess = function () {
    const im = new Image();
    im.onload = () => {
      try {
        const w = im.naturalWidth, h = im.naturalHeight;
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(im, 0, 0);
        const d = x.getImageData(0, 0, w, h), px = d.data;
        const low = i => {
          const r = px[i], g = px[i + 1], b = px[i + 2];
          return (Math.max(r, g, b) - Math.min(r, g, b)) < 26;
        };
        /* 从边界泛洪：只移除与外界连通的灰白背景，保留眼睛高光等内部浅色 */
        const seen = new Uint8Array(w * h), stack = [];
        const push = (xx, yy) => { const k = yy * w + xx; if (!seen[k]) { seen[k] = 1; stack.push(k); } };
        for (let xx = 0; xx < w; xx++) { push(xx, 0); push(xx, h - 1); }
        for (let yy = 0; yy < h; yy++) { push(0, yy); push(w - 1, yy); }
        while (stack.length) {
          const k = stack.pop(), i = k * 4;
          if (!low(i)) continue;
          px[i + 3] = 0;
          const xx = k % w, yy = (k / w) | 0;
          if (xx > 0) push(xx - 1, yy);
          if (xx < w - 1) push(xx + 1, yy);
          if (yy > 0) push(xx, yy - 1);
          if (yy < h - 1) push(xx, yy + 1);
        }
        /* 边缘羽化：紧邻透明区的半透明像素按饱和度给 alpha，去除白边光晕 */
        const a0 = new Uint8Array(w * h);
        for (let k2 = 0; k2 < w * h; k2++) a0[k2] = px[k2 * 4 + 3];
        for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
          const k2 = yy * w + xx, i = k2 * 4;
          if (a0[k2] === 0) continue;
          let near = false;
          for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) {
            const nx = xx + dx, ny = yy + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            if (a0[ny * w + nx] === 0) { near = true; break; }
          }
          if (!near) continue;
          const r = px[i], g = px[i + 1], b = px[i + 2];
          const sat = Math.max(r, g, b) - Math.min(r, g, b);
          px[i + 3] = Math.min(px[i + 3], Math.round(Math.max(0, Math.min(1, (sat - 6) / 48)) * 255));
        }
        x.putImageData(d, 0, 0);
        /* 裁掉透明边 */
        let x0 = w, y0 = h, x1 = 0, y1 = 0;
        for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
          if (px[(yy * w + xx) * 4 + 3] > 8) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; }
        }
        const c2 = document.createElement('canvas');
        c2.width = Math.max(1, x1 - x0 + 1); c2.height = Math.max(1, y1 - y0 + 1);
        c2.getContext('2d').drawImage(c, x0, y0, c2.width, c2.height, 0, 0, c2.width, c2.height);
        G.img = c2; G.imgW = c2.width; G.imgH = c2.height; G.mode = 'photo';
      } catch (e) { G.mode = 'vector'; }
    };
    im.src = 'assets/character/frog-original.jpg';
  };

  /* 动作 → 形体参数 */
  function poseParams(pose, t, charge, beatPhase) {
    const P = { sq: 1, st: 1, dy: 0, rot: 0, armL: 0.5, armR: -0.5, leg: 0, jump: 0 };
    const b = Math.sin(beatPhase * Math.PI * 2);
    switch (pose) {
      case 'idle': P.sq = 1 + b * 0.03; P.st = 1 - b * 0.03; P.armL = 0.5 + b * 0.08; P.armR = -0.5 - b * 0.08; break;
      case 'charge': {
        const c = charge || 0;
        P.sq = 1 + c * 0.22; P.st = 1 - c * 0.2; P.dy = c * 10;
        P.armL = 0.9 + c * 0.6; P.armR = -0.9 - c * 0.6; break;
      }
      case 'throw': {
        const k = Math.min(1, t / 0.3);
        P.st = 1 + 0.18 * (1 - k); P.sq = 1 - 0.12 * (1 - k);
        P.armR = -2.4 + k * 1.6; P.armL = 0.8; P.jump = Math.sin(Math.min(1, t / 0.4) * Math.PI) * 14; break;
      }
      case 'kick': {
        const k = Math.min(1, t / 0.35);
        P.rot = -0.12 * (1 - k); P.leg = Math.sin(k * Math.PI) * 1.4; P.dy = -Math.sin(k * Math.PI) * 6; break;
      }
      case 'swing': {
        const k = Math.min(1, t / 0.3);
        P.armR = -2.8 + k * 3.4; P.rot = -0.15 + k * 0.3; P.sq = 1 + 0.06 * Math.sin(k * Math.PI); break;
      }
      case 'catch': P.armL = -1.9; P.armR = 1.9; P.st = 1.06; P.jump = Math.sin(Math.min(1, t / 0.4) * Math.PI) * 10; break;
      case 'jump': P.jump = Math.sin(Math.min(1, t / 0.5) * Math.PI) * 30; P.armL = -1.6; P.armR = 1.6; break;
      case 'run': {
        const ph = t * 10;
        P.leg = Math.sin(ph) * 0.7; P.dy = -Math.abs(Math.sin(ph)) * 6;
        P.armL = 0.6 + Math.sin(ph) * 0.7; P.armR = -0.6 - Math.sin(ph) * 0.7; break;
      }
      case 'slip': P.rot = Math.min(1, t / 0.3) * 1.4; P.dy = Math.min(1, t / 0.3) * 16; P.armL = -2; P.armR = 2; break;
      case 'hide': P.sq = 1.25; P.st = 0.7; P.dy = 14; P.armL = -2.6; P.armR = 2.6; break;
      case 'cheer': P.jump = Math.abs(Math.sin(t * 8)) * 18; P.armL = -2.2; P.armR = 2.2; break;
      case 'play': P.armL = -1.2; P.armR = -0.9 + Math.sin(t * 14) * 0.25; break;
      case 'sad': P.sq = 1.1; P.st = 0.92; P.dy = 6; P.armL = 0.9; P.armR = -0.9; break;
    }
    return P;
  }

  /* 表情：眼/嘴 */
  function drawFace(ctx, expr, s, blink) {
    const eyeY = -34 * s, eyeDX = 22 * s, eyeR = 12.5 * s;
    const closed = blink < 0.08;
    for (const side of [-1, 1]) {
      const ex = side * eyeDX;
      ctx.fillStyle = SKIN_D;
      RF.util.circle(ctx, ex, eyeY, eyeR * 1.22); ctx.fill();
      if (closed || expr === 'closed' || expr === 'smile') {
        ctx.strokeStyle = '#3a2b12'; ctx.lineWidth = 2.6 * s; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(ex, eyeY + 2 * s, eyeR * 0.8, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
        continue;
      }
      let er = eyeR;
      if (expr === 'surprise' || expr === 'stars') er = eyeR * 1.18;
      if (expr === 'sad' || expr === 'tense') er = eyeR * 0.88;
      ctx.fillStyle = '#1d1a14';
      RF.util.circle(ctx, ex, eyeY, er); ctx.fill();
      ctx.fillStyle = '#fff';
      RF.util.circle(ctx, ex - er * 0.32, eyeY - er * 0.34, er * 0.34); ctx.fill();
      RF.util.circle(ctx, ex + er * 0.28, eyeY + er * 0.3, er * 0.15); ctx.fill();
      if (expr === 'stars') {
        ctx.fillStyle = '#FFE082';
        RF.util.circle(ctx, ex + er * 0.25, eyeY - er * 0.25, er * 0.2); ctx.fill();
      }
      if (expr === 'dizzy') {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2 * s;
        ctx.beginPath(); ctx.arc(ex, eyeY, er * 0.5, 0, Math.PI * 1.5); ctx.stroke();
      }
    }
    /* 嘴 */
    ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 2.6 * s; ctx.lineCap = 'round';
    ctx.fillStyle = '#7a4426';
    const my = -14 * s;
    ctx.beginPath();
    switch (expr) {
      case 'happy': case 'stars': case 'smile':
        ctx.arc(0, my - 2 * s, 9 * s, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); break;
      case 'surprise':
        RF.util.ell(ctx, 0, my + 2 * s, 4.5 * s, 6 * s); ctx.fill(); break;
      case 'sad':
        ctx.arc(0, my + 8 * s, 8 * s, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); break;
      case 'tense':
        ctx.moveTo(-8 * s, my + 2 * s);
        ctx.quadraticCurveTo(-4 * s, my - 1 * s, 0, my + 2 * s);
        ctx.quadraticCurveTo(4 * s, my + 5 * s, 8 * s, my + 2 * s); ctx.stroke(); break;
      case 'open':
        RF.util.ell(ctx, 0, my + 3 * s, 7 * s, 8 * s); ctx.fill(); break;
      default:
        ctx.moveTo(-9 * s, my); ctx.quadraticCurveTo(0, my + 4 * s, 9 * s, my); ctx.stroke();
    }
    /* 腮红 */
    if (expr !== 'sad') {
      ctx.fillStyle = 'rgba(244,143,177,0.45)';
      RF.util.ell(ctx, -34 * s, -20 * s, 7 * s, 4.5 * s); ctx.fill();
      RF.util.ell(ctx, 34 * s, -20 * s, 7 * s, 4.5 * s); ctx.fill();
    }
    /* 汗滴 */
    if (expr === 'tense' || expr === 'sweat') {
      ctx.fillStyle = 'rgba(90,200,250,0.9)';
      RF.util.ell(ctx, 34 * s, -44 * s, 3.5 * s, 5 * s, 0.4); ctx.fill();
    }
  }

  /* 照片精灵渲染：保留蓄力压扁/跳跃/旋转/翻转等动作变换与手持道具 */
  const TILT = { charge: 0.55, throw: -1.05, swing: -0.95, kick: 0.35, catch: -0.3, hide: 0.2 };
  G.draw = function (ctx, o) {
    if (G.mode !== 'photo' || !G.img) return G._drawVector(ctx, o);
    const s = o.s || 1;
    const P = poseParams(o.pose || 'idle', o.poseT || 0, o.charge || 0, o.beatPhase || 0);
    const face = o.face || 1;
    ctx.save();
    ctx.translate(o.x, o.y - (P.jump || 0) * s + (P.dy || 0) * s);
    ctx.rotate((P.rot || 0) * face);
    ctx.scale(face * P.sq, P.st);
    const H = 140 * s, W = H * G.imgW / G.imgH;
    ctx.drawImage(G.img, -W / 2, -78 * s, W, H);
    if (o.prop) {
      const side = o.propHand === 'L' ? -1 : 1;
      ctx.save();
      ctx.translate(side * W * 0.42, -2 * s);
      ctx.rotate((o.propAngle || 0) + (TILT[o.pose] || 0) * side);
      RF.props.draw(ctx, o.prop, s);
      ctx.restore();
    }
    ctx.restore();
  };

  G._drawVector = function (ctx, o) {
    const s = o.s || 1;
    const P = poseParams(o.pose || 'idle', o.poseT || 0, o.charge || 0, o.beatPhase || 0);
    const face = o.face || 1;
    ctx.save();
    ctx.translate(o.x, o.y - (P.jump || 0) * s + (P.dy || 0) * s);
    ctx.rotate((P.rot || 0) * face);
    ctx.scale(face * P.sq, P.st);
    /* 影子在调用方画；这里画身体 */
    const RX = 46 * s, RY = 56 * s;
    /* 腿 */
    ctx.fillStyle = SKIN;
    const legSw = (P.leg || 0);
    RF.util.ell(ctx, -20 * s, RY * 0.86, 13 * s, 15 * s, legSw * 0.4); ctx.fill();
    RF.util.ell(ctx, 20 * s, RY * 0.86, 13 * s, 15 * s, -legSw * 0.4); ctx.fill();
    /* 手臂（后） */
    const armY = -2 * s;
    function arm(side, ang, holdProp) {
      ctx.save();
      ctx.translate(side * RX * 0.86, armY);
      ctx.rotate(ang * side);
      ctx.fillStyle = SKIN;
      RF.util.ell(ctx, 0, 14 * s, 9 * s, 17 * s); ctx.fill();
      if (holdProp && o.prop) {
        ctx.translate(0, 26 * s);
        RF.props.draw(ctx, o.prop, s, o.propAngle || 0);
      }
      ctx.restore();
    }
    arm(-1, P.armL, o.propHand === 'L');
    /* 身体 */
    const g = ctx.createLinearGradient(0, -RY, 0, RY);
    g.addColorStop(0, SKIN_L); g.addColorStop(0.55, SKIN); g.addColorStop(1, SKIN_D);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -RY);
    ctx.bezierCurveTo(RX * 1.02, -RY * 0.92, RX * 1.12, RY * 0.3, RX * 0.8, RY * 0.92);
    ctx.quadraticCurveTo(0, RY * 1.12, -RX * 0.8, RY * 0.92);
    ctx.bezierCurveTo(-RX * 1.12, RY * 0.3, -RX * 1.02, -RY * 0.92, 0, -RY);
    ctx.closePath(); ctx.fill();
    /* 肚皮 */
    ctx.fillStyle = BELLY;
    RF.util.ell(ctx, 0, RY * 0.34, RX * 0.55, RY * 0.5); ctx.fill();
    /* 脸 */
    drawFace(ctx, o.expr || 'normal', s, o.blink == null ? 1 : o.blink);
    /* 手臂（前，可持道具） */
    arm(1, P.armR, o.propHand !== 'L');
    ctx.restore();
  };

  G.shadow = function (ctx, x, y, s, jump) {
    const k = 1 - Math.min(0.5, (jump || 0) / 60);
    ctx.fillStyle = 'rgba(90,60,20,0.18)';
    RF.util.ell(ctx, x, y, 44 * s * k, 10 * s * k); ctx.fill();
  };
})();
