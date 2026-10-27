/* 节奏小奶蛙 - 合成音效表（全部程序生成，零音频文件） */
(function () {
  const S = RF.sfx = {};
  const t0 = () => RF.audio.now();
  const T = o => RF.audio.tone(Object.assign({ t: t0(), dest: RF.audio.sfx }, o));
  const N = o => RF.audio.noise(Object.assign({ t: t0(), dest: RF.audio.sfx }, o));

  S.ui = () => T({ f: 700, f2: 900, dur: 0.07, vol: 0.25, type: 'triangle' });
  S.perfect = () => { T({ f: 880, dur: 0.09, vol: 0.3, type: 'triangle' }); T({ f: 1320, dur: 0.14, vol: 0.26, type: 'triangle' }); T({ f: 1760, dur: 0.2, vol: 0.14, type: 'sine' }); };
  S.good = () => { T({ f: 660, dur: 0.1, vol: 0.26, type: 'triangle' }); T({ f: 880, dur: 0.12, vol: 0.14, type: 'sine' }); };
  S.miss = () => { T({ f: 160, f2: 70, dur: 0.22, vol: 0.35, type: 'sine' }); N({ dur: 0.12, vol: 0.14, freq: 300, filter: 'lowpass' }); };
  S.whoosh = () => N({ dur: 0.16, vol: 0.2, freq: 900, q: 1.4 });
  S.hit = () => { N({ dur: 0.06, vol: 0.3, freq: 2600, q: 1.2 }); T({ f: 420, f2: 240, dur: 0.08, vol: 0.2, type: 'triangle' }); };
  S.bounce = () => T({ f: 300, f2: 120, dur: 0.12, vol: 0.3, type: 'sine' });
  S.swish = () => N({ dur: 0.2, vol: 0.16, freq: 3200, filter: 'highpass' });
  S.pop = () => T({ f: 500, f2: 900, dur: 0.08, vol: 0.3, type: 'square' });
  S.charge = p => T({ f: 300 + p * 600, dur: 0.05, vol: 0.08, type: 'square' });
  S.whistle = () => { T({ f: 2100, dur: 0.12, vol: 0.2, type: 'square' }); T({ f: 2500, dur: 0.2, vol: 0.18, type: 'square' }); };
  S.shatter = () => { N({ dur: 0.3, vol: 0.3, freq: 4000, filter: 'highpass' }); T({ f: 1200, f2: 300, dur: 0.2, vol: 0.12, type: 'triangle' }); };
  S.score = () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => T({ f, dur: 0.18, vol: 0.24, type: 'triangle' }), i * 90)); };
  S.fail = () => { [330, 262, 196].forEach((f, i) => setTimeout(() => T({ f, dur: 0.25, vol: 0.24, type: 'triangle' }), i * 140)); };
  S.ting = () => { T({ f: 2093, dur: 0.35, vol: 0.22, type: 'sine' }); T({ f: 3150, dur: 0.22, vol: 0.08, type: 'sine' }); };
  S.key = i => {
    const deg = [0, 2, 4, 7, 9, 12, 14, 16][i % 8];
    T({ f: 523.25 * Math.pow(2, deg / 12), dur: 0.28, vol: 0.26, type: 'triangle' });
    T({ f: 523.25 * Math.pow(2, deg / 12) * 2, dur: 0.18, vol: 0.1, type: 'sine' });
  };
  S.count = hi => T({ f: hi ? 1560 : 900, dur: hi ? 0.2 : 0.09, vol: 0.3, type: 'square' });
  S.dart = () => { N({ dur: 0.08, vol: 0.24, freq: 2400, q: 1.6 }); T({ f: 900, f2: 300, dur: 0.1, vol: 0.16, type: 'square' }); };
  S.shot = () => { N({ dur: 0.09, vol: 0.34, freq: 1500, q: 0.7 }); T({ f: 220, f2: 90, dur: 0.12, vol: 0.3, type: 'sine' }); };
  S.engine = () => T({ f: 90, f2: 160, dur: 0.3, vol: 0.16, type: 'sawtooth' });
  S.drift = () => N({ dur: 0.25, vol: 0.2, freq: 700, q: 1.1 });
  S.splash = () => N({ dur: 0.25, vol: 0.2, freq: 1200, filter: 'lowpass' });
})();
