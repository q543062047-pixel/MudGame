/**
 * 地图连接线计算
 * 职责：计算可见节点之间的连接线坐标
 */

import { computed, type Ref } from 'vue'
import type { VisibleNode } from './useNodeVisibility'
import { getLineEdgePoints } from '@/utils/map/coordinates'
import { MAP_RENDER_CONFIG } from '@/constants/map'

export interface ConnectionLine {
  x1: number
  y1: number
  x2: number
  y2: number
  isActive: boolean
  isBlocked: boolean
}

export interface UseMapConnectionsOptions {
  nodeRadius?: number
}

/**
 * 计算地图连接线
 */
export function useMapConnections(
  visibleNodes: Ref<VisibleNode[]>,
  isVisited: Ref<(nodeId: string) => boolean>,
  isPathBlocked: Ref<(nodeId: string, direction: string) => { blocked: boolean }>,
  options: UseMapConnectionsOptions = {}
) {
  const { nodeRadius = MAP_RENDER_CONFIG.NODE_RADIUS } = options

  /**
   * 计算所有可见的连接线
   */
  const visibleConnections = computed<ConnectionLine[]>(() => {
    const nodes = visibleNodes.value
    if (nodes.length === 0) return []

    const connections: ConnectionLine[] = []
    const nodePositionMap = new Map<string, { x: number; y: number }>()
    
    // 建立节点位置映射
    nodes.forEach(n => {
      nodePositionMap.set(n.id, { x: n.x, y: n.y })
    })

    // 遍历所有可见节点，绘制它们的连接线
    nodes.forEach(node => {
      const sourcePos = nodePositionMap.get(node.id)
      if (!sourcePos) return

      Object.entries(node.connections).forEach(([dir, targetId]) => {
        const targetPos = nodePositionMap.get(targetId)
        if (!targetPos) return

        // 避免重复绘制（只绘制一次）
        const alreadyDrawn = connections.some(c => {
          const isSameLine = 
            (c.x1 === sourcePos.x && c.y1 === sourcePos.y && 
             c.x2 === targetPos.x && c.y2 === targetPos.y) ||
            (c.x1 === targetPos.x && c.y1 === targetPos.y && 
             c.x2 === sourcePos.x && c.y2 === sourcePos.y)
          return isSameLine
        })

        if (alreadyDrawn) return

        // 计算线段在圆边缘的起点和终点
        const edgePoints = getLineEdgePoints(
          sourcePos,
          targetPos,
          nodeRadius
        )

        // 检查是否被阻挡（检查两个方向）
        const blocked1 = isPathBlocked.value(node.id, dir).blocked
        const blocked2 = isPathBlocked.value(targetId, getReverseDirection(dir)).blocked

        connections.push({
          x1: edgePoints.start.x,
          y1: edgePoints.start.y,
          x2: edgePoints.end.x,
          y2: edgePoints.end.y,
          isActive: isVisited.value(targetId) && isVisited.value(node.id),
          isBlocked: blocked1 || blocked2,
        })
      })
    })

    return connections
  })

  return {
    visibleConnections,
  }
}

/**
 * 获取反向方向（辅助函数）
 */
function getReverseDirection(dir: string): string {
  const reverseMap: Record<string, string> = {
    north: 'south',
    south: 'north',
    east: 'west',
    west: 'east',
    northeast: 'southwest',
    southwest: 'northeast',
    northwest: 'southeast',
    southeast: 'northwest',
  }
  return reverseMap[dir] || dir
}

// Made with Bob
