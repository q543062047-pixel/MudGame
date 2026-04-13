/**
 * 路径查找算法
 * 职责：BFS、可见性计算等图算法
 */

import type { MapNode, Direction8 } from '@/types'

export interface BFSNode {
  nodeId: string
  distance: number
  path?: string[]
}

/**
 * 广度优先搜索（BFS）
 * @param startNodeId 起始节点ID
 * @param allNodes 所有节点映射
 * @param maxDistance 最大搜索距离
 * @returns 可达节点列表
 */
export function bfsSearch(
  startNodeId: string,
  allNodes: Record<string, MapNode>,
  maxDistance: number
): BFSNode[] {
  const result: BFSNode[] = []
  const visited = new Set<string>()
  const queue: BFSNode[] = [{ nodeId: startNodeId, distance: 0 }]

  visited.add(startNodeId)

  while (queue.length > 0) {
    const current = queue.shift()!
    const node = allNodes[current.nodeId]

    if (!node) continue

    result.push(current)

    // 如果还没到达最大距离，继续探索
    if (current.distance < maxDistance) {
      Object.values(node.connections).forEach((targetId) => {
        if (!visited.has(targetId)) {
          visited.add(targetId)
          queue.push({
            nodeId: targetId,
            distance: current.distance + 1,
          })
        }
      })
    }
  }

  return result
}

/**
 * 查找两个节点之间的最短路径
 * @param startId 起始节点
 * @param endId 目标节点
 * @param allNodes 所有节点
 * @returns 路径（节点ID数组），如果不可达返回null
 */
export function findShortestPath(
  startId: string,
  endId: string,
  allNodes: Record<string, MapNode>
): string[] | null {
  if (startId === endId) return [startId]

  const visited = new Set<string>()
  const queue: Array<{ nodeId: string; path: string[] }> = [
    { nodeId: startId, path: [startId] },
  ]

  visited.add(startId)

  while (queue.length > 0) {
    const { nodeId, path } = queue.shift()!
    const node = allNodes[nodeId]

    if (!node) continue

    // 检查所有相邻节点
    for (const targetId of Object.values(node.connections)) {
      if (targetId === endId) {
        return [...path, targetId]
      }

      if (!visited.has(targetId)) {
        visited.add(targetId)
        queue.push({
          nodeId: targetId,
          path: [...path, targetId],
        })
      }
    }
  }

  return null // 不可达
}

/**
 * 检查两个节点是否直接相连
 */
export function areNodesConnected(
  nodeId1: string,
  nodeId2: string,
  allNodes: Record<string, MapNode>
): boolean {
  const node1 = allNodes[nodeId1]
  if (!node1) return false

  return Object.values(node1.connections).includes(nodeId2)
}

/**
 * 获取节点之间的连接方向
 */
export function getConnectionDirection(
  fromNodeId: string,
  toNodeId: string,
  allNodes: Record<string, MapNode>
): Direction8 | null {
  const fromNode = allNodes[fromNodeId]
  if (!fromNode) return null

  const entry = Object.entries(fromNode.connections).find(
    ([_, targetId]) => targetId === toNodeId
  )

  return entry ? (entry[0] as Direction8) : null
}

// Made with Bob
