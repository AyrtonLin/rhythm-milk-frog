/* 机制：力度投掷（投篮/足球射门/扔飞镖/踢毽子）
   按住蓄力 → 松手投出；节奏判定 × 力度判定双维评分 */
(function(){
'use strict';
const RF=window.RF;
const U=RF.util;

function ThrowMech(game,level){
  RF.MechBase.call(this,game,level);
  const p=level.params||{};
  this.target=p.target||'hoop';
  this.chargeDur=p.chargeDur||1.3;
  this.precision=p.precision||'normal';
  this.charging=false;
  this.chargeStart=0;
  this.anims=[];
  this.score3=[]; /* 每次投篮结果展示 */
  const rnd=U.rand(level.seed||1);
  const bpm=level.bpm,spb=60/bpm;
  const lead=(level.leadBeats||8)*spb;
  const interval=level.intervalBeats*spb;
  const n=level.shots;
  const zoneW=this.precision==='narrow'?[0.05,0.1]:[0.07,0.14];
  for(let i=0;i<n;i++){
    const ideal=0.25+rnd()*0.65;
    let tx,ty,dist;
    if(this.target==='hoop'){
      tx=0.18+rnd()*0.5;ty=0.16+rnd()*0.14;
    }else if(this.target==='goal'){
      tx=0.2+rnd()*0.6;ty=0.22+rnd()*0.1;
    }else if(this.target==='dart'){
      tx=0.55+rnd()*0.35;ty=0.2+rnd()*0.22;
    }else{ /* height 毽子 */
      tx=0.5;ty=0.12+rnd()*0.3;
    }
    this.notes.push({t:lead+i*interval,ideal:ideal,tx:tx,ty:ty,judged:null,res:null,zoneW:zoneW,seedv:rnd()});
  }
}
ThrowMech.prototype=Object.create(RF.MechBase.prototype);
ThrowMech.prototype.start=function(){
  this.game.setHint(this.target==='height'?'按住蓄力，让毽子落在虚线高度带内!':'按住蓄力，力度进入绿区时松手投出!');
};
ThrowMech.prototype.update=function(pos,dt){
  if(this.charging){
    const p=this.chargePower(pos);
    const game=this.game;
    game.frogCharge=p;
    game.pose('charge',999);
    /* 蓄力音效阶段提示 */
    if(Math.floor(p*4)!==this.lastChargeStep){
      this.lastChargeStep=Math.floor(p*4);
      if(this.lastChargeStep>0)RF.audio.sfx('charge',{p:p});
    }
  }
  /* 动画推进 */
  for(let i=this.anims.length-1;i>=0;i--){
    const a=this.anims[i];
    a.t+=dt;
    if(a.t>a.dur)this.anims.splice(i,1);
  }
};
ThrowMech.prototype.chargePower=function(pos){
  return U.clamp((pos-this.chargeStart)/this.chargeDur,0,1);
};
ThrowMech.prototype.onDown=function(x,y,pos){
  if(this.charging)return;
  this.charging=true;
  this.chargeStart=pos;
  this.lastChargeStep=-1;
};
ThrowMech.prototype.onUp=function(x,y,pos){
  if(!this.charging)return;
  this.charging=false;
  const power=this.chargePower(pos);
  this.game.frogCharge=0;
  /* 找最近未判定音符 */
  let note=null,best=1e9;
  for(let i=0;i<this.notes.length;i++){
    const nt=this.notes[i];
    if(nt.judged)continue;
    const d=Math.abs(pos-nt.t);
    if(d<best){best=d;note=nt;}
  }
  if(!note||best>RF.judge.good+0.05){
    /* 空挥 */
    this.game.pose('throw',0.4);
    RF.audio.sfx('whoosh');
    return;
  }
  note.judged='hit';
  const kind=RF.judge.rate(pos-note.t);
  const dev=Math.abs(power-note.ideal);
  const zw=note.zoneW;
  let powerBonus=0,powerRes='out';
  if(dev<=zw[0]){powerBonus=50;powerRes='swish';}
  else if(dev<=zw[1]){powerBonus=25;powerRes='rim';}
  /* 节奏对了但力度完全出界 → 物理不中 */
  if(powerRes==='out'&&kind!=='miss'){
    this.game.judgeNote(note,kind==='perfect'?'good':'good',0,power);
    note.res='out';
    this.fly(power,note,'out');
  }else{
    this.game.judgeNote(note,kind,powerBonus,power);
    note.res=kind==='miss'?'out':powerRes;
    this.fly(power,note,note.res);
  }
  this.game.pose('throw',0.5);
  this.game.expr(kind==='miss'?'sad':(powerRes==='swish'?'happy':'focus'),0.6);
};
ThrowMech.prototype.fly=function(power,note,res){
  const V=this.game.V;
  const from={x:V.w/2,y:V.h-150};
  const to=this.targetPos(note,V);
  this.anims.push({t:0,dur:0.55+power*0.25,from:from,to:to,res:res,power:power,note:note});
  RF.audio.sfx('whoosh');
};
ThrowMech.prototype.targetPos=function(note,V){
  if(this.target==='height'){
    /* 毽子：目标高度带 y = note.ideal 映射 */
    return {x:V.w/2,y:V.h*0.72-note.ideal*V.h*0.5};
  }
  return {x:note.tx*V.w,y:note.ty*V.h};
};
ThrowMech.prototype.onMiss=function(note){
  note.res=note.res||'out';
  this.anims.push({t:0,dur:0.5,from:{x:this.game.V.w/2,y:this.game.V.h-150},to:this.targetPos(note,this.game.V),res:'out',power:0.3,note:note});
};
ThrowMech.prototype.render=function(g,pos){
  const V=this.game.V;
  const game=this.game;
  /* 当前目标 */
  let note=null;
  for(let i=0;i<this.notes.length;i++){
    if(!this.notes[i].judged){note=this.notes[i];break;}
  }
  const active=this.notes.filter(function(n){return !n.judged;})[0]||note;
  if(active){
    const tp=this.targetPos(active,V);
    const pp=U.clamp(1-(active.t-pos)/1.4,0,1.15);
    if(this.target==='hoop'){
      this.drawHoop(g,tp.x,tp.y,V,pp);
      RF.fx.ring(g,tp.x,tp.y+40,pp,120*Math.min(1,V.w/500),26,'#FFE9A8');
    }else if(this.target==='goal'){
      this.drawGoal(g,tp.x,tp.y,V,pp);
      RF.fx.ring(g,tp.x,tp.y+30,pp,120*Math.min(1,V.w/500),26,'#FFE9A8');
    }else if(this.target==='dart'){
      this.drawDartboard(g,tp.x,tp.y,V,pp,active);
      RF.fx.ring(g,tp.x,tp.y,pp,110*Math.min(1,V.w/500),24,'#FFE9A8');
    }else{
      this.drawHeightLine(g,tp.y,V,pp,active);
      RF.fx.ring(g,V.w/2,tp.y,pp,130*Math.min(1,V.w/500),28,'#FFE9A8');
    }
  }
  /* 飞行动画 */
  for(let i=0;i<this.anims.length;i++){
    const a=this.anims[i];
    const pr=U.clamp(a.t/a.dur,0,1);
    const x=U.lerp(a.from.x,a.to.x,pr);
    const arcH=Math.sin(pr*Math.PI)*(120+a.power*160)*Math.min(1,V.h/700);
    const y=U.lerp(a.from.y,a.to.y,pr)-arcH*(this.target==='height'?-1:1)*(this.target==='height'?-0.4:1);
    this.drawProjectile(g,x,y,a,V,pr);
  }
};
ThrowMech.prototype.drawProjectile=function(g,x,y,a,V,pr){
  const s=Math.min(V.w,V.h)/14;
  if(this.target==='hoop')RF.frog.PROPS.basketball(g,x,y,s);
  else if(this.target==='goal')RF.frog.PROPS.soccer(g,x,y,s);
  else if(this.target==='dart')RF.frog.PROPS.dart(g,x,y,s);
  else RF.frog.PROPS.jianzi(g,x,y,s);
  /* 命中特效 */
  if(pr>0.85&&a.res!=='out'){
    if(a.note&&!a.note.hadFx){
      a.note.hadFx=true;
      if(a.res==='swish'){
        RF.fx.burst(a.to.x,a.to.y,'#FFD54A',14,160);
        RF.audio.sfx('swish');
      }else{
        RF.fx.burst(a.to.x,a.to.y,'#BFE6FF',8,120);
        RF.audio.sfx('bounce');
      }
    }
  }
};
ThrowMech.prototype.drawHoop=function(g,x,y,V,pp){
  const sc=Math.min(V.w,V.h)/560;
  /* 篮板 */
  g.fillStyle='#FFF';g.strokeStyle='#C9A96B';g.lineWidth=4;
  U.roundRect(g,x-55*sc,y-70*sc,110*sc,80*sc,8*sc);g.fill();g.stroke();
  g.strokeStyle='#E5484D';g.lineWidth=5;
  U.roundRect(g,x-42*sc,y-56*sc,84*sc,52*sc,5*sc);g.stroke();
  /* 篮框 */
  g.strokeStyle='#E5484D';g.lineWidth=7*sc;
  g.beginPath();g.ellipse(x,y+28*sc,46*sc,14*sc,0,0,Math.PI*2);g.stroke();
  g.strokeStyle='rgba(229,72,77,0.4)';g.lineWidth=3;
  g.beginPath();g.ellipse(x,y+42*sc,38*sc,10*sc,0,0,Math.PI*2);g.stroke();
  /* 网兜 */
  g.strokeStyle='rgba(255,255,255,0.75)';g.lineWidth=2;
  for(let i=-3;i<=3;i++){
    g.beginPath();g.moveTo(x+i*12*sc,y+36*sc);g.lineTo(x+i*7*sc,y+72*sc);g.stroke();
  }
};
ThrowMech.prototype.drawGoal=function(g,x,y,V,pp){
  const sc=Math.min(V.w,V.h)/560;
  g.fillStyle='rgba(255,255,255,0.14)';
  g.fillRect(x-90*sc,y-8*sc,180*sc,90*sc);
  g.strokeStyle='#EAF2F0';g.lineWidth=5;
  g.strokeRect(x-90*sc,y-10*sc,180*sc,92*sc);
  /* 球网 */
  g.strokeStyle='rgba(255,255,255,0.5)';g.lineWidth=1.5;
  for(let i=0;i<=6;i++){
    g.beginPath();g.moveTo(x-90*sc+i*30*sc,y-10*sc);g.lineTo(x-90*sc+i*30*sc,y+82*sc);g.stroke();
  }
  for(let j=0;j<=3;j++){
    g.beginPath();g.moveTo(x-90*sc,y-10*sc+j*30*sc);g.lineTo(x+90*sc,y-10*sc+j*30*sc);g.stroke();
  }
  g.fillStyle='rgba(229,72,77,0.35)';
  g.fillRect(x-90*sc,y+62*sc,180*sc,20*sc);
  g.fillStyle='#FFF';g.font='bold 12px sans-serif';g.textAlign='center';
  g.fillText('射向红区!',x,y+76*sc);
};
ThrowMech.prototype.drawDartboard=function(g,x,y,V,pp,active){
  const sc=Math.min(V.w,V.h)/560;
  const r=44*sc+(active.seedv-0.5)*16*sc;
  const rings=[['#F2E4C4',1],['#E5484D',0.8],['#4CC9F0',0.62],['#E5484D',0.44],['FFD54A',0.26]];
  const cols=[['#F2E4C4',1],['#E5484D',0.8],['#F5F5F0',0.62],['#E5484D',0.44],['#FFD54A',0.24]];
  for(let i=0;i<cols.length;i++){
    g.fillStyle=cols[i][0];
    g.beginPath();g.arc(x,y,r*cols[i][1],0,Math.PI*2);g.fill();
    g.strokeStyle='rgba(60,40,20,0.4)';g.lineWidth=1.5;g.stroke();
  }
};
ThrowMech.prototype.drawHeightLine=function(g,y,V,pp,active){
  /* 毽子目标高度带 */
  const sc=Math.min(V.w,V.h)/560;
  const band=active.zoneW[1]*V.h*0.5;
  g.fillStyle='rgba(126,217,87,0.25)';
  g.fillRect(V.w*0.2,y-band/2,V.w*0.6,band);
  g.strokeStyle='rgba(126,217,87,0.9)';g.lineWidth=3;
  g.setLineDash([10,8]);
  g.beginPath();g.moveTo(V.w*0.2,y-band/2);g.lineTo(V.w*0.8,y-band/2);g.stroke();
  g.beginPath();g.moveTo(V.w*0.2,y+band/2);g.lineTo(V.w*0.8,y+band/2);g.stroke();
  g.setLineDash([]);
  g.fillStyle='#FFF';g.font='bold '+14*sc+'px sans-serif';g.textAlign='left';
  g.fillText('目标高度带',V.w*0.2,y-band/2-8);
};
RF.mech.throw=ThrowMech;
})();
