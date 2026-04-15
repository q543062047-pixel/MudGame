# 剧情与地图简化整合方案

## 🎯 核心理念
**地图节点 = 剧情容器**
- 保持现有探索界面不变
- 地图节点可以"装载"剧情内容
- 像编辑器一样简单配置

---

## 🏗️ 简化架构

```
地图节点 (MapNode)
    ↓
  绑定剧情ID (storyId)
    ↓
  触发时加载剧情 (StoryData)
    ↓
  显示剧情界面 (StoryView)
```

---

## 📦 数据结构调整

### 1. 地图节点（保持现有结构，只添加剧情绑定）

```typescript
// src/types/index.ts
export interface MapNode {
  id: string
  name: string
  description: string
  type: NodeType
  connections: Partial<Record<Direction8, string>>
  mapX: number
  mapY: number
  
  // ✨ 新增：剧情绑定
  stories?: StoryBinding[]  // 可以绑定多个剧情
  
  // 保持原有字段
  npcs?: string[]
  shop?: boolean
  inn?: boolean
  icon?: string
  color?: string
}

// 剧情绑定配置
export interface StoryBinding {
  storyId: string           // 剧情ID
  trigger: TriggerType      // 触发方式
  condition?: Condition     // 触发条件
  priority?: number         // 优先级
  once?: boolean           // 是否只触发一次
}

type TriggerType = 
  | 'auto'        // 自动触发（进入节点时）
  | 'manual'      // 手动触发（玩家点击）
  | 'first_visit' // 首次访问
```

### 2. 剧情数据（独立文件）

```typescript
// 剧情数据结构
export interface StoryData {
  id: string
  name: string
  type: 'dialog' | 'event' | 'battle' | 'cutscene'
  
  // 剧情内容
  content: StoryContent
}

export interface StoryContent {
  // 对话型剧情
  dialog?: {
    text: string[]
    speaker?: string
    avatar?: string
    choices?: Choice[]
  }
  
  // 事件型剧情
  event?: {
    description: string[]
    effects: Effect[]
  }
  
  // 战斗型剧情
  battle?: {
    enemyId: string
    intro?: string[]
    onWin?: Effect[]
    onLose?: Effect[]
  }
  
  // 过场动画
  cutscene?: {
    scenes: CutsceneFrame[]
  }
}
```

---

## 📋 配置示例

### 示例1：地图节点绑定剧情

```json
// src/data/worldGraph.ts
{
  "id": "qingyun_gate",
  "name": "青云山门",
  "description": "青云派山门，石阶蜿蜒而上...",
  "type": "sect",
  "mapX": 5,
  "mapY": 5,
  "connections": {
    "north": "qingyun_hall",
    "south": "mountain_foot"
  },
  
  // ✨ 绑定剧情
  "stories": [
    {
      "storyId": "qingyun_gate_intro",
      "trigger": "first_visit",
      "priority": 1
    },
    {
      "storyId": "guard_dialog",
      "trigger": "manual",
      "condition": {
        "type": "flag",
        "flag": "talked_to_master"
      }
    }
  ],
  
  "icon": "观",
  "color": "#9070c0"
}
```

### 示例2：剧情数据文件

```json
// src/data/stories/qingyun_gate_intro.json
{
  "id": "qingyun_gate_intro",
  "name": "初到山门",
  "type": "dialog",
  
  "content": {
    "dialog": {
      "text": [
        "你来到青云山门前。",
        "守门弟子向你点头致意。",
        "「师兄，掌门正在大殿等你。」"
      ],
      "speaker": "守门弟子",
      "choices": [
        {
          "text": "【前往大殿】",
          "effects": [
            { "type": "setFlag", "flag": "intro_complete" }
          ]
        }
      ]
    }
  }
}
```

```json
// src/data/stories/forest_battle.json
{
  "id": "forest_battle",
  "name": "密林遇袭",
  "type": "battle",
  
  "content": {
    "battle": {
      "enemyId": "bandit",
      "intro": [
        "三名山贼从林中跳出！",
        "「此路是我开，此树是我栽...」"
      ],
      "onWin": [
        { "type": "addItem", "itemId": "silver", "amount": 50 },
        { "type": "changeReputation", "value": 10 },
        { "type": "setFlag", "flag": "defeated_bandits" }
      ],
      "onLose": [
        { "type": "changeHp", "value": -20 }
      ]
    }
  }
}
```

---

## 🔧 实现方式

### 1. 剧情加载器

```typescript
// src/engine/StoryLoader.ts
export class StoryLoader {
  private cache = new Map<string, StoryData>()
  
  // 加载剧情数据
  async load(storyId: string): Promise<StoryData> {
    if (this.cache.has(storyId)) {
      return this.cache.get(storyId)!
    }
    
    // 动态导入剧情文件
    const module = await import(`@/data/stories/${storyId}.json`)
    const story = module.default as StoryData
    this.cache.set(storyId, story)
    return story
  }
  
  // 预加载章节的所有剧情
  async preloadChapter(storyIds: string[]): Promise<void> {
    await Promise.all(storyIds.map(id => this.load(id)))
  }
}
```

### 2. 剧情触发器

```typescript
// src/composables/useStoryTrigger.ts
export function useStoryTrigger() {
  const worldStore = useWorldStore()
  const gameStore = useGameStore()
  const storyLoader = new StoryLoader()
  
  // 检查节点的剧情触发
  async function checkStoryTriggers(nodeId: string) {
    const node = worldStore.graph.nodes[nodeId]
    if (!node.stories) return
    
    for (const binding of node.stories) {
      if (shouldTrigger(binding)) {
        await triggerStory(binding.storyId)
        break  // 一次只触发一个
      }
    }
  }
  
  // 判断是否应该触发
  function shouldTrigger(binding: StoryBinding): boolean {
    // 检查触发类型
    if (binding.trigger === 'first_visit') {
      const key = `story_${binding.storyId}_triggered`
      if (gameStore.hasFlag(key)) return false
    }
    
    // 检查条件
    if (binding.condition) {
      return evaluateCondition(binding.condition)
    }
    
    return true
  }
  
  // 触发剧情
  async function triggerStory(storyId: string) {
    const story = await storyLoader.load(storyId)
    
    // 根据剧情类型执行不同逻辑
    switch (story.type) {
      case 'dialog':
        showDialog(story.content.dialog!)
        break
      case 'battle':
        startBattle(story.content.battle!)
        break
      case 'event':
        executeEvent(story.content.event!)
        break
      case 'cutscene':
        playCutscene(story.content.cutscene!)
        break
    }
    
    // 标记已触发
    gameStore.setFlag(`story_${storyId}_triggered`)
  }
  
  return {
    checkStoryTriggers,
    triggerStory
  }
}
```

### 3. 在现有系统中集成

```typescript
// src/stores/world.ts (修改 move 方法)
function move(direction: Direction8) {
  const currentNode = graph.value.nodes[graph.value.currentNodeId]
  const targetId = currentNode.connections[direction]
  
  if (!targetId) return
  
  // 移动到新节点
  graph.value.currentNodeId = targetId
  graph.value.visitedNodes.add(targetId)
  
  // ✨ 检查剧情触发
  const { checkStoryTriggers } = useStoryTrigger()
  checkStoryTriggers(targetId)
}
```

---

## 🎨 编辑器友好的配置方式

### 方式1：在地图节点中直接配置

```typescript
// worldGraph.ts
export const WORLD_NODES: Record<string, MapNode> = {
  qingyun_gate: {
    id: 'qingyun_gate',
    name: '青云山门',
    // ... 其他配置
    
    // 直接在这里配置剧情
    stories: [
      {
        storyId: 'qingyun_gate_intro',
        trigger: 'first_visit'
      }
    ]
  }
}
```

### 方式2：使用配置文件映射

```json
// src/data/story-bindings.json
{
  "qingyun_gate": [
    {
      "storyId": "qingyun_gate_intro",
      "trigger": "first_visit"
    },
    {
      "storyId": "guard_dialog",
      "trigger": "manual"
    }
  ],
  "forest_entrance": [
    {
      "storyId": "forest_battle",
      "trigger": "auto",
      "condition": {
        "type": "flag",
        "flag": "bandits_active",
        "value": true
      }
    }
  ]
}
```

### 方式3：可视化编辑器配置（未来）

```
┌─────────────────────────────────────────┐
│  地图编辑器                              │
├─────────────────────────────────────────┤
│  节点：青云山门                          │
│                                         │
│  绑定剧情：                              │
│  ┌─────────────────────────────────┐   │
│  │ [+] 添加剧情                     │   │
│  │                                 │   │
│  │ 1. qingyun_gate_intro           │   │
│  │    触发：首次访问                │   │
│  │    [编辑] [删除]                 │   │
│  │                                 │   │
│  │ 2. guard_dialog                 │   │
│  │    触发：手动                    │   │
│  │    条件：talked_to_master       │   │
│  │    [编辑] [删除]                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [保存] [取消]                          │
└─────────────────────────────────────────┘
```

---

## 📁 文件组织

```
src/
├── data/
│   ├── worldGraph.ts              # 地图节点（含剧情绑定）
│   │
│   ├── stories/                   # 剧情数据文件夹
│   │   ├── qingyun/              # 按区域分类
│   │   │   ├── qingyun_gate_intro.json
│   │   │   └── guard_dialog.json
│   │   ├── forest/
│   │   │   ├── forest_battle.json
│   │   │   └── rescue_scholar.json
│   │   └── city/
│   │       └── ...
│   │
│   └── story-bindings.json        # 可选：集中管理绑定关系
│
├── engine/
│   ├── StoryLoader.ts             # 剧情加载器
│   └── StoryExecutor.ts           # 剧情执行器
│
└── composables/
    └── useStoryTrigger.ts         # 剧情触发逻辑
```

---

## 🔄 工作流程

### 开发者工作流

1. **创建地图节点**（已有）
   ```typescript
   // worldGraph.ts
   qingyun_gate: { id: 'qingyun_gate', name: '青云山门', ... }
   ```

2. **创建剧情文件**
   ```json
   // stories/qingyun/qingyun_gate_intro.json
   { "id": "qingyun_gate_intro", "type": "dialog", ... }
   ```

3. **绑定剧情到节点**
   ```typescript
   // worldGraph.ts
   qingyun_gate: {
     ...,
     stories: [
       { storyId: 'qingyun_gate_intro', trigger: 'first_visit' }
     ]
   }
   ```

4. **完成！** 玩家进入节点时自动触发剧情

### 未来编辑器工作流

1. **在地图上选择节点**
2. **点击"添加剧情"按钮**
3. **选择或创建剧情文件**
4. **配置触发条件**
5. **保存** → 自动更新 JSON 文件

---

## ✨ 优势

### 1. **最小改动**
- 保持现有探索界面不变
- 只需在 MapNode 添加一个 `stories` 字段
- 现有代码几乎不需要修改

### 2. **清晰分离**
- 地图数据 = 位置信息 + 剧情绑定
- 剧情数据 = 独立的故事内容
- 两者通过 ID 关联

### 3. **灵活配置**
- 一个节点可以绑定多个剧情
- 支持不同触发方式
- 支持条件判断

### 4. **易于编辑**
- 剧情文件独立，易于查找和修改
- JSON 格式，可以用任何编辑器
- 未来可以做可视化编辑器

### 5. **性能优化**
- 按需加载剧情文件
- 支持预加载
- 缓存机制

---

## 🚀 实施步骤

### 阶段一：类型定义（30分钟）
1. ✅ 在 `types/index.ts` 添加 `StoryBinding` 和 `StoryData` 类型
2. ✅ 修改 `MapNode` 类型，添加 `stories?` 字段

### 阶段二：剧情加载器（1小时）
1. ✅ 创建 `engine/StoryLoader.ts`
2. ✅ 实现加载、缓存、预加载功能
3. ✅ 编写单元测试

### 阶段三：剧情触发器（1.5小时）
1. ✅ 创建 `composables/useStoryTrigger.ts`
2. ✅ 实现触发检查逻辑
3. ✅ 实现条件评估
4. ✅ 集成到 WorldStore 的 move 方法

### 阶段四：剧情执行器（2小时）
1. ✅ 创建 `engine/StoryExecutor.ts`
2. ✅ 实现不同类型剧情的执行逻辑
3. ✅ 集成到现有的 UI 组件

### 阶段五：数据迁移（2小时）
1. ✅ 将现有 `chapter1.json` 拆分为独立剧情文件
2. ✅ 在地图节点中添加剧情绑定
3. ✅ 测试所有剧情流程

### 阶段六：优化和文档（1小时）
1. ✅ 性能优化
2. ✅ 编写使用文档
3. ✅ 添加示例

**总计：约 8 小时**

---

## 📝 使用示例

### 示例1：简单对话

```json
// stories/simple_dialog.json
{
  "id": "simple_dialog",
  "type": "dialog",
  "content": {
    "dialog": {
      "text": ["你好，欢迎来到青云派！"],
      "speaker": "守门弟子"
    }
  }
}
```

### 示例2：带选择的对话

```json
{
  "id": "choice_dialog",
  "type": "dialog",
  "content": {
    "dialog": {
      "text": ["你要进城吗？"],
      "choices": [
        {
          "text": "【进城】",
          "effects": [
            { "type": "setFlag", "flag": "entered_city" }
          ]
        },
        {
          "text": "【再等等】"
        }
      ]
    }
  }
}
```

### 示例3：战斗剧情

```json
{
  "id": "bandit_fight",
  "type": "battle",
  "content": {
    "battle": {
      "enemyId": "bandit",
      "intro": ["山贼拦住了你的去路！"],
      "onWin": [
        { "type": "addItem", "itemId": "silver", "amount": 50 },
        { "type": "setFlag", "flag": "defeated_bandits" }
      ]
    }
  }
}
```

---

## 🎯 总结

这个方案的核心思想是：
1. **地图节点是容器**，可以"装载"剧情
2. **剧情是独立内容**，通过 ID 关联
3. **保持现有界面**，只在后台增强逻辑
4. **像编辑器一样**，配置简单直观

这样既保持了现有系统的稳定性，又为未来的可视化编辑器打下了基础。

你觉得这个简化方案如何？