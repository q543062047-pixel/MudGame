import type { MapCell, CellType, WorldMap } from '@/types'
import { buildCellMetaFromStory } from './storyConfig'

const SYMBOL_MAP: Record<string, CellType> = {
  '.': 'plain', 'T': 'town', 'I': 'inn', 'S': 'shop',
  'P': 'temple', 'F': 'forest', 'M': 'mountain', 'R': 'road',
  'W': 'water', 'D': 'dungeon', '#': 'wall',
}

// 精简地图 13×11，去掉无用边框格
// 玩家起始：青云山 (2,2)  苍梧城 (9,2)
const MAP_LAYOUT = [
  'MMMMMMMMMMMMM',
  'MF...F...T..M',  // y=1  T=苍梧城
  'MP...F...T..M',  // y=2  P=青云山门
  'MF...R...R..M',
  'MF...R...I..M',  // y=4  I=客栈
  'M....R...R..M',
  'M....R...S..M',  // y=6  S=百草堂
  'M....R...R..M',
  'MRRRRRRRRRR.M',  // y=8  横向官道
  'M....W...F.DM',  // y=9  W=湖 D=地牢
  'M..F.W...I..M',  // y=10 I=林中茶舍
  'MMMMMMMMMMMMM',
]

interface CellMeta {
  name: string
  description?: string
  scenarioId?: string
  hasNpc?: boolean
  triggerOnce?: boolean  // 是否只触发一次
  blockedDirections?: ('north' | 'south' | 'east' | 'west')[]  // 阻挡的方向
}

// 从 storyConfig 自动生成剧情地点配置
const STORY_CELL_META = buildCellMetaFromStory()

// 其他非剧情地点（可配置方向阻挡）
const OTHER_CELL_META: Record<string, CellMeta> = {
  '10,9': { name: '苍梧湖畔' },
  '11,10': { name: '林中茶舍', hasNpc: true },
  '4,8': { name: '官道驿站', hasNpc: true },
  
  // 青云山门周围的密林 - 强制玩家从山门通过
  '1,2': { name: '青云山北麓', blockedDirections: ['east', 'south'] },  // 北边密林：不能向东和向南
  '3,2': { name: '青云山南麓', blockedDirections: ['east', 'north'] },  // 南边密林：不能向东和向北
  '1,3': { name: '山林小径', blockedDirections: ['west'] },  // 东北平原：不能从西边进入
  '3,3': { name: '山脚小路', blockedDirections: ['west'] },  // 东南平原：不能从西边进入
}

// 合并所有地点配置
const CELL_META: Record<string, CellMeta> = {
  ...STORY_CELL_META,
  ...OTHER_CELL_META
}

export function buildWorldMap(): WorldMap {
  const height = MAP_LAYOUT.length
  const width = MAP_LAYOUT[0].length
  const cells: MapCell[][] = []

  for (let y = 0; y < height; y++) {
    cells[y] = []
    for (let x = 0; x < width; x++) {
      const ch = MAP_LAYOUT[y][x] ?? '.'
      const type: CellType = SYMBOL_MAP[ch] ?? 'plain'
      const key = `${y},${x}`
      const meta = CELL_META[key]
      cells[y][x] = {
        x, y, type,
        name: meta?.name ?? '',
        description: meta?.description ?? '',
        scenarioId: meta?.scenarioId,
        explored: false,
        hasEvent: !!(meta?.scenarioId || meta?.hasNpc),
        blockedDirections: meta?.blockedDirections,
      }
    }
  }

  // 起始位置已探索
  cells[2][2].explored = true
  cells[2][3].explored = true
  cells[1][2].explored = true
  cells[3][2].explored = true

  return { width, height, cells, playerX: 2, playerY: 2 }
}

export function isWalkable(type: CellType): boolean {
  return type !== 'wall' && type !== 'water' && type !== 'mountain'
}

// 宣纸色系地图地形颜色（深色地图，与宣纸文字区形成对比）
export const CELL_COLORS: Record<CellType, { bg: string; border: string; text: string }> = {
  plain:    { bg: '#1e2a12', border: '#2a3a18', text: '#5a7a38' },
  town:     { bg: '#2a1a08', border: '#5a3010', text: '#e0b060' },
  inn:      { bg: '#1e1408', border: '#4a3010', text: '#c09050' },
  shop:     { bg: '#181e10', border: '#304020', text: '#70a040' },
  temple:   { bg: '#14101e', border: '#302848', text: '#9070c0' },
  forest:   { bg: '#111a0a', border: '#1e2e10', text: '#3a5a20' },
  mountain: { bg: '#141414', border: '#202020', text: '#404040' },
  road:     { bg: '#1a1808', border: '#3a3010', text: '#7a6838' },
  water:    { bg: '#0a1420', border: '#102030', text: '#3070a0' },
  dungeon:  { bg: '#180808', border: '#380000', text: '#8a3030' },
  wall:     { bg: '#0c0c0c', border: '#141414', text: '#282828' },
}

export const CELL_ICONS: Record<CellType, string> = {
  plain: '·', town: '城', inn: '客', shop: '坊',
  temple: '观', forest: '林', mountain: '山', road: '道',
  water: '水', dungeon: '窟', wall: '■',
}

export const TERRAIN_TYPE_NAMES: Record<CellType, string> = {
  plain: '荒野', town: '城镇', inn: '客栈', shop: '商铺',
  temple: '观宇', forest: '密林', mountain: '山岭', road: '官道',
  water: '水域', dungeon: '险地', wall: '绝壁',
}
