# 江湖志·问剑录

一款武侠纯文字游戏 Demo，基于 Vue 3 + TypeScript + Pinia + Vite 构建。

---

## 快速启动

```bash
# 1. 解压后进入目录
cd wuxia-game

# 2. 安装依赖（需要 Node.js >= 18）
npm install

# 3. 启动开发服务器
npm run dev
```

浏览器打开 http://localhost:5173 即可游玩。

---

## 构建生产版本

```bash
npm run build
npm run preview
```

---

## 项目结构

```
src/
├── components/
│   └── game/
│       ├── TextOutput.vue      # 逐字打字主文字区
│       ├── ChoiceMenu.vue      # 选项菜单
│       ├── CharacterPanel.vue  # 左侧角色属性面板
│       └── BattleView.vue      # 战斗界面
├── views/
│   ├── HomeView.vue            # 主菜单（标题画面）
│   └── GameView.vue            # 主游戏界面
├── stores/
│   ├── player.ts               # 角色状态（Pinia）
│   └── game.ts                 # 游戏状态（Pinia）
├── composables/
│   ├── useGameEngine.ts        # 剧情引擎（节点推进）
│   ├── useBattle.ts            # 战斗逻辑
│   ├── useTypewriter.ts        # 打字机效果
│   └── useSave.ts              # LocalStorage 存读档
├── data/
│   ├── scenarios/chapter1.json # 第一章剧情节点树
│   ├── items.json              # 物品数据库
│   ├── enemies.json            # 敌人数据库
│   └── skills.json             # 功法数据库
├── types/index.ts              # TypeScript 类型定义
├── router/index.ts
└── styles/theme.css            # 古风 CSS 变量主题
```

---

## Demo 内容

**第一章「问剑」**共包含约 **15 个剧情节点**，涵盖：

- 🎯 多分支选择（影响剧情走向）
- ⚔️ 2 场战斗（可胜可败，各有结局）
- 🎒 物品获取系统（玉佩、残卷、丹药）
- 📜 存档/读档（LocalStorage）
- 💬 逐字打字机效果
- 🎨 古风宣纸主题 UI

---

## 技术栈

| 模块 | 技术 |
|------|------|
| 框架 | Vue 3 + Composition API |
| 语言 | TypeScript |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| 构建工具 | Vite 5 |
| UI | 纯 CSS 古风自定义主题 |
| 字体 | Noto Serif SC + Ma Shan Zheng |
| 存储 | localStorage |

---

## 扩展方向

- 增加更多章节剧情（复制 `chapter1.json` 结构扩展）
- 接入 IndexedDB 替代 localStorage（见 `useSave.ts`）
- 添加背景音乐（`useAudio.ts` 骨架已预留）
- 引入 Element Plus / Naive UI 古风主题定制
- 增加技能学习、门派系统、随机事件

---

*「仗剑走江湖，此去问苍茫。」*
