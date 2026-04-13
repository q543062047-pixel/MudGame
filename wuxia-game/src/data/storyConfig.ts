/**
 * 剧情配置文件
 * 统一管理剧情节点和地图位置的绑定关系
 */

export interface StoryLocation {
  x: number
  y: number
  name: string
  scenarioId: string
  triggerOnce?: boolean
  hasNpc?: boolean
  description?: string
}

/**
 * 剧情地点配置
 * 将剧情节点和地图位置绑定在一起，便于维护
 */
export const STORY_LOCATIONS: StoryLocation[] = [
  // ========== 青云山区域 ==========
  {
    x: 2,
    y: 2,
    name: '青云山',
    scenarioId: 'start',
    triggerOnce: true,
    hasNpc: true,
    description: '青云门所在地，你的起点'
  },
  {
    x: 2,
    y: 3,
    name: '山门出口',
    scenarioId: 'mountain_exit',
    triggerOnce: true,
    description: '离开青云山，踏上江湖之路'
  },

  // ========== 密林区域 ==========
  {
    x: 3,
    y: 1,
    name: '密林入口',
    scenarioId: 'forest_entrance',
    triggerOnce: true,
    description: '幽深的密林，传来打斗声'
  },
  {
    x: 4,
    y: 1,
    name: '密林深处',
    scenarioId: 'forest_rescue',
    triggerOnce: true,
    description: '书生被山贼围攻的地方'
  },

  // ========== 苍梧城区域 ==========
  {
    x: 9,
    y: 1,
    name: '苍梧城门',
    scenarioId: 'city_gate',
    triggerOnce: true,
    hasNpc: true,
    description: '繁华的苍梧城入口'
  },
  {
    x: 9,
    y: 2,
    name: '苍梧城内',
    scenarioId: 'city_inside',
    triggerOnce: true,
    hasNpc: true,
    description: '城内街道，人来人往'
  },

  // ========== 城内地点 ==========
  {
    x: 9,
    y: 4,
    name: '山中客栈',
    scenarioId: 'inn_entrance',
    triggerOnce: true,
    hasNpc: true,
    description: '可以休息的客栈'
  },
  {
    x: 9,
    y: 6,
    name: '百草堂',
    scenarioId: 'herbal_shop',
    triggerOnce: true,
    hasNpc: true,
    description: '药香四溢的药铺'
  },
  {
    x: 10,
    y: 3,
    name: '醉仙楼',
    scenarioId: 'tavern_arrive',
    triggerOnce: true,
    hasNpc: true,
    description: '寻找无名客的地方'
  },

  // ========== 其他地点 ==========
  {
    x: 12,
    y: 9,
    name: '废弃地牢',
    scenarioId: 'dungeon_entrance',
    triggerOnce: true,
    description: '阴森的废弃地牢'
  }
]

/**
 * 将配置转换为地图元数据格式
 */
export function buildCellMetaFromStory() {
  const meta: Record<string, any> = {}
  
  for (const loc of STORY_LOCATIONS) {
    const key = `${loc.y},${loc.x}`
    meta[key] = {
      name: loc.name,
      scenarioId: loc.scenarioId,
      triggerOnce: loc.triggerOnce ?? true,
      hasNpc: loc.hasNpc ?? false,
      description: loc.description
    }
  }
  
  return meta
}

/**
 * 获取所有剧情节点ID
 */
export function getAllScenarioIds(): Set<string> {
  const ids = new Set<string>()
  
  for (const loc of STORY_LOCATIONS) {
    ids.add(loc.scenarioId)
  }
  
  // 添加战斗相关节点
  ids.add('forest_battle')
  ids.add('rescue_win')
  ids.add('rescue_lose')
  
  return ids
}

/**
 * 根据坐标查找剧情地点
 */
export function findStoryLocation(x: number, y: number): StoryLocation | undefined {
  return STORY_LOCATIONS.find(loc => loc.x === x && loc.y === y)
}

/**
 * 根据节点ID查找地点
 */
export function findLocationByScenario(scenarioId: string): StoryLocation | undefined {
  return STORY_LOCATIONS.find(loc => loc.scenarioId === scenarioId)
}

// Made with Bob
