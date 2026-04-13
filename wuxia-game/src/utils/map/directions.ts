/**
 * 方向工具函数
 * 职责：处理8方向的转换、验证、反向查找
 */

import type { Direction8 } from '@/types'

export const DIRECTION_NAMES: Record<Direction8, string> = {
  north: '北',
  south: '南',
  east: '东',
  west: '西',
  northeast: '东北',
  northwest: '西北',
  southeast: '东南',
  southwest: '西南',
}

export const DIRECTION_KEYS: Record<Direction8, string> = {
  north: 'W',
  south: 'S',
  east: 'D',
  west: 'A',
  northeast: 'E',
  northwest: 'Q',
  southeast: 'C',
  southwest: 'Z',
}

const REVERSE_DIRECTION_MAP: Record<Direction8, Direction8> = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
  northeast: 'southwest',
  southwest: 'northeast',
  northwest: 'southeast',
  southeast: 'northwest',
}

/**
 * 获取反向方向
 */
export function getReverseDirection(direction: Direction8): Direction8 {
  return REVERSE_DIRECTION_MAP[direction]
}

/**
 * 根据坐标差计算方向
 */
export function getDirectionFromDelta(dx: number, dy: number): Direction8 | null {
  if (dx === 0 && dy < 0) return 'north'
  if (dx === 0 && dy > 0) return 'south'
  if (dx > 0 && dy === 0) return 'east'
  if (dx < 0 && dy === 0) return 'west'
  if (dx > 0 && dy < 0) return 'northeast'
  if (dx < 0 && dy < 0) return 'northwest'
  if (dx > 0 && dy > 0) return 'southeast'
  if (dx < 0 && dy > 0) return 'southwest'
  return null
}

/**
 * 验证是否为有效方向
 */
export function isValidDirection(dir: string): dir is Direction8 {
  return dir in DIRECTION_NAMES
}

// Made with Bob
