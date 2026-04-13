# 动态路径阻挡系统设计

## 需求
实现类似"被石头堵住了，无法返回"的动态路径阻挡功能，允许在游戏过程中根据剧情或事件动态地阻挡或开放某些路径。

## 设计方案

### 1. 数据结构扩展

#### 1.1 MapNode 类型扩展
```typescript
// src/types/index.ts
export interface MapNode {
  id: string
  name: string
  description: string
  type: NodeType
  connections: Partial<Record<Direction8, string>>
  
  // 新增：动态阻挡配置
  blockedConnections?: Partial<Record<Direction8, PathBlock>>
  
  mapX: number
  mapY: number
  scenarioId?: string
  npcs?: string[]
  shop?: boolean
  inn?: boolean
  icon?: string
  color?: string
}

// 路径阻挡信息
export interface PathBlock {
  blocked: boolean           // 是否被阻挡
  reason: string            // 阻挡原因描述，如"巨石挡路"
  requiredFlag?: string     // 需要的标志位才能通过
  requiredItem?: string     // 需要的物品才能通过
  onBlockMessage?: string   // 尝试通过时的提示消息
}
```

#### 1.2 WorldGraph 扩展
```typescript
export interface WorldGraph {
  nodes: Record<string, MapNode>
  currentNodeId: string
  visitedNodes: Set<string>
  
  // 新增：动态阻挡状态（运行时）
  dynamicBlocks: Map<string, Partial<Record<Direction8, PathBlock>>>
}
```

### 2. World Store 方法扩展

#### 2.1 阻挡管理方法
```typescript
// src/stores/world.ts

// 动态阻挡某个方向
function blockPath(
  nodeId: string, 
  direction: Direction8, 
  block: PathBlock
): void {
  if (!graph.value.dynamicBlocks.has(nodeId)) {
    graph.value.dynamicBlocks.set(nodeId, {})
  }
  const nodeBlocks = graph.value.dynamicBlocks.get(nodeId)!
  nodeBlocks[direction] = block
}

// 解除阻挡
function unblockPath(nodeId: string, direction: Direction8): void {
  const nodeBlocks = graph.value.dynamicBlocks.get(nodeId)
  if (nodeBlocks && nodeBlocks[direction]) {
    delete nodeBlocks[direction]
  }
}

// 检查路径是否被阻挡
function isPathBlocked(
  nodeId: string, 
  direction: Direction8
): { blocked: boolean; block?: PathBlock } {
  const nodeBlocks = graph.value.dynamicBlocks.get(nodeId)
  const block = nodeBlocks?.[direction]
  
  if (!block || !block.blocked) {
    return { blocked: false }
  }
  
  // 检查是否满足通过条件
  if (block.requiredFlag) {
    const playerStore = usePlayerStore()
    if (playerStore.hasFlag(block.requiredFlag)) {
      return { blocked: false }
    }
  }
  
  if (block.requiredItem) {
    const playerStore = usePlayerStore()
    if (playerStore.hasItem(block.requiredItem)) {
      return { blocked: false }
    }
  }
  
  return { blocked: true, block }
}

// 修改 tryMove 方法
function tryMove(direction: Direction8): { 
  moved: boolean
  node: MapNode | null
  blocked?: boolean
  blockReason?: string
} {
  const node = currentNode.value
  if (!node) return { moved: false, node: null }

  const targetId = node.connections[direction]
  if (!targetId) return { moved: false, node: null }

  // 检查是否被阻挡
  const blockCheck = isPathBlocked(node.id, direction)
  if (blockCheck.blocked) {
    return { 
      moved: false, 
      node: null, 
      blocked: true,
      blockReason: blockCheck.block?.onBlockMessage || blockCheck.block?.reason
    }
  }

  const targetNode = graph.value.nodes[targetId]
  if (!targetNode) return { moved: false, node: null }

  // 移动成功
  graph.value.currentNodeId = targetId
  graph.value.visitedNodes.add(targetId)
  
  return { moved: true, node: targetNode }
}
```

### 3. 使用示例

#### 3.1 在剧情中触发阻挡
```typescript
// src/data/scenarios/chapter1.json
{
  "cave_collapse": {
    "id": "cave_collapse",
    "text": [
      "轰隆隆——！",
      "洞穴突然发生坍塌，巨石滚落，堵住了来时的路！",
      "看来只能继续向前探索了..."
    ],
    "effects": [
      {
        "type": "blockPath",
        "nodeId": "mysterious_cave",
        "direction": "east",
        "reason": "巨石堵路",
        "message": "巨石挡住了去路，无法返回。"
      }
    ],
    "autoNext": "cave_deeper"
  }
}
```

#### 3.2 在代码中使用
```typescript
// 在某个事件处理函数中
const worldStore = useWorldStore()

// 阻挡路径
worldStore.blockPath('mysterious_cave', 'east', {
  blocked: true,
  reason: '巨石堵路',
  onBlockMessage: '巨石挡住了去路，你无法返回。需要找到炸药才能炸开。',
  requiredItem: 'dynamite'  // 需要炸药才能通过
})

// 后续获得炸药后，可以选择：
// 方案1：直接解除阻挡
worldStore.unblockPath('mysterious_cave', 'east')

// 方案2：保持阻挡配置，但玩家有炸药时自动通过
// （已在 isPathBlocked 中实现）
```

#### 3.3 UI 显示
```vue
<!-- NodeView.vue 或 DirectionPad.vue -->
<template>
  <div class="direction-buttons">
    <button 
      v-for="dir in availableDirections"
      :key="dir.direction"
      :class="{ blocked: isDirectionBlocked(dir.direction) }"
      @click="handleMove(dir.direction)"
    >
      {{ directionName(dir.direction) }}
      <span v-if="isDirectionBlocked(dir.direction)" class="block-icon">🚫</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const worldStore = useWorldStore()

function isDirectionBlocked(direction: Direction8): boolean {
  const node = worldStore.currentNode
  if (!node) return false
  return worldStore.isPathBlocked(node.id, direction).blocked
}

function handleMove(direction: Direction8) {
  const result = worldStore.tryMove(direction)
  
  if (result.blocked && result.blockReason) {
    // 显示阻挡提示
    showMessage(result.blockReason)
  } else if (result.moved) {
    // 移动成功
    emit('move', direction, result.node)
  }
}
</script>
```

### 4. 高级功能

#### 4.1 条件性阻挡
```typescript
// 需要特定标志位
worldStore.blockPath('secret_passage', 'north', {
  blocked: true,
  reason: '机关门紧闭',
  requiredFlag: 'solved_puzzle_1',
  onBlockMessage: '机关门紧闭着，似乎需要解开某个谜题。'
})

// 需要特定物品
worldStore.blockPath('locked_gate', 'south', {
  blocked: true,
  reason: '铁门上锁',
  requiredItem: 'iron_key',
  onBlockMessage: '铁门紧锁，需要钥匙才能打开。'
})
```

#### 4.2 单向阻挡
```typescript
// 只阻挡从A到B，但B到A可以通过
worldStore.blockPath('cliff_top', 'south', {
  blocked: true,
  reason: '悬崖峭壁',
  onBlockMessage: '前方是悬崖，太危险了，不能跳下去！'
})
// cliff_bottom 到 cliff_top 的 north 方向不阻挡
```

#### 4.3 临时阻挡
```typescript
// 战斗中阻挡逃跑
worldStore.blockPath(currentNodeId, 'all', {
  blocked: true,
  reason: '战斗中',
  onBlockMessage: '战斗还未结束，无法离开！'
})

// 战斗结束后解除
worldStore.unblockPath(currentNodeId, 'all')
```

### 5. 连接线视觉效果

在 NodeView.vue 中，被阻挡的连接线可以显示为虚线或红色：

```typescript
const visibleConnections = computed(() => {
  // ... 现有逻辑
  
  connections.push({
    x1, y1, x2, y2,
    isActive: ws.isVisited(targetId) && ws.isVisited(n.id),
    isBlocked: ws.isPathBlocked(n.id, dir).blocked  // 新增
  })
})
```

```vue
<path
  :d="`M ${conn.x1} ${conn.y1} L ${conn.x2} ${conn.y2}`"
  class="connection-line"
  :class="{ 
    active: conn.isActive,
    blocked: conn.isBlocked 
  }"
  :stroke-dasharray="conn.isBlocked ? '5,5' : 'none'"
  fill="none"
/>
```

```css
.connection-line.blocked {
  stroke: #ff4444;
  opacity: 0.6;
}
```

## 总结

这个设计方案提供了：
1. ✅ 动态阻挡/解除路径的能力
2. ✅ 条件性通过（需要物品/标志位）
3. ✅ 自定义阻挡提示消息
4. ✅ 单向阻挡支持
5. ✅ 与现有系统无缝集成
6. ✅ 可视化反馈（虚线、颜色）

实现时只需要：
1. 扩展类型定义
2. 在 world store 中添加阻挡管理方法
3. 修改 tryMove 方法检查阻挡
4. 在 UI 中显示阻挡状态
5. 在剧情/事件中调用阻挡方法