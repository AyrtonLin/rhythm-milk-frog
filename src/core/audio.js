/* 节奏小奶蛙 - Web Audio 合成引擎 + BGM 调度器
   所有音符用 lookahead 精确排程，判定与音乐共用 AudioContext 时钟 */
(function(){
'use strict';
const RF=window.RF;
const U=RF.util;
let ctx=null,master,comp,musicGain,sfxGain,noiseBuf;
let locked=false,cur=null;

function ensure(){
  if(!ctx){
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return null;
    ctx=new AC();
    master=ctx.createGain();master.gain.value=1;
    comp=ctx.createDynamicsCompressor();
    comp.threshold.value=-16;comp.knee.value=18;comp.ratio.value=5;comp.attack.value=0.003;comp.release.value=0.25;
    master.connect(comp);comp.connect(ctx.destination);
    musicGain=ctx.createGain();musicGain.connect(master);
    sfxGain=ctx.createGain();sfxGain.connect(master);
    applyVol();
  }
  if(!locked&&ctx.state==='suspended')ctx.resume();
  return ctx;
}
function applyVol(){
  if(!ctx)return;
  musicGain.gain.value=RF.save.settings.music;
  sfxGain.gain.value=RF.save.settings.sfx;
}
function now(){return ctx?ctx.currentTime:0;}
function noise(){
  if(!noiseBuf){
    noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);
    const d=noiseBuf.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  }
  const s=ctx.createBufferSource();s.buffer=noiseBuf;s.loop=true;return s;
}
/* ---------------- 合成乐器 ---------------- */
function kick(t,v){
  v=v||1;
  const o=ctx.createOscillator(),g=ctx.createGain();
  o.frequency.setValueAtTime(165,t);o.frequency.exponentialRampToValueAtTime(44,t+0.11);
  g.gain.setValueAtTime(0.001,t);g.gain.linearRampToValueAtTime(0.85*v,t+0.004);g.gain.exponentialRampToValueAtTime(0.001,t+0.24);
  o.connect(g);g.connect(musicGain);o.start(t);o.stop(t+0.26);
}
function snare(t,v){
  v=v||1;
  const s=noise(),f=ctx.createBiquadFilter(),g=ctx.createGain();
  f.type='bandpass';f.frequency.value=1900;f.Q.value=0.9;
  g.gain.setValueAtTime(0.5*v,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.16);
  s.connect(f);f.connect(g);g.connect(musicGain);s.start(t);s.stop(t+0.2);
  const o=ctx.createOscillator(),g2=ctx.createGain();
  o.type='triangle';o.frequency.value=210;
  g2.gain.setValueAtTime(0.25*v,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.09);
  o.connect(g2);g2.connect(musicGain);o.start(t);o.stop(t+0.1);
}
function hat(t,v,open){
  v=v||1;
  const s=noise(),f=ctx.createBiquadFilter(),g=ctx.createGain();
  f.type='highpass';f.frequency.value=7600;
  const d=open?0.22:0.05;
  g.gain.setValueAtTime(0.22*v,t);g.gain.exponentialRampToValueAtTime(0.001,t+d);
  s.connect(f);f.connect(g);g.connect(musicGain);s.start(t);s.stop(t+d+0.02);
}
function tone(t,f,d,o){
  o=o||{};
  const osc=ctx.createOscillator(),g=ctx.createGain(),flt=ctx.createBiquadFilter();
  osc.type=o.type||'triangle';osc.frequency.setValueAtTime(f,t);
  flt.type='lowpass';flt.frequency.value=o.cut||3800;
  const v=o.vol||0.2,a=o.a||0.008,rel=o.rel!=null?o.rel:d*0.9;
  const sus=Math.max(a,d-rel);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+a);
  g.gain.setValueAtTime(v,t+sus);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  osc.connect(flt);flt.connect(g);g.connect(o.sfx?sfxGain:musicGain);
  osc.start(t);osc.stop(t+d+0.05);
}
function pluck(t,f,v){ /* 八音盒/铃铛 */
  const o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),g2=ctx.createGain();
  o.type='sine';o.frequency.value=f;o2.type='sine';o2.frequency.value=f*2.01;
  g2.gain.value=0.35;
  g.gain.setValueAtTime(v||0.3,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.5);
  o.connect(g);o2.connect(g2);g2.connect(g);g.connect(musicGain);
  o.start(t);o.stop(t+0.55);o2.start(t);o2.stop(t+0.55);
}
function pad(t,fs,d,v){
  v=v||0.1;
  const g=ctx.createGain(),flt=ctx.createBiquadFilter();
  flt.type='lowpass';flt.frequency.value=1000;flt.Q.value=0.4;
  const a=Math.min(0.4,d*0.3);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+a);
  g.gain.setValueAtTime(v,t+Math.max(a,d*0.3));g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  flt.connect(g);g.connect(musicGain);
  for(let i=0;i<fs.length;i++){
    const dts=[0,-7,7];
    for(let j=0;j<dts.length;j++){
      const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=fs[i];o.detune.value=dts[j];
      o.connect(flt);o.start(t);o.stop(t+d+0.05);
    }
  }
}
function bass(t,f,d,v){
  const o=ctx.createOscillator(),g=ctx.createGain(),flt=ctx.createBiquadFilter();
  o.type='square';o.frequency.value=f;
  flt.type='lowpass';flt.frequency.value=420;
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v||0.16,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  o.connect(flt);flt.connect(g);g.connect(musicGain);o.start(t);o.stop(t+d+0.03);
}
function lead(t,f,d,v,type,cut){
  const o=ctx.createOscillator(),g=ctx.createGain(),flt=ctx.createBiquadFilter();
  o.type=type||'sawtooth';o.frequency.value=f;
  flt.type='lowpass';flt.frequency.value=cut||2400;
  const vv=v||0.14;
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vv,t+0.015);
  g.gain.setValueAtTime(vv,t+Math.max(0.015,d*0.6));g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  o.connect(flt);flt.connect(g);g.connect(musicGain);o.start(t);o.stop(t+d+0.05);
}
/* ---------------- 乐曲构建 ---------------- */
const CHORD={m:[0,3,7],M:[0,4,7],M7:[0,4,7,11],m7:[0,3,7,10],sus:[0,5,7]};
function frq(s){return 220*Math.pow(2,s/12);}
const PROG={
  sport:[[0,'m'],[8,'M'],[3,'M'],[10,'M']],
  campus:[[0,'M'],[9,'m'],[5,'M'],[7,'M']],
  home:[[0,'M'],[9,'m'],[5,'M'],[7,'M']],
  music:[[0,'m'],[7,'M'],[3,'M'],[10,'M']],
  work:[[0,'M7'],[9,'m7'],[5,'M7'],[7,'sus']],
  life:[[0,'m'],[5,'m'],[8,'M'],[7,'M']]
};
const SCALE={
  sport:[0,3,5,7,10],
  campus:[0,2,4,7,9],
  home:[0,2,4,7,9],
  music:[0,2,3,5,7,8,10],
  work:[0,2,3,5,7,9,10],
  life:[0,3,5,7,10]
};
function buildSong(def){
  const bpm=def.bpm,spb=60/bpm,bars=def.bars,style=def.style||'sport';
  const rnd=U.rand((def.seed||1)*7919+13);
  const ev=[];
  const root=def.root!=null?def.root:Math.floor(rnd()*5)-2;
  const prog=PROG[style]||PROG.sport;
  const baseScale=SCALE[style]||SCALE.sport;
  const sc=baseScale.concat(baseScale.map(function(s){return s+12;}));
  let mi=Math.floor(sc.length/2);
  const rhy=[[0,.5,1,2,2.5,3],[0,1,1.5,2.5,3],[.5,1,1.5,2,3,3.5],[0,.5,1,1.5,2,3],[0,2,2.5,3,3.5],[0,.5,1.5,2.5,3]];
  for(let b=0;b<bars;b++){
    const tb=b*4*spb;
    const cs=prog[b%prog.length][0],cq=prog[b%prog.length][1];
    const ch=(CHORD[cq]||CHORD.M).map(function(s){return cs+root+s;});
    const bassF=frq(cs+root-12);
    const padF=ch.map(frq);
    switch(style){
      case'sport':
        [0,0.75,2,2.75].forEach(function(x){
          ev.push({t:tb+x*spb,k:'kick',v:1});
          ev.push({t:tb+x*spb,k:'bass',f:bassF,d:0.3*spb,v:0.17});
        });
        [1,3].forEach(function(x){ev.push({t:tb+x*spb,k:'snare',v:0.85});});
        for(let x=0;x<4;x+=0.5)ev.push({t:tb+x*spb,k:'hat',v:(x%1?0.5:0.8),open:x===3.5});
        ev.push({t:tb,k:'pad',fs:padF,d:1.8*spb,v:0.06});
        ev.push({t:tb+2.5*spb,k:'pad',fs:padF,d:0.8*spb,v:0.05});
        break;
      case'campus':
        [0,1.75,2.75].forEach(function(x){ev.push({t:tb+x*spb,k:'kick',v:0.95});});
        [1,3].forEach(function(x){ev.push({t:tb+x*spb,k:'snare',v:0.8});});
        for(let x=0;x<4;x+=0.5)ev.push({t:tb+x*spb,k:'hat',v:(x%1?0.4:0.7),open:(x===1.5||x===3.5)});
        ev.push({t:tb,k:'pad',fs:padF,d:1.9*spb,v:0.06});
        break;
      case'home':
        [0,2].forEach(function(x){ev.push({t:tb+x*spb,k:'kick',v:0.5});});
        [0.5,1.5,2.5,3.5].forEach(function(x){ev.push({t:tb+x*spb,k:'hat',v:0.4});});
        ev.push({t:tb,k:'pad',fs:padF,d:3.8*spb,v:0.07});
        break;
      case'music':
        for(let x=0;x<8;x++){
          const s=ch[x%3]+(x>=6?12:0);
          ev.push({t:tb+x*0.5*spb,k:'pluck',f:frq(s+12),v:0.2});
        }
        ev.push({t:tb,k:'pad',fs:padF,d:3.8*spb,v:0.07});
        break;
      case'work':
        [0,2.5].forEach(function(x){ev.push({t:tb+x*spb,k:'kick',v:0.8});});
        [1,3].forEach(function(x){ev.push({t:tb+x*spb,k:'snare',v:0.45});});
        [0.5,1.58,2.5,3.58].forEach(function(x){ev.push({t:tb+x*spb,k:'hat',v:0.5});});
        ev.push({t:tb,k:'pad',fs:padF,d:3.8*spb,v:0.09});
        [0,2.5].forEach(function(x){ev.push({t:tb+x*spb,k:'bass',f:bassF,d:0.9*spb,v:0.13});});
        break;
      case'life':
        ev.push({t:tb,k:'pad',fs:padF.map(function(f){return f/2;}).concat(padF),d:7.8*spb,v:0.11});
        if(b%2===0)ev.push({t:tb,k:'bass',f:bassF/2,d:7.5*spb,v:0.1});
        break;
    }
    /* 旋律 */
    const rp=rhy[Math.floor(rnd()*rhy.length)];
    for(let i=0;i<rp.length;i++){
      const step=Math.floor(rnd()*5)-2;
      mi=U.clamp(mi+step,0,sc.length-1);
      const f=frq(root+sc[mi]+24);
      const x=rp[i];
      if(style==='home')ev.push({t:tb+x*spb,k:'pluck',f:f,v:0.26});
      else if(style==='life')ev.push({t:tb+x*spb,k:'pluck',f:f,v:0.13});
      else if(style==='music')ev.push({t:tb+x*spb,k:'lead',f:f,d:0.5*spb,v:0.1,type:'triangle',cut:3000});
      else if(style==='work')ev.push({t:tb+x*spb,k:'lead',f:f,d:0.4*spb,v:0.09,type:'sine',cut:2600});
      else ev.push({t:tb+x*spb,k:'lead',f:f,d:0.34*spb,v:0.12,type:style==='campus'?'square':'sawtooth',cut:style==='campus'?3400:2400});
    }
  }
  ev.sort(function(a,b){return a.t-b.t;});
  return {events:ev,dur:bars*4*spb};
}
function playEvent(e,at){
  switch(e.k){
    case'kick':kick(at,e.v);break;
    case'snare':snare(at,e.v);break;
    case'hat':hat(at,e.v,e.open);break;
    case'bass':bass(at,e.f,e.d,e.v);break;
    case'pad':pad(at,e.fs,e.d,e.v);break;
    case'pluck':pluck(at,e.f,e.v);break;
    case'lead':lead(at,e.f,e.d,e.v,e.type,e.cut);break;
  }
}
/* ---------------- 播放器 ---------------- */
function playSong(def,onEnd){
  if(!ensure())return null;
  stopSong();
  const built=buildSong(def);
  const startAt=ctx.currentTime+0.12;
  cur={built:built,i:0,startTime:startAt,dur:built.dur,onEnd:onEnd,ended:false};
  cur.timer=setInterval(tick,25);
  tick();
  return cur;
}
function tick(){
  if(!cur||cur.ended)return;
  const ahead=ctx.currentTime+0.2;
  const ev=cur.built.events;
  while(cur.i<ev.length&&cur.startTime+ev[cur.i].t<ahead){
    playEvent(ev[cur.i],cur.startTime+ev[cur.i].t);
    cur.i++;
  }
  if(ctx.currentTime>cur.startTime+cur.dur+0.4)finish();
}
function finish(){
  if(!cur||cur.ended)return;
  cur.ended=true;
  if(cur.timer)clearInterval(cur.timer);
  const cb=cur.onEnd;
  cur=null;
  if(cb)cb();
}
function stopSong(){
  if(cur){
    if(cur.timer)clearInterval(cur.timer);
    cur=null;
  }
}
function songDur(){return cur?cur.dur:0;}
function pos(){if(!cur||!ctx)return 0;return ctx.currentTime-cur.startTime;}
function pause(){
  if(ctx&&ctx.state==='running'){locked=true;try{ctx.suspend();}catch(e){}}
}
function resume(){locked=false;if(ctx&&ctx.state==='suspended')try{ctx.resume();}catch(e){}}
function isPaused(){return ctx?ctx.state==='suspended':false;}
/* ---------------- 音效 ---------------- */
function sfx(name,opt){
  if(locked)return;
  if(!ensure())return;
  sfxAt(name,ctx.currentTime+0.001,opt);
}
function sfxAt(name,t,opt){
  const v=(opt&&opt.v)||1;
  switch(name){
    case'perfect':
      tone(t,1318,0.12,{type:'sine',vol:0.35*v,sfx:true});
      tone(t+0.07,1760,0.16,{type:'sine',vol:0.3*v,sfx:true});
      break;
    case'good':tone(t,880,0.1,{type:'sine',vol:0.28*v,sfx:true});break;
    case'miss':{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sawtooth';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(90,t+0.18);
      g.gain.setValueAtTime(0.2*v,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.2);
      o.connect(g);g.connect(sfxGain);o.start(t);o.stop(t+0.22);
      break;
    }
    case'tick':tone(t,1100,0.06,{type:'square',vol:0.16*v,sfx:true,cut:2500});break;
    case'go':
      tone(t,660,0.09,{type:'square',vol:0.2,sfx:true});
      tone(t+0.09,990,0.16,{type:'square',vol:0.2,sfx:true});
      break;
    case'click':tone(t,700,0.05,{type:'square',vol:0.13,sfx:true,cut:1800});break;
    case'switch':tone(t,520,0.07,{type:'square',vol:0.15,sfx:true});break;
    case'charge':tone(t,300+((opt&&opt.p)||0)*700,0.06,{type:'sine',vol:0.18,sfx:true});break;
    case'whoosh':{
      const s=noise(),f=ctx.createBiquadFilter(),g=ctx.createGain();
      f.type='bandpass';f.Q.value=1.2;f.frequency.setValueAtTime(600,t);f.frequency.exponentialRampToValueAtTime(2400,t+0.16);
      g.gain.setValueAtTime(0.22*v,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.18);
      s.connect(f);f.connect(g);g.connect(sfxGain);s.start(t);s.stop(t+0.2);
      break;
    }
    case'swish':{
      const s=noise(),f=ctx.createBiquadFilter(),g=ctx.createGain();
      f.type='highpass';f.frequency.value=5000;
      g.gain.setValueAtTime(0.28*v,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.12);
      s.connect(f);f.connect(g);g.connect(sfxGain);s.start(t);s.stop(t+0.14);
      tone(t+0.04,1568,0.12,{type:'sine',vol:0.22,sfx:true});
      break;
    }
    case'bounce':{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sine';o.frequency.setValueAtTime(320,t);o.frequency.exponentialRampToValueAtTime(180,t+0.1);
      g.gain.setValueAtTime(0.24,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.12);
      o.connect(g);g.connect(sfxGain);o.start(t);o.stop(t+0.14);
      break;
    }
    case'crash':{
      const s=noise(),f=ctx.createBiquadFilter(),g=ctx.createGain();
      f.type='lowpass';f.frequency.setValueAtTime(3000,t);f.frequency.exponentialRampToValueAtTime(300,t+0.3);
      g.gain.setValueAtTime(0.3,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.32);
      s.connect(f);f.connect(g);g.connect(sfxGain);s.start(t);s.stop(t+0.35);
      break;
    }
    case'cheer':
      [0,4,7,12].forEach(function(s,i){tone(t+i*0.07,660*Math.pow(2,s/12),0.14,{type:'triangle',vol:0.2,sfx:true});});
      break;
    case'pop':tone(t,990,0.07,{type:'sine',vol:0.22,sfx:true});break;
    case'unlock':
      tone(t,660,0.1,{type:'sine',vol:0.22,sfx:true});
      tone(t+0.1,880,0.18,{type:'sine',vol:0.22,sfx:true});
      break;
    case'oops':
      tone(t,392,0.12,{type:'triangle',vol:0.2,sfx:true});
      tone(t+0.11,330,0.2,{type:'triangle',vol:0.2,sfx:true});
      break;
  }
}
function vib(ms){
  const s=RF.save.settings;
  if(s&&s.vibrate&&navigator.vibrate){try{navigator.vibrate(ms);}catch(e){}}
}
RF.audio={
  ensure:ensure,applyVol:applyVol,now:now,
  playSong:playSong,stopSong:stopSong,finish:finish,
  pos:pos,songDur:songDur,
  pause:pause,resume:resume,isPaused:isPaused,
  sfx:sfx,sfxAt:sfxAt,vib:vib
};
})();
