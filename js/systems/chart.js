/* 节奏小奶蛙 - 谱面生成（种子确定性：重玩谱面一致，可公平刷分）
   make(cfg) cfg:{id, bpm, beats, mech, params, levelIdx}
   → {notes:[{i,beat,t,type,dir,zone,aim}], beatSec, duration, maxScore} */
(function () {
  const C = RF.chart = {};
  const U = RF.util;
  /* 蓄力满程时长（秒）：与引导/提示文案统一 */
  C.FULL = 1.0;
  /* 每关音符数（阶段内难度递增，10 关曲线） */
  const COUNTS = [26, 30, 34, 38, 42, 46, 50, 54, 58, 62];

  C.make = function (cfg) {
    const r = RF.util.mulberry32(RF.util.hashStr(cfg.id));
    const beatSec = 60 / cfg.bpm;
    let total = cfg.beats;
    const intro = 4, outro = 4;
    const usable = total - intro - outro;
    let count = Math.min(COUNTS[(cfg.levelIdx - 1) % 10] || 30, Math.floor(usable / 0.5));
    if (cfg.params && cfg.params.dense) count = Math.round(count * 1.35);   // 高密度关（三角铁等）
    const notes = [];
    /* 以基础间隔铺点，再按种子做 ±0.5 拍微扰（保持网格对齐） */
    let base = Math.max(0.5, Math.round((usable / count) * 2) / 2);
    if (cfg.mech === 'power') {
      /* 蓄力关：每音符前 1 秒倒计时(3-2-1快闪) → 间隔 2.1~3.0s，时长 ≈ 1 分钟 */
      const li = (cfg.levelIdx - 1) % 10;
      count = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25][li];
      const gapSec = [3.0, 2.9, 2.8, 2.7, 2.6, 2.5, 2.4, 2.3, 2.2, 2.1][li];
      base = Math.max(2, Math.round(gapSec / beatSec * 2) / 2);
    }
    let t = intro, i = 0;
    while (t <= total - outro && i < count + (cfg.mech === 'power' ? 1 : 6)) {
      notes.push({ i: i, beat: t, t: t * beatSec, judged: false, tier: null });
      let gap = base;
      const roll = r();
      if (base >= 1.5 && roll < 0.25) gap = base - 0.5;
      else if (base >= 1 && roll > 0.82) gap = base - 0.5;
      else if (base <= 1.5 && roll > 0.9) gap = base + 0.5;
      t = Math.round((t + Math.max(0.5, gap)) * 2) / 2;
      i++;
    }
    /* 蓄力关：开局预留首个 1 秒倒计时 */
    let cdSegs = null;
    if (cfg.mech === 'power') {
      const baseOff = Math.max(0.5, (2.5 - intro * beatSec) / beatSec);
      notes.forEach(n => { n.beat += baseOff; n.t = n.beat * beatSec; });
      total = Math.ceil(notes[notes.length - 1].beat) + 4;
    }
    /* 机制附加字段 */
    const zoneCenters = [35, 55, 72, 88];
    notes.forEach((n, k) => {
      if (cfg.mech === 'power') {
        /* 目标力度所需按压时长必须 ≤ 间隔-1.8s（前面要放 1 秒倒计时+缓冲） */
        const prevB = k > 0 ? notes[k - 1].beat : 0;
        const avail = (n.beat - prevB) * beatSec;
        const maxC = U.clamp(Math.min(avail / C.FULL * 100 * 0.85, (avail - 1.8) / C.FULL * 100), 30, 95);
        let c = zoneCenters[Math.floor(r() * zoneCenters.length)] + U.rr(r, -6, 6);
        c = Math.min(c, maxC);
        n.zone = { c: U.clamp(c, 20, 95), p: 10, g: 20 };   // 力度目标区间（P/G 半宽）
        n.aim = k % 4;                                            // 目标位置循环种子
        n.dir = r() < 0.5 ? 'L' : 'R';
      } else if (cfg.mech === 'swing') {
        n.dir = Math.floor(r() * 3);          // 0 左 / 1 中 / 2 右 来球方向
        n.ret = Math.floor(r() * 3);          // 回球方向
      } else if (cfg.mech === 'race') {
        const prev = notes[k - 1];
        if (k > 2 && r() < 0.16) n.dir = r() < 0.5 ? 'U' : 'D';   // 跳跃/下蹲障碍
        else n.dir = (prev && (prev.dir === 'L' || prev.dir === 'R') && r() < 0.55) ? prev.dir : (r() < 0.5 ? 'L' : 'R');
      } else if (cfg.mech === 'target') {
        n.px = U.rr(r, 0.2, 0.8); n.py = U.rr(r, 0.3, 0.58);
        n.ph = U.rr(r, 0, 6.28); n.side = r() < 0.5 ? 0 : 1;
        n.aim = Math.floor(r() * 8);
      } else if (cfg.mech === 'beattap') {
        n.px = U.rr(r, 0.25, 0.75); n.py = U.rr(r, 0.4, 0.62);
      } else if (cfg.mech === 'fall') {
        n.lane = Math.floor(r() * 3);
      } else if (cfg.mech === 'choice') {
        n.item = Math.floor(r() * 8);
      } else if (cfg.mech === 'pose') {
        n.item = Math.floor(r() * 4);
      } else if (cfg.mech === 'keys') {
        n.lane = Math.floor(r() * (cfg.params.lanes || 4));
      } else if (cfg.mech === 'tri') {
        n.item = Math.floor(r() * 3);
      }
    });
    /* 蓄力关：每个音符的倒计时段（1 秒快闪 3-2-1，终点 = “按住!”出现时刻） */
    if (cfg.mech === 'power') {
      cdSegs = notes.map((n, k) => {
        const cue = n.t - n.zone.c / 100 * C.FULL;
        return { a: Math.max(0.2, cue - 1), b: cue, i: k };
      });
    }
    /* 满分模拟：全 Perfect 连击加成 */
    let combo = 0, maxScore = 0;
    notes.forEach(() => { combo++; maxScore += 300 * C.comboMult(combo); });
    return {
      notes, beatSec, duration: total * beatSec, totalBeats: total, maxScore,
      count: notes.length, cdSegs
    };
  };
  C.comboMult = combo => 1 + Math.min(0.5, Math.floor(combo / 10) * 0.05);
})();
