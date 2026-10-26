/* 节奏小奶蛙 - DOM 界面层：标题 / 选关 / 结算 / 庆祝 / 设置 / 暂停 / toast */
(function () {
  const UI = RF.ui = {};
  const $ = id => document.getElementById(id);
  let curStage = 1;

  UI.showScreen = function (id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  };
  UI.toast = function (msg, ms) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(UI._toastT);
    UI._toastT = setTimeout(() => t.classList.add('hidden'), ms || 1800);
  };
  UI.showPauseBtn = function (on) { $('pauseBtn').classList.toggle('hidden', !on); };

  UI.init = function () {
    /* 启动遮罩：首触解锁音频（微信/iOS 必需） */
    $('scr-boot').addEventListener('pointerdown', () => {
      RF.audio.unlock();
      RF.sfx.ui();
      UI.showScreen('scr-title');
    }, { once: true });

    $('btn-start').onclick = () => {
      RF.sfx.ui();
      const gi = Math.min(RF.save.get().unlocked, 60);
      const cfg = RF.registry.list().find(l => RF.registry.gi(l) === gi);
      if (cfg) UI.startLevel(cfg);
      else { curStage = 1; UI.renderSelect(); UI.showScreen('scr-select'); }
    };
    $('btn-select').onclick = () => { RF.sfx.ui(); UI.renderSelect(); UI.showScreen('scr-select'); };
    $('btn-settings').onclick = () => { RF.sfx.ui(); UI.syncSettings(); UI.showScreen('scr-settings'); };

    $('btn-select-back').onclick = () => { RF.sfx.ui(); UI.showScreen('scr-title'); };

    $('btn-retry').onclick = () => { RF.sfx.ui(); UI.startLevel(UI._lastCfg); };
    $('btn-next').onclick = () => {
      RF.sfx.ui();
      const nx = RF.registry.nextOf(UI._lastCfg);
      if (nx && RF.registry.levelUnlocked(nx)) UI.startLevel(nx);
      else { UI.renderSelect(); UI.showScreen('scr-select'); }
    };
    $('btn-result-select').onclick = () => { RF.sfx.ui(); UI.renderSelect(); UI.showScreen('scr-select'); };

    $('btn-cele-continue').onclick = () => { RF.sfx.ui(); curStage = Math.min(6, UI._celeStage + 1); UI.renderSelect(); UI.showScreen('scr-select'); };
    $('btn-cele-select').onclick = () => { RF.sfx.ui(); UI.renderSelect(); UI.showScreen('scr-select'); };

    $('btn-settings-close').onclick = () => { RF.sfx.ui(); UI.showScreen('scr-title'); };
    $('set-bgm').oninput = e => { RF.save.get().settings.bgm = e.target.value / 100; RF.save.flush(); RF.audio.setVolumes(RF.save.get().settings); };
    $('set-sfx').oninput = e => { RF.save.get().settings.sfx = e.target.value / 100; RF.save.flush(); RF.audio.setVolumes(RF.save.get().settings); };
    $('set-vib').onchange = e => { RF.save.get().settings.vib = e.target.checked; RF.save.flush(); };

    $('pauseBtn').onclick = () => { RF.sfx.ui(); RF.play.pause(); UI.showScreen('scr-pause'); };
    $('btn-resume').onclick = () => { RF.sfx.ui(); UI.showScreen(null); RF.play.resume(); };
    $('btn-restart').onclick = () => { RF.sfx.ui(); UI.showScreen(null); RF.play.start(RF.play.cfg); };
    $('btn-quit').onclick = () => {
      RF.sfx.ui();
      RF.audio.stop();
      RF.play.active = false; RF.play.state = 'idle';
      UI.showPauseBtn(false);
      UI.renderSelect(); UI.showScreen('scr-select');
    };
  };

  UI.syncSettings = function () {
    const s = RF.save.get().settings;
    $('set-bgm').value = Math.round(s.bgm * 100);
    $('set-sfx').value = Math.round(s.sfx * 100);
    $('set-vib').checked = !!s.vib;
  };

  UI.startLevel = function (cfg) {
    UI._lastCfg = cfg;
    UI.showScreen(null);
    RF.play.start(cfg);
  };

  UI.renderSelect = function () {
    const tabs = $('stage-tabs'), grid = $('level-grid');
    tabs.innerHTML = ''; grid.innerHTML = '';
    RF.registry.STAGES.forEach(st => {
      const b = document.createElement('button');
      const un = RF.registry.stageUnlocked(st.n);
      b.className = 'stage-tab' + (st.n === curStage ? ' on' : '') + (un ? '' : ' lock');
      b.innerHTML = '<i>' + st.icon + '</i><span>' + st.name + '</span>';
      b.onclick = () => {
        if (!un) { RF.sfx.miss(); UI.toast(st.n > 2 ? '🔒 该阶段开发中，敬请期待' : '🔒 通关上一阶段后解锁'); return; }
        RF.sfx.ui(); curStage = st.n; UI.renderSelect();
      };
      tabs.appendChild(b);
    });
    const levels = RF.registry.stageLevels(curStage);
    if (!levels.length) {
      grid.innerHTML = '<div class="empty-tip">该阶段关卡正在开发中…<br>敬请期待 🐸</div>';
    }
    levels.forEach(cfg => {
      const un = RF.registry.levelUnlocked(cfg);
      const rec = RF.save.get().levels[cfg.id];
      const b = document.createElement('button');
      b.className = 'level-btn' + (un ? '' : ' lock');
      b.innerHTML =
        '<div class="lv-num">' + cfg.idx + '</div>' +
        '<div class="lv-name">' + cfg.name + '</div>' +
        '<div class="lv-rank ' + (rec && rec.cleared ? 'rank-' + rec.rank : '') + '">' +
        (un ? (rec && rec.cleared ? rec.rank : '·') : '🔒') + '</div>';
      b.onclick = () => {
        if (!un) { RF.sfx.miss(); UI.toast('🔒 先通过第 ' + (cfg.idx - 1) + ' 关'); return; }
        RF.sfx.ui(); UI.startLevel(cfg);
      };
      grid.appendChild(b);
    });
    const cleared = RF.registry.list().filter(l => (RF.save.get().levels[l.id] || {}).cleared).length;
    $('select-total').textContent = '已通关 ' + cleared + ' / 60';
  };

  UI.result = function (cfg, res, sc, rec) {
    UI._lastCfg = cfg;
    $('result-rank').textContent = res.rank;
    $('result-rank').className = 'result-rank rank-' + res.rank;
    $('result-title').textContent = res.cleared ? '关卡完成！' : '差一点点…再试一次！';
    $('result-rows').innerHTML =
      '<div class="r-row"><span>PERFECT</span><b class="c-p">' + sc.p + '</b></div>' +
      '<div class="r-row"><span>GOOD</span><b class="c-g">' + sc.g + '</b></div>' +
      '<div class="r-row"><span>MISS</span><b class="c-m">' + sc.m + '</b></div>' +
      '<div class="r-row"><span>最大连击</span><b>' + sc.maxCombo + '</b></div>' +
      '<div class="r-row"><span>得分率</span><b>' + Math.round(res.rate * 100) + '%</b></div>';
    $('result-score').innerHTML = sc.score + ' 分' + (rec && rec.best === sc.score ? ' <i class="newrec">新纪录!</i>' : '');
    const nx = RF.registry.nextOf(cfg);
    $('btn-next').style.display = (nx && RF.registry.levelUnlocked(nx)) ? '' : 'none';
    UI.showScreen('scr-result');
  };

  UI.celebration = function (stage, res, sc) {
    UI._celeStage = stage;
    $('cele-title').textContent = '第 ' + stage + ' 阶段完成！';
    const lv = RF.registry.stageLevels(stage);
    $('cele-sub').textContent = '本阶段最后一关得分 ' + sc.score + ' · 评级 ' + res.rank;
    $('cele-stars').innerHTML = lv.map(l => {
      const r = (RF.save.get().levels[l.id] || {}).rank;
      return '<div class="cele-lv"><i>' + l.idx + '</i><b class="' + (r ? 'rank-' + r : '') + '">' + (r || '·') + '</b></div>';
    }).join('');
    UI.showScreen('scr-celebration');
    /* 彩带 */
    const wrap = $('scr-celebration');
    for (let i = 0; i < 24; i++) {
      const c = document.createElement('i');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + '%';
      c.style.background = ['#FFD34D', '#FF8A65', '#5AC8FA', '#81C784', '#F48FB1'][i % 5];
      c.style.animationDelay = (Math.random() * 1.2) + 's';
      c.style.animationDuration = (2 + Math.random() * 1.5) + 's';
      wrap.appendChild(c);
      setTimeout(() => c.remove(), 4000);
    }
  };
})();
