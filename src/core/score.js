/* 节奏小奶蛙 - 计分/连击/评级 */
(function(){
'use strict';
const RF=window.RF;
RF.ScoreKeeper=function(){this.reset();};
RF.ScoreKeeper.prototype={
  reset:function(){
    this.perfect=0;this.good=0;this.miss=0;
    this.combo=0;this.maxCombo=0;
    this.score=0;this.bonus=0;this.total=0;
  },
  /* 连击加成：每 10 连击 +10%，封顶 ×1.5 */
  mult:function(){return 1+Math.min(Math.floor(this.combo/10)*0.1,0.5);},
  hit:function(kind,powerBonus){
    powerBonus=powerBonus||0;
    if(kind==='miss'){this.combo=0;this.miss++;return 0;}
    if(kind==='perfect')this.perfect++;else this.good++;
    this.combo++;if(this.combo>this.maxCombo)this.maxCombo=this.combo;
    const base=kind==='perfect'?100:60;
    const gain=Math.round(base*this.mult())+Math.round(powerBonus);
    this.score+=gain;this.bonus+=Math.round(powerBonus);
    return gain;
  },
  judged:function(){return this.perfect+this.good+this.miss;},
  acc:function(){const j=this.judged();return j?(this.perfect+this.good*0.6)/j:1;},
  rank:function(){const a=this.acc();return a>=0.92?'S':(a>=0.78?'A':(a>=0.6?'B':'C'));}
};
})();
