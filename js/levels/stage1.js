/* 节奏小奶蛙 - 第一阶段「运动季」10 关配置 */
(function () {
  RF.levels = RF.levels || [];
  const L = (idx, name, bpm, mech, params, extra) => RF.levels.push(Object.assign({
    id: '1-' + idx, stage: 1, idx, name, bpm, beats: bpm, mech, params, style: 'sport', levelIdx: idx
  }, extra || {}));

  L(1, '投篮练习', 96, 'power', { kind: 'basket', prop: 'basketball' }, { tutorial: true, tip: '按住蓄力，踩准节拍松手投篮' });
  L(2, '羽毛球', 100, 'swing', { kind: 'badminton', prop: 'badminton', ballProp: 'shuttle' }, { tip: '球飞到身边时点击挥拍' });
  L(3, '乒乓球', 104, 'swing', { kind: 'tt', prop: 'ttpaddle', ballProp: 'ttball', ballScale: 0.62 }, { tip: '球路更快，盯紧节拍环' });
  L(4, '足球射门', 108, 'power', { kind: 'goal' }, { tip: '按住蓄力，踩拍射门，瞄亮圈角落' });
  L(5, '排球', 112, 'swing', { kind: 'vb', ballProp: 'volleyball', ballScale: 1.1 }, { tip: '来球方向不同，动作也不同' });
  L(6, '网球', 116, 'swing', { kind: 'tennis', prop: 'tennis', ballProp: 'tennisball' }, { tip: '踩得越准，回球落点越深且不出界' });
  L(7, '踢毽子', 118, 'power', { kind: 'jianzi' }, { tip: '按住时长=毽子高度，对准目标线松手' });
  L(8, '扔飞镖', 120, 'power', { kind: 'dart', prop: 'dart' }, { tip: '标靶距离会变，力度要对准区间' });
  L(9, '打飞盘', 124, 'swing', { kind: 'frisbee', prop: 'toygun', ballProp: 'frisbee', ballScale: 1.15 }, { tip: '飞盘飞到中线时点击射击' });
  L(10, '冲刺赛车', 128, 'race', { kind: 'race', prop: 'wheel', dpad: true, judgeScale: 1.7, autoWin: true }, { tip: '弯道/障碍踩拍按对应方向：键盘 W A S D 或屏幕方向键' });
})();
