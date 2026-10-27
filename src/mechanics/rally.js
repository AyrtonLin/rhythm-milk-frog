/* 机制：来球反击（羽毛球/乒乓球/排球/网球）
   球在节拍点精确到达，点击挥拍；网球变体需长按蓄力控制落点 */
(function(){
'use strict';
const RF=window.RF;
const U=RF.util;

function RallyMech(game,level){
  RF.MechBase.call(this,game,level);
  const p=level.params||{};
  this.ball=p.ball||'shuttle';
  this.powerMode=!!p.power;
  this.fromTop=!!p.fromTop;
  this.fast=!!p.fast;
  this.charging=false;
  this.chargeStart=0;
  this.returnAnims=[];
  const rnd=U.rand(level.seed||1);
  const spb=60/level.bpm;
  const lead=(level.leadBeats||8)*spb;
  const interval=level.intervalBeats*spb;
  for(let i=0;i<level.hits;i++){
    const side=rnd()<0.5?-1:1;
    const y0=U.rr(rnd,0.18,0.45);
    const ideal=this.powerMode?U.rr(rnd,0.3,0.75):0;
    this.notes.push({t:lead+i*interval,side:side,y0:y0,ideal:ideal,judged:null,seedv:rnd(),ang:U.rr(rnd,-0.3,0.3)});
  }
}
RallyMech.prototype=Object.create(RF.MechBase.prototype);
RallyMech.prototype.start=function(){
  this.game.setHint(this.powerMode?'提前按住蓄力，节拍点松手回击，落点要进绿区!':'球到身前、节拍环收缩时点击挥拍!');
};
RallyMech.prototype.racketPoint=function(){
  const V=this.game.V;
  return {x:V.w/2,y:V.h-210};
};
RallyMech.prototype.ballPath=function(note,pos){
  /* 二次贝塞尔：球在 note.t 时刻精确到达 racketPoint */
  const V=this.game.V;
  const arrive=1.5; /* 提前 1.5s 出现 */
  const pr=U.clamp(1-(note.t-pos)/arrive,0,1);
  const rp=this.racketPoint();
  let x0,y0;
  if(this.fromTop&&note.seedv>0.5){x0=V.w/2+note.side*V.w*0.4;y0=-40;}
  else{x0=note.side>0?V.w+60:-60;y0=note.y0*V.h;}
  const cx=(x0+rp.x)/2-note.side*V.w*0.1;
  const cy=Math.min(y0,rp.y)-V.h*0.25;
  const t=pr;
  const x=U.lerp(U.lerp(x0,cx,t),U.lerp(cx,rp.x,t),t);
  const y=U.lerp(U.lerp(y0,cy,t),U.lerp(cy,rp.y,t),t);
  return {x:x,y:y,pr:pr,t:t};
};
RallyMech.prototype.update=function(pos,dt){
  if(this.charging){
    const pw=U.clamp((pos-this.chargeStart)/1.0,0,1);
    this.game.frogCharge=pw;
    this.game.pose('charge',999);
    if(Math.floor(pw*4)!==this.lastStep){
      this.lastStep=Math.floor(pw*4);
      if(this.lastStep>0)RF.audio.sfx('charge',{p:pw});
    }
  }
  for(let i=this.returnAnims.length-1;i>=0;i--){
    const a=this.returnAnims[i];
    a.t+=dt;
    if(a.t>a.dur)this.returnAnims.splice(i,1);
  }
};
RallyMech.prototype.onDown=function(x,y,pos){
  if(this.powerMode){
    if(this.charging)return;
    this.charging=true;
    this.chargeStart=pos;
    this.lastStep=-1;
    return;
  }
  this.swing(pos,0.5);
};
RallyMech.prototype.onUp=function(x,y,pos){
  if(!this.powerMode||!this.charging)return;
  this.charging=false;
  const power=U.clamp((pos-this.chargeStart)/1.0,0,1);
  this.game.frogCharge=0;
  this.swing(pos,power);
};
RallyMech.prototype.swing=function(pos,power){
  const game=this.game;
  let note=null,best=1e9;
  for(let i=0;i<this.notes.length;i++){
    const nt=this.notes[i];
    if(nt.judged)continue;
    const d=Math.abs(pos-nt.t);
    if(d<best){best=d;note=nt;}
  }
  game.pose('swing',0.4);
  RF.audio.sfx('whoosh');
  if(!note||best>RF.judge.good+0.05){
    return; /* 空挥 */
  }
  note.judged='hit';
  const kind=RF.judge.rate(pos-note.t);
  if(kind==='miss'){
    game.judgeNote(note,'miss',0,power);
    game.expr('sad',0.7);
    this.returnAnims.push({t:0,dur:0.6,note:note,miss:true});
    return;
  }
  let bonus=0,zoneRes='in';
  if(this.powerMode){
    const dev=Math.abs(power-note.ideal);
    if(dev<=0.09){bonus=50;zoneRes='ace';}
    else if(dev<=0.16){bonus=25;zoneRes='in';}
    else{bonus=0;zoneRes='out';}
    if(zoneRes==='out'){
      game.judgeNote(note,kind==='perfect'?'good':'good',0,power);
      game.expr('focus',0.6);
      this.returnAnims.push({t:0,dur:0.7,note:note,miss:true,power:power});
      RF.audio.sfx('oops');
      return;
    }
  }
  game.judgeNote(note,kind,bonus,power);
  game.expr(kind==='perfect'?'happy':'focus',0.6);
  this.returnAnims.push({t:0,dur:0.7,note:note,miss:false,power:power});
  if(!this.powerMode&&kind==='perfect')RF.audio.sfx('pop');
};
RallyMech.prototype.onMiss=function(note){
  this.returnAnims.push({t:0,dur:0.6,note:note,miss:true});
};
RallyMech.prototype.render=function(g,pos){
  const V=this.game.V;
  const game=this.game;
  const rp=this.racketPoint();
  /* 场地元素 */
  if(this.ball==='tennis')this.drawCourt(g,V,pos);
  else if(this.ball==='volley')this.drawNet(g,V);
  else this.drawCourtLine(g,V);
  /* 球 + 节拍环 */
  for(let i=0;i<this.notes.length;i++){
    const note=this.notes[i];
    if(note.judged&&(!this.returnAnims.some(function(a){return a.note===note;})))continue;
    const bp=this.ballPath(note,pos);
    if(!note.judged){
      if(pos<note.t-1.55||pos>note.t+RF.judge.good+0.05)continue;
      this.drawBall(g,bp.x,bp.y,note,V);
      /* 命中点节拍环 */
      RF.fx.ring(g,rp.x,rp.y-10,1-(note.t-pos)/1.4,110*Math.min(1,V.w/500),30,'#FFE9A8');
    }
  }
  /* 回球动画 */
  for(let i=0;i<this.returnAnims.length;i++){
    const a=this.returnAnims[i];
    const pr=U.clamp(a.t/a.dur,0,1);
    let x,y;
    if(a.miss){
      x=U.lerp(rp.x,rp.x+ (a.note.side*-1)*V.w*0.4,pr);
      y=rp.y+Math.sin(pr*Math.PI)*-40+pr*120;
    }else{
      const tx=this.ball==='tennis'?V.w/2+((a.power||0.5)-0.5)*V.w*0.1:rp.x-a.note.side*V.w*0.45;
      const ty=this.ball==='tennis'?V.h*0.34:rp.y-V.h*0.28;
      x=U.lerp(rp.x,tx,pr);
      y=U.lerp(rp.y,ty,pr)-Math.sin(pr*Math.PI)*60;
    }
    this.drawBall(g,x,y,a.note,V);
    if(pr>0.9&&!a.fx2){
      a.fx2=true;
      if(!a.miss){
        RF.fx.burst(x,y,this.ball==='tennis'?'#FFE066':'#BFE6FF',8,110);
        if(this.ball==='tennis'){
          /* 网球落点判定显示 */
          const land=this.landPoint(a,V);
          g.save();
          RF.fx.burst(land.x,land.y,'#7ED957',6,80);
          g.restore();
        }
      }
    }
  }
  /* 蓄力时的落点预览 */
  if(this.charging&&this.ball==='tennis'){
    const pw=U.clamp((pos-this.chargeStart)/1.0,0,1);
    const land=this.powerLand(pw,V);
    const note=null;
    g.fillStyle='rgba(255,255,255,0.5)';
    g.beginPath();g.arc(land.x,land.y,8,0,7);g.fill();
  }
};
RallyMech.prototype.landPoint=function(a,V){
  const pw=a.power!=null?a.power:0.5;
  return {x:V.w/2,y:V.h*0.34+(pw-0.5)*V.h*0.1};
};
RallyMech.prototype.powerLand=function(pw,V){
  return {x:V.w/2,y:V.h*0.34+(pw-0.5)*V.h*0.1};
};
RallyMech.prototype.drawCourt=function(g,V){
  /* 网球场：上半区场地 + 目标深度带 */
  g.fillStyle='#3D6B35';
  g.fillRect(V.w*0.06,V.h*0.18,V.w*0.88,V.h*0.26);
  g.strokeStyle='rgba(255,255,255,0.8)';g.lineWidth=3;
  g.strokeRect(V.w*0.06,V.h*0.18,V.w*0.88,V.h*0.26);
  g.beginPath();g.moveTo(V.w*0.06,V.h*0.31);g.lineTo(V.w*0.94,V.h*0.31);g.stroke();
  g.fillStyle='rgba(255,255,255,0.25)';
  g.fillRect(V.w*0.2,V.h*0.27,V.w*0.6,V.h*0.08);
  g.fillStyle='#FFF';g.font='bold 12px sans-serif';g.textAlign='center';
  g.fillText('深区',V.w/2,V.h*0.315);
  /* 球网 */
  g.strokeStyle='rgba(255,255,255,0.9)';g.lineWidth=4;
  g.beginPath();g.moveTo(V.w*0.06,V.h*0.45);g.lineTo(V.w*0.94,V.h*0.45);g.stroke();
};
RallyMech.prototype.drawNet=function(g,V){
  g.strokeStyle='rgba(255,255,255,0.85)';g.lineWidth=4;
  g.beginPath();g.moveTo(V.w*0.05,V.h*0.5);g.lineTo(V.w*0.95,V.h*0.5);g.stroke();
  g.strokeStyle='rgba(255,255,255,0.35)';g.lineWidth=1.5;
  for(let x=V.w*0.05;x<V.w*0.95;x+=14){
    g.beginPath();g.moveTo(x,V.h*0.5);g.lineTo(x,V.h*0.5-46);g.stroke();
  }
  g.beginPath();g.moveTo(V.w*0.05,V.h*0.5-46);g.lineTo(V.w*0.95,V.h*0.5-46);g.stroke();
};
RallyMech.prototype.drawCourtLine=function(g,V){
  g.strokeStyle='rgba(250,240,215,0.5)';g.lineWidth=3;
  g.beginPath();g.moveTo(V.w*0.1,V.h*0.55);g.lineTo(V.w*0.9,V.h*0.55);g.stroke();
};
RallyMech.prototype.drawBall=function(g,x,y,note,V){
  const s=Math.min(V.w,V.h)/26;
  g.save();
  if(this.ball==='shuttle'){
    g.translate(x,y);g.rotate(0.5+note.ang);
    g.fillStyle='#E5484D';
    g.beginPath();g.arc(0,0,s*0.4,0,7);g.fill();
    g.strokeStyle='#C05E14';g.lineWidth=2;
    g.beginPath();g.arc(0,0,s*0.4,0,7);g.stroke();
    const cols=['#FFF','#F5F5F0','#E8E8E0'];
    for(let i=-1;i<=1;i++){
      g.fillStyle=cols[i+1];
      g.beginPath();
      g.moveTo(0,-s*0.3);
      g.lineTo(i*s*0.45,-s*1.4);
      g.lineTo(i*s*0.45+s*0.3,-s*1.4);
      g.closePath();g.fill();
    }
  }else if(this.ball==='pingpong'){
    g.fillStyle='#FFF';g.beginPath();g.arc(x,y,s*0.45,0,7);g.fill();
    g.strokeStyle='#D9C9A8';g.lineWidth=1.5;g.stroke();
  }else if(this.ball==='volley'){
    RF.frog.PROPS.volleyball(g,x,y,s*1.2);
  }else{ /* tennis */
    g.fillStyle='#D9E85A';g.beginPath();g.arc(x,y,s*0.5,0,7);g.fill();
    g.strokeStyle='#B8C93E';g.lineWidth=2;
    g.beginPath();g.arc(x,y,s*0.5,0,7);g.stroke();
    g.beginPath();g.moveTo(x-s*0.5,y);g.quadraticCurveTo(x,y-s*0.15,x+s*0.5,y);g.stroke();
  }
  g.restore();
  /* 拖尾 */
  g.fillStyle='rgba(255,255,255,0.25)';
  g.beginPath();g.arc(x,y,s*0.7,0,7);g.fill();
};
RF.mech.rally=RallyMech;
})();
