import type { MapNode } from '@/types'

/**
 * 密林区域
 * 包含：林间小路、密林入口、密林深处、林中空地
 */
export const FOREST_REGION: Record<string, MapNode> = {
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
    stories: [
      {
        storyId: 'forest_bandit_battle',
        trigger: 'first_visit',
        priority: 1,
        maxTriggers: 1
      }
    ],
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
}

// Made with Bob
