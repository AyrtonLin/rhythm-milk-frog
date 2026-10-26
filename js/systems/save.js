/* 节奏小奶蛙 - localStorage 存档：进度 / 最佳成绩 / 设置 / 提示标记 */
(function () {
  const KEY = 'rf_save_v1';
  const DEF = () => ({
    v: 1,
    levels: {},            // levelId -> {best, rank, p, g, m, maxCombo, cleared}
    unlocked: 1,           // 已解锁关卡序号（全局 1..60）
    settings: { bgm: 0.8, sfx: 0.9, vib: true },
    flags: { tutorialDone: false, hints: {} }
  });
  const S = RF.save = { data: null };
  S.get = function () {
    if (!S.data) {
      try {
        const raw = localStorage.getItem(KEY);
        S.data = raw ? Object.assign(DEF(), JSON.parse(raw)) : DEF();
        S.data.settings = Object.assign(DEF().settings, S.data.settings || {});
        S.data.flags = Object.assign(DEF().flags, S.data.flags || {});
      } catch (e) { S.data = DEF(); }
    }
    return S.data;
  };
  S.flush = function () { try { localStorage.setItem(KEY, JSON.stringify(S.data)); } catch (e) { } };
  S.record = function (levelId, res) {
    const d = S.get();
    const old = d.levels[levelId];
    const rec = {
      best: Math.max(old ? old.best : 0, res.score),
      rank: res.rankRank < (old ? old.rankRank : 9) ? res.rank : (old ? old.rank : res.rank),
      rankRank: Math.min(old ? old.rankRank : 9, res.rankRank),
      p: res.p, g: res.g, m: res.m, maxCombo: res.maxCombo, cleared: (old ? old.cleared : false) || res.cleared
    };
    d.levels[levelId] = rec;
    return rec;
  };
  S.vibrate = function (ms) {
    if (S.get().settings.vib && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { } }
  };
})();
