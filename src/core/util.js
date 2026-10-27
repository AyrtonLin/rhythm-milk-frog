/* 节奏小奶蛙 - 工具与随机数 */
(function(){
'use strict';
window.RF=window.RF||{};
const U=RF.util={};
U.clamp=function(v,a,b){return v<a?a:(v>b?b:v);};
U.lerp=function(a,b,t){return a+(b-a)*t;};
U.easeOut=function(t){return 1-Math.pow(1-U.clamp(t,0,1),3);};
U.easeIn=function(t){t=U.clamp(t,0,1);return t*t*t;};
U.easeIO=function(t){t=U.clamp(t,0,1);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;};
U.elastic=function(t){t=U.clamp(t,0,1);return t===0?0:t===1?1:Math.pow(2,-10*t)*Math.sin((t*10-0.75)*(2*Math.PI/3))+1;};
U.dist=function(x1,y1,x2,y2){return Math.hypot(x2-x1,y2-y1);};
U.fmt=function(n){return ''+Math.round(n);};
/* mulberry32 种子随机：保证每关谱面可复现 */
U.rand=function(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+U.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
U.imul=Math.imul;
U.rr=function(rnd,a,b){return a+rnd()*(b-a);};
U.ri=function(rnd,a,b){return Math.floor(a+rnd()*(b-a+1));};
U.pick=function(rnd,arr){return arr[Math.floor(rnd()*arr.length)];};
U.now=function(){return (window.performance&&performance.now)?performance.now()/1000:Date.now()/1000;};
})();
