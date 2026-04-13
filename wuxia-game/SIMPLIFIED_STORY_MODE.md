# 📖 精简剧情模式说明

## 🎯 改动目的

将复杂的线性剧情改为**快速引导 + 自由探索**模式，让玩家更快进入游戏核心玩法。

---

## ✨ 新的游戏流程

### 原版流程（复杂）
```
开始 → 师父对话 → 下山 → 林中事件 → 多个分支选择 
→ 城门对话 → 城内探索 → 多个剧情节点 → ...
（约15个强制剧情节点）
```

### 精简版流程（推荐）
```
开始 → 简短引导（2个节点） → 自由探索
（仅2个引导节点，之后完全自由）
```

---

## 📝 精简版剧情内容

### 1. 开场（start）
- **文本**：简短的背景介绍
- **选项**：【踏上旅途】
- **时长**：约10秒

### 2. 引导结束（tutorial_end）
- **文本**：告知玩家可以自由探索
- **效果**：设置 `tutorial_complete` 标记
- **自动跳转**：进入自由探索模式

### 3. 自由探索（free_explore）
- **文本**：操作提示
- **特点**：无选项，玩家直接在地图上移动
- **核心玩法开始**：
  - ✅ 地图探索
  - ✅ NPC对话
  - ✅ 随机事件
  - ✅ 成就解锁
  - ✅ 战斗系统

---

## 🗺️ 保留的地点剧情

虽然主线精简，但地点触发的剧情仍然保留：

| 地点 | 节点ID | 说明 |
|------|--------|------|
| 苍梧城门 | city_gate | 进城提示 |
| 苍梧城内 | city_inside | 城内介绍 |
| 百草堂 | herbal_shop | 获得丹药 |
| 废弃地牢 | forest_rescue | 战斗事件 |
| 林中茶舍 | city_explore | 打探消息 |

这些剧情**不会强制触发**，玩家可以：
- 选择是否前往这些地点
- 按自己的节奏探索
- 随时存档/读档

---

## 🎮 玩家体验改进

### 优点
1. ✅ **快速上手** - 10秒内进入游戏
2. ✅ **自由度高** - 不被剧情束缚
3. ✅ **重复可玩性** - 每次探索路线不同
4. ✅ **适合Demo** - 快速展示核心玩法

### 保留的内容
- ✅ 所有地图地点
- ✅ 所有NPC对话
- ✅ 战斗系统
- ✅ 随机事件
- ✅ 成就系统
- ✅ 存档系统

---

## 🔄 如何切换回复杂剧情

如果需要恢复原版复杂剧情：

### 方法一：修改引用
```typescript
// src/composables/useGameEngine.ts
// src/composables/useBattle.ts

// 改回：
import chapter1 from '@/data/scenarios/chapter1.json'
const allNodes = (chapter1 as { nodes: Record<string, ScenarioNode> }).nodes
```

### 方法二：保留两个版本
```typescript
// 在游戏设置中让玩家选择
const storyMode = ref<'simple' | 'full'>('simple')

const scenarioData = storyMode.value === 'simple' 
  ? chapter1Simple 
  : chapter1
```

---

## 📊 节点对比

| 项目 | 原版 | 精简版 |
|------|------|--------|
| 总节点数 | ~15个 | 10个 |
| 强制节点 | ~10个 | 2个 |
| 开场时长 | 2-3分钟 | 10秒 |
| 分支选择 | 多个 | 1个 |
| 自由探索 | 剧情后 | 立即开始 |

---

## 🎯 适用场景

### 精简版适合：
- ✅ Demo展示
- ✅ 快速测试
- ✅ 沙盒玩法
- ✅ 重复游玩

### 完整版适合：
- ✅ 正式发布
- ✅ 剧情向游戏
- ✅ 新手引导
- ✅ 世界观构建

---

## 🔧 自定义剧情

你可以轻松修改 `chapter1_simple.json` 来调整剧情：

### 添加新节点
```json
{
  "your_node": {
    "id": "your_node",
    "atmosphere": "normal",
    "text": ["你的剧情文本"],
    "choices": [
      {
        "text": "【选项】",
        "next": "free_explore"
      }
    ]
  }
}
```

### 修改开场文本
```json
{
  "start": {
    "text": [
      "你的自定义开场文本",
      "可以有多段"
    ]
  }
}
```

---

## 📁 相关文件

- `src/data/scenarios/chapter1_simple.json` - 精简版剧情（当前使用）
- `src/data/scenarios/chapter1.json` - 完整版剧情（保留）
- `src/composables/useGameEngine.ts` - 剧情引擎
- `src/composables/useBattle.ts` - 战斗系统
- `src/views/GameViewOptimized.vue` - 游戏主视图

---

## 💡 建议

对于 Demo 版本，建议：

1. **保持精简剧情** - 让玩家快速体验核心玩法
2. **丰富随机事件** - 增加探索的趣味性
3. **完善NPC对话** - 通过对话展开世界观
4. **添加更多成就** - 引导玩家探索不同内容

---

**当前使用：精简版剧情** ✅  
**切换方式：修改 import 语句即可**