import type { MapNode } from '@/types'

/**
 * 苍梧城区域
 * 包含：城外、城门、城中广场、百草堂、铁匠铺、悦来客栈
 */
export const CITY_REGION: Record<string, MapNode> = {
  city_approach: {
    id: 'city_approach',
    name: '城外',
    description: '苍梧城外，城墙高耸，城门守卫森严。',
    type: 'wild',
    connections: {
      west: 'crossroad',
      north: 'road_station',
    },
    mapX: 7,
    mapY: 8,
    icon: '城',
    color: '#e0b060',
  },

  city_gate: {
    id: 'city_gate',
    name: '苍梧城门',
    description: '苍梧城正门，人来人往，十分热闹。',
    type: 'town',
    connections: {
      south: 'road_station',
      north: 'city_square',
    },
    mapX: 7,
    mapY: 6,
    icon: '城',
    color: '#e0b060',
  },

  city_square: {
    id: 'city_square',
    name: '城中广场',
    description: '苍梧城中心广场，四周店铺林立。广场边停着几辆马车，车夫在招揽生意。',
    type: 'town',
    connections: {
      south: 'city_gate',
      east: 'herb_shop',
      west: 'weapon_shop',
      north: 'city_inn',
    },
    mapX: 7,
    mapY: 5,
    icon: '市',
    color: '#e0b060',
  },

  herb_shop: {
    id: 'herb_shop',
    name: '百草堂',
    description: '城中药铺，售卖各种丹药。',
    type: 'town',
    connections: {
      west: 'city_square',
    },
    mapX: 8,
    mapY: 5,
    shop: true,
    icon: '药',
    color: '#70a040',
  },

  weapon_shop: {
    id: 'weapon_shop',
    name: '铁匠铺',
    description: '城中兵器铺，可以购买武器装备。',
    type: 'town',
    connections: {
      east: 'city_square',
    },
    mapX: 6,
    mapY: 5,
    shop: true,
    icon: '铁',
    color: '#a08060',
  },

  city_inn: {
    id: 'city_inn',
    name: '悦来客栈',
    description: '城中最大的客栈，可以休息恢复。',
    type: 'town',
    connections: {
      south: 'city_square',
    },
    mapX: 7,
    mapY: 4,
    inn: true,
    npcs: ['innkeeper'],
    icon: '客',
    color: '#c09050',
  },
}

// Made with Bob
