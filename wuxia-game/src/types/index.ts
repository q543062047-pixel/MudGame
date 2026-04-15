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
  type: 'skill' | 'item' | 'reputation' | 'gold' | 'stat' | 'flag' | 'hasItem'
  target?: string
  value?: number
  operator?: '>=' | '<=' | '==' | '>'
  flag?: string      // 用于 flag 类型：检查是否有某个标志
  itemId?: string    // 用于 hasItem 类型：检查是否拥有某个物品
}

// 节点效果
export interface NodeEffect {
  type: 'addItem' | 'removeItem' | 'changeHp' | 'changeMp' | 'changeGold' | 'changeReputation' | 'learnSkill' | 'setFlag' | 'joinSect' | 'leaveSect'
  target?: string
  value?: number
  flag?: string
  sectId?: string  // 用于 joinSect 类型
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

// 传送点配置
export interface TeleportPoint {
  id: string                    // 传送点ID
  name: string                  // 传送点名称（显示给玩家）
  targetNodeId: string          // 目标节点ID
  description?: string          // 描述
  cost?: number                 // 传送费用（金钱）
  requiredFlag?: string         // 需要的标志位
  requiredItem?: string         // 需要的物品
  requiredReputation?: number   // 需要的声望
  icon?: string                 // 图标
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
  scenarioId?: string  // 旧的剧情系统（将逐步废弃）
  stories?: StoryBinding[]  // 新的剧情绑定系统
  npcs?: string[]
  shop?: boolean
  inn?: boolean
  
  // 视觉
  icon?: string
  color?: string
  
  // 传送点配置
  teleportPoints?: TeleportPoint[]
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
  counters: Record<string, number>  // 计数器（剧情触发次数等）
  gameTime: number
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

// ── 剧情系统（新增）──────────────────────────────

// 触发类型
export type TriggerType =
  | 'auto'        // 自动触发（进入节点时）
  | 'manual'      // 手动触发（玩家点击）
  | 'first_visit' // 首次访问
  | 'conditional' // 条件触发

// 剧情绑定配置
export interface StoryBinding {
  storyId: string           // 剧情ID
  trigger: TriggerType      // 触发方式
  condition?: Condition     // 触发条件
  priority?: number         // 优先级（数字越大优先级越高）
  maxTriggers?: number     // 最大触发次数（默认 1，0 表示无限次）
}

// 剧情类型
export type StoryType =
  | 'dialog'    // 对话型剧情
  | 'event'     // 事件型剧情
  | 'battle'    // 战斗型剧情
  | 'cutscene'  // 过场动画

// 剧情数据
export interface StoryData {
  id: string
  name: string
  type: StoryType
  content: StoryContent
}

// 剧情内容
export interface StoryContent {
  // 对话型剧情
  dialog?: DialogContent
  
  // 事件型剧情
  event?: EventContent
  
  // 战斗型剧情
  battle?: BattleContent
  
  // 过场动画
  cutscene?: CutsceneContent
}

// 对话内容
export interface DialogContent {
  text: string[]           // 对话文本
  speaker?: string         // 说话者名称
  avatar?: string          // 头像图片
  choices?: Choice[]       // 选项
  effects?: NodeEffect[]   // 对话结束后的效果
}

// 事件内容
export interface EventContent {
  description: string[]    // 事件描述
  effects: NodeEffect[]    // 事件效果
  choices?: Choice[]       // 可选的选项
}

// 战斗内容
export interface BattleContent {
  enemyId: string          // 敌人ID
  canFlee?: boolean        // 是否可以逃跑（默认 true）
  intro?: string[]         // 战斗前的介绍文本
  onWin?: NodeEffect[]     // 胜利后的效果
  onLose?: NodeEffect[]    // 失败后的效果
}

// 过场动画内容
export interface CutsceneContent {
  scenes: CutsceneFrame[]  // 场景帧
}

// 过场动画帧
export interface CutsceneFrame {
  image?: string           // 背景图片
  text?: string[]          // 文本
  duration?: number        // 持续时间（毫秒）
  transition?: string      // 过渡效果
}

// ── 门派系统 ──────────────────────────────

// 门派类型
export type SectType = 'righteous' | 'evil' | 'neutral'

// 门派声望等级
export interface SectReputationLevel {
  level: number
  title: string
  minReputation: number
}

// 门派商店物品
export interface SectShopItem {
  itemId: string
  price: number
  requiredReputation: number
}

// 门派属性加成
export interface SectAttributes {
  hp: number
  mp: number
  attack: number
  defense: number
  speed: number
}

// 门派配置
export interface Sect {
  id: string
  name: string
  description: string
  type: SectType
  location: string              // 门派总部位置（节点ID）
  attributes: SectAttributes    // 门派属性加成
  skills: string[]              // 门派技能ID列表
  reputationLevels: SectReputationLevel[]  // 声望等级
  shopItems: SectShopItem[]     // 门派商店物品
  color: string                 // 门派颜色
  icon: string                  // 门派图标
}

// 角色门派信息
export interface CharacterSectInfo {
  sectId: string                // 当前门派ID
  reputation: number            // 当前门派声望
  level: number                 // 当前门派等级
  title: string                 // 当前门派称号
  joinedAt?: number             // 加入时间（游戏天数）
}
