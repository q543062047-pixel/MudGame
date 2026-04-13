# 🚀 优化功能快速开始指南

## 立即体验新功能

### 方式一：使用优化版 GameView（推荐）

1. **更新路由配置**
```typescript
// src/router/index.ts
import GameViewOptimized from '@/views/GameViewOptimized.vue'

const routes = [
  // ... 其他路由
  {
    path: '/game',
    name: 'game',
    component: GameViewOptimized  // 替换为优化版本
  }
]
```

2. **启动游戏**
```bash
npm run dev
```

3. **新功能自动启用**
   - ✅ 随机事件（地图移动时10%概率触发）
   - ✅ 成就系统（自动检测并解锁）
   - ✅ 多存档槽（快速存档使用槽位1）
   - ✅ 优化的战斗系统

---

### 方式二：在现有 GameView 中集成

如果你想保留原有的 GameView.vue，可以逐步集成新功能：

#### 1. 添加随机事件

```vue
<script setup lang="ts">
import { useRandomEvents } from '@/composables/useRandomEvents'

const { triggerRandomEvent, applyEventEffects, currentEvent, clearEvent } = useRandomEvents()

// 在 onEnterCell 函数中添加
function onEnterCell(cell: MapCell) {
  // ... 原有代码
  
  // 添加随机事件触发（10%概率）
  if (Math.random() < 0.1) {
    const event = triggerRandomEvent()
    if (event && event.effects) {
      applyEventEffects(event.effects)
    }
  }
}
</script>

<template>
  <!-- 添加随机事件弹窗 -->
  <Transition name="event">
    <div v-if="currentEvent" class="event-modal" @click.self="clearEvent">
      <div class="event-box">
        <div class="event-title">{{ currentEvent.name }}</div>
        <div class="event-desc">{{ currentEvent.description }}</div>
        <div v-if="currentEvent.choices" class="event-choices">
          <button
            v-for="(ch, i) in currentEvent.choices" :key="i"
            class="event-btn"
            @click="handleEventChoice(ch)"
          >
            {{ ch.text }}
          </button>
        </div>
        <button v-else class="event-btn" @click="clearEvent">确定</button>
      </div>
    </div>
  </Transition>
</template>
```

#### 2. 添加成就系统

```vue
<script setup lang="ts">
import { useAchievements } from '@/composables/useAchievements'

const { checkAchievements, newUnlocks, clearNewUnlocks } = useAchievements()

// 在关键节点检查成就
function onEnterCell(cell: MapCell) {
  // ... 原有代码
  
  // 检查成就
  const unlocked = checkAchievements()
  if (unlocked.length > 0) {
    setTimeout(() => clearNewUnlocks(), 3000)
  }
}
</script>

<template>
  <!-- 添加成就提示 -->
  <TransitionGroup name="ach" tag="div" class="ach-list">
    <div v-for="ach in newUnlocks" :key="ach.id" class="ach-toast">
      <span class="ach-icon">{{ ach.icon }}</span>
      <div class="ach-info">
        <div class="ach-name">成就解锁：{{ ach.name }}</div>
        <div class="ach-desc">{{ ach.description }}</div>
      </div>
    </div>
  </TransitionGroup>
</template>
```

#### 3. 升级存档系统

```vue
<script setup lang="ts">
import { useSaveSlots } from '@/composables/useSaveSlots'

const { saveToSlot, loadFromSlot, slots } = useSaveSlots()

function doSave() {
  saveToSlot(1, '快速存档')  // 使用槽位1
  saveToast.value = true
  setTimeout(() => { saveToast.value = false }, 2000)
}
</script>
```

---

## 🎮 新功能使用示例

### 1. 随机事件配置

在 `useRandomEvents.ts` 中添加自定义事件：

```typescript
const RANDOM_EVENTS: RandomEvent[] = [
  // ... 现有事件
  {
    id: 'your_custom_event',
    name: '你的事件名称',
    description: '事件描述文字',
    probability: 0.15,  // 15%触发概率
    effects: [
      { type: 'changeGold', value: 50 }
    ]
  }
]
```

### 2. 成就配置

在 `useAchievements.ts` 中添加新成就：

```typescript
const ACHIEVEMENTS: Achievement[] = [
  // ... 现有成就
  {
    id: 'your_achievement',
    name: '成就名称',
    description: '成就描述',
    icon: '🏆',
    condition: { 
      type: 'flag', 
      target: 'your_flag_name' 
    },
    unlocked: false
  }
]
```

### 3. 装备物品

```typescript
// 在角色面板或背包中
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()

// 装备武器
const weapon = { 
  id: 'iron_sword', 
  name: '铁剑',
  type: 'weapon',
  effect: { attack: 10 }
}
playerStore.equipItem(weapon)

// 卸下装备
playerStore.unequipItem('weapon')
```

---

## 🎨 UI 组件使用

### 使用新的独立组件

```vue
<template>
  <!-- 过场系统 -->
  <CutsceneOverlay
    :visible="cutsceneOn"
    :atmosphere="csAtm"
    :history="csHistory"
    :displayed-text="csDisplayed"
    :is-typing="csTyping"
    :paragraph-queue="csParagraphQueue"
    :choices="csChoices"
    :check-condition="checkCondition"
    @click="csClick"
    @select-choice="handleCsChoice"
  />

  <!-- NPC对话 -->
  <NpcDialog
    :npc="activeNpc"
    :dialogue-index="dialogueIdx"
    @close="closeNpc"
    @next="nextDialogue"
    @trigger-scenario="triggerNpcScenario"
  />

  <!-- 探索面板 -->
  <ExplorePanel
    :npcs="cellNpcs"
    :active-npc="activeNpc"
    :dialogue-index="dialogueIdx"
    :lines="exploreLines"
    :atmosphere="exploreAtm"
    @talk-to="talkTo"
    @close-npc="closeNpc"
    @next-dialogue="nextDialogue"
    @trigger-scenario="triggerNpcScenario"
  />
</template>

<script setup lang="ts">
import CutsceneOverlay from '@/components/game/CutsceneOverlay.vue'
import NpcDialog from '@/components/game/NpcDialog.vue'
import ExplorePanel from '@/components/game/ExplorePanel.vue'
</script>
```

---

## 🔧 配置地图触发

在 `worldMap.ts` 的 `CELL_META` 中配置：

```typescript
const CELL_META: Record<string, CellMeta> = {
  '2,5': { 
    name: '神秘洞穴',
    scenarioId: 'cave_entrance',  // 触发的剧情节点ID
    triggerOnce: true,             // 只触发一次
    hasNpc: true                   // 有NPC
  }
}
```

---

## 📊 数据持久化

### 成就数据
- 存储位置：`localStorage['wuxia_achievements']`
- 格式：`string[]` (已解锁成就ID列表)

### 存档数据
- 存储位置：`localStorage['wuxia_save_slot_1']` (槽位1-3)
- 格式：`SaveData` 对象

### 清除数据
```javascript
// 清除所有成就
localStorage.removeItem('wuxia_achievements')

// 清除所有存档
for (let i = 1; i <= 3; i++) {
  localStorage.removeItem(`wuxia_save_slot_${i}`)
}
```

---

## 🐛 调试技巧

### 1. 强制触发随机事件
```typescript
// 在浏览器控制台
const { triggerRandomEvent } = useRandomEvents()
const event = triggerRandomEvent()
console.log('触发事件:', event)
```

### 2. 解锁所有成就
```typescript
// 在浏览器控制台
const achievements = JSON.parse(localStorage.getItem('wuxia_achievements') || '[]')
// 添加所有成就ID
const allIds = ['first_battle', 'rescue_scholar', 'enter_city', 'collect_jade', 'reputation_50', 'chapter1_complete']
localStorage.setItem('wuxia_achievements', JSON.stringify(allIds))
```

### 3. 查看当前存档
```typescript
// 在浏览器控制台
const save = JSON.parse(localStorage.getItem('wuxia_save_slot_1'))
console.log('存档数据:', save)
```

---

## ⚡ 性能优化建议

1. **组件懒加载**
```typescript
const GameViewOptimized = () => import('@/views/GameViewOptimized.vue')
```

2. **事件节流**
```typescript
// 限制随机事件触发频率
let lastEventTime = 0
const EVENT_COOLDOWN = 5000 // 5秒冷却

function onEnterCell(cell: MapCell) {
  const now = Date.now()
  if (now - lastEventTime > EVENT_COOLDOWN) {
    const event = triggerRandomEvent()
    if (event) lastEventTime = now
  }
}
```

3. **成就检查优化**
```typescript
// 只在关键节点检查，而非每次移动
function onEnterCell(cell: MapCell) {
  if (cell.scenarioId) {
    checkAchievements()
  }
}
```

---

## 📱 移动端适配（待实现）

```css
/* 添加到 theme.css */
@media (max-width: 768px) {
  .game-view {
    flex-direction: column;
  }
  
  .character-panel {
    width: 100%;
    height: auto;
  }
  
  .event-box {
    width: 95vw;
    padding: 16px;
  }
}
```

---

## 🎯 下一步

1. ✅ 测试所有新功能
2. ✅ 根据需要调整事件概率
3. ✅ 添加更多成就和事件
4. ✅ 完善装备数据库
5. ✅ 实现音效系统

---

**需要帮助？** 查看 `OPTIMIZATION_SUMMARY.md` 了解详细的技术文档。