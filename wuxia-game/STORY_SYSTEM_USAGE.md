# 剧情系统使用指南

## 📚 概述

新的剧情系统已经实现，采用**地图节点 = 剧情容器**的设计理念。

### 核心组件

1. **类型定义** (`src/types/index.ts`)
   - `StoryBinding` - 剧情绑定配置
   - `StoryData` - 剧情数据结构
   - `StoryContent` - 剧情内容（对话、事件、战斗、过场）

2. **剧情加载器** (`src/engine/StoryLoader.ts`)
   - 动态加载剧情文件
   - 缓存管理
   - 数据验证

3. **剧情触发器** (`src/composables/useStoryTrigger.ts`)
   - 检查触发条件
   - 管理触发状态
   - 提供手动触发接口

4. **剧情执行器** (`src/engine/StoryExecutor.ts`)
   - 执行不同类型的剧情
   - 应用游戏效果
   - 处理战斗结果

---

## 🎯 快速开始

### 1. 创建剧情文件

在 `src/data/stories/` 目录下创建 JSON 文件：

```json
// src/data/stories/my_story.json
{
  "id": "my_story",
  "name": "我的剧情",
  "type": "dialog",
  "content": {
    "dialog": {
      "text": [
        "这是第一句话。",
        "这是第二句话。"
      ],
      "speaker": "NPC名字",
      "effects": [
        {
          "type": "setFlag",
          "flag": "my_story_completed"
        }
      ]
    }
  }
}
```

### 2. 绑定到地图节点

在 `src/data/worldGraph.ts` 中添加剧情绑定：

```typescript
my_node: {
  id: 'my_node',
  name: '我的地点',
  // ... 其他配置
  
  // 添加剧情绑定
  stories: [
    {
      storyId: 'my_story',      // 剧情文件名（不含.json）
      trigger: 'first_visit',   // 触发方式
      priority: 1               // 优先级
    }
  ]
}
```

### 3. 完成！

玩家进入该节点时，剧情会自动触发。

---

## 📖 剧情类型

### 1. 对话型剧情 (dialog)

```json
{
  "id": "dialog_example",
  "type": "dialog",
  "content": {
    "dialog": {
      "text": ["对话内容"],
      "speaker": "说话者",
      "avatar": "头像路径（可选）",
      "choices": [
        {
          "text": "【选项1】",
          "effects": [
            { "type": "setFlag", "flag": "choice1_selected" }
          ]
        }
      ],
      "effects": [
        { "type": "changeGold", "value": 10 }
      ]
    }
  }
}
```

### 2. 事件型剧情 (event)

```json
{
  "id": "event_example",
  "type": "event",
  "content": {
    "event": {
      "description": ["事件描述"],
      "effects": [
        { "type": "addItem", "target": "healing_pill", "value": 1 }
      ]
    }
  }
}
```

### 3. 战斗型剧情 (battle)

```json
{
  "id": "battle_example",
  "type": "battle",
  "content": {
    "battle": {
      "enemyId": "bandit",
      "canFlee": true,
      "intro": ["战斗前的文本"],
      "onWin": [
        { "type": "changeGold", "value": 50 }
      ],
      "onLose": [
        { "type": "changeHp", "value": -10 }
      ]
    }
  }
}
```

---

## 🎮 触发方式

### auto - 自动触发
每次进入节点都触发（除非设置 `once: true`）

```typescript
{
  storyId: 'my_story',
  trigger: 'auto'
}
```

### first_visit - 首次访问
只在第一次访问节点时触发

```typescript
{
  storyId: 'my_story',
  trigger: 'first_visit'
}
```

### conditional - 条件触发
满足条件时触发

```typescript
{
  storyId: 'my_story',
  trigger: 'conditional',
  condition: {
    type: 'item',
    target: 'special_key'
  }
}
```

### manual - 手动触发
需要玩家主动点击交互（未来实现）

```typescript
{
  storyId: 'my_story',
  trigger: 'manual'
}
```

---

## 🔧 效果类型

### 物品相关
```json
{ "type": "addItem", "target": "healing_pill", "value": 2 }
{ "type": "removeItem", "target": "old_key", "value": 1 }
```

### 属性相关
```json
{ "type": "changeHp", "value": 50 }
{ "type": "changeMp", "value": -20 }
{ "type": "changeGold", "value": 100 }
{ "type": "changeReputation", "value": 10 }
```

### 技能相关
```json
{ "type": "learnSkill", "target": "fireball" }
```

### 标志位
```json
{ "type": "setFlag", "flag": "quest_completed" }
```

---

## 📝 示例：完整剧情流程

### 1. 创建剧情文件

```json
// src/data/stories/merchant_encounter.json
{
  "id": "merchant_encounter",
  "name": "遇见商人",
  "type": "dialog",
  "content": {
    "dialog": {
      "text": [
        "一位商人拦住了你的去路。",
        "「年轻人，要不要看看我的货物？」"
      ],
      "speaker": "神秘商人",
      "choices": [
        {
          "text": "【购买物品】（需要50金币）",
          "condition": {
            "type": "gold",
            "value": 50,
            "operator": ">="
          },
          "effects": [
            { "type": "changeGold", "value": -50 },
            { "type": "addItem", "target": "rare_sword", "value": 1 },
            { "type": "setFlag", "flag": "bought_from_merchant" }
          ]
        },
        {
          "text": "【离开】"
        }
      ]
    }
  }
}
```

### 2. 绑定到节点

```typescript
// src/data/worldGraph.ts
official_road: {
  id: 'official_road',
  name: '官道',
  // ... 其他配置
  
  stories: [
    {
      storyId: 'merchant_encounter',
      trigger: 'first_visit',
      priority: 1
    }
  ]
}
```

### 3. 测试

1. 启动游戏
2. 移动到"官道"节点
3. 剧情自动触发
4. 选择选项
5. 效果自动应用

---

## 🎨 最佳实践

### 1. 文件命名
- 使用小写字母和下划线
- 描述性命名：`forest_bandit_battle.json`
- 按区域分类：`qingyun/gate_intro.json`

### 2. 剧情ID
- 与文件名一致
- 唯一且描述性
- 例如：`qingyun_gate_intro`

### 3. 优先级
- 数字越大优先级越高
- 重要剧情：10+
- 普通剧情：1-5
- 背景剧情：0

### 4. 条件设置
- 使用标志位追踪进度
- 合理设置物品/金币要求
- 避免过于复杂的条件链

### 5. 效果应用
- 先检查条件，再应用效果
- 重要效果设置标志位
- 金币/物品变化要合理

---

## 🐛 调试技巧

### 1. 查看控制台日志
```
[StoryTrigger] 触发剧情: 初到山门 (qingyun_gate_intro)
[StoryExecutor] 执行剧情: 初到山门 (dialog)
[Effect] 设置标志: qingyun_gate_visited
```

### 2. 检查剧情是否加载
```typescript
import { storyLoader } from '@/engine/StoryLoader'

// 检查缓存
console.log(storyLoader.getCachedStoryIds())

// 手动加载测试
const story = await storyLoader.load('my_story')
console.log(story)
```

### 3. 检查触发条件
```typescript
import { useStoryTrigger } from '@/composables/useStoryTrigger'

const { evaluateCondition } = useStoryTrigger()

// 测试条件
const result = evaluateCondition({
  type: 'gold',
  value: 50,
  operator: '>='
})
console.log('条件满足:', result)
```

---

## 🚀 下一步

### 当前状态
✅ 核心系统已实现
✅ 示例剧情已创建
✅ 地图节点已绑定
⏳ UI 集成（需要在 NodeView 组件中调用）
⏳ 完整数据迁移（将 chapter1.json 拆分）

### 待实现功能
- [ ] 在 NodeView 组件中集成剧情触发
- [ ] 创建剧情显示 UI 组件
- [ ] 手动触发剧情的交互界面
- [ ] 过场动画系统
- [ ] 更多剧情类型

### 数据迁移
将现有的 `chapter1.json` 中的剧情节点拆分为独立的剧情文件，并绑定到对应的地图节点。

---

## 📞 需要帮助？

如果遇到问题，请检查：
1. 剧情文件是否在正确的目录
2. JSON 格式是否正确
3. 剧情ID 是否与文件名一致
4. 地图节点是否正确绑定
5. 控制台是否有错误信息

祝你创作愉快！🎉