import type { MapNode, WorldGraph } from '@/types'
import { getAllNodes } from './regions'

/**
 * 世界地图节点定义
 * 现在从各个区域文件中导入，便于管理和扩展
 * 
 * 区域文件位置：src/data/regions/
 * - qingyun.ts: 青云派区域
 * - forest.ts: 密林区域
 * - road.ts: 官道区域
 * - city.ts: 苍梧城区域
 * - other.ts: 其他区域（湖泊、西部等）
 * 
 * 添加新区域的步骤：
 * 1. 在 src/data/regions/ 目录下创建新的区域文件
 * 2. 在 src/data/regions/index.ts 中导入并注册新区域
 * 3. 新区域会自动合并到世界地图中
 */
export const WORLD_NODES: Record<string, MapNode> = getAllNodes()

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
