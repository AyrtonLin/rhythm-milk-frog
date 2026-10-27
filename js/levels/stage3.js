/* 节奏小奶蛙 - 第三阶段「音乐厅」10 关配置（voice = 乐器音色，命中音与 BGM 主音共用） */
(function () {
  RF.levels = RF.levels || [];
  const L = (idx, name, bpm, mech, params, extra) => RF.levels.push(Object.assign({
    id: '3-' + idx, stage: 3, idx, name, bpm, beats: bpm, mech, params, style: 'stage', levelIdx: idx
  }, extra || {}));

  L(1, '弹钢琴', 105, 'keys', { lanes: 5, skin: 'piano', voice: 'piano', labels: ['Do', 'Re', 'Mi', 'Fa', 'Sol'] }, { tip: '音符落到琴键时点按对应键（键盘 A S D F G）' });
  L(2, '弹吉他', 110, 'keys', { lanes: 6, skin: 'strings', voice: 'guitar', labels: ['E', 'A', 'D', 'G', 'B', 'e'], prop: 'guitar' }, { tip: '六根弦：音符落桥时点对应弦' });
  L(3, '小提琴', 115, 'keys', { lanes: 4, skin: 'strings', voice: 'violin', labels: ['G', 'D', 'A', 'E'], prop: 'violin' }, { tip: '四弦落音，踩拍拉响' });
  L(4, '吹笛子', 120, 'keys', { lanes: 6, skin: 'wind', voice: 'flute', labels: ['1', '2', '3', '4', '5', '6'], prop: 'flute' }, { tip: '音符落线时按对应气孔' });
  L(5, '三角铁', 125, 'beattap', { kind: 'tri', dense: true, prop: 'mallet' }, { tip: '高密度节奏！踩拍敲击三角铁' });
  L(6, '架子鼓', 130, 'keys', { lanes: 5, skin: 'drums', voice: 'drums', labels: ['K', 'S', 'H', 'T', 'R'], prop: 'sticks' }, { tip: '鼓点落在对应鼓/镲上，及时敲击' });
  L(7, '弹贝斯', 135, 'keys', { lanes: 4, skin: 'strings', voice: 'bass', labels: ['E', 'A', 'D', 'G'], prop: 'guitar' }, { tip: '贝斯线更低更沉，跟住' });
  L(8, '拉二胡', 140, 'keys', { lanes: 3, skin: 'strings', voice: 'erhu', labels: ['Do', 'Sol', 'Re'], prop: 'erhu' }, { tip: '三弦急奏，手速跟上' });
  L(9, '吹小号', 150, 'keys', { lanes: 3, skin: 'wind', voice: 'trumpet', labels: ['1', '2', '3'], prop: 'trumpet' }, { tip: '高速活塞组合，吹出华彩' });
  L(10, '吹口琴', 160, 'keys', { lanes: 6, skin: 'wind', voice: 'harmonica', labels: ['吹', '吸', '吹', '吸', '吹', '吸'], prop: 'harmonica' }, { tip: '终章 160 BPM：吹吸交替全速前进' });
})();
