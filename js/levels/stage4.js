/* 节奏小奶蛙 - 第四阶段「职场记」10 关配置 */
(function () {
  RF.levels = RF.levels || [];
  const L = (idx, name, bpm, mech, params, extra) => RF.levels.push(Object.assign({
    id: '4-' + idx, stage: 4, idx, name, bpm, beats: bpm, mech, params, style: 'office', levelIdx: idx
  }, extra || {}));

  L(1, '打卡', 112, 'target', { kind: 'clock' }, { tip: '设备亮起时踩拍点击打卡' });
  L(2, '填表格', 116, 'target', { kind: 'data' }, { tip: '数据浮现时踩拍点击使其留存' });
  L(3, '开会', 120, 'tri', {}, { tip: '铃声响起，踩拍点按正确按键静音' });
  L(4, '摸鱼', 124, 'beattap', { kind: 'slack' }, { tip: '经理巡查！踩拍点击切换屏幕' });
  L(5, '写代码', 128, 'target', { kind: 'code' }, { tip: '点击绿色正确代码，避开红色错误' });
  L(6, '接线路', 132, 'target', { kind: 'wire' }, { tip: '踩拍点击断开处修理线路' });
  L(7, '开闸放水', 136, 'target', { kind: 'gate' }, { tip: '闸门喷水时踩拍点击关闸' });
  L(8, '接电话', 140, 'target', { kind: 'phone' }, { tip: '电话响起时踩拍点击接听' });
  L(9, '准时下班', 144, 'beattap', { kind: 'boss' }, { tip: '主管回头时踩拍点击隐蔽' });
  L(10, '赶公交', 148, 'race', { kind: 'run', dpad: true, judgeScale: 1.5, autoWin: true }, { tip: '踩拍按方向键冲刺赶车（WASD/屏幕方向键）' });
})();
