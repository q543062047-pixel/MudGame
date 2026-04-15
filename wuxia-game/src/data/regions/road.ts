import type { MapNode } from '@/types'

/**
 * 官道区域
 * 包含：官道、官道驿站、十字路口
 */
export const ROAD_REGION: Record<string, MapNode> = {
  official_road: {
    id: 'official_road',
    name: '官道',
    description: '宽阔的官道，通往苍梧城。路上行人不少。',
    type: 'wild',
    connections: {
      north: 'mountain_foot',
      northeast: 'forest_clearing',
      east: 'road_station',
      south: 'crossroad',
    },
    mapX: 5,
    mapY: 7,
    icon: '道',
    color: '#7a6838',
  },

  road_station: {
    id: 'road_station',
    name: '官道驿站',
    description: '官道上的驿站，可以休息补给。驿站掌柜可以安排马车前往各地。',
    type: 'wild',
    connections: {
      west: 'official_road',
      north: 'city_gate',
      south: 'city_approach',
    },
    mapX: 7,
    mapY: 7,
    npcs: ['station_keeper'],
    inn: true,
    icon: '驿',
    color: '#c09050',
  },

  crossroad: {
    id: 'crossroad',
    name: '十字路口',
    description: '四条道路在此交汇，路标指向各个方向。',
    type: 'wild',
    connections: {
      north: 'official_road',
      east: 'city_approach',
      south: 'lake_shore',
      west: 'west_path',
    },
    mapX: 5,
    mapY: 8,
    icon: '十',
    color: '#7a6838',
  },
}

// Made with Bob
