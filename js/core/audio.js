/* 节奏小奶蛙 - Web Audio 引擎：合成器 + look-ahead 调度器
   关键设计：游戏时钟 = 音频时钟（songTime = ctx.currentTime - t0），判定与音乐零漂移；
   暂停用 ctx.suspend() 冻结时钟，恢复零误差。 */
(function () {
  const A = RF.audio = {
    ctx: null, master: null, bgm: null, sfx: null,
    unlocked: false, _st: null, _timer: null, _noise: null
  };

  A.unlock = function () {
    if (!A.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      A.ctx = new AC();
      A.master = A.ctx.createGain();
      A.master.connect(A.ctx.destination);
      A.bgm = A.ctx.createGain(); A.bgm.connect(A.master);
      A.sfx = A.ctx.createGain(); A.sfx.connect(A.master);
      const s = RF.save.get().settings;
      A.master.gain.value = 0.9;
      A.bgm.gain.value = s.bgm;
      A.sfx.gain.value = s.sfx;
      // 噪声缓冲（鼓组/音效用）
      const len = A.ctx.sampleRate;
      A._noise = A.ctx.createBuffer(1, len, A.ctx.sampleRate);
      const d = A._noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (A.ctx.state === 'suspended') A.ctx.resume();
    A.unlocked = true;
    return true;
  };

  A.setVolumes = function (s) {
    if (!A.ctx) return;
    A.bgm.gain.value = s.bgm;
    A.sfx.gain.value = s.sfx;
  };

  A.now = () => (A.ctx ? A.ctx.currentTime : 0);

  /* ---------- 合成声部 ---------- */
  A.tone = function (o) {
    if (!A.ctx) return;
    const c = A.ctx, t = o.t, dur = o.dur || 0.2;
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(Math.max(20, o.f), t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(o.vol || 0.2, t + (o.att || 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(o.dest || A.bgm);
    osc.start(t); osc.stop(t + dur + 0.06);
  };
  A.noise = function (o) {
    if (!A.ctx || !A._noise) return;
    const c = A.ctx, t = o.t, dur = o.dur || 0.1;
    const src = c.createBufferSource(); src.buffer = A._noise;
    const f = c.createBiquadFilter();
    f.type = o.filter || 'bandpass'; f.frequency.value = o.freq || 1800; f.Q.value = o.q || 0.9;
    const g = c.createGain();
    g.gain.setValueAtTime(o.vol || 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(o.dest || A.bgm);
    src.start(t); src.stop(t + dur + 0.02);
  };
  const drum = {
    kick(t, v) { A.tone({ t, f: 150, f2: 44, dur: 0.16, vol: (v || 1) * 0.85, type: 'sine' }); },
    snare(t, v) { A.noise({ t, dur: 0.12, vol: (v || 1) * 0.32, freq: 1900, q: 0.8 }); A.tone({ t, f: 210, f2: 120, dur: 0.08, vol: (v || 1) * 0.16, type: 'triangle' }); },
    hat(t, v) { A.noise({ t, dur: 0.045, vol: (v || 1) * 0.16, freq: 8000, filter: 'highpass', q: 0.7 }); },
    tick(t, v) { A.tone({ t, f: 1500, f2: 1100, dur: 0.05, vol: (v || 1) * 0.22, type: 'square' }); }
  };
  A.drum = drum;

  /* ---------- 歌曲调度 ---------- */
  A.play = function (song) {
    if (!A.ctx) return;
    A.stop();
    /* 修复：暂停/退出遗留的 suspended 时钟必须恢复，否则新关卡停摆 */
    if (A.ctx.state === 'suspended') A.ctx.resume();
    A._st = { song, i: 0, t0: A.ctx.currentTime + 0.15 };
    A._timer = setInterval(A._tick, 25);
  };
  A._tick = function () {
    const st = A._st; if (!st || !A.ctx) return;
    const ahead = A.ctx.currentTime + 0.15;
    const evs = st.song.events;
    while (st.i < evs.length && evs[st.i].t + st.t0 <= ahead) {
      A._schedule(evs[st.i], evs[st.i].t + st.t0);
      st.i++;
    }
  };
  A._schedule = function (ev, t) {
    const S = (A._st && A._st.song && A._st.song.style) || {};
    switch (ev.tr) {
      case 'lead': {
        const vp = RF.music.VOICES[(A._st && A._st.song.voice)] || {};
        A.tone({ t, f: ev.f, dur: ev.dur * (vp.durMul || 1), vol: ev.vol, type: vp.wave || S.wave || 'square', att: vp.att || 0.008 });
        break;
      }
      case 'bass': A.tone({ t, f: ev.f, dur: ev.dur, vol: ev.vol || 0.34, type: S.bassWave || 'triangle' }); break;
      case 'pad': A.tone({ t, f: ev.f, dur: ev.dur, vol: ev.vol || 0.08, type: 'sine', att: 0.08 }); break;
      case 'kick': drum.kick(t, ev.vol); break;
      case 'snare': drum.snare(t, ev.vol); break;
      case 'hat': drum.hat(t, ev.vol); break;
      case 'tick': drum.tick(t, ev.vol); break;
    }
  };
  A.songTime = function () { return A._st ? A.ctx.currentTime - A._st.t0 : 0; };
  A.playing = () => !!A._st;
  A.pause = function () { if (A.ctx && A.ctx.state === 'running') A.ctx.suspend(); };
  A.resume = function () { if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume(); };
  A.stop = function () {
    if (A._timer) { clearInterval(A._timer); A._timer = null; }
    A._st = null;
  };
})();
