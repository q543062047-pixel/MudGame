import type { MapNode } from '@/types'

/**
 * 其他区域
 * 包含：湖泊区域、西部区域等
 */
export const OTHER_REGIONS: Record<string, MapNode> = {
  // 湖泊区域
  lake_shore: {
    id: 'lake_shore',
    name: '苍梧湖畔',
    description: '湖水清澈，波光粼粼。远处可见一座小岛。',
    type: 'wild',
    connections: {
      north: 'crossroad',
      east: 'lake_pavilion',
    },
    mapX: 5,
    mapY: 9,
    icon: '湖',
    color: '#3070a0',
  },

  lake_pavilion: {
    id: 'lake_pavilion',
    name: '湖心亭',
    description: '湖中小亭，环境清幽，是个修炼的好地方。',
    type: 'special',
    connections: {
      west: 'lake_shore',
    },
    mapX: 6,
    mapY: 9,
    icon: '亭',
    color: '#3070a0',
  },

  // 西部区域
  west_path: {
    id: 'west_path',
    name: '西行小道',
    description: '向西的小路，通往未知的地方。',
    type: 'wild',
    connections: {
      east: 'crossroad',
      west: 'mysterious_cave',
    },
    mapX: 4,
    mapY: 8,
    icon: '道',
    color: '#7a6838',
  },

  mysterious_cave: {
    id: 'mysterious_cave',
    name: '神秘洞窟',
    description: '一个阴暗的洞窟，里面似乎藏着什么秘密...',
    type: 'dungeon',
    connections: {
      east: 'west_path',
    },
    mapX: 3,
    mapY: 8,
    icon: '窟',
    color: '#8a3030',
  },
}

// Made with Bob
