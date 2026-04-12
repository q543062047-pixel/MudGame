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

// 游戏存档
export interface SaveData {
  id: string
  name: string
  timestamp: number
  character: Character
  currentNodeId: string
  flags: Record<string, boolean>
  gameTime: number   // 游戏内时间（天）
}
