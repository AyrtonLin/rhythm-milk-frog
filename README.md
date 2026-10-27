# 节奏小奶蛙 🐸🎵

H5 休闲音乐节奏游戏。小奶蛙跟着音乐节拍运动、生活、演奏、上班、上学，最后走过一段人生的旅程。

**当前版本：v26.10.27c — 第一/二阶段已开放（20 关）**

## 运行方式

- **电脑**：直接双击 `index.html` 即可游玩（零依赖、无需构建、离线可用）
- **手机**：电脑上运行 `node dev-frog-server.js`，手机连同一 Wi-Fi 访问提示的地址
- 或用任意静态服务器托管本目录

## 技术栈

- 原生 Canvas 2D 渲染 + DOM UI（60fps，DPR 自适应，横竖屏自动重排）
- Web Audio API 程序化合成 BGM 与音效——每关独立谱面与配器，判定与音乐共用 `AudioContext` 硬件时钟，节拍零漂移
- 角色形象：预抠图 `frog-cut.png`（优先）→ 运行时抠底 → 程序化矢量小奶蛙（三级回退）
- localStorage 存档（进度/最高分/评级/设置）
- 触摸 + 鼠标统一输入，兼容微信内置浏览器

## 玩法

- 点击/长按与节拍对齐：PERFECT ±80ms / GOOD ±160ms / MISS
- 长按时长映射为力度（0~100%），力度条绿区 = 最佳力度
- 连击每 +10 得分加成 +5%（上限 +50%）；评级 S≥90% A≥80% B≥65% C≥50% 通关
- 第一关有 4 步新手引导（点击 → 长按 → 力度条 → 评分规则）；新机制关卡首次出现有轻提示

## 目录结构

```
index.html                 入口（DOM UI + Canvas）
assets/character/          角色形象（原图 + 预抠图）
css/main.css               UI 样式
js/core/                   util / view / input / audio / sfx / music
js/systems/                save / judge / chart / scoring / fx / hud
js/art/                    frog(角色) / props(道具) / themes(六阶段主题)
js/levels/                 mechanics(+2) 机制 / stage1~2 关卡 / registry / tutorial
js/game/play.js            关卡运行器
js/ui/screens.js           各界面
test/smoke.js              Node 冒烟测试（node test/smoke.js）
dev-frog-server.js         手机联调静态服务器
```

## 测试

```
node test/smoke.js
```
覆盖：脚本加载、音频解锁、新手引导 4 步、1-1 全自动通关（评级 S）、谱面确定性、暂停/恢复/竖屏旋转、1-3~1-9 与 2-1~2-10 逐关冒烟、1-10 阶段庆祝、解锁链与存档。

## 部署 GitHub Pages

1. 推送本目录到 GitHub 仓库
2. 仓库 Settings → Pages → Source 选 `main` 分支根目录
3. 访问 `https://<用户名>.github.io/<仓库名>/`

## 开发进度

- [x] 通用系统：音频合成、判定、计分、存档、UI、新手引导、暂停、设置
- [x] 第一阶段 · 运动季（10 关：投篮/羽毛球/乒乓/足球/排球/网球/毽子/飞镖/飞盘/赛车）
- [x] 第二阶段 · 生活家（10 关：拍苍蝇/修水管/晾衣服/洗碗/扫地/买菜/接菜/浇花/垃圾分类/取快递）
- [ ] 第三阶段 · 音乐厅
- [ ] 第四阶段 · 职场记
- [ ] 第五阶段 · 校园志
- [ ] 第六阶段 · 人生路
