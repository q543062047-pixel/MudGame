import type { Sect } from '@/types'

/**
 * 门派系统
 * 定义各个门派的属性、技能、声望等级等
 */

/**
 * 门派配置
 */
export const SECTS: Record<string, Sect> = {
  qingyun: {
    id: 'qingyun',
    name: '青云派',
    description: '名门正派，以剑法闻名江湖。讲究以柔克刚，剑气纵横。',
    type: 'righteous',
    location: 'qingyun_gate',
    
    // 门派属性加成
    attributes: {
      hp: 10,
      mp: 15,
      attack: 5,
      defense: 3,
      speed: 7,
    },
    
    // 门派特色技能
    skills: [
      'basic_strike',
      'cloud_slash',
      'wind_step',
    ],
    
    // 声望等级
    reputationLevels: [
      { level: 0, title: '外门弟子', minReputation: 0 },
      { level: 1, title: '内门弟子', minReputation: 100 },
      { level: 2, title: '精英弟子', minReputation: 300 },
      { level: 3, title: '真传弟子', minReputation: 600 },
      { level: 4, title: '长老', minReputation: 1000 },
      { level: 5, title: '掌门', minReputation: 2000 },
    ],
    
    // 门派商店（特殊物品）
    shopItems: [
      { itemId: 'healing_pill_2', price: 50, requiredReputation: 0 },
      { itemId: 'mp_pill', price: 60, requiredReputation: 100 },
    ],
    
    color: '#9070c0',
    icon: '剑',
  },

  badao: {
    id: 'badao',
    name: '霸刀帮',
    description: '江湖邪派，以刀法凶狠著称。行事霸道，不择手段。',
    type: 'evil',
    location: 'city_square',
    
    attributes: {
      hp: 15,
      mp: 5,
      attack: 10,
      defense: 5,
      speed: 5,
    },
    
    skills: [
      'heavy_slash',
      'blood_strike',
      'rage_mode',
    ],
    
    reputationLevels: [
      { level: 0, title: '外围成员', minReputation: 0 },
      { level: 1, title: '正式帮众', minReputation: 100 },
      { level: 2, title: '小头目', minReputation: 300 },
      { level: 3, title: '堂主', minReputation: 600 },
      { level: 4, title: '护法', minReputation: 1000 },
      { level: 5, title: '帮主', minReputation: 2000 },
    ],
    
    shopItems: [
      { itemId: 'healing_pill', price: 40, requiredReputation: 0 },
    ],
    
    color: '#8b0000',
    icon: '刀',
  },

  wulin: {
    id: 'wulin',
    name: '武林盟',
    description: '江湖正道联盟，维护武林秩序。汇聚各派高手，共抗邪魔。',
    type: 'neutral',
    location: 'city_inn',
    
    attributes: {
      hp: 12,
      mp: 10,
      attack: 7,
      defense: 6,
      speed: 5,
    },
    
    skills: [
      'basic_strike',
      'iron_defense',
      'swift_counter',
    ],
    
    reputationLevels: [
      { level: 0, title: '江湖新人', minReputation: 0 },
      { level: 1, title: '小有名气', minReputation: 200 },
      { level: 2, title: '江湖豪杰', minReputation: 500 },
      { level: 3, title: '武林高手', minReputation: 1000 },
      { level: 4, title: '一代宗师', minReputation: 2000 },
      { level: 5, title: '盟主', minReputation: 5000 },
    ],
    
    shopItems: [
      { itemId: 'healing_pill_2', price: 55, requiredReputation: 200 },
      { itemId: 'mp_pill', price: 65, requiredReputation: 200 },
    ],
    
    color: '#d4af37',
    icon: '盟',
  },

  none: {
    id: 'none',
    name: '无门无派',
    description: '独行侠，不受门派约束。自由自在，但也缺少门派庇护。',
    type: 'neutral',
    location: '',
    
    attributes: {
      hp: 8,
      mp: 8,
      attack: 6,
      defense: 4,
      speed: 6,
    },
    
    skills: [
      'basic_strike',
    ],
    
    reputationLevels: [
      { level: 0, title: '无名小卒', minReputation: 0 },
      { level: 1, title: '江湖浪人', minReputation: 150 },
      { level: 2, title: '独行侠', minReputation: 400 },
      { level: 3, title: '游侠', minReputation: 800 },
      { level: 4, title: '侠客', minReputation: 1500 },
      { level: 5, title: '大侠', minReputation: 3000 },
    ],
    
    shopItems: [],
    
    color: '#808080',
    icon: '侠',
  },
}

/**
 * 获取门派信息
 */
export function getSect(sectId: string): Sect | undefined {
  return SECTS[sectId]
}

/**
 * 获取所有门派
 */
export function getAllSects(): Sect[] {
  return Object.values(SECTS)
}

/**
 * 获取正派门派
 */
export function getRighteousSects(): Sect[] {
  return Object.values(SECTS).filter(s => s.type === 'righteous')
}

/**
 * 获取邪派门派
 */
export function getEvilSects(): Sect[] {
  return Object.values(SECTS).filter(s => s.type === 'evil')
}

/**
 * 获取中立门派
 */
export function getNeutralSects(): Sect[] {
  return Object.values(SECTS).filter(s => s.type === 'neutral')
}

/**
 * 根据声望获取门派等级
 */
export function getSectLevel(sect: Sect, reputation: number): number {
  for (let i = sect.reputationLevels.length - 1; i >= 0; i--) {
    if (reputation >= sect.reputationLevels[i].minReputation) {
      return sect.reputationLevels[i].level
    }
  }
  return 0
}

/**
 * 根据声望获取门派称号
 */
export function getSectTitle(sect: Sect, reputation: number): string {
  for (let i = sect.reputationLevels.length - 1; i >= 0; i--) {
    if (reputation >= sect.reputationLevels[i].minReputation) {
      return sect.reputationLevels[i].title
    }
  }
  return sect.reputationLevels[0].title
}

// Made with Bob
