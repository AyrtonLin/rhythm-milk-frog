/* 节奏小奶蛙 - 关卡注册表与解锁链 */
(function () {
  const R = RF.registry = {};
  R.STAGES = [
    { n: 1, name: '运动季', icon: '🏀', desc: '运动场 · 明亮活力' },
    { n: 2, name: '生活家', icon: '🍳', desc: '温馨家居 · 暖色生活' },
    { n: 3, name: '音乐厅', icon: '🎹', desc: '舞台灯光 · 华丽乐章' },
    { n: 4, name: '职场记', icon: '💼', desc: '办公室 · 都市职场' },
    { n: 5, name: '校园志', icon: '🎒', desc: '教室校园 · 青春正好' },
    { n: 6, name: '人生路', icon: '🌌', desc: '空灵梦境 · 治愈叙事' }
  ];
  R.list = () => RF.levels || [];
  R.get = id => R.list().find(l => l.id === id);
  R.stageLevels = n => R.list().filter(l => l.stage === n).sort((a, b) => a.idx - b.idx);
  R.gi = cfg => (cfg.stage - 1) * 10 + cfg.idx;              // 全局序号 1..60
  R.stageUnlocked = n => {
    if (n === 1) return true;
    const built = R.stageLevels(n).length > 0;
    return built && RF.save.get().unlocked > (n - 1) * 10;
  };
  R.levelUnlocked = cfg => RF.save.get().unlocked >= R.gi(cfg);
  R.nextOf = cfg => R.list().find(l => l.stage === cfg.stage && l.idx === cfg.idx + 1);
})();
