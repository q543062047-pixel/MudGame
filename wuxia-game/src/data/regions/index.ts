import type { MapNode } from '@/types'
import { QINGYUN_REGION } from './qingyun'
import { FOREST_REGION } from './forest'
import { ROAD_REGION } from './road'
import { CITY_REGION } from './city'
import { OTHER_REGIONS } from './other'

/**
 * 区域注册表
 * 添加新区域时，在这里导入并注册
 */
export const REGIONS = {
  qingyun: QINGYUN_REGION,
  forest: FOREST_REGION,
  road: ROAD_REGION,
  city: CITY_REGION,
  other: OTHER_REGIONS,
} as const

/**
 * 合并所有区域的节点
 */
export function getAllNodes(): Record<string, MapNode> {
  return {
    ...QINGYUN_REGION,
    ...FOREST_REGION,
    ...ROAD_REGION,
    ...CITY_REGION,
    ...OTHER_REGIONS,
  }
}

/**
 * 获取指定区域的节点
 */
export function getRegionNodes(regionName: keyof typeof REGIONS): Record<string, MapNode> {
  return REGIONS[regionName]
}

/**
 * 获取所有区域名称
 */
export function getRegionNames(): string[] {
  return Object.keys(REGIONS)
}

// Made with Bob
