/* 节奏小奶蛙 - 道具矢量绘制（手持道具 + 关卡物件），原点=握持点 */
(function () {
  const P = RF.props = {};
  const U = RF.util;
  P.draw = function (ctx, name, s, ang) {
    const fn = P[name];
    if (!fn) return;
    ctx.save();
    ctx.rotate(ang || 0);
    fn(ctx, s);
    ctx.restore();
  };

  P.basketball = (ctx, s) => {
    ctx.fillStyle = '#F57C00'; U.circle(ctx, 0, 0, 15 * s); ctx.fill();
    ctx.strokeStyle = '#7a3c00'; ctx.lineWidth = 1.6 * s;
    U.circle(ctx, 0, 0, 15 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-15 * s, 0); ctx.lineTo(15 * s, 0);
    ctx.moveTo(0, -15 * s); ctx.lineTo(0, 15 * s); ctx.stroke();
    ctx.beginPath(); ctx.arc(-20 * s, 0, 14 * s, -0.6, 0.6); ctx.stroke();
    ctx.beginPath(); ctx.arc(20 * s, 0, 14 * s, Math.PI - 0.6, Math.PI + 0.6); ctx.stroke();
  };
  P.football = (ctx, s) => {
    ctx.fillStyle = '#fff'; U.circle(ctx, 0, 0, 15 * s); ctx.fill();
    ctx.strokeStyle = '#37474F'; ctx.lineWidth = 1.4 * s; U.circle(ctx, 0, 0, 15 * s); ctx.stroke();
    ctx.fillStyle = '#37474F';
    U.circle(ctx, 0, 0, 5 * s); ctx.fill();
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * U.TAU - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 5 * s, Math.sin(a) * 5 * s);
      ctx.lineTo(Math.cos(a) * 13 * s, Math.sin(a) * 13 * s);
      ctx.stroke();
    }
  };
  P.volleyball = (ctx, s) => {
    ctx.fillStyle = '#FFF9C4'; U.circle(ctx, 0, 0, 14 * s); ctx.fill();
    ctx.strokeStyle = '#F9A825'; ctx.lineWidth = 2 * s; U.circle(ctx, 0, 0, 14 * s); ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -14 * s, 16 * s, 0.5, Math.PI - 0.5); ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 14 * s, 16 * s, Math.PI + 0.5, U.TAU - 0.5); ctx.stroke();
  };
  P.tennisball = (ctx, s) => {
    ctx.fillStyle = '#D4E157'; U.circle(ctx, 0, 0, 11 * s); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.8 * s;
    ctx.beginPath(); ctx.arc(-11 * s, 0, 10 * s, -0.9, 0.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(11 * s, 0, 10 * s, Math.PI - 0.9, Math.PI + 0.9); ctx.stroke();
  };
  P.shuttle = (ctx, s) => {   // 羽毛球
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(0, 6 * s); ctx.lineTo(-8 * s, -14 * s); ctx.lineTo(8 * s, -14 * s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#B0BEC5'; ctx.lineWidth = 1.2 * s; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-4 * s, -4 * s); ctx.lineTo(4 * s, -4 * s); ctx.stroke();
    ctx.fillStyle = '#EF5350'; U.circle(ctx, 0, 8 * s, 5.5 * s); ctx.fill();
  };
  P.jianzi = (ctx, s) => {    // 毽子
    ctx.fillStyle = '#F06292';
    for (let i = -2; i <= 2; i++) {
      ctx.save(); ctx.rotate(i * 0.35);
      U.ell(ctx, 0, -10 * s, 3 * s, 10 * s); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#8D6E63'; U.circle(ctx, 0, 3 * s, 5 * s); ctx.fill();
    ctx.fillStyle = '#FFD34D'; U.circle(ctx, 0, 3 * s, 3 * s); ctx.fill();
  };
  P.dart = (ctx, s) => {      // 飞镖（尖朝上=前进方向）
    ctx.fillStyle = '#90A4AE';
    ctx.beginPath(); ctx.moveTo(0, -16 * s); ctx.lineTo(-3 * s, -6 * s); ctx.lineTo(3 * s, -6 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#EF5350'; U.roundRect(ctx, -2.5 * s, -6 * s, 5 * s, 14 * s, 2 * s); ctx.fill();
    ctx.fillStyle = '#42A5F5';
    ctx.beginPath(); ctx.moveTo(-2.5 * s, 8 * s); ctx.lineTo(-8 * s, 16 * s); ctx.lineTo(-2.5 * s, 13 * s); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(2.5 * s, 8 * s); ctx.lineTo(8 * s, 16 * s); ctx.lineTo(2.5 * s, 13 * s); ctx.closePath(); ctx.fill();
  };
  P.frisbee = (ctx, s) => {
    ctx.fillStyle = '#4FC3F7'; U.ell(ctx, 0, 0, 16 * s, 7 * s); ctx.fill();
    ctx.fillStyle = '#81D4FA'; U.ell(ctx, 0, -2 * s, 11 * s, 4.5 * s); ctx.fill();
    ctx.strokeStyle = '#0288D1'; ctx.lineWidth = 1.2 * s; U.ell(ctx, 0, 0, 16 * s, 7 * s); ctx.stroke();
  };
  /* 球拍类：握持点在手柄末端 */
  P.badminton = (ctx, s) => {
    ctx.strokeStyle = '#5C6BC0'; ctx.lineWidth = 3.4 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -18 * s); ctx.stroke();
    ctx.lineWidth = 2.6 * s;
    U.ell(ctx, 0, -32 * s, 10 * s, 14 * s); ctx.stroke();
    ctx.lineWidth = 0.8 * s; ctx.strokeStyle = 'rgba(92,107,192,0.7)';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(i * 4 * s, -44 * s); ctx.lineTo(i * 4 * s, -20 * s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-9 * s, (-32 + i * 5) * s); ctx.lineTo(9 * s, (-32 + i * 5) * s); ctx.stroke();
    }
  };
  P.ttball = (ctx, s) => {    // 乒乓球
    ctx.fillStyle = '#FF9800'; U.circle(ctx, 0, 0, 8 * s); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; U.circle(ctx, -2.5 * s, -2.5 * s, 2.6 * s); ctx.fill();
  };
  P.ttpaddle = (ctx, s) => {   // 乒乓球拍
    ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 4 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -10 * s); ctx.stroke();
    ctx.fillStyle = '#E53935'; U.ell(ctx, 0, -22 * s, 12 * s, 13 * s); ctx.fill();
    ctx.strokeStyle = '#B71C1C'; ctx.lineWidth = 1.4 * s; U.ell(ctx, 0, -22 * s, 12 * s, 13 * s); ctx.stroke();
  };
  P.tennis = (ctx, s) => {
    ctx.strokeStyle = '#26A69A'; ctx.lineWidth = 3.6 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -16 * s); ctx.stroke();
    ctx.lineWidth = 2.8 * s;
    U.ell(ctx, 0, -30 * s, 11 * s, 14 * s); ctx.stroke();
    ctx.lineWidth = 0.8 * s; ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(i * 4 * s, -42 * s); ctx.lineTo(i * 4 * s, -18 * s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-10 * s, (-30 + i * 5) * s); ctx.lineTo(10 * s, (-30 + i * 5) * s); ctx.stroke();
    }
  };
  P.toygun = (ctx, s) => {    // 玩具枪（打飞盘）
    ctx.fillStyle = '#FF7043'; U.roundRect(ctx, -4 * s, -20 * s, 9 * s, 22 * s, 3 * s); ctx.fill();
    ctx.fillStyle = '#FFAB91'; U.roundRect(ctx, -4 * s, -24 * s, 20 * s, 7 * s, 3 * s); ctx.fill();
    ctx.fillStyle = '#42A5F5'; U.circle(ctx, 14 * s, -20 * s, 3.4 * s); ctx.fill();
  };
  P.wheel = (ctx, s) => {     // 方向盘
    ctx.strokeStyle = '#37474F'; ctx.lineWidth = 4 * s;
    U.circle(ctx, 0, -14 * s, 14 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14 * s, -14 * s); ctx.lineTo(14 * s, -14 * s);
    ctx.moveTo(0, -14 * s); ctx.lineTo(0, 0); ctx.stroke();
    ctx.fillStyle = '#EF5350'; U.circle(ctx, 0, -14 * s, 4 * s); ctx.fill();
  };
  P.broom = (ctx, s) => {
    ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 3.4 * s;
    ctx.beginPath(); ctx.moveTo(0, 4 * s); ctx.lineTo(0, -30 * s); ctx.stroke();
    ctx.fillStyle = '#FFB300'; U.roundRect(ctx, -8 * s, 2 * s, 16 * s, 10 * s, 3 * s); ctx.fill();
  };
  /* 场景物件 */
  P.hoop = (ctx, s) => {      // 篮框（原点=框中心）
    ctx.strokeStyle = '#ECEFF1'; ctx.lineWidth = 5 * s;
    ctx.beginPath(); ctx.moveTo(26 * s, -34 * s); ctx.lineTo(26 * s, 26 * s); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    U.roundRect(ctx, 14 * s, -40 * s, 24 * s, 34 * s, 3 * s); ctx.fill();
    ctx.strokeStyle = '#EF5350'; ctx.lineWidth = 2 * s;
    U.roundRect(ctx, 18 * s, -26 * s, 15 * s, 12 * s, 2 * s); ctx.stroke();
    ctx.strokeStyle = '#FF7043'; ctx.lineWidth = 4 * s;
    ctx.beginPath(); ctx.moveTo(-20 * s, 0); ctx.lineTo(20 * s, 0); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.6 * s;
    ctx.beginPath();
    ctx.moveTo(-18 * s, 0); ctx.lineTo(-10 * s, 20 * s); ctx.lineTo(10 * s, 20 * s); ctx.lineTo(18 * s, 0);
    ctx.moveTo(-9 * s, 0); ctx.lineTo(-6 * s, 20 * s);
    ctx.moveTo(9 * s, 0); ctx.lineTo(6 * s, 20 * s);
    ctx.stroke();
  };
  P.flag = (ctx, s, color) => {
    ctx.fillStyle = color || '#EF5350';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(14 * s, 5 * s); ctx.lineTo(0, 10 * s); ctx.closePath(); ctx.fill();
  };
})();
