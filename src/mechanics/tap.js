/* 机制：目标点击（打飞盘，后续阶段复用于拍苍蝇/修水管/接快递等）
   目标按节拍出现，点击目标位置 + 踩准节拍双重判定 */
(function(){
'use strict';
const RF=window.RF;
const U=RF.util;

function TapMech(game,level){
  RF.MechBase.call(this,game,level);
  const p=level.params||{};
  this.style=p.style||'disc';
  this.flying=this.style==='disc';
  this.appear=1.1;
  const rnd=U.rand(level.seed||1);
  const spb=60/level.bpm;
  const lead=(level.leadBeats||8)*spb;
  const interval=level.intervalBeats*spb;
  for(let i=0;i<level.hits;i++){
    const side=rnd()<0.5?-1:1;
    const y=U.rr(rnd,0.15,0.5);
    this.notes.push({t:lead+i*interval,side:side,y:y,judged:null,hitX:0,hitY:0,seedv:rnd(),spin:rnd()*7});
  }
}
TapMech.prototype=Object.create(RF.MechBase.prototype);
TapMech.prototype.start=function(){
  this.game.setHint(this.flying?'飞盘飞过时点击它！踩准节拍=Perfect!':'节拍环缩到目标中心时点击!');
};
TapMech.prototype.targetPos=function(note,pos,V){
  if(this.flying){
    /* 飞盘横穿屏幕，note.t 时到达中线 */
    const speed=V.w*0.45; /* 每秒像素 */
    const x=V.w/2+(note.t-pos)*speed*note.side;
    return {x:x,y:note.y*V.h+Math.sin((pos+note.seedv*3)*3)*24};
  }
  return {x:0,y:0};
};
TapMech.prototype.update=function(pos,dt){
  /* 击中动画 */
  for(let i=0;i<this.notes.length;i++){
    const n=this.notes[i];
    if(n.judged==='hit'&&n.hitT!=null){
      n.hitT+=dt;
    }
  }
};
TapMech.prototype.onDown=function(x,y,pos){
  const game=this.game;
  const V=game.V;
  let note=null,best=1e9;
  for(let i=0;i<this.notes.length;i++){
    const nt=this.notes[i];
    if(nt.judged)continue;
    const d=Math.abs(pos-nt.t);
    if(d<best){best=d;note=nt;}
  }
  if(!note||best>RF.judge.good+0.05){
    RF.audio.sfx('click');
    return;
  }
  /* 飞盘需点中目标本体（宽松半径），其余目标点击任意处即可 */
  if(this.flying){
    const tp=this.targetPos(note,pos,V);
    if(U.dist(x,y,tp.x,tp.y)>Math.min(V.w,V.h)*0.16){
      RF.audio.sfx('click');
      return;
    }
  }
  note.judged='hit';
  note.hitT=0;
  const kind=RF.judge.rate(pos-note.t);
  const tp=this.flying?this.targetPos(note,pos,V):{x:V.w/2,y:V.h*0.35};
  note.hitX=tp.x;note.hitY=tp.y;
  game.judgeNote(note,kind,0,0.5);
  game.pose('shoot',0.35);
  game.expr(kind==='miss'?'sad':(kind==='perfect'?'happy':'focus'),0.6);
  RF.audio.sfx(kind==='perfect'?'perfect':(kind==='good'?'good':'miss'));
  if(kind!=='miss'){
    RF.fx.burst(note.hitX,note.hitY,kind==='perfect'?'#FFD54A':'#BFE6FF',10,140);
  }
};
TapMech.prototype.onMiss=function(note){};
TapMech.prototype.render=function(g,pos){
  const V=this.game.V;
  for(let i=0;i<this.notes.length;i++){
    const note=this.notes[i];
    if(note.judged==='hit'){
      if(note.hitT<0.35){
        const pr=note.hitT/0.35;
        g.globalAlpha=1-pr;
        this.drawDisc(g,note.hitX,note.hitY,V,note,pr);
        g.globalAlpha=1;
      }
      continue;
    }
    if(note.judged)continue;
    if(pos<note.t-this.appear||pos>note.t+RF.judge.good+0.05)continue;
    const tp=this.targetPos(note,pos,V);
    this.drawDisc(g,tp.x,tp.y,V,note,0);
    if(!this.flying)RF.fx.ring(g,tp.x,tp.y,1-(note.t-pos)/this.appear,110*Math.min(1,V.w/500),24,'#FFE9A8');
  }
};
TapMech.prototype.drawDisc=function(g,x,y,V,note,breakPr){
  const s=Math.min(V.w,V.h)/22;
  g.save();
  g.translate(x,y);
  const hit=note.judged==='hit';
  g.rotate(hit?note.spin+breakPr*6:note.spin+U.now()*4*note.side);
  g.scale(1,0.35+0.65*Math.abs(Math.sin(note.spin+U.now()*3)));
  if(!hit||breakPr<0.5){
    g.fillStyle='#F5C518';
    g.beginPath();g.arc(0,0,s,0,7);g.fill();
    g.strokeStyle='#C79124';g.lineWidth=3;
    g.beginPath();g.arc(0,0,s,0,7);g.stroke();
    g.fillStyle='#E8541D';
    g.beginPath();g.arc(0,0,s*0.55,0,7);g.fill();
  }
  if(hit){
    /* 碎裂效果 */
    g.strokeStyle='#FFF';g.lineWidth=2;
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3;
      g.beginPath();
      g.moveTo(Math.cos(a)*s*0.3,Math.sin(a)*s*0.3);
      g.lineTo(Math.cos(a)*s*(1+breakPr*1.5),Math.sin(a)*s*(1+breakPr*1.5));
      g.stroke();
    }
  }
  g.restore();
  if(!hit){
    g.fillStyle='rgba(255,255,255,0.2)';
    g.beginPath();g.arc(x-note.side*s*1.6,y,s*0.5,0,7);g.fill();
    g.beginPath();g.arc(x-note.side*s*3,y,s*0.3,0,7);g.fill();
  }
};
RF.mech.tap=TapMech;
})();
