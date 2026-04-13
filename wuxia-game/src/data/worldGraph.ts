import type { MapNode, WorldGraph } from '@/types'

// 世界地图节点定义
export const WORLD_NODES: Record<string, MapNode> = {
  // 青云派区域
  qingyun_gate: {
    id: 'qingyun_gate',
    name: '青云山门',
    description: '青云派山门，石阶蜿蜒而上，两侧古松参天。门前立着两尊石狮，威武庄严。',
    type: 'sect',
    connections: {
      north: 'qingyun_hall',
      east: 'mountain_path',
      south: 'mountain_foot',
    },
    mapX: 5,
    mapY: 5,
    scenarioId: 'start',
    icon: '观',
    color: '#9070c0',
  },

  qingyun_hall: {
    id: 'qingyun_hall',
    name: '青云大殿',
    description: '青云派主殿，殿内供奉着历代掌门的牌位。',
    type: 'sect',
    connections: {
      south: 'qingyun_gate',
      east: 'training_ground',
    },
    mapX: 5,
    mapY: 4,
    icon: '殿',
    color: '#9070c0',
  },

  training_ground: {
    id: 'training_ground',
    name: '演武场',
    description: '青云派弟子练武之地，地面铺着青石板，四周竹林环绕。',
    type: 'sect',
    connections: {
      west: 'qingyun_hall',
      south: 'mountain_path',
    },
    mapX: 6,
    mapY: 4,
    icon: '武',
    color: '#9070c0',
  },

  mountain_foot: {
    id: 'mountain_foot',
    name: '山脚',
    description: '青云山脚下，官道从这里通往远方。',
    type: 'wild',
    connections: {
      north: 'qingyun_gate',
      east: 'forest_path',
      south: 'official_road',
    },
    mapX: 5,
    mapY: 6,
    icon: '道',
    color: '#7a6838',
  },

  mountain_path: {
    id: 'mountain_path',
    name: '山间小径',
    description: '蜿蜒的山路，两旁竹林摇曳，偶尔传来鸟鸣。',
    type: 'wild',
    connections: {
      west: 'qingyun_gate',
      north: 'training_ground',
      east: 'forest_entrance',
      south: 'forest_path',
    },
    mapX: 6,
    mapY: 5,
    icon: '径',
    color: '#5a7a38',
  },

  // 密林区域
  forest_path: {
    id: 'forest_path',
    name: '林间小路',
    description: '通往密林的小路，树木渐渐茂密。',
    type: 'wild',
    connections: {
      north: 'mountain_path',
      west: 'mountain_foot',
      northeast: 'forest_entrance',
    },
    mapX: 6,
    mapY: 6,
    icon: '林',
    color: '#3a5a20',
  },

  forest_entrance: {
    id: 'forest_entrance',
    name: '密林入口',
    description: '茂密的树林，光线昏暗。远处传来打斗声和呼救声！',
    type: 'wild',
    connections: {
      west: 'mountain_path',
      southwest: 'forest_path',
      east: 'deep_forest',
    },
    mapX: 7,
    mapY: 5,
    scenarioId: 'forest_entrance',
    icon: '林',
    color: '#3a5a20',
  },

  deep_forest: {
    id: 'deep_forest',
    name: '密林深处',
    description: '林中更加幽深，一名白衣书生被山贼围攻！',
    type: 'wild',
    connections: {
      west: 'forest_entrance',
      south: 'forest_clearing',
    },
    mapX: 8,
    mapY: 5,
    scenarioId: 'forest_rescue',
    icon: '林',
    color: '#3a5a20',
  },

  forest_clearing: {
    id: 'forest_clearing',
    name: '林中空地',
    description: '一片开阔的空地，阳光透过树叶洒下斑驳的光影。',
    type: 'wild',
    connections: {
      north: 'deep_forest',
      southwest: 'official_road',
    },
    mapX: 8,
    mapY: 6,
    icon: '地',
    color: '#5a7a38',
  },

  // 官道区域
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
    description: '官道上的驿站，可以休息补给。',
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

  // 苍梧城区域
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
    description: '苍梧城中心广场，四周店铺林立。',
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

// 方向显示名称
export const DIRECTION_NAMES: Record<string, string> = {
  north: '北',
  south: '南',
  east: '东',
  west: '西',
  northeast: '东北',
  northwest: '西北',
  southeast: '东南',
  southwest: '西南',
}

// 方向键盘映射
export const DIRECTION_KEYS: Record<string, string> = {
  north: 'W',
  south: 'S',
  east: 'D',
  west: 'A',
  northeast: 'E',
  northwest: 'Q',
  southeast: 'C',
  southwest: 'Z',
}

// 初始化世界图
export function buildWorldGraph(): WorldGraph {
  return {
    nodes: WORLD_NODES,
    currentNodeId: 'qingyun_gate',
    visitedNodes: new Set(['qingyun_gate']),
    dynamicBlocks: new Map(),
  }
}

// Made with Bob
