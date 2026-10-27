/* 节奏小奶蛙 - Q版小奶蛙程序化绘制（表情/动作/道具） */
(function(){
'use strict';
const RF=window.RF;
const U=RF.util;
const C={
  body:'#FFF7E6',body2:'#F2E4C4',belly:'#E9F5CE',
  outline:'#C9A96B',cheek:'#FFBFC9',
  eyeW:'#FFFFFF',pupil:'#3A2E2A',lid:'#F2E4C4',
  mouth:'#9C5540',tongue:'#F2938C'
};
function blob(g,x,y,rx,ry,col,rot){
  g.fillStyle=col;g.beginPath();
  g.ellipse(x,y,Math.max(rx,0.1),Math.max(ry,0.1),rot||0,0,Math.PI*2);g.fill();
}
function capsule(g,x1,y1,x2,y2,r,col){
  g.strokeStyle=col;g.lineWidth=r*2;g.lineCap='round';
  g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
}
/* 道具绘制 */
const PROPS={
  basketball:function(g,x,y,s){
    const r=0.3*s;
    blob(g,x,y,r,r,'#F7942C');
    g.strokeStyle='#C05E14';g.lineWidth=0.045*s;
    g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.stroke();
    g.beginPath();g.moveTo(x-r,y);g.lineTo(x+r,y);g.stroke();
    g.beginPath();g.moveTo(x,y-r);g.lineTo(x,y+r);g.stroke();
    g.beginPath();g.ellipse(x,y,r*0.55,r,0,0,Math.PI*2);g.stroke();
  },
  soccer:function(g,x,y,s){
    const r=0.3*s;
    blob(g,x,y,r,r,'#FFFFFF');
    g.strokeStyle='#4A4A4A';g.lineWidth=0.04*s;
    g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.stroke();
    g.fillStyle='#333';
    g.beginPath();
    for(let i=0;i<5;i++){
      const a=-Math.PI/2+i*Math.PI*2/5;
      const px=x+Math.cos(a)*r*0.32,py=y+Math.sin(a)*r*0.32;
      if(i===0)g.moveTo(px,py);else g.lineTo(px,py);
    }
    g.closePath();g.fill();
    for(let i=0;i<5;i++){
      const a=-Math.PI/2+i*Math.PI*2/5+Math.PI/5;
      g.beginPath();g.moveTo(x+Math.cos(a)*r*0.3,y+Math.sin(a)*r*0.3);
      g.lineTo(x+Math.cos(a)*r*0.95,y+Math.sin(a)*r*0.95);g.stroke();
    }
  },
  volleyball:function(g,x,y,s){
    const r=0.34*s;
    blob(g,x,y,r,r,'#FBEFD4');
    g.strokeStyle='#E4B96A';g.lineWidth=0.05*s;
    g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.stroke();
    g.beginPath();g.arc(x-r*0.45,y,r*0.75,-1.1,1.1);g.stroke();
    g.beginPath();g.arc(x+r*0.45,y,r*0.75,Math.PI-1.1,Math.PI+1.1);g.stroke();
    g.beginPath();g.moveTo(x,y-r);g.quadraticCurveTo(x+r*0.2,y,x,y+r);g.stroke();
  },
  badmintonRacket:function(g,x,y,s){
    g.save();g.translate(x,y);g.rotate(-0.7);
    capsule(g,0,0.45*s,0,0.95*s,0.055*s,'#7A4B2A');
    g.fillStyle='#F5F5F0';g.strokeStyle='#7A4B2A';g.lineWidth=0.05*s;
    g.beginPath();g.ellipse(0,-0.1*s,0.26*s,0.42*s,0,0,Math.PI*2);g.fill();g.stroke();
    g.strokeStyle='#C8C8BE';g.lineWidth=0.02*s;
    for(let i=-2;i<=2;i++){
      g.beginPath();g.moveTo(i*0.09*s,-0.48*s);g.lineTo(i*0.09*s,0.26*s);g.stroke();
      g.beginPath();g.moveTo(-0.24*s,i*0.13*s-0.1*s);g.lineTo(0.24*s,i*0.13*s-0.1*s);g.stroke();
    }
    g.restore();
  },
  tennisRacket:function(g,x,y,s){
    g.save();g.translate(x,y);g.rotate(-0.7);
    capsule(g,0,0.5*s,0,1.0*s,0.06*s,'#3D6B35');
    g.fillStyle='#EAF7D9';g.strokeStyle='#3D6B35';g.lineWidth=0.05*s;
    g.beginPath();g.ellipse(0,-0.08*s,0.32*s,0.44*s,0,0,Math.PI*2);g.fill();g.stroke();
    g.strokeStyle='#B8D8A0';g.lineWidth=0.022*s;
    for(let i=-2;i<=2;i++){
      g.beginPath();g.moveTo(i*0.11*s,-0.46*s);g.lineTo(i*0.11*s,0.3*s);g.stroke();
      g.beginPath();g.moveTo(-0.28*s,i*0.14*s-0.08*s);g.lineTo(0.28*s,i*0.14*s-0.08*s);g.stroke();
    }
    g.restore();
  },
  ppPaddle:function(g,x,y,s){
    g.save();g.translate(x,y);g.rotate(-0.5);
    capsule(g,0,0.35*s,0,0.7*s,0.05*s,'#B0653A');
    g.fillStyle='#E5484D';g.strokeStyle='#B0653A';g.lineWidth=0.045*s;
    g.beginPath();g.arc(0,-0.05*s,0.3*s,0,Math.PI*2);g.fill();g.stroke();
    g.restore();
  },
  dart:function(g,x,y,s){
    g.save();g.translate(x,y);g.rotate(-0.5);
    capsule(g,0,0,0,0.6*s,0.045*s,'#7A4B2A');
    g.fillStyle='#E5484D';
    g.beginPath();g.moveTo(0,-0.5*s);g.lineTo(-0.14*s,0.05*s);g.lineTo(0.14*s,0.05*s);g.closePath();g.fill();
    g.fillStyle='#F5C518';
    g.beginPath();g.moveTo(0,-0.5*s);g.lineTo(-0.14*s,0.05*s);g.lineTo(0,0);g.closePath();g.fill();
    g.restore();
  },
  toyGun:function(g,x,y,s){
    g.save();g.translate(x,y);g.rotate(-0.35);
    g.fillStyle='#8A5A33';
    g.fillRect(-0.5*s,-0.09*s,0.55*s,0.16*s);
    g.fillStyle='#666';
    g.fillRect(0.02*s,-0.07*s,0.5*s,0.11*s);
    g.fillStyle='#E5484D';g.beginPath();g.arc(0.56*s,-0.015*s,0.09*s,0,Math.PI*2);g.fill();
    g.restore();
  },
  jianzi:function(g,x,y,s){
    blob(g,x,y,0.14*s,0.1*s,'#D9C9A8');
    const cols=['#E5484D','#F5C518','#4C9BE8'];
    for(let i=0;i<3;i++){
      g.fillStyle=cols[i];
      g.beginPath();
      g.moveTo(x,y-0.05*s);
      g.lineTo(x+(i-1)*0.16*s,y-0.55*s);
      g.lineTo(x+(i-1)*0.16*s+0.12*s,y-0.55*s);
      g.closePath();g.fill();
    }
  },
  none:function(){}
};
/* 卡丁车（赛车关） */
function kart(g,x,y,s,o){
  o=o||{};
  const st=o.steer||0;
  g.save();g.translate(x,y);
  g.rotate(st*0.12);
  g.scale(1.25,1.25);
  /* 车身 */
  g.fillStyle='#E5484D';
  g.beginPath();
  g.moveTo(-0.9*s,0.25*s);g.lineTo(-0.95*s,0.75*s);
  g.lineTo(0.95*s,0.75*s);g.lineTo(0.9*s,0.25*s);
  g.quadraticCurveTo(0.6*s,0.05*s,0,0.05*s);
  g.quadraticCurveTo(-0.6*s,0.05*s,-0.9*s,0.25*s);
  g.closePath();g.fill();
  g.strokeStyle='#A83240';g.lineWidth=0.06*s;g.stroke();
  /* 车头 */
  blob(g,0,0.1*s,0.5*s,0.2*s,'#F5C518');
  /* 车轮 */
  g.fillStyle='#333';
  [[-0.72,0.75],[0.72,0.75]].forEach(function(w){
    g.beginPath();g.ellipse(w[0]*s,w[1]*s,0.22*s,0.13*s,0,0,Math.PI*2);g.fill();
  });
  g.restore();
}
/* 手臂位置表（相对肩，单位 s） */
function armTargets(pose,pp,t,side){
  switch(pose){
    case'charge':return[0.2*side,-0.95];
    case'throw':return[1.05*side,-0.8+0.25*U.clamp(pp,0,1)];
    case'swing':return side>0?[1.0,-0.3-0.7*U.clamp(pp,0,1)]:[-0.7,-0.4];
    case'jump':return[0.9*side,-0.9];
    case'cheer':return[1.0*side,-1.1];
    case'kick':return[0.9*side,-0.3];
    case'catch':return[1.0*side,-0.55];
    case'drive':return[0.7*side,-0.15];
    case'crash':return[1.2*side,-0.5];
    case'shoot':return side>0?[1.15,-0.3]:[0.5,-0.2];
    case'point':return side>0?[1.2,-0.4]:[0.5,0.3];
    case'run':return side>0?[0.9,-0.3-0.35*Math.sin(t*9)]:[-0.9,-0.3+0.35*Math.sin(t*9)];
    case'slide':return[1.0*side,-0.7];
    default:return[0.6*side,0.5];
  }
}
function face(g,s,expr,t,pose){
  const ex=0.46,ey=-0.62,er=0.34;
  const blink=expr==='idle'&&(t%3.9)<0.12;
  const happyClosed=(expr==='happy'&&pose==='cheer')||expr==='proud';
  /* 眼白 */
  for(let q=-1;q<=1;q+=2){
    blob(g,q*ex*s,ey*s,er*s,er*s*1.02,C.eyeW);
    g.strokeStyle=C.outline;g.lineWidth=0.045*s;
    g.beginPath();g.ellipse(q*ex*s,ey*s,er*s,er*s*1.02,0,0,Math.PI*2);g.stroke();
  }
  for(let q=-1;q<=1;q+=2){
    const cx=q*ex*s,cy=ey*s;
    if(blink||happyClosed){
      /* 闭眼弧线 */
      g.strokeStyle=C.pupil;g.lineWidth=0.07*s;g.lineCap='round';
      g.beginPath();
      if(happyClosed){g.moveTo(cx-0.2*s,cy+0.05*s);g.quadraticCurveTo(cx,cy-0.22*s,cx+0.2*s,cy+0.05*s);}
      else{g.moveTo(cx-0.2*s,cy);g.lineTo(cx+0.2*s,cy);}
      g.stroke();
      continue;
    }
    if(expr==='dizzy'){
      g.strokeStyle=C.pupil;g.lineWidth=0.05*s;
      g.beginPath();
      for(let a=0;a<Math.PI*4;a+=0.25){
        const r=(0.04+0.025*a/Math.PI)*s;
        const px=cx+Math.cos(a+t*6)*r,py=cy+Math.sin(a+t*6)*r;
        if(a===0)g.moveTo(px,py);else g.lineTo(px,py);
      }
      g.stroke();
      continue;
    }
    /* 瞳孔 */
    const lookY=(expr==='sad'||expr==='cry')?0.12:(expr==='focus'?0.02:0);
    const pr=(expr==='happy')?0.17:(expr==='focus'?0.1:0.135);
    blob(g,cx,cy+lookY*s,pr*s,pr*s,C.pupil);
    blob(g,cx+0.05*s,cy+lookY*s-0.06*s,0.05*s,0.05*s,'#FFF');
    /* 眼睑：专注/难过 */
    if(expr==='focus'||expr==='sad'||expr==='cry'){
      g.fillStyle=C.lid;
      g.save();
      g.beginPath();g.ellipse(cx,cy,er*s,er*s*1.02,0,0,Math.PI*2);g.clip();
      const lidY=cy-er*s*1.02+(expr==='focus'?er*s*0.65:er*s*0.5);
      g.fillRect(cx-er*s,cy-er*s*1.05,er*s*2,lidY-(cy-er*s*1.05));
      g.restore();
      g.strokeStyle=C.outline;g.lineWidth=0.035*s;
      g.beginPath();g.moveTo(cx-er*s*0.95,lidY);g.lineTo(cx+er*s*0.95,lidY);g.stroke();
    }
  }
  /* 眉毛（专注/疑惑） */
  if(expr==='focus'||expr==='confused'){
    g.strokeStyle=C.outline;g.lineWidth=0.05*s;g.lineCap='round';
    g.beginPath();g.moveTo(-0.6*s,-1.12*s);g.lineTo(-0.32*s,-1.05*s);g.stroke();
    if(expr==='confused'){
      g.beginPath();g.moveTo(0.32*s,-1.15*s);g.lineTo(0.6*s,-1.02*s);g.stroke();
    }else{
      g.beginPath();g.moveTo(0.32*s,-1.05*s);g.lineTo(0.6*s,-1.12*s);g.stroke();
    }
  }
  /* 泪滴/泪痕 */
  if(expr==='cry'){
    for(let q=-1;q<=1;q+=2){
      g.fillStyle='#8FD3F4';
      g.beginPath();
      const ty=ey*s+0.28*s+Math.sin(t*8)*0.04*s;
      g.ellipse(q*ex*s-0.12*q*s,ty,0.07*s,0.12*s,0,0,Math.PI*2);g.fill();
    }
  }else if(expr==='sad'){
    g.fillStyle='#8FD3F4';
    g.beginPath();
    g.arc(-0.58*s,ey*s+0.15*s,0.08*s,0,Math.PI*2);g.fill();
  }
  /* 腮红 */
  g.globalAlpha=(expr==='happy'||expr==='proud')?0.9:0.6;
  blob(g,-0.62*s,-0.18*s,0.15*s,0.09*s,C.cheek);
  blob(g,0.62*s,-0.18*s,0.15*s,0.09*s,C.cheek);
  g.globalAlpha=1;
  /* 嘴 */
  g.strokeStyle=C.mouth;g.lineWidth=0.06*s;g.lineCap='round';
  const my=0.05*s;
  if(expr==='happy'||expr==='proud'){
    g.fillStyle=C.mouth;
    g.beginPath();
    g.arc(0,my,0.3*s,0.15*Math.PI,0.85*Math.PI);
    g.closePath();g.fill();
    g.fillStyle=C.tongue;
    g.beginPath();
    g.arc(0,my+0.14*s,0.13*s,Math.PI,0);
    g.closePath();g.fill();
  }else if(expr==='sad'||expr==='cry'){
    g.beginPath();
    g.arc(0,my+0.32*s,0.24*s,1.2*Math.PI,1.8*Math.PI);
    g.stroke();
  }else if(expr==='focus'){
    g.beginPath();g.moveTo(-0.16*s,my+0.1*s);g.lineTo(0.16*s,my+0.1*s);g.stroke();
  }else if(expr==='confused'){
    g.fillStyle=C.mouth;
    g.beginPath();g.ellipse(0,my+0.08*s,0.09*s,0.11*s,0,0,Math.PI*2);g.fill();
  }else if(expr==='dizzy'){
    g.beginPath();
    g.moveTo(-0.2*s,my+0.12*s);
    g.quadraticCurveTo(-0.1*s,my+0.02*s,0,my+0.12*s);
    g.quadraticCurveTo(0.1*s,my+0.22*s,0.2*s,my+0.12*s);
    g.stroke();
  }else{
    g.beginPath();
    g.arc(0,my,0.22*s,0.25*Math.PI,0.75*Math.PI);
    g.stroke();
  }
}
/* 主绘制入口
   g,x,y,s(身体半径像素),o:{expr,pose,poseP,prop,charge,t,swingDir,hideProp} */
function drawFrog(g,x,y,s,o){
  o=o||{};
  const t=o.t||0;
  const expr=o.expr||'idle';
  const pose=o.pose||'idle';
  const pp=o.poseP!=null?o.poseP:0;
  const ch=U.clamp(o.charge||0,0,1);
  const dir=o.swingDir||1;
  g.save();
  g.translate(x,y);
  let dy=0,rot=0,sx=1+ch*0.12,sy=1-ch*0.16;
  dy+=Math.sin(t*2.4)*0.03*s;
  const pc=U.clamp(pp,0,1);
  switch(pose){
    case'jump':dy-=Math.sin(pc*Math.PI)*0.9*s;sy*=1.08;sx*=0.94;break;
    case'charge':dy+=0.1*s;sy*=0.92;sx*=1.06;break;
    case'throw':dy-=Math.sin(pc*Math.PI*0.9)*0.55*s;rot=-0.25*Math.sin(pc*Math.PI);break;
    case'swing':rot=(pc-0.5)*1.0*dir;break;
    case'kick':dy-=Math.sin(pc*Math.PI)*0.3*s;rot=0.15*Math.sin(pc*Math.PI);break;
    case'crash':rot=1.35;dy+=0.25*s;break;
    case'slide':rot=-1.1;dy+=0.3*s;break;
    case'cheer':dy-=Math.abs(Math.sin(t*6))*0.16*s;break;
    case'drive':dy+=0.12*s;break;
    case'run':dy-=Math.abs(Math.sin(t*9))*0.08*s;break;
  }
  g.rotate(rot);
  g.scale(sx,sy);
  /* 腿 */
  if(pose==='kick'){
    capsule(g,-0.42*s,0.95*s,-0.55*s,1.35*s,0.16*s,C.body);
    capsule(g,0.42*s,0.95*s,0.85*s,(1.0-0.9*Math.sin(pc*Math.PI))*s,0.16*s,C.body);
    blob(g,-0.55*s,1.35*s,0.17*s,0.12*s,C.body);
    blob(g,0.85*s,(1.0-0.9*Math.sin(pc*Math.PI))*s,0.17*s,0.12*s,C.body);
  }else if(pose==='drive'){
    capsule(g,-0.4*s,0.95*s,-0.78*s,1.12*s,0.15*s,C.body);
    capsule(g,0.4*s,0.95*s,0.78*s,1.12*s,0.15*s,C.body);
  }else if(pose==='run'){
    const ph=Math.sin(t*9);
    capsule(g,-0.4*s,0.95*s,(-0.4-0.25*ph)*s,1.25*s,0.15*s,C.body);
    capsule(g,0.4*s,0.95*s,(0.4+0.25*ph)*s,1.25*s,0.15*s,C.body);
  }else{
    capsule(g,-0.4*s,0.95*s,-0.5*s,1.3*s,0.15*s,C.body);
    capsule(g,0.4*s,0.95*s,0.5*s,1.3*s,0.15*s,C.body);
    blob(g,-0.5*s,1.3*s,0.16*s,0.11*s,C.body);
    blob(g,0.5*s,1.3*s,0.16*s,0.11*s,C.body);
  }
  /* 身体 */
  blob(g,0,0,1.06*s,1.12*s,C.body);
  g.strokeStyle=C.outline;g.lineWidth=0.055*s;
  g.beginPath();g.ellipse(0,0,1.06*s,1.12*s,0,0,Math.PI*2);g.stroke();
  /* 肚皮 */
  blob(g,0,0.45*s,0.76*s,0.6*s,C.belly);
  /* 手臂 */
  const shx=0.62,shy=-0.15;
  const hR=armTargets(pose,pp,t,1),hL=armTargets(pose,pp,t,-1);
  capsule(g,-shx*s,shy*s,hL[0]*s,hL[1]*s,0.14*s,C.body);
  capsule(g,shx*s,shy*s,hR[0]*s,hR[1]*s,0.14*s,C.body);
  blob(g,hL[0]*s,hL[1]*s,0.15*s,0.15*s,C.body);
  blob(g,hR[0]*s,hR[1]*s,0.15*s,0.15*s,C.body);
  /* 表情 */
  face(g,s,expr,t,pose);
  /* 道具：蓄力时双手举过头顶，其它拿在前手 */
  if(o.prop&&PROPS[o.prop]&&!o.hideProp){
    if(pose==='charge'){
      PROPS[o.prop](g,0,-1.15*s,s*0.9);
    }else{
      PROPS[o.prop](g,hR[0]*s,hR[1]*s,s*0.9);
    }
  }
  g.restore();
}
RF.frog={draw:drawFrog,PROPS:PROPS,kart:kart,C:C};
})();
