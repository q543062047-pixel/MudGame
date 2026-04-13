/**
 * 节点可见性计算
 * 职责：使用BFS算法计算可见范围内的节点
 */

import { computed, type Ref } from 'vue'
import type { MapNode } from '@/types'
import { bfsSearch } from '@/utils/map/pathfinding'
import { mapToScreen } from '@/utils/map/coordinates'
import { MAP_RENDER_CONFIG } from '@/constants/map'

export interface VisibleNode extends MapNode {
  x: number
  y: number
  distance: number
}

export interface UseNodeVisibilityOptions {
  visibilityRange?: number
  gridSize?: number
  centerX?: number
  centerY?: number
}

/**
 * 计算可见节点
 */
export function useNodeVisibility(
  currentNode: Ref<MapNode | null>,
  allNodes: Record<string, MapNode>,
  options: UseNodeVisibilityOptions = {}
) {
  const {
    visibilityRange = MAP_RENDER_CONFIG.VISIBILITY_RANGE,
    gridSize = MAP_RENDER_CONFIG.GRID_SIZE,
    centerX = MAP_RENDER_CONFIG.CENTER_X,
    centerY = MAP_RENDER_CONFIG.CENTER_Y,
  } = options

  /**
   * 计算可见节点列表（包含屏幕坐标）
   */
  const visibleNodes = computed<VisibleNode[]>(() => {
    const current = currentNode.value
    if (!current) return []

    // 使用BFS查找可见范围内的节点
    const bfsResult = bfsSearch(current.id, allNodes, visibilityRange)

    // 转换为包含屏幕坐标的节点
    return bfsResult.map(({ nodeId, distance }) => {
      const node = allNodes[nodeId]
      
      // 计算屏幕坐标
      const screenPos = mapToScreen(
        { mapX: node.mapX, mapY: node.mapY },
        { mapX: current.mapX, mapY: current.mapY },
        gridSize,
        { x: centerX, y: centerY }
      )

      return {
        ...node,
        x: screenPos.x,
        y: screenPos.y,
        distance,
      }
    })
  })

  /**
   * 检查节点是否可见
   */
  const isNodeVisible = (nodeId: string): boolean => {
    return visibleNodes.value.some(n => n.id === nodeId)
  }

  /**
   * 获取节点的屏幕坐标
   */
  const getNodeScreenPosition = (nodeId: string) => {
    const node = visibleNodes.value.find(n => n.id === nodeId)
    return node ? { x: node.x, y: node.y } : null
  }

  return {
    visibleNodes,
    isNodeVisible,
    getNodeScreenPosition,
  }
}

// Made with Bob
