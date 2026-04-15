import type { MapNode } from '@/types'

/**
 * 青云派区域
 * 包含：青云山门、青云大殿、演武场、山脚、山间小径
 */
export const QINGYUN_REGION: Record<string, MapNode> = {
  qingyun_gate: {
    id: 'qingyun_gate',
    name: '青云山门',
    description: '青云派山门，石阶蜿蜒而上，两侧古松参天。门前立着两尊石狮，威武庄严。守山弟子在此值守。',
    type: 'sect',
    connections: {
      north: 'qingyun_hall',
      east: 'mountain_path',
      south: 'mountain_foot',
    },
    mapX: 5,
    mapY: 5,
    stories: [
      {
        storyId: 'qingyun_gate_intro',
        trigger: 'first_visit',
        priority: 1,
        maxTriggers: 1
      },
      {
        storyId: 'follow_up_story',
        trigger: 'conditional',
        condition: {
          type: 'flag',
          flag: 'qingyun_gate_intro_completed'
        },
        priority: 2,
        maxTriggers: 1
      }
    ],
    icon: '观',
    color: '#9070c0',
  },

  qingyun_hall: {
    id: 'qingyun_hall',
    name: '青云大殿',
    description: '青云派主殿，殿内供奉着历代掌门的牌位。清风道长正在此处等候。',
    type: 'sect',
    connections: {
      south: 'qingyun_gate',
      east: 'training_ground',
    },
    mapX: 5,
    mapY: 4,
    stories: [
      {
        storyId: 'join_qingyun_sect',
        trigger: 'first_visit',
        priority: 1,
        maxTriggers: 1
      }
    ],
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
    stories: [
      {
        storyId: 'daily_training',
        trigger: 'auto',
        priority: 1,
        maxTriggers: 3
      }
    ],
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
}

// Made with Bob
