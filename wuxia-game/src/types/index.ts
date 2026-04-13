// 角色属性
export interface Character {
  name: string
  title: string      // 称号
  sect: string       // 门派
  hp: number
  maxHp: number
  mp: number         // 内力
  maxMp: number
  attack: number
  defense: number
  speed: number
  reputation: number // 声望
  gold: number
  level: number
  exp: number
  skills: Skill[]
  inventory: Item[]
  equipment: Equipment  // 装备系统
}

// 装备系统
export interface Equipment {
  weapon: Item | null
  armor: Item | null
  accessory: Item | null
}

// 功法技能
export interface Skill {
  id: string
  name: string
  damage: number
  mpCost: number
  description: string
}

// 物品
export interface Item {
  id: string
  name: string
  type: 'weapon' | 'armor' | 'medicine' | 'misc'
  description: string
  effect?: ItemEffect
  quantity: number
}

export interface ItemEffect {
  hp?: number
  mp?: number
  attack?: number
  defense?: number
}

// 剧情节点
export interface ScenarioNode {
  id: string
  text: string[]           // 支持多段文字
  choices?: Choice[]       // 没有则自动推进
  autoNext?: string        // 自动跳转的节点id
  battle?: BattleConfig    // 触发战斗
  effects?: NodeEffect[]   // 节点效果（获得物品、属性变化等）
  bgm?: string
  atmosphere?: 'normal' | 'tense' | 'peaceful' | 'battle' | 'mystery'
}

// 选项
export interface Choice {
  text: string
  next: string
  condition?: Condition    // 显示条件
  effects?: NodeEffect[]
}

// 条件
export interface Condition {
  type: 'skill' | 'item' | 'reputation' | 'gold' | 'stat'
  target?: string
  value?: number
  operator?: '>=' | '<=' | '==' | '>'
}

// 节点效果
export interface NodeEffect {
  type: 'addItem' | 'removeItem' | 'changeHp' | 'changeMp' | 'changeGold' | 'changeReputation' | 'learnSkill' | 'setFlag'
  target?: string
  value?: number
  flag?: string
}

// 战斗配置
export interface BattleConfig {
  enemyId: string
  canFlee: boolean
  winNext: string
  loseNext: string
}

// 敌人
export interface Enemy {
  id: string
  name: string
  title: string
  hp: number
  maxHp: number
  mp: number
  attack: number
  defense: number
  speed: number
  skills: Skill[]
  loot?: LootTable[]
  description: string
}

export interface LootTable {
  itemId: string
  chance: number   // 0-1
  quantity: number
}

// 战斗日志
export interface BattleLog {
  round: number
  actor: string
  action: string
  damage?: number
  effect?: string
}

// ── 地图系统 (节点式) ──────────────────────────────

export type NodeType = 'town' | 'wild' | 'dungeon' | 'special' | 'sect'

export type Direction8 = 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest'

// 路径阻挡信息
export interface PathBlock {
  blocked: boolean           // 是否被阻挡
  reason: string            // 阻挡原因描述
  requiredFlag?: string     // 需要的标志位才能通过
  requiredItem?: string     // 需要的物品才能通过
  onBlockMessage?: string   // 尝试通过时的提示消息
}

export interface MapNode {
  id: string
  name: string
  description: string
  type: NodeType
  
  // 8方向连接
  connections: Partial<Record<Direction8, string>>
  
  // 小地图坐标
  mapX: number
  mapY: number
  
  // 功能
  scenarioId?: string
  npcs?: string[]
  shop?: boolean
  inn?: boolean
  
  // 视觉
  icon?: string
  color?: string
}

export interface WorldGraph {
  nodes: Record<string, MapNode>
  currentNodeId: string
  visitedNodes: Set<string>
  dynamicBlocks: Map<string, Partial<Record<Direction8, PathBlock>>>  // 动态阻挡状态
}

// 游戏存档
export interface SaveData {
  id: string
  name: string
  timestamp: number
  character: Character
  currentNodeId: string
  flags: Record<string, boolean>
  gameTime: number
  playerX: number
  playerY: number
  achievements?: string[]  // 已解锁成就
}

// ── 成就系统 ──────────────────────────────
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  condition: AchievementCondition
  unlocked: boolean
  unlockedAt?: number
}

export interface AchievementCondition {
  type: 'flag' | 'battle_win' | 'item_collect' | 'reputation' | 'ending'
  target?: string
  value?: number
}

// ── 随机事件系统 ──────────────────────────────
export interface RandomEvent {
  id: string
  name: string
  description: string
  probability: number  // 0-1
  conditions?: Condition[]
  effects?: NodeEffect[]  // 可选，有些事件通过 choices 来应用效果
  choices?: Choice[]
}
