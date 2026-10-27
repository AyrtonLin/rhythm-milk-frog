/* 节奏小奶蛙 - 第二阶段「生活家」10 关配置 */
(function () {
  RF.levels = RF.levels || [];
  const L = (idx, name, bpm, mech, params, extra) => RF.levels.push(Object.assign({
    id: '2-' + idx, stage: 2, idx, name, bpm, beats: bpm, mech, params, style: 'home', levelIdx: idx
  }, extra || {}));

  L(1, '拍苍蝇', 92, 'target', { kind: 'fly', prop: 'flyswat' }, { tip: '苍蝇停在节拍环上时点击拍打' });
  L(2, '修水管', 96, 'target', { kind: 'pipe', prop: 'wrench' }, { tip: '踩拍点击喷水裂口止水' });
  L(3, '晾衣服', 100, 'target', { kind: 'hanger', prop: 'shirt' }, { tip: '衣架滑进中间金色区域时点击晾上' });
  L(4, '洗碗', 104, 'beattap', { kind: 'dish', prop: 'sponge' }, { tip: '踩准节拍点击洗碗，踩错碗会碎' });
  L(5, '扫地', 108, 'beattap', { kind: 'sweep', prop: 'broom' }, { tip: '踩拍点击污渍清扫，踩错会滑倒' });
  L(6, '买菜', 112, 'target', { kind: 'veg', prop: 'basket' }, { tip: '点击新鲜菜篮子，别碰烂菜' });
  L(7, '接住阿姨的菜', 116, 'fall', { kind: 'veg', prop: 'basket' }, { tip: '菜落到接菜线时点击对应轨道' });
  L(8, '浇花', 120, 'target', { kind: 'water', prop: 'can' }, { tip: '花快枯了！踩拍点击花盆浇水' });
  L(9, '垃圾分类', 124, 'choice', { judgeScale: 1.3, cueWinBeats: 6 }, { tip: '看清物品与背景对照表，踩拍点击正确垃圾桶' });
  L(10, '取快递', 128, 'fall', { kind: 'parcel' }, { tip: '快递从格口落下，踩拍点击轨道接住' });
})();
