/* 节奏小奶蛙 - 判定系统（全关卡统一复用）
   时间窗：Perfect ±120ms / Good ±240ms / 其余 Miss
   长按关双档：节奏档(按下/松手时刻) + 力度档(力度vs目标区间)，取较差者 */
(function () {
  const J = RF.judge = { P: 0.12, G: 0.24 };
  J.RANK = { P: 3, G: 2, M: 1 };
  J.timeTier = function (dt, s) {
    s = s || 1;
    const a = Math.abs(dt);
    if (a <= J.P * s) return 'P';
    if (a <= J.G * s) return 'G';
    return null;
  };
  J.powerTier = function (power, zone) {
    if (!zone) return 'P';
    const d = Math.abs(power - zone.c);
    if (d <= zone.p) return 'P';
    if (d <= zone.g) return 'G';
    return null;
  };
  J.worse = function (a, b) {
    const ra = J.RANK[a] || 0, rb = J.RANK[b] || 0;
    if (ra === 0 || rb === 0) return 'M';
    return ra <= rb ? a : b;
  };
  J.label = { P: 'PERFECT', G: 'GOOD', M: 'MISS' };
  J.color = { P: '#FFD34D', G: '#5AC8FA', M: '#9AA0A6' };
})();
