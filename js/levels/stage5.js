/* 节奏小奶蛙 - 第五阶段「校园志」10 关配置 */
(function () {
  RF.levels = RF.levels || [];
  const L = (idx, name, bpm, mech, params, extra) => RF.levels.push(Object.assign({
    id: '5-' + idx, stage: 5, idx, name, bpm, beats: bpm, mech, params, style: 'school', levelIdx: idx
  }, extra || {}));

  L(1, '写作业', 104, 'beattap', { kind: 'hide' }, { tip: '门外有动静！踩拍点击把手机藏到书下' });
  L(2, '躲粉笔', 108, 'target', { kind: 'chalk' }, { tip: '粉笔飞来时踩拍点击闪避' });
  L(3, '食堂抢饭', 112, 'race', { kind: 'run', elbow: true, dpad: true, judgeScale: 1.5 }, { tip: '踩拍按方向肘开人群冲刺！' });
  L(4, '跑操', 116, 'race', { kind: 'run', dpad: true, judgeScale: 1.5 }, { tip: '跟住跑操方向口令，踩拍按方向' });
  L(5, '传纸条', 120, 'target', { kind: 'note' }, { tip: '点击举手的同学传纸条，别被老师发现' });
  L(6, '考试', 124, 'target', { kind: 'exam' }, { tip: '踩拍点击发光的选项' });
  L(7, '运动会', 128, 'keys', { lanes: 4, skin: 'arrows', voice: 'trumpet', labels: ['←', '↑', '→', '↓'] }, { tip: '音符落垫时点按对应箭头跳拉拉舞' });
  L(8, '班歌比赛', 132, 'beattap', { kind: 'sing' }, { tip: '踩拍点击跟唱，全班合唱！' });
  L(9, '折纸飞机', 136, 'power', { kind: 'plane' }, { tip: '按住蓄力，踩拍松手把纸飞机扔向操场' });
  L(10, '毕业不说再见', 140, 'pose', {}, { tip: '人群比姿势时，踩拍点按对应姿势按钮' });
})();
