/**
 * 地图相关常量
 * 职责：集中管理地图配置常量
 */

/**
 * 地图渲染配置
 */
export const MAP_RENDER_CONFIG = {
  // 网格大小（像素）
  GRID_SIZE: 120,
  
  // 节点半径（像素）
  NODE_RADIUS: 30,
  
  // 中心点坐标
  CENTER_X: 400,
  CENTER_Y: 300,
  
  // 可见范围（格数）
  VISIBILITY_RANGE: 2,
  
  // SVG视图框
  VIEWBOX: '-100 -150 1000 900',
} as const

/**
 * 节点类型标签
 */
export const NODE_TYPE_LABELS: Record<string, string> = {
  town: '城镇',
  wild: '野外',
  dungeon: '险地',
  special: '特殊',
  sect: '门派',
} as const

/**
 * 动画配置
 */
export const MAP_ANIMATION_CONFIG = {
  // 连接线淡入时间（毫秒）
  CONNECTION_FADE_DURATION: 500,
  
  // 节点移动延迟（毫秒）
  NODE_MOVE_DELAY: 350,
  
  // 节点脉冲动画时间（毫秒）
  NODE_PULSE_DURATION: 2000,
} as const

/**
 * 颜色配置
 */
export const MAP_COLORS = {
  // 连接线颜色
  CONNECTION_INACTIVE: '#3a4a2a',
  CONNECTION_ACTIVE: '#7a9a5a',
  CONNECTION_BLOCKED: '#ff4444',
  
  // 节点颜色
  NODE_CURRENT: '#e0d0a0',
  NODE_VISITED: 'rgba(80, 100, 50, 0.6)',
  NODE_UNVISITED: 'rgba(40, 50, 30, 0.4)',
} as const

// Made with Bob
