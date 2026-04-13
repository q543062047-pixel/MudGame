# 地图系统重新设计方案

## 目标
从网格地图改为节点式地图（类似传统MUD游戏），支持8方向移动和小地图显示。

## 参考界面
```
┌─────────────────────────────────────────────────────┐
│ 沧浪剑派                                             │
│ 江南水乡深处的武学圣地，青石白墙，竹林环绕...        │
│                                                      │
│              后山竹林                                 │
│                 │                                    │
│      演武场 ─ 竹林入口 ─ 采药坡                      │
│                 │                                    │
│                                                      │
│                                                      │
│                                            ┌────────┐│
│                                            │ 小地图  ││
│                                            │ ■─■    ││
│                                            │ │ │    ││
│  [21:05:00] 终夜漂泊，寒气逼人，万籁俱寂。  │ ■─●─■  ││
│                                            │   │    ││
│                                            │   ■    ││
│                                            └────────┘│
│                                                      │
└─────────────────────────────────────────────────────┘
```

## 新数据结构

### 1. 地图节点 (MapNode)
```typescript
interface MapNode {
  id: string                    // 节点ID，如 'qingyun_gate'
  name: string                  // 显示名称 '青云山门'
  description: string           // 详细描述
  type: 'town' | 'wild' | 'dungeon' | 'special'
  
  // 8方向连接
  connections: {
    north?: string              // 北边连接的节点ID
    south?: string
    east?: string
    west?: string
    northeast?: string
    northwest?: string
    southeast?: string
    southwest?: string
  }
  
  // 地图坐标（用于小地图显示）
  mapX: number
  mapY: number
  
  // 功能
  scenarioId?: string           // 触发的剧情
  npcs?: string[]               // NPC列表
  shop?: boolean                // 是否有商店
  inn?: boolean                 // 是否可休息
  
  // 视觉
  icon?: string                 // 节点图标
  color?: string                // 节点颜色
}
```

### 2. 世界地图 (WorldGraph)
```typescript
interface WorldGraph {
  nodes: Record<string, MapNode>
  currentNodeId: string
  visitedNodes: Set<string>     // 已访问的节点
}
```

## 新组件结构

### 1. MapView.vue (主地图视图)
- 显示当前节点信息
- 显示可用的8个方向
- 点击方向按钮移动
- 键盘快捷键支持

### 2. MiniMap.vue (小地图)
- 右下角固定位置
- 显示所有已访问节点
- 当前位置高亮
- 可点击快速传送（已访问的节点）

### 3. NodeCard.vue (节点卡片)
- 显示节点名称、描述
- 显示可用方向（8个按钮）
- 显示NPC、商店等功能图标

## 移动系统

### 方向映射
```typescript
const DIRECTIONS = {
  north:     { dx: 0,  dy: -1, key: 'w', label: '北' },
  northeast: { dx: 1,  dy: -1, key: 'e', label: '东北' },
  east:      { dx: 1,  dy: 0,  key: 'd', label: '东' },
  southeast: { dx: 1,  dy: 1,  key: 'c', label: '东南' },
  south:     { dx: 0,  dy: 1,  key: 's', label: '南' },
  southwest: { dx: -1, dy: 1,  key: 'z', label: '西南' },
  west:      { dx: -1, dy: 0,  key: 'a', label: '西' },
  northwest: { dx: -1, dy: -1, key: 'q', label: '西北' },
}
```

### 方向按钮布局
```
  Q(西北)  W(北)   E(东北)
  A(西)    ●当前   D(东)
  Z(西南)  S(南)   C(东南)
```

## 示例地图数据

```typescript
const WORLD_NODES: Record<string, MapNode> = {
  qingyun_gate: {
    id: 'qingyun_gate',
    name: '青云山门',
    description: '青云派山门，石阶蜿蜒而上，两侧古松参天。',
    type: 'special',
    connections: {
      north: 'qingyun_hall',
      east: 'mountain_path',
      south: 'mountain_foot',
    },
    mapX: 5, mapY: 5,
    scenarioId: 'start',
  },
  
  mountain_path: {
    id: 'mountain_path',
    name: '山间小径',
    description: '蜿蜒的山路，两旁竹林摇曳。',
    type: 'wild',
    connections: {
      west: 'qingyun_gate',
      east: 'forest_entrance',
      northeast: 'cliff_edge',
    },
    mapX: 6, mapY: 5,
  },
  
  forest_entrance: {
    id: 'forest_entrance',
    name: '密林入口',
    description: '茂密的树林，光线昏暗。',
    type: 'wild',
    connections: {
      west: 'mountain_path',
      north: 'deep_forest',
    },
    mapX: 7, mapY: 5,
    scenarioId: 'forest_rescue',
  },
}
```

## 实现步骤

### Phase 1: 数据层
1. 创建 `src/data/worldGraph.ts` - 定义节点数据
2. 修改 `src/types/index.ts` - 添加新类型定义
3. 修改 `src/stores/world.ts` - 改为节点式存储

### Phase 2: 组件层
1. 创建 `src/components/game/NodeView.vue` - 节点视图
2. 创建 `src/components/game/DirectionPad.vue` - 方向按钮
3. 创建 `src/components/game/MiniMap.vue` - 小地图
4. 修改 `src/views/GameViewOptimized.vue` - 使用新组件

### Phase 3: 交互层
1. 实现8方向移动逻辑
2. 实现小地图点击传送
3. 实现节点访问记录
4. 保持剧情触发机制

## 优势

1. **更符合MUD传统** - 节点式移动更有代入感
2. **灵活的地图设计** - 不受网格限制，可以创造复杂路径
3. **清晰的方向指示** - 8个方向按钮，一目了然
4. **小地图导航** - 快速了解世界结构
5. **易于扩展** - 添加新地点只需定义节点和连接

## 兼容性

- 保持现有的剧情系统
- 保持现有的战斗系统
- 保持现有的NPC系统
- 只替换地图移动部分

## 预计工作量

- 数据重构: 2-3小时
- 组件开发: 3-4小时
- 测试调试: 1-2小时
- 总计: 6-9小时

## 是否继续？

这是一个较大的重构，会完全改变地图系统。如果确认要进行，我会：

1. 先备份当前代码
2. 逐步实现新系统
3. 保持其他功能不变
4. 提供详细的迁移说明

请确认是否要进行这个重构？