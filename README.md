# 节奏小奶蛙 · Rhythm Milk Frog

H5 休闲音乐节奏游戏：6 阶段 × 10 关 = 60 关，跟着节拍和小奶蛙一起玩。
纯前端零依赖：HTML5 + Canvas 2D + Web Audio 程序化音乐，无任何外部资源文件。

## 本地运行（三选一）

1. **直接双击** `index.html`（无需服务器，Chrome / Edge / Safari 均可）
2. **电脑浏览器**：本目录起任意静态服务器，如 `npx serve` 或仓库外 `node dev-frog-server.js`
3. **手机 / 微信真机**：电脑运行 `node dev-frog-server.js 8123`，手机连同一 Wi-Fi 后访问控制台打印的局域网地址（如 `http://192.168.x.x:8123`）

## 玩法

- **点击**：来球 / 节拍点到达判定环时点击屏幕（桌面可用空格）
- **长按**：按住蓄力，力度条 0~100%，指针停在目标区间内再松手（力度 = 投篮距离 / 射门角度 / 毽子高度 / 飞镖靶距）
- **判定**：PERFECT ±80ms / GOOD ±160ms / MISS；长按关同时判定力度区间，取较差档
- **评分**：P=300 / G=150，连击每 +10 加成 +5%（上限 +50%）；得分率 S≥90% / A≥80% / B≥65% / C≥50%（通关线）
- 进度与最佳成绩自动保存在浏览器 localStorage

## 目录结构

```
index.html            入口（DOM 界面层 + 画布）
css/main.css          界面样式（移动端 / 安全区 / 微信适配）
js/core/              util view input audio sfx music（音频时钟 = 游戏时钟）
js/systems/           save judge chart scoring fx hud
js/art/               frog（程序化骨骼动画） props themes（六阶段背景）
js/levels/            mechanics（机制原型） stage1~6 registry tutorial
js/game/play.js       关卡运行器
js/ui/screens.js      标题 / 选关 / 结算 / 庆祝 / 设置 / 暂停
```

## 部署 GitHub Pages

仓库根即本目录；推送后在 Settings → Pages 选择分支根目录即可，无需构建步骤。
