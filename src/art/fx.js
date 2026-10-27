/* 节奏小奶蛙 - 特效：飘字/粒子/节拍环/力度条 */
(function(){
'use strict';
const RF=window.RF;
const U=RF.util;
const texts=[],parts=[];
const fx={
  clear:function(){texts.length=0;parts.length=0;},
  text:function(x,y,str,col,size,dur){
    texts.push({x:x,y:y,str:str,col:col,size:size||30,dur:dur||0.75,t:0});
  },
  judge:function(kind,x,y,extra){
    const map={
      perfect:{col:'#FFD54A',txt:'PERFECT'},
      good:{col:'#7ED957',txt:'GOOD'},
      miss:{col:'#FF6B6B',txt:'MISS'}
    };
    const m=map[kind]||map.miss;
    fx.text(x,y,m.txt,m.col,0,0.75);
    if(extra)fx.text(x,y+34,extra,'#FFF',0,0.7);
  },
  burst:function(x,y,col,n,sp){
    n=n||10;sp=sp||120;
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2,v=sp*(0.4+Math.random()*0.8);
      parts.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,life:0.6+Math.random()*0.3,t:0,col:col,r:3+Math.random()*3,kind:'dot'});
    }
  },
  confetti:function(V,n){
    n=n||40;
    const cols=['#FF6B8A','#FFD54A','#7ED957','#4CC9F0','#B388FF'];
    for(let i=0;i<n;i++){
      parts.push({x:Math.random()*V.w,y:-20-Math.random()*V.h*0.3,vx:(Math.random()-0.5)*40,vy:60+Math.random()*90,life:3+Math.random(),t:0,col:cols[i%5],r:4+Math.random()*4,rot:Math.random()*7,vr:(Math.random()-0.5)*6,kind:'conf'});
    }
  },
  update:function(dt,V){
    for(let i=texts.length-1;i>=0;i--){
      const p=texts[i];p.t+=dt;
      if(p.t>=p.dur)texts.splice(i,1);
    }
    for(let i=parts.length-1;i>=0;i--){
      const p=parts[i];p.t+=dt;
      if(p.t>=p.life){parts.splice(i,1);continue;}
      if(p.kind==='conf'){
        p.x+=p.vx*dt+Math.sin(p.t*6+p.rot)*30*dt;
        p.y+=p.vy*dt;p.rot+=p.vr*dt;
      }else{
        p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;
      }
    }
  },
  render:function(g,V){
    for(let i=0;i<parts.length;i++){
      const p=parts[i];
      const a=1-Math.pow(p.t/p.life,2);
      g.globalAlpha=Math.max(0,a);
      if(p.kind==='conf'){
        g.save();g.translate(p.x,p.y);g.rotate(p.rot);
        g.fillStyle=p.col;g.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6);
        g.restore();
      }else{
        g.fillStyle=p.col;
        g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.fill();
      }
    }
    g.globalAlpha=1;
    for(let i=0;i<texts.length;i++){
      const p=texts[i];
      const pr=p.t/p.dur;
      const pop=pr<0.2?(pr/0.2):(1-(pr-0.2)*0.3);
      const size=(p.size||34)*(1+pop*0.35)*U.lerp(1.25,1,Math.min(1,pr*3));
      const y=p.y-pr*60;
      g.globalAlpha=pr>0.7?1-(pr-0.7)/0.3:1;
      g.font='bold '+size+'px "PingFang SC","Microsoft YaHei",sans-serif';
      g.textAlign='center';g.textBaseline='middle';
      g.lineWidth=4;g.strokeStyle='rgba(40,30,20,0.55)';
      g.strokeText(p.str,p.x,y);
      g.fillStyle=p.col;
      g.fillText(p.str,p.x,y);
      g.globalAlpha=1;
    }
  },
  /* 节拍环：p 从 0(远) 到 1(命中点) */
  ring:function(g,x,y,p,r0,r1,col){
    p=U.clamp(p,0,1.15);
    const r=U.lerp(r0,r1,U.clamp(p,0,1));
    const a=0.25+U.clamp(p,0,1)*0.7;
    g.globalAlpha=Math.min(1,a);
    g.strokeStyle=col||'#FFE9A8';
    g.lineWidth=Math.max(2,r*0.09);
    g.beginPath();g.arc(x,y,Math.max(1,r),0,Math.PI*2);g.stroke();
    if(p>0.94){
      const f=(p-0.94)/0.21;
      g.globalAlpha=Math.max(0,1-f);
      g.strokeStyle='#FFF';g.lineWidth=3;
      g.beginPath();g.arc(x,y,r1+f*40,0,Math.PI*2);g.stroke();
    }
    g.globalAlpha=1;
  },
  /* 力度条：power 0~1，zones:[{from,to,kind:'green'|'yellow'}] */
  powerBar:function(g,V,cx,y,power,zones,active){
    const w=Math.min(V.w*0.62,340),h=18;
    const x=cx-w/2;
    g.fillStyle='rgba(30,24,16,0.55)';
    U.roundRect(g,x-4,y-4,w+8,h+8,10);g.fill();
    g.fillStyle='rgba(255,255,255,0.15)';
    U.roundRect(g,x,y,w,h,8);g.fill();
    for(let i=0;i<(zones||[]).length;i++){
      const z=zones[i];
      const zx=x+z.from*w,zw=(z.to-z.from)*w;
      g.fillStyle=z.kind==='green'?'rgba(126,217,87,0.85)':'rgba(255,213,74,0.7)';
      U.roundRect(g,zx,y,Math.max(2,zw),h,4);g.fill();
    }
    if(power>0){
      const pw=power*w;
      const grd=g.createLinearGradient(x,0,x+pw,0);
      grd.addColorStop(0,'#FF9E4A');grd.addColorStop(1,'#FF5C5C');
      g.fillStyle=grd;
      U.roundRect(g,x,y,Math.max(2,pw),h,8);g.fill();
    }
    /* 指针 */
    const nx=x+U.clamp(power,0,1)*w;
    g.fillStyle='#FFF';
    g.beginPath();g.moveTo(nx,y-5);g.lineTo(nx-7,y-16);g.lineTo(nx+7,y-16);g.closePath();g.fill();
    if(active){
      const inGreen=(zones||[]).some(function(z){return z.kind==='green'&&power>=z.from&&power<=z.to;});
      if(inGreen){
        g.strokeStyle='rgba(126,217,87,'+(0.6+0.4*Math.sin(U.now()*10))+')';
        g.lineWidth=3;
        U.roundRect(g,x-6,y-6,w+12,h+12,12);g.stroke();
      }
    }
  }
};
/* 圆角矩形辅助 */
U.roundRect=function(g,x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  g.beginPath();
  g.moveTo(x+r,y);
  g.arcTo(x+w,y,x+w,y+h,r);
  g.arcTo(x+w,y+h,x,y+h,r);
  g.arcTo(x,y+h,x,y,r);
  g.arcTo(x,y,x+w,y,r);
  g.closePath();
};
RF.fx=fx;
})();
