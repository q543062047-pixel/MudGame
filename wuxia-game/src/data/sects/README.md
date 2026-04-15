# 门派系统使用文档

## 概述

门派系统是角色成长的核心机制之一，提供属性加成、专属技能、声望等级等功能。

## 文件结构

```
src/data/sects/
├── index.ts          # 门派配置和工具函数
└── README.md         # 本文件
```

## 现有门派

### 1. 青云派 (qingyun)
- **类型**：正派
- **特色**：剑法流派，攻守兼备
- **属性加成**：HP+10, MP+15, 攻击+5, 防御+3, 速度+7
- **专属技能**：青云剑法、云破剑、踏风步
- **总部位置**：青云山门 (qingyun_gate)

### 2. 霸刀帮 (badao)
- **类型**：邪派
- **特色**：刀法流派，攻击凶猛
- **属性加成**：HP+15, MP+5, 攻击+10, 防御+5, 速度+5
- **专属技能**：蛮力劈砍、血刃斩、狂暴模式
- **总部位置**：城中广场 (city_square)

### 3. 武林盟 (wulin)
- **类型**：中立
- **特色**：综合流派，平衡发展
- **属性加成**：HP+12, MP+10, 攻击+7, 防御+6, 速度+5
- **专属技能**：基础剑法、铁壁防御、迅捷反击
- **总部位置**：悦来客栈 (city_inn)

### 4. 无门无派 (none)
- **类型**：中立
- **特色**：自由发展，不受约束
- **属性加成**：HP+8, MP+8, 攻击+6, 防御+4, 速度+6
- **专属技能**：基础剑法
- **总部位置**：无

## 声望等级系统

每个门派都有6个声望等级，随着声望提升可以获得新称号和解锁新技能。

### 青云派等级
| 等级 | 称号 | 所需声望 |
|------|------|----------|
| 0 | 外门弟子 | 0 |
| 1 | 内门弟子 | 100 |
| 2 | 精英弟子 | 300 |
| 3 | 真传弟子 | 600 |
| 4 | 长老 | 1000 |
| 5 | 掌门 | 2000 |

### 霸刀帮等级
| 等级 | 称号 | 所需声望 |
|------|------|----------|
| 0 | 外围成员 | 0 |
| 1 | 正式帮众 | 100 |
| 2 | 小头目 | 300 |
| 3 | 堂主 | 600 |
| 4 | 护法 | 1000 |
| 5 | 帮主 | 2000 |

### 武林盟等级
| 等级 | 称号 | 所需声望 |
|------|------|----------|
| 0 | 江湖新人 | 0 |
| 1 | 小有名气 | 200 |
| 2 | 江湖豪杰 | 500 |
| 3 | 武林高手 | 1000 |
| 4 | 一代宗师 | 2000 |
| 5 | 盟主 | 5000 |

## 使用方法

### 在代码中使用

```typescript
import { useSect } from '@/composables/useSect'

// 在组件中
const {
  currentSect,           // 当前门派信息
  currentSectReputation, // 当前声望
  currentSectLevel,      // 当前等级
  currentSectTitle,      // 当前称号
  nextLevelReputation,   // 下一等级所需声望
  levelProgress,         // 升级进度 (0-1)
  
  joinSect,              // 加入门派
  leaveSect,             // 离开门派
  addReputation,         // 增加声望
  canBuySectItem,        // 检查是否可购买
  buySectItem,           // 购买门派物品
} = useSect()

// 加入门派
joinSect('qingyun')

// 增加声望
addReputation(50)

// 购买物品
if (canBuySectItem('healing_pill_2')) {
  buySectItem('healing_pill_2')
}
```

### 在剧情中使用

可以通过剧情效果来操作门派系统：

```json
{
  "effects": [
    {
      "type": "changeReputation",
      "value": 50
    }
  ]
}
```

## 添加新门派

### 步骤 1：在 index.ts 中添加门派配置

```typescript
export const SECTS: Record<string, Sect> = {
  // ...现有门派
  
  new_sect: {
    id: 'new_sect',
    name: '新门派',
    description: '门派描述',
    type: 'righteous', // 或 'evil', 'neutral'
    location: 'node_id',
    
    attributes: {
      hp: 10,
      mp: 10,
      attack: 5,
      defense: 5,
      speed: 5,
    },
    
    skills: [
      'skill_1',
      'skill_2',
      'skill_3',
    ],
    
    reputationLevels: [
      { level: 0, title: '新手', minReputation: 0 },
      { level: 1, title: '弟子', minReputation: 100 },
      // ...更多等级
    ],
    
    shopItems: [
      { itemId: 'item_1', price: 50, requiredReputation: 0 },
      // ...更多物品
    ],
    
    color: '#9070c0',
    icon: '新',
  },
}
```

### 步骤 2：创建门派专属技能

在 `src/data/skills.json` 中添加门派技能。

### 步骤 3：创建门派剧情

创建门派相关的剧情文件，如入门剧情、升级剧情等。

### 步骤 4：在地图上标记门派位置

在对应的地图节点上添加门派相关的剧情绑定。

## 门派商店系统

每个门派都可以有自己的商店，出售特殊物品。

### 商店物品配置

```typescript
shopItems: [
  {
    itemId: 'healing_pill_2',  // 物品ID
    price: 50,                  // 价格
    requiredReputation: 100,    // 所需声望
  },
]
```

### 购买条件

- 必须是该门派成员
- 声望达到要求
- 有足够的金钱

## 门派关系系统（未来扩展）

可以添加门派之间的关系：

```typescript
interface SectRelation {
  sectId: string
  relation: 'ally' | 'neutral' | 'enemy'
  value: number  // -100 到 100
}
```

## 最佳实践

1. **平衡性**：确保各门派的属性加成总和相近
2. **特色鲜明**：每个门派应有独特的玩法风格
3. **声望获取**：通过完成任务、战斗胜利等方式获得
4. **等级设计**：等级间隔合理，给玩家成就感
5. **商店物品**：提供有价值但不破坏平衡的物品

## 注意事项

- 角色只能同时加入一个门派
- 离开门派会失去所有门派加成
- 声望不会在离开门派时保留
- 门派技能在离开后仍然保留（可选择是否移除）