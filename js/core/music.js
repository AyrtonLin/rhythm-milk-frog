/* 节奏小奶蛙 - 程序化 BGM 生成：谱面重音与旋律同源 → 节拍点清晰可听
   make({seed, bpm, bars, style, accents:[beat...]}) → {bpm, beat, events[], duration, style} */
(function () {
  const M = RF.music = {};
  const mtf = m => 440 * Math.pow(2, (m - 69) / 12);

  /* 各阶段音色包（后续阶段在此扩展） */
  M.STYLES = {
    sport: { root: 60, prog: [0, 7, 9, 5], penta: [0, 2, 4, 7, 9], wave: 'square', bassWave: 'triangle', drums: 'pop', mel: 0.55, hat8: true },
    home: { root: 62, prog: [0, 5, 9, 7], penta: [0, 2, 4, 7, 9], wave: 'triangle', bassWave: 'sine', drums: 'soft', mel: 0.5, hat8: true },
    stage: { root: 57, prog: [0, 3, 5, 7], penta: [0, 3, 5, 7, 10], wave: 'sawtooth', bassWave: 'square', drums: 'rock', mel: 0.65, hat8: true },
    office: { root: 59, prog: [0, 10, 5, 7], penta: [0, 2, 5, 7, 9], wave: 'square', bassWave: 'sawtooth', drums: 'funk', mel: 0.6, hat8: true },
    school: { root: 62, prog: [0, 5, 7, 9], penta: [0, 2, 4, 7, 9], wave: 'triangle', bassWave: 'triangle', drums: 'pop', mel: 0.6, hat8: true },
    dream: { root: 60, prog: [0, 5, 3, 7], penta: [0, 3, 5, 7, 10], wave: 'sine', bassWave: 'sine', drums: 'none', mel: 0.35, hat8: false, pad: true }
  };

  /* 乐器音色配方（BGM 主音用） */
  M.VOICES = {
    piano: { wave: 'triangle', att: 0.005, durMul: 1.6 },
    guitar: { wave: 'sawtooth', att: 0.004, durMul: 1.1 },
    violin: { wave: 'sawtooth', att: 0.06, durMul: 1.8 },
    flute: { wave: 'sine', att: 0.04, durMul: 1.6 },
    drums: { wave: 'square', att: 0.003, durMul: 0.6 },
    bass: { wave: 'triangle', att: 0.006, durMul: 1.3 },
    erhu: { wave: 'sawtooth', att: 0.05, durMul: 1.7 },
    trumpet: { wave: 'sawtooth', att: 0.02, durMul: 1.2 },
    harmonica: { wave: 'square', att: 0.02, durMul: 1.1 },
    tri: { wave: 'sine', att: 0.004, durMul: 1.2 }
  };
  M.make = function (cfg) {
    const r = RF.util.mulberry32(cfg.seed);
    const S = M.STYLES[cfg.style] || M.STYLES.sport;
    const beat = 60 / cfg.bpm;
    const bars = cfg.bars;
    const ev = [];
    const push = (t, tr, extra) => ev.push(Object.assign({ t: t * beat, tr }, extra));

    for (let bar = 0; bar < bars; bar++) {
      const ch = S.prog[bar % S.prog.length];
      const b0 = bar * 4;
      /* 鼓组 */
      for (let b = 0; b < 4; b++) push(b0 + b, 'tick', { vol: 0.15 });   // 每拍轻声节拍器，节奏更明显
      if (S.drums === 'pop') {
        push(b0, 'kick'); push(b0 + 2, 'kick');
        push(b0 + 1, 'snare'); push(b0 + 3, 'snare');
        for (let h = 0; h < 4; h += (S.hat8 ? 0.5 : 1)) push(b0 + h, 'hat', { vol: h % 1 === 0 ? 0.9 : 0.5 });
      } else if (S.drums === 'soft') {
        push(b0, 'kick'); push(b0 + 2.5, 'kick', { vol: 0.7 });
        push(b0 + 1, 'hat', { vol: 0.7 }); push(b0 + 3, 'hat', { vol: 0.7 });
        push(b0 + 1, 'snare', { vol: 0.45 }); push(b0 + 3, 'snare', { vol: 0.45 });
      } else if (S.drums === 'rock') {
        push(b0, 'kick'); push(b0 + 1.5, 'kick', { vol: 0.8 }); push(b0 + 2, 'kick'); push(b0 + 3.5, 'kick', { vol: 0.8 });
        push(b0 + 1, 'snare'); push(b0 + 3, 'snare');
        for (let h = 0; h < 4; h += 0.5) push(b0 + h, 'hat', { vol: h % 1 === 0 ? 1 : 0.6 });
      } else if (S.drums === 'funk') {
        push(b0, 'kick'); push(b0 + 0.75, 'kick', { vol: 0.7 }); push(b0 + 2, 'kick'); push(b0 + 2.75, 'kick', { vol: 0.7 });
        push(b0 + 1, 'snare'); push(b0 + 3, 'snare'); push(b0 + 3.5, 'snare', { vol: 0.5 });
        for (let h = 0; h < 4; h += 0.5) push(b0 + h, 'hat', { vol: h % 1 === 0 ? 0.9 : 0.7 });
      }
      /* 贝斯 */
      push(b0, 'bass', { f: mtf(S.root - 24 + ch), dur: beat * 0.9 });
      push(b0 + 2, 'bass', { f: mtf(S.root - 24 + ch + (r() < 0.4 ? 7 : 12)), dur: beat * 0.7, vol: 0.26 });
      if (S.drums === 'funk') push(b0 + 3.5, 'bass', { f: mtf(S.root - 12 + ch), dur: beat * 0.4, vol: 0.2 });
      /* 铺底（空灵风格） */
      if (S.pad) {
        [0, 7, 12].forEach(iv => push(b0, 'pad', { f: mtf(S.root - 12 + ch + iv), dur: beat * 4 }));
      }
      /* 旋律填充（避开重音拍，重音由谱面驱动） */
      for (let b = 0; b < 4; b++) {
        if (r() < S.mel) {
          const deg = S.penta[Math.floor(r() * S.penta.length)];
          push(b0 + b + (r() < 0.25 ? 0.5 : 0), 'lead', {
            f: mtf(S.root + 12 + ch + deg), dur: beat * 0.42, vol: 0.13
          });
        }
      }
    }
    /* 谱面重音 → 主旋律强拍 + 清脆 tick，让判定点“听得见” */
    (cfg.accents || []).forEach(ab => {
      const ch = S.prog[Math.floor(ab / 4) % S.prog.length];
      const deg = [0, 4, 7, 12, 16][Math.floor(r() * 5)];
      push(ab, 'lead', { f: mtf(S.root + 12 + ch + deg), dur: beat * 0.55, vol: 0.36 });
      push(ab, 'tick', { vol: 0.6 });
    });
    ev.sort((a, b) => a.t - b.t);
    return { bpm: cfg.bpm, beat, events: ev, duration: bars * 4 * beat, style: S, styleName: cfg.style, voice: cfg.voice };
  };
})();
