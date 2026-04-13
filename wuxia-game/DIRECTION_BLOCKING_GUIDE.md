# 地图方向阻挡功能使用指南

## 功能说明

地图格子现在支持配置方向阻挡，可以限制玩家从某个格子向特定方向移动，用于创建更有趣的地图布局和路径设计。

## 配置方法

在 `src/data/worldMap.ts` 的 `OTHER_CELL_META` 或 `STORY_CELL_META` 中为格子添加 `blockedDirections` 属性：

```typescript
const OTHER_CELL_META: Record<string, CellMeta> = {
  // 格子坐标 'y,x'
  '3,5': { 
    name: '悬崖边', 
    blockedDirections: ['south', 'east']  // 阻挡向南和向东移动
  },
  '4,7': {
    name: '峡谷入口',
    blockedDirections: ['west']  // 只能从东边进入，不能向西离开
  }
}
```

## 方向说明

- `'north'` - 向北（上）
- `'south'` - 向南（下）
- `'east'` - 向东（右）
- `'west'` - 向西（左）

## 工作原理

1. **当前格子阻挡**：如果当前格子配置了某个方向的阻挡，玩家无法向该方向移动
2. **目标格子阻挡**：如果目标格子配置了反方向的阻挡，玩家也无法进入
   - 例如：目标格子阻挡 `'west'`，则玩家无法从西边（左边）进入该格子

## 使用场景示例

### 1. 单向通道
```typescript
// 只能从北边进入，不能返回
'5,3': { 
  name: '密道入口', 
  blockedDirections: ['north']  // 进入后无法向北返回
}
```

### 2. 悬崖/峡谷
```typescript
// 悬崖边缘，不能向南和向东
'2,8': { 
  name: '悬崖边', 
  blockedDirections: ['south', 'east']
}
```

### 3. 迷宫设计
```typescript
// 创建复杂的迷宫路径
'6,4': { name: '迷宫岔路A', blockedDirections: ['east'] },
'6,5': { name: '迷宫岔路B', blockedDirections: ['west', 'south'] },
'7,5': { name: '迷宫岔路C', blockedDirections: ['north'] },
```

### 4. 剧情门控
```typescript
// 配合剧情标记，创建条件性通道
'8,6': { 
  name: '封印之门', 
  blockedDirections: ['east'],  // 初始阻挡
  // 可以在剧情中动态修改此属性
}
```

## 实际应用示例

### 示例1：强制战斗路径
```typescript
// 密林深处 - 玩家必须经过这里才能到达某个地点
'4,1': { 
  name: '密林深处', 
  scenarioId: 'forest_rescue',
  blockedDirections: ['west']  // 不能绕过，必须触发剧情
}
```

### 示例2：山路设计
```typescript
// 山路只能沿着特定路径前进
'3,2': { name: '山路起点', blockedDirections: ['west', 'north'] },
'3,3': { name: '山路转角', blockedDirections: ['south'] },
'2,3': { name: '山路终点', blockedDirections: ['east'] },
```

## 注意事项

1. **避免死路**：确保玩家总有路径可以移动，不要创建完全封闭的格子
2. **测试路径**：添加阻挡后要测试玩家能否正常到达所有重要地点
3. **配合地形**：方向阻挡应该与地形类型相符（如悬崖、河流等）
4. **剧情配合**：可以在剧情中动态修改阻挡，创造解锁新区域的效果

## 当前地图布局参考

```
MMMMMMMMMMMMM
MF...F...T..M  (y=1)
MP...F...T..M  (y=2) P=青云山(2,2) 起点
MF...R...R..M  (y=3)
MF...R...I..M  (y=4) F=密林(1,4)
M....R...R..M  (y=5)
M....R...S..M  (y=6)
M....R...R..M  (y=7)
MRRRRRRRRRR.M  (y=8)
M....W...F.DM  (y=9)
M..F.W...I..M  (y=10)
MMMMMMMMMMMMM
```

坐标格式：`'y,x'`（注意是行在前，列在后）

## 高级技巧

### 动态修改阻挡（未来功能）
```typescript
// 在剧情效果中可以添加修改地图阻挡的功能
{
  type: 'modifyCell',
  x: 5,
  y: 3,
  removeBlockedDirections: ['east'],  // 移除东向阻挡
  addBlockedDirections: ['west']      // 添加西向阻挡
}
```

这个功能可以用于：
- 打开封印的门
- 桥梁建造/损坏
- 剧情推进解锁新区域