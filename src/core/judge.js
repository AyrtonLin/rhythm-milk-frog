/* 节奏小奶蛙 - 节拍判定 */
(function(){
'use strict';
const RF=window.RF;
RF.judge={
  perfect:0.095,   // Perfect 窗口 ±95ms
  good:0.185,      // Good 窗口 ±185ms
  rate:function(delta){
    const a=Math.abs(delta);
    return a<=this.perfect?'perfect':(a<=this.good?'good':'miss');
  }
};
})();
