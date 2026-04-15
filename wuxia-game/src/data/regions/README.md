# 世界地图区域系统

## 目录结构

```
src/data/regions/
├── index.ts          # 区域注册中心
├── qingyun.ts        # 青云派区域
├── forest.ts         # 密林区域
├── road.ts           # 官道区域
├── city.ts           # 苍梧城区域
├── other.ts          # 其他区域
└── README.md         # 本文件
```

## 现有区域

### 1. 青云派区域 (qingyun.ts)
- 青云山门
- 青云大殿
- 演武场
- 山脚
- 山间小径

### 2. 密林区域 (forest.ts)
- 林间小路
- 密林入口
- 密林深处
- 林中空地

### 3. 官道区域 (road.ts)
- 官道
- 官道驿站
- 十字路口

### 4. 苍梧城区域 (city.ts)
- 城外
- 苍梧城门
- 城中广场
- 百草堂
- 铁匠铺
- 悦来客栈

### 5. 其他区域 (other.ts)
- 苍梧湖畔
- 湖心亭
- 西行小道
- 神秘洞窟

## 如何添加新区域

### 步骤 1：创建区域文件

在 `src/data/regions/` 目录下创建新文件，例如 `desert.ts`：

```typescript
import type { MapNode } from '@/types'

/**
 * 沙漠区域
 * 包含：沙漠入口、沙漠绿洲等
 */
export const DESERT_REGION: Record<string, MapNode> = {
  desert_entrance: {
    id: 'desert_entrance',
    name: '沙漠入口',
    description: '一望无际的沙漠，烈日炎炎。',
    type: 'wild',
    connections: {
      // 连接到其他节点
      west: 'some_existing_node',
      east: 'desert_oasis',
    },
    mapX: 10,
    mapY: 10,
    icon: '沙',
    color: '#d4a574',
  },

  desert_oasis: {
    id: 'desert_oasis',
    name: '沙漠绿洲',
    description: '沙漠中的绿洲，有清澈的泉水。',
    type: 'wild',
    connections: {
      west: 'desert_entrance',
    },
    mapX: 11,
    mapY: 10,
    icon: '泉',
    color: '#70a040',
  },
}
```

### 步骤 2：注册新区域

在 `src/data/regions/index.ts` 中导入并注册：

```typescript
import { DESERT_REGION } from './desert'

export const REGIONS = {
  qingyun: QINGYUN_REGION,
  forest: FOREST_REGION,
  road: ROAD_REGION,
  city: CITY_REGION,
  other: OTHER_REGIONS,
  desert: DESERT_REGION,  // 添加新区域
} as const

export function getAllNodes(): Record<string, MapNode> {
  return {
    ...QINGYUN_REGION,
    ...FOREST_REGION,
    ...ROAD_REGION,
    ...CITY_REGION,
    ...OTHER_REGIONS,
    ...DESERT_REGION,  // 添加新区域
  }
}
```

### 步骤 3：连接到现有地图

确保新区域的节点与现有节点有连接：

1. 在新区域的某个节点中，添加到现有节点的连接
2. 在现有节点中，添加到新区域的连接

例如，在 `other.ts` 中的 `west_path` 节点添加：

```typescript
west_path: {
  // ...
  connections: {
    east: 'crossroad',
    west: 'mysterious_cave',
    south: 'desert_entrance',  // 连接到新区域
  },
  // ...
}
```

### 步骤 4：测试

1. 运行 `npm run dev`
2. 访问游戏，测试新区域的连接是否正常
3. 检查地图显示是否正确

## 节点属性说明

### 必需属性
- `id`: 节点唯一标识符
- `name`: 节点显示名称
- `description`: 节点描述
- `type`: 节点类型 ('sect' | 'town' | 'wild' | 'dungeon' | 'special')
- `connections`: 连接到其他节点的方向
- `mapX`, `mapY`: 地图坐标
- `icon`: 地图上显示的图标（单个汉字）
- `color`: 节点颜色（十六进制）

### 可选属性
- `stories`: 剧情绑定列表
- `npcs`: NPC 列表
- `shop`: 是否为商店
- `inn`: 是否为客栈
- `scenarioId`: 旧剧情系统ID（不推荐使用）

## 最佳实践

1. **区域划分**：按地理位置或功能划分区域
2. **命名规范**：使用小写字母和下划线，如 `desert_oasis`
3. **坐标规划**：合理规划 mapX 和 mapY，避免节点重叠
4. **连接完整性**：确保双向连接（A连接到B，B也要连接到A）
5. **颜色一致性**：同一区域使用相近的颜色
6. **文档更新**：添加新区域后更新本 README

## 注意事项

- 节点 ID 必须全局唯一
- 连接的目标节点必须存在
- 地图坐标不要与现有节点冲突
- 新区域至少要有一个节点连接到现有地图