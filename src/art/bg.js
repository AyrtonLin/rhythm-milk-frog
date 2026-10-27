/* 节奏小奶蛙 - 六大阶段主题背景（程序化绘制） */
(function(){
'use strict';
const RF=window.RF;
const U=RF.util;
function sky(g,V,c0,c1,h){const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,c0);gr.addColorStop(1,c1);g.fillStyle=gr;g.fillRect(0,0,V.w,h);}
function stage1(g,t,V,beat){ /* 运动场 */
  sky(g,V,'#8ED4F7','#CBEFFF',V.h*0.6);
  const standH=V.h*0.30;
  for(let r=0;r<4;r++){
    g.fillStyle=['#7FB3E0','#6EA7DA','#7FB3E0','#6EA7DA'][r];
    g.fillRect(0,standH*(r/4),V.w,standH/4+1);
  }
  const rnd=U.rand(42),n=Math.ceil(V.w/24);
  for(let i=0;i<n;i++)for(let r=0;r<4;r++){
    const x=i*24+12,y=standH*(r/4)+standH/8+Math.sin(t*2+x*0.05+r*0.8)*4;
    g.fillStyle=['#FFE3A8','#FFC9C9','#BFE6FF','#D9C9FF'][i%4];
    g.beginPath();g.arc(x,y,6,0,7);g.fill();
  }
  g.fillStyle='#E8B36B';g.fillRect(0,standH,V.w,V.h-standH);
  g.fillStyle='#D9A35B';g.fillRect(0,standH,V.w,8);
  g.strokeStyle='rgba(250,240,215,0.8)';g.lineWidth=Math.max(3,V.w*0.008);
  g.beginPath();g.arc(V.w/2,V.h*0.62,V.w*0.22,0,Math.PI*2);g.stroke();
  g.beginPath();g.moveTo(0,V.h*0.62);g.lineTo(V.w,V.h*0.62);g.stroke();
  /* 横幅 */
  g.fillStyle='#E5484D';
  const bw=V.w*0.24;
  g.fillRect(V.w*0.5-bw/2,standH*0.16,bw,standH*0.3);
  g.fillStyle='#FFF';g.font='bold '+Math.max(10,V.w*0.028)+'px sans-serif';
  g.textAlign='center';g.fillText('加油!',V.w/2,standH*0.16+standH*0.22);
  /* 节拍聚光 */
  const a=0.05+beat*0.06;
  g.fillStyle='rgba(255,255,220,'+a+')';
  g.beginPath();
  g.moveTo(V.w*0.2,0);g.lineTo(V.w*0.42,0);g.lineTo(V.w*0.6,V.h);g.lineTo(V.w*0.32,V.h);
  g.closePath();g.fill();
}
function stage2(g,t,V,beat){ /* 温馨家居 */
  sky(g,V,'#FFE3C2','#FFD1A8',V.h);
  g.fillStyle='#F2B988';g.fillRect(0,V.h*0.72,V.w,V.h*0.28);
  g.fillStyle='#E09F66';
  for(let x=0;x<V.w;x+=V.w*0.14)g.fillRect(x,V.h*0.72,V.w*0.006,V.h*0.28);
  /* 窗户 */
  const wx=V.w*0.08,wy=V.h*0.12,ww=V.w*0.3,wh=V.h*0.34;
  g.fillStyle='#FFF7E0';g.fillRect(wx,wy,ww,wh);
  const gr=g.createLinearGradient(wx,wy,wx,wy+wh);
  gr.addColorStop(0,'#BFE6FF');gr.addColorStop(1,'#E8F7D9');
  g.fillStyle=gr;g.fillRect(wx+6,wy+6,ww-12,wh-12);
  g.strokeStyle='#B08050';g.lineWidth=6;
  g.strokeRect(wx,wy,ww,wh);
  g.beginPath();g.moveTo(wx+ww/2,wy);g.lineTo(wx+ww/2,wy+wh);g.moveTo(wx,wy+wh/2);g.lineTo(wx+ww,wy+wh/2);g.stroke();
  blob(g,V.w*0.78,V.h*0.2,V.w*0.1,V.w*0.1,'#FFC46B');
  /* 盆栽 */
  g.fillStyle='#C96A4A';g.fillRect(V.w*0.8,V.h*0.6,V.w*0.12,V.h*0.13);
  g.fillStyle='#5BA357';
  g.beginPath();g.ellipse(V.w*0.86,V.h*0.56,V.w*0.08,V.h*0.07,0,0,Math.PI*2);g.fill();
  /* 暖灯光晕 */
  const a=0.06+beat*0.05;
  g.fillStyle='rgba(255,220,150,'+a+')';
  g.beginPath();g.arc(V.w*0.5,V.h*0.1,V.w*0.5,0,Math.PI*2);g.fill();
}
function stage3(g,t,V,beat){ /* 舞台/音乐厅 */
  sky(g,V,'#1A1030','#2A1848',V.h);
  const cols=['#FF5C8A','#4CC9F0','#FFD166','#B388FF'];
  for(let i=0;i<4;i++){
    const ph=t*0.7+i*Math.PI/2;
    const a=0.10+beat*0.1;
    g.fillStyle=cols[i].replace(')',','+a+')').replace('#','');
    g.save();g.globalAlpha=a;
    g.fillStyle=cols[i];
    g.beginPath();
    const bx=V.w*(0.15+i*0.24);
    g.moveTo(bx,0);
    const ang=Math.sin(ph)*0.5;
    g.lineTo(bx+Math.tan(ang)*V.h*0.8-V.w*0.06,V.h*0.8);
    g.lineTo(bx+Math.tan(ang)*V.h*0.8+V.w*0.14,V.h*0.8);
    g.closePath();g.fill();
    g.restore();
  }
  g.fillStyle='#4A3070';g.fillRect(0,V.h*0.72,V.w,V.h*0.28);
  g.fillStyle='#3A2458';g.fillRect(0,V.h*0.72,V.w,10);
  /* 星星灯 */
  const rnd=U.rand(99);
  for(let i=0;i<14;i++){
    const x=rnd()*V.w,y=rnd()*V.h*0.6;
    const tw=0.5+0.5*Math.sin(t*3+i);
    g.fillStyle='rgba(255,255,200,'+(0.25+tw*0.5)+')';
    g.beginPath();g.arc(x,y,2.5+tw*1.5,0,7);g.fill();
  }
}
function stage4(g,t,V,beat){ /* 办公室 */
  sky(g,V,'#3E4A5E','#2C3444',V.h);
  /* 城市窗景 */
  const rnd=U.rand(7);
  g.fillStyle='#22304A';g.fillRect(0,0,V.w,V.h*0.55);
  for(let i=0;i<12;i++){
    const bw=V.w*0.07,x=i*(V.w/11),bh=V.h*(0.2+rnd()*0.25);
    g.fillStyle='#182338';g.fillRect(x,V.h*0.55-bh,bw,bh);
    g.fillStyle='rgba(255,220,120,0.5)';
    for(let wY=0;wY<bh-V.h*0.04;wY+=V.h*0.045){
      if(rnd()>0.5)g.fillRect(x+bw*0.15,V.h*0.55-bh+wY+4,bw*0.25,V.h*0.02);
      if(rnd()>0.5)g.fillRect(x+bw*0.6,V.h*0.55-bh+wY+4,bw*0.25,V.h*0.02);
    }
  }
  g.fillStyle='#59636F';g.fillRect(0,V.h*0.55,V.w,V.h*0.45);
  g.fillStyle='#4A545F';g.fillRect(0,V.h*0.55,V.w,8);
  /* 工位剪影 */
  g.fillStyle='#3C4550';
  g.fillRect(V.w*0.06,V.h*0.72,V.w*0.24,V.h*0.02);
  g.fillRect(V.w*0.68,V.h*0.72,V.w*0.24,V.h*0.02);
  g.fillRect(V.w*0.1,V.h*0.74,V.w*0.02,V.h*0.1);
  g.fillRect(V.w*0.72,V.h*0.74,V.w*0.02,V.h*0.1);
  g.fillStyle='rgba(120,220,255,'+(0.25+beat*0.15)+')';
  g.fillRect(V.w*0.12,V.h*0.64,V.w*0.13,V.h*0.08);
  g.fillRect(V.w*0.74,V.h*0.64,V.w*0.13,V.h*0.08);
}
function stage5(g,t,V,beat){ /* 校园教室 */
  sky(g,V,'#CDE8FF','#EAF6FF',V.h);
  g.fillStyle='#3E7A52';g.fillRect(0,0,V.w,V.h*0.42);
  g.strokeStyle='rgba(255,255,255,0.5)';g.lineWidth=3;
  g.strokeRect(V.w*0.03,V.h*0.05,V.w*0.94,V.h*0.34);
  g.fillStyle='rgba(255,255,255,0.85)';
  g.font='bold '+Math.max(14,V.w*0.05)+'px sans-serif';
  g.textAlign='center';
  g.fillText('今天也要加油呀',V.w/2,V.h*0.17);
  g.font=Math.max(10,V.w*0.028)+'px sans-serif';
  g.fillText('♪ 跟上节奏 ♪',V.w/2,V.h*0.24);
  g.fillStyle='#D9A35B';g.fillRect(0,V.h*0.42,V.w,V.h*0.58);
  g.strokeStyle='#B08050';g.lineWidth=4;
  g.beginPath();g.moveTo(0,V.h*0.42);g.lineTo(V.w,V.h*0.42);g.stroke();
  /* 课桌 */
  g.fillStyle='#C98B5A';
  g.fillRect(V.w*0.05,V.h*0.58,V.w*0.2,V.h*0.02);
  g.fillRect(V.w*0.75,V.h*0.58,V.w*0.2,V.h*0.02);
  const a=0.08+beat*0.06;
  g.fillStyle='rgba(255,255,200,'+a+')';
  g.beginPath();g.arc(V.w/2,V.h*0.1,V.w*0.4,0,Math.PI*2);g.fill();
}
function stage6(g,t,V,beat){ /* 人生·空灵 */
  const hue=(t*4)%360;
  const gr=g.createLinearGradient(0,0,V.w,V.h);
  gr.addColorStop(0,'hsl('+hue+',45%,16%)');
  gr.addColorStop(0.5,'hsl('+((hue+40)%360)+',50%,24%)');
  gr.addColorStop(1,'hsl('+((hue+80)%360)+',45%,14%)');
  g.fillStyle=gr;g.fillRect(0,0,V.w,V.h);
  const rnd=U.rand(2026);
  for(let i=0;i<40;i++){
    const x=rnd()*V.w,y=rnd()*V.h;
    const tw=0.4+0.6*Math.abs(Math.sin(t*1.5+i*2.4));
    g.fillStyle='rgba(255,255,255,'+(0.15+tw*0.4)+')';
    g.beginPath();g.arc(x,y,1+rnd()*2.2*tw+beat,0,7);g.fill();
  }
  for(let i=0;i<5;i++){
    const px=(V.w*0.2+V.w*0.15*i+Math.sin(t*0.5+i)*30)%V.w;
    const py=V.h*0.3+Math.cos(t*0.4+i*1.3)*V.h*0.18;
    g.fillStyle='hsla('+((hue+i*70)%360)+',70%,70%,0.12)';
    g.beginPath();g.arc(px,py,V.w*0.08*(0.6+0.4*Math.sin(t+i)),0,Math.PI*2);g.fill();
  }
}
const FNS=[null,stage1,stage2,stage3,stage4,stage5,stage6];
RF.bg={
  draw:function(g,stage,t,V,beat){
    (FNS[stage]||stage1)(g,t,V,beat||0);
  }
};
})();
