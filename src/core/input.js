/* 节奏小奶蛙 - 统一输入层（触摸 + 鼠标） */
(function(){
'use strict';
const RF=window.RF;
let cv=null,activeId=null;
function emit(type,e){
  if(!RF.scenes||!RF.scenes.pointer)return;
  const r=cv.getBoundingClientRect();
  RF.scenes.pointer(type,e.clientX-r.left,e.clientY-r.top,e);
}
function synth(e){return {clientX:e.clientX,clientY:e.clientY,preventDefault:function(){}};}
RF.input={
  attach:function(canvas){
    cv=canvas;
    function dn(e){
      const pid=e.pointerId!==undefined?e.pointerId:0;
      if(activeId!==null&&pid!==activeId)return;
      activeId=pid;emit('down',e);
      if(e.preventDefault)e.preventDefault();
    }
    function up(e){
      const pid=e.pointerId!==undefined?e.pointerId:0;
      if(activeId!==null&&pid!==activeId)return;
      activeId=null;emit('up',e);
      if(e.preventDefault)e.preventDefault();
    }
    function mv(e){emit('move',e);if(e.preventDefault)e.preventDefault();}
    if(window.PointerEvent){
      cv.addEventListener('pointerdown',dn,{passive:false});
      cv.addEventListener('pointermove',mv,{passive:false});
      cv.addEventListener('pointerup',up,{passive:false});
      cv.addEventListener('pointercancel',up,{passive:false});
    }else{
      cv.addEventListener('touchstart',function(e){const t=e.changedTouches[0];dn(synth(t));e.preventDefault();},{passive:false});
      cv.addEventListener('touchmove',function(e){const t=e.changedTouches[0];mv(synth(t));e.preventDefault();},{passive:false});
      cv.addEventListener('touchend',function(e){const t=e.changedTouches[0];up(synth(t));e.preventDefault();},{passive:false});
      cv.addEventListener('touchcancel',function(e){const t=e.changedTouches[0];up(synth(t));e.preventDefault();},{passive:false});
      cv.addEventListener('mousedown',dn);
      window.addEventListener('mousemove',mv);
      window.addEventListener('mouseup',up);
    }
    /* 阻止双指缩放 */
    document.addEventListener('gesturestart',function(e){e.preventDefault();});
  }
};
})();
