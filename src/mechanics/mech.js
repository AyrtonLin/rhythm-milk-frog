/* 节奏小奶蛙 - 机制模板基类与注册表 */
(function(){
'use strict';
const RF=window.RF;
RF.mech={};
RF.MechBase=function(game,level){
  this.game=game;
  this.level=level;
  this.notes=[];
  this.missIdx=0;
};
RF.MechBase.prototype={
  start:function(){},
  update:function(pos,dt){},
  render:function(g,pos){},
  onDown:function(x,y,pos){},
  onUp:function(x,y,pos){},
  onMiss:function(note){},
  finish:function(){}
};
})();
