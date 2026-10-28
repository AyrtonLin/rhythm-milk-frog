/* 节奏小奶蛙 - 游戏内 HUD：分数 / 连击 / 进度 / 力度条(含目标区间) */
(function () {
  const H = RF.hud = {};
  H.draw = function (r, ctx) {
    const w = RF.view.w, h = RF.view.h, u = RF.view.u, m = RF.view.margin();
    ctx.save();
    /* 顶部进度条 */
    const pw = w - m * 2;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    RF.util.roundRect(ctx, m, m, pw, 6 * u, 3 * u); ctx.fill();
    const prog = RF.util.clamp(r.now() / r.chart.duration, 0, 1);
    ctx.fillStyle = '#FFD34D';
    RF.util.roundRect(ctx, m, m, pw * prog, 6 * u, 3 * u); ctx.fill();

    /* 分数 */
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.font = '900 ' + (22 * u) + 'px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(90,60,20,0.85)';
    ctx.fillText('' + r.scoreState.score, m, m + 12 * u);
    /* 关卡名（避开右上暂停按钮） */
    ctx.textAlign = 'right';
    ctx.font = '700 ' + (14 * u) + 'px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(90,60,20,0.6)';
    ctx.fillText(r.cfg.name, w - m - 52 * u, m + 14 * u);

    /* 连击 */
    if (r.scoreState.combo >= 2) {
      const pop = 1 + Math.max(0, 0.35 - (r.now() - r._comboAt)) * 1.6;
      ctx.save();
      ctx.translate(w / 2, m + 40 * u);
      ctx.scale(pop, pop);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '900 ' + (30 * u) + 'px system-ui, sans-serif';
      ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.strokeText(r.scoreState.combo + ' COMBO', 0, 0);
      ctx.fillStyle = r.scoreState.combo >= 20 ? '#FF7043' : '#FFB300';
      ctx.fillText(r.scoreState.combo + ' COMBO', 0, 0);
      ctx.restore();
    }

    /* 力度条（长按时 / 或刚松手余晖） */
    const pb = r.powerBar;
    if (pb && pb.show > 0) {
      const bw = Math.min(w * 0.62, 420 * u), bh = 18 * u;
      const bx = w / 2 - bw / 2, by = h - m - 46 * u;
      ctx.globalAlpha = Math.min(1, pb.show);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      RF.util.roundRect(ctx, bx - 3 * u, by - 3 * u, bw + 6 * u, bh + 6 * u, (bh + 6 * u) / 2); ctx.fill();
      ctx.fillStyle = 'rgba(120,90,40,0.25)';
      RF.util.roundRect(ctx, bx, by, bw, bh, bh / 2); ctx.fill();
      /* 目标区间 */
      if (pb.zone) {
        const z = pb.zone;
        const x1 = bx + bw * RF.util.clamp(z.c - z.g, 0, 100) / 100;
        const x2 = bx + bw * RF.util.clamp(z.c + z.g, 0, 100) / 100;
        const px1 = bx + bw * RF.util.clamp(z.c - z.p, 0, 100) / 100;
        const px2 = bx + bw * RF.util.clamp(z.c + z.p, 0, 100) / 100;
        ctx.fillStyle = 'rgba(90,200,250,0.55)';
        ctx.fillRect(x1, by, x2 - x1, bh);
        ctx.fillStyle = 'rgba(129,199,132,0.85)';
        ctx.fillRect(px1, by, px2 - px1, bh);
      }
      /* 当前力度 */
      const gx = bx + bw * RF.util.clamp(pb.power, 0, 100) / 100;
      const grad = ctx.createLinearGradient(bx, 0, gx, 0);
      grad.addColorStop(0, '#FFE082'); grad.addColorStop(1, '#FFB300');
      ctx.fillStyle = grad;
      RF.util.roundRect(ctx, bx, by, Math.max(bh, gx - bx), bh, bh / 2); ctx.fill();
      ctx.fillStyle = '#fff';
      RF.util.circle(ctx, gx, by + bh / 2, bh * 0.62); ctx.fill();
      ctx.fillStyle = '#FF8F00';
      RF.util.circle(ctx, gx, by + bh / 2, bh * 0.34); ctx.fill();
      /* 文案：力度% + 目标秒数（按住时长与提示一致） */
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.font = '700 ' + (13 * u) + 'px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(90,60,20,0.8)';
      const lbl = pb.zone
        ? '力度 ' + Math.round(pb.power) + '% ・ 目标按住 ' + (pb.zone.c / 100 * RF.chart.FULL).toFixed(2) + ' 秒'
        : '力度 ' + Math.round(pb.power) + '%';
      ctx.fillText(lbl, w / 2, by - 6 * u);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  };

  /* ---------- 方向键（手机屏幕 D-Pad + 键盘 WASD 提示）：方向类关卡通用 ---------- */
  const H2 = RF.hud;
  H2._dpadActive = null;
  H2.dpadRects = function () {
    const u = RF.view.u, m = RF.view.margin();
    const cx = m + 66 * u, cy = RF.view.h - m - 92 * u, d = 56 * u, rad = 27 * u;
    return [
      { dir: 'U', x: cx, y: cy - d, r: rad },
      { dir: 'L', x: cx - d, y: cy, r: rad },
      { dir: 'D', x: cx, y: cy + d, r: rad },
      { dir: 'R', x: cx + d, y: cy, r: rad }
    ];
  };
  H2.dpadDir = function (x, y) {
    const b = H2.dpadRects().find(b => (x - b.x) * (x - b.x) + (y - b.y) * (y - b.y) <= b.r * b.r * 1.5);
    return b ? b.dir : null;
  };
  H2.drawDpad = function (ctx) {
    const u = RF.view.u;
    for (const b of H2.dpadRects()) {
      const on = H2._dpadActive === b.dir;
      ctx.fillStyle = on ? 'rgba(255,211,77,0.9)' : 'rgba(255,253,244,0.42)';
      RF.util.circle(ctx, b.x, b.y, b.r); ctx.fill();
      ctx.strokeStyle = 'rgba(107,74,18,0.5)'; ctx.lineWidth = 2 * u;
      RF.util.circle(ctx, b.x, b.y, b.r); ctx.stroke();
      ctx.save(); ctx.translate(b.x, b.y);
      ctx.rotate({ U: 0, R: Math.PI / 2, D: Math.PI, L: -Math.PI / 2 }[b.dir]);
      ctx.fillStyle = 'rgba(107,74,18,0.8)';
      ctx.beginPath(); ctx.moveTo(0, -11 * u); ctx.lineTo(10 * u, 7 * u); ctx.lineTo(-10 * u, 7 * u); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(90,60,20,0.55)';
    ctx.font = '600 ' + (11 * u) + 'px system-ui,sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('键盘 W/A/S/D 或点按方向键', RF.view.margin() + 132 * u, RF.view.h - RF.view.margin() - 34 * u);
  };

  /* ---------- 节拍视觉提示：每拍脉冲环 + 下一音符逼近环（踩拍更明显） ---------- */
  H2.drawCue = function (r, ctx, x, y) {
    const u = RF.view.u, now = r.now(), b = r.chart.beatSec;
    /* 判定基准环 */
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 3 * u;
    RF.util.circle(ctx, x, y, 24 * u); ctx.stroke();
    /* 每拍脉冲 */
    const ph = r.beatPhase();
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.3 * (1 - ph)).toFixed(3) + ')';
    ctx.lineWidth = 2.5 * u;
    RF.util.circle(ctx, x, y, (24 + 36 * ph) * u); ctx.stroke();
    /* 下一音符逼近环：收缩到基准环时即拍点
       蓄力关：收缩时长 = 目标蓄力时长（黄圈出现=开始按住，合拢=松手） */
    const n = r.nextNote();
    if (!n) return;
    let win = b * 2;
    if (r.cfg && r.cfg.params && r.cfg.params.cueWinBeats) win = b * r.cfg.params.cueWinBeats;  // 关卡自定义缩圈时长
    if (r.cfg && r.cfg.params && r.cfg.params.autoWin && r.chart.gapBeats) win = b * r.chart.gapBeats;  // 缩圈=音符间隔：每拍完整慢缩圈
    if (r.cfg && r.cfg.mech === 'power' && n.zone) {
      win = Math.max(0.3, n.zone.c / 100 * RF.chart.FULL);
    }
    /* 逼近环：窗口内每个未判定音符都有完整缩圈（最近的最亮，后续淡环预告） */
    const list = [];
    for (const nn of r.chart.notes) {
      if (nn.judged) continue;
      const d = nn.t - now;
      if (d > 0 && d < win) list.push(nn);
      if (list.length >= 3) break;
    }
    list.forEach((nn, idx) => {
      const k = (nn.t - now) / win;
      if (idx === 0) {
        ctx.strokeStyle = 'rgba(255,211,77,' + (0.95 - 0.55 * k).toFixed(3) + ')';
        ctx.lineWidth = 4.5 * u;
        RF.util.circle(ctx, x, y, (24 + 78 * k) * u); ctx.stroke();
        if (k > 0.9) {
          ctx.strokeStyle = 'rgba(255,255,255,' + ((k - 0.9) * 6).toFixed(3) + ')';
          ctx.lineWidth = 3 * u;
          RF.util.circle(ctx, x, y, (24 + 78 * k + 10) * u); ctx.stroke();
        }
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.4 * (1 - k) + 0.08).toFixed(3) + ')';
        ctx.lineWidth = 2.5 * u;
        RF.util.circle(ctx, x, y, (24 + 78 * k) * u); ctx.stroke();
      }
    });
    if (list.length && r.cfg && r.cfg.mech === 'power') {
      const k = (list[0].t - now) / win;
      /* 文字提示：蓄力关 黄圈收缩全程“按住!” → 末段“松手!” */
      if (r.cfg && r.cfg.mech === 'power') {
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '900 ' + (27 * u) + 'px system-ui,sans-serif';
        if (k > 0.2) {
          const pop = RF.util.easeOutBack(Math.min(1, (1 - k) / 0.25));
          ctx.save(); ctx.translate(x, y - 64 * u); ctx.scale(pop, pop);
          ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.95)';
          ctx.strokeText('按住!', 0, 0);
          ctx.fillStyle = '#FFB300'; ctx.fillText('按住!', 0, 0);
          ctx.restore();
        } else {
          ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.95)';
          ctx.strokeText('松手!', x, y - 64 * u);
          ctx.fillStyle = '#EF5350'; ctx.fillText('松手!', x, y - 64 * u);
        }
      }
    }
    const dt0 = n.t - now;
    if (dt0 <= 0 && dt0 > -0.12) {
      ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 5.5 * u;
      RF.util.circle(ctx, x, y, 26 * u); ctx.stroke();
      /* 合拢瞬间动作字 */
      const act = r.cfg && (r.cfg.mech === 'power' ? '松手!' : r.cfg.mech === 'swing' ? '点!' : null);
      if (act) {
        ctx.globalAlpha = Math.max(0, 1 + dt0 / 0.12);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '900 ' + (27 * u) + 'px system-ui,sans-serif';
        ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.95)';
        ctx.strokeText(act, x, y - 64 * u);
        ctx.fillStyle = '#EF5350'; ctx.fillText(act, x, y - 64 * u);
        ctx.globalAlpha = 1;
      }
    }
  };
})();
