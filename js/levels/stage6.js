/* 节奏小奶蛙 - 第六阶段「人生路」10 关配置（空灵治愈叙事） */
(function () {
  RF.levels = RF.levels || [];
  const L = (idx, name, bpm, mech, params, extra) => RF.levels.push(Object.assign({
    id: '6-' + idx, stage: 6, idx, name, bpm, beats: bpm, mech, params, style: 'dream', levelIdx: idx
  }, extra || {}));

  L(1, '懵懂', 72, 'target', { kind: 'balloon' }, { tip: '点击按顺序发光的气球' });
  L(2, '迷茫', 76, 'target', { kind: 'spark' }, { tip: '空白世界里，朝闪光处踩拍前行' });
  L(3, '成长', 80, 'keys', { lanes: 5, skin: 'stairs', voice: 'piano', labels: ['Ⅰ', '', 'Ⅲ', '', 'Ⅴ'], ending: 'door' }, { tip: '踩拍踏上发光台阶，尽头推门' });
  L(4, '星火', 84, 'target', { kind: 'firefly' }, { tip: '踩拍收集萤火虫，点亮夜空' });
  L(5, '勇气', 88, 'target', { kind: 'lamp' }, { tip: '踩拍点亮路灯，照亮前路' });
  L(6, '离别', 92, 'fall', { kind: 'petal' }, { tip: '踩拍点按轨道，用伞接住飘落的花瓣' });
  L(7, '思念', 84, 'target', { kind: 'boat' }, { tip: '踩拍护航纸船，躲开暗礁' });
  L(8, '风暴', 88, 'beattap', { kind: 'cloud' }, { tip: '踩拍点击驱散乌云，等天晴' });
  L(9, '星河', 92, 'power', { kind: 'star' }, { tip: '按住蓄力，踩拍让星光升上目标高度' });
  L(10, '归家', 96, 'race', { kind: 'walk', dpad: true, judgeScale: 1.5, ending: 'home' }, { tip: '走过四季，踩拍按方向走向家' });
})();
