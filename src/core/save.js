/* 节奏小奶蛙 - localStorage 存档 */
(function(){
'use strict';
const RF=window.RF;
const KEY='rhythm-frog-v1';
function fresh(){return {v:1,unlocked:1,best:{},settings:{music:0.75,sfx:0.9,offset:0,vibrate:true}};}
let data=fresh();
try{
  const s=localStorage.getItem(KEY);
  if(s){
    const p=JSON.parse(s);
    if(p&&p.v===1){const f=fresh();data=Object.assign(f,p);data.settings=Object.assign(f.settings,p.settings||{});}
  }
}catch(e){}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(data));}catch(e){}}
RF.save={
  get all(){return data;},
  get settings(){return data.settings;},
  best(id){return data.best[id]||null;},
  setBest(id,res){
    const b=data.best[id];
    if(!b||res.score>b.score){
      data.best[id]={score:res.score,rank:res.rank,acc:res.acc,perfect:res.perfect,good:res.good,miss:res.miss};
      persist();
    }
  },
  unlock(n){if(n>data.unlocked){data.unlocked=n;persist();}},
  reset(){data=fresh();persist();}
};
})();
