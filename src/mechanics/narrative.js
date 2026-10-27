/* 机制：叙事演出（第一阶段=赛车）
   弯道按节拍逼近，点击左右转向穿过旗门，冲线庆祝 */
(function(){
'use strict';
const RF=window.RF;
const U=RF.util;

function NarrativeMech(game,level){
  RF.MechBase.call(this,level&&game,level);
  const p=level.params||{};
  this.mode=p.mode||'race';
  const rnd=U.rand(level.seed||1);
  const spb=60/level.bpm;
  const lead=(level.leadBeats||8)*spb;
  const interval=level.intervalBeats*spb;
  this.gates=[];
  this.laneX=0.5;       /* 0~1 */
  this.steerAnim=0;
  this.crashT=0;
  this.finished=false;
  this.finishT=0;
  this.scroll=0;
  for(let i=0;i<level.hits;i++){
    /* 弯道方向：正弦混合，可复现 */
    const z=(lead+i*interval)/spb;
    const target=0.5+Math.sin(z*0.35)*0.3+Math.sin(z*0.13+2)*0.15;
    this.gates.push({t:lead+i*interval,target:target,judged:null,res:null,dir:target>0.5?1:-1});
  }
  this.notes=this.gates;
}
NarrativeMech.prototype=Object.create(RF.MechBase.prototype);
NarrativeMech.prototype.start=function(){
  this.game.setHint('点击屏幕左右两侧转向，穿过旗门冲向终点!');
};
NarrativeMech.prototype.roadCenter=function(z,V){
  /* z = 节拍数坐标；返回赛道中心 x（0~1） */
  return 0.5+Math.sin(z*0.35)*0.26+Math.sin(z*0.13+2)*0.14;
};
NarrativeMech.prototype.update=function(pos,dt){
  const game=this.game;
  const spb=60/this.level.bpm;
  const z=pos/spb;
  this.scroll=z;
  this.steerAnim=Math.max(0,this.steerAnim-dt*3);
  this.crashT=Math.max(0,this.crashT-dt);
  /* 车道自然回中 */
  const center=this.roadCenter(z);
  this.laneX=U.clamp(this.laneX+(center-this.laneX)*Math.min(1,dt*0.8),0.08,0.92);
  /* 冲线 */
  const last=this.gates[this.gates.length-1];
  if(!this.finished&&pos>last.t+3*spb){
    this.finished=true;
    this.finishT=0;
    RF.audio.sfx('cheer');
    game.expr('happy',5);
  }
  if(this.finished)this.finishT+=dt;
};
NarrativeMech.prototype.onDown=function(x,y,pos){
  if(this.finished)return;
  const game=this.game;
  const V=game.V;
  const dir=x<V.w/2?-1:1;
  this.laneX=U.clamp(this.laneX+dir*0.13,0.08,0.92);
  this.steerAnim=dir;
  RF.audio.sfx('switch');
  game.pose('drive',999);
};
NarrativeMech.prototype.onMiss=function(gate){
  gate.res='miss';
  this.crashT=0.6;
  RF.audio.sfx('crash');
  RF.audio.vib(80);
};
NarrativeMech.prototype.render=function(g,pos){
  const V=this.game.V;
  const game=this.game;
  const spb=60/this.level.bpm;
  const z=pos/spb;
  const carY=V.h-160;
  const rowH=V.h*0.09;
  const roadW=V.w*0.42;
  /* 路面 */
  g.fillStyle='#8FBF6B';
  g.fillRect(0,0,V.w,V.h);
  /* 赛道带（向远处采样） */
  const rows=Math.ceil(V.h/rowH)+2;
  g.fillStyle='#7B6B55';
  g.beginPath();
  g.moveTo(this.roadCenter(z,V)*V.w-roadW/2+roadW*0.13,V.h);
  for(let i=rows;i>=0;i--){
    const zx=z-(V.h-(i*rowH))/ (rowH*9);
    const cx=this.roadCenter(zx)*V.w;
    const y=V.h-i*rowH;
    const w=roadW*(0.35+0.65*(y/V.h));
    g.lineTo(cx-w/2,y);
  }
  for(let i=0;i<=rows;i++){
    const zx=z-(i*rowH)/(rowH*9);
    const cx=this.roadCenter(zx)*V.w;
    const y=V.h-i*rowH;
    const w=roadW*(0.35+0.65*(y/V.h));
    g.lineTo(cx+w/2,y);
  }
  g.closePath();g.fill();
  /* 中线虚线 */
  g.strokeStyle='rgba(250,240,215,0.7)';g.lineWidth=4;
  g.setLineDash([18,22]);
  g.beginPath();
  g.moveTo(this.roadCenter(z)*V.w,V.h);
  for(let i=rows;i>=0;i--){
    const zx=z-(V.h-(i*rowH))/(rowH*9);
    const y=V.h-i*rowH;
    g.lineTo(this.roadCenter(zx)*V.w,y);
  }
  g.stroke();
  g.setLineDash([]);
  /* 路旁树 */
  const rnd=U.rand(this.level.seed+5);
  for(let i=0;i<10;i++){
    const gz=Math.floor(z)+i*0.7;
    const side=rnd()<0.5?-1:1;
    const y=V.h-((gz-z)*rowH*9%V.h);
    if(y<-40||y>V.h+40)continue;
    const cx=this.roadCenter(z-(V.h-y)/(rowH*9))*V.w;
    const tx=cx+side*roadW*0.7;
    g.fillStyle='#5A8F4A';
    g.beginPath();g.arc(tx,y,14,0,7);g.fill();
    g.fillStyle='#7A5230';
    g.fillRect(tx-3,y+10,6,14);
  }
  /* 旗门 */
  for(let i=0;i<this.gates.length;i++){
    const gate=this.gates[i];
    const dz=(gate.t-pos)/spb;
    if(dz<-0.5||dz>3.4)continue;
    const y=carY-dz*(V.h*0.42/3);
    const sc=U.clamp(1-dz/4.5,0.3,1);
    const gx=gate.target*V.w;
    const gw=roadW*0.16*sc;
    const col=gate.judged==='hit'?((gate.res==='perfect')?'#FFD54A':'#7ED957'):(gate.judged?'#FF6B6B':'#4CC9F0');
    /* 旗杆 */
    g.strokeStyle='#FFF';g.lineWidth=3*sc;
    g.beginPath();g.moveTo(gx-gw,y);g.lineTo(gx-gw,y-70*sc);g.stroke();
    g.beginPath();g.moveTo(gx+gw,y);g.lineTo(gx+gw,y-70*sc);g.stroke();
    /* 旗面 */
    g.fillStyle=col;
    g.beginPath();g.moveTo(gx-gw,y-70*sc);g.lineTo(gx-gw+gw*0.8,y-55*sc);g.lineTo(gx-gw,y-40*sc);g.closePath();g.fill();
    g.beginPath();g.moveTo(gx+gw,y-70*sc);g.lineTo(gx+gw-gw*0.8,y-55*sc);g.lineTo(gx+gw,y-40*sc);g.closePath();g.fill();
    if(!gate.judged&&dz>0&&dz<2.5){
      /* 方向提示箭头 */
      const ax=gx+(gate.dir)*V.w*0.18*(1.2-dz/2.5);
      g.fillStyle='rgba(255,255,255,0.85)';
      g.save();g.translate(ax,y-30);g.scale(gate.dir,1);
      g.beginPath();g.moveTo(-12,0);g.lineTo(4,-9);g.lineTo(4,-3);g.lineTo(14,-3);g.lineTo(14,3);g.lineTo(4,3);g.lineTo(4,9);g.closePath();g.fill();
      g.restore();
    }
  }
  /* 终点线 */
  const last=this.gates[this.gates.length-1];
  const fdz=(last.t+3*spb-pos)/spb;
  if(fdz>-1&&fdz<4){
    const y=carY-fdz*(V.h*0.42/3);
    const cx=this.roadCenter((last.t+3*spb)/spb)*V.w;
    g.fillStyle='#FFF';
    for(let i=0;i<8;i++){
      g.fillStyle=i%2?'#333':'#FFF';
      g.fillRect(cx-roadW*0.24+i*roadW*0.06,y,roadW*0.06,12);
    }
    g.fillStyle='#E5484D';
    g.font='bold '+Math.min(V.w,V.h)*0.04+'px sans-serif';
    g.textAlign='center';
    g.fillText('FINISH',cx,y-14);
  }
  /* 车与小奶蛙 */
  const carX=this.laneX*V.w;
  const fs=Math.min(V.w,V.h)/7;
  g.save();
  if(this.crashT>0)g.translate(Math.sin(U.now()*40)*6,0);
  RF.frog.kart(g,carX,carY+fs*0.3,fs,{steer:this.steerAnim});
  RF.frog.draw(g,carX,carY-fs*0.15,fs*0.5,{expr:this.crashT>0?'dizzy':(this.finished?'happy':'focus'),pose:'drive',t:U.now(),hideProp:true});
  g.restore();
  /* 冲线庆祝 */
  if(this.finished){
    RF.fx.confetti(V,3);
    g.fillStyle='rgba(255,240,200,0.9)';
    g.font='bold '+Math.min(V.w,V.h)*0.07+'px "PingFang SC","Microsoft YaHei",sans-serif';
    g.textAlign='center';
    g.fillText('冲线啦!!',V.w/2,V.h*0.4);
  }
  /* 速度线 */
  if(!this.finished&&pos>0){
    g.strokeStyle='rgba(255,255,255,0.25)';g.lineWidth=2;
    for(let i=0;i<6;i++){
      const sx=(i*0.17+0.08)*V.w,sy=((U.now()*3+i*0.4)%1)*V.h;
      g.beginPath();g.moveTo(sx,sy);g.lineTo(sx,sy+30);g.stroke();
    }
  }
};
RF.mech.narrative=NarrativeMech;
})();
