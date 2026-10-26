/* 节奏小奶蛙 - 计分 / 连击 / 评级（全关卡统一） */
(function () {
  const S = RF.scoring = {};
  S.create = function (maxScore) {
    return {
      p: 0, g: 0, m: 0, combo: 0, maxCombo: 0, score: 0, maxScore,
      add(tier) {
        if (tier === 'P') { this.p++; this.combo++; }
        else if (tier === 'G') { this.g++; this.combo++; }
        else { this.m++; this.combo = 0; }
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        const base = tier === 'P' ? 300 : tier === 'G' ? 150 : 0;
        this.score += Math.round(base * RF.chart.comboMult(this.combo));
        return tier;
      },
      finish() {
        const rate = this.maxScore > 0 ? this.score / this.maxScore : 0;
        let rank = 'D', rr = 5;
        if (rate >= 0.9) { rank = 'S'; rr = 1; }
        else if (rate >= 0.8) { rank = 'A'; rr = 2; }
        else if (rate >= 0.65) { rank = 'B'; rr = 3; }
        else if (rate >= 0.5) { rank = 'C'; rr = 4; }
        return { rate, rank, rankRank: rr, cleared: rr <= 4 };
      }
    };
  };
})();
