import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WorldGraph, MapNode, Direction8, PathBlock } from '@/types'
import { buildWorldGraph } from '@/data/worldGraph'

export const useWorldStore = defineStore('world', () => {
  const graph = ref<WorldGraph>(buildWorldGraph())

  const currentNodeId = computed(() => graph.value.currentNodeId)
  
  const currentNode = computed<MapNode | null>(() => {
    return graph.value.nodes[graph.value.currentNodeId] || null
  })

  const visitedNodes = computed(() => graph.value.visitedNodes)

  // 获取当前节点可用的方向
  const availableDirections = computed(() => {
    const node = currentNode.value
    if (!node) return []
    return Object.entries(node.connections).map(([dir, targetId]) => ({
      direction: dir as Direction8,
      targetId,
      targetNode: graph.value.nodes[targetId],
    }))
  })

  // ── 动态阻挡系统 ──────────────────────────────

  // 阻挡某个方向的路径
  function blockPath(nodeId: string, direction: Direction8, block: PathBlock): void {
    if (!graph.value.dynamicBlocks.has(nodeId)) {
      graph.value.dynamicBlocks.set(nodeId, {})
    }
    const nodeBlocks = graph.value.dynamicBlocks.get(nodeId)!
    nodeBlocks[direction] = block
  }

  // 解除阻挡
  function unblockPath(nodeId: string, direction: Direction8): void {
    const nodeBlocks = graph.value.dynamicBlocks.get(nodeId)
    if (nodeBlocks && nodeBlocks[direction]) {
      delete nodeBlocks[direction]
    }
  }

  // 检查路径是否被阻挡
  function isPathBlocked(
    nodeId: string,
    direction: Direction8
  ): { blocked: boolean; block?: PathBlock } {
    const nodeBlocks = graph.value.dynamicBlocks.get(nodeId)
    const block = nodeBlocks?.[direction]

    if (!block || !block.blocked) {
      return { blocked: false }
    }

    // 检查是否满足通过条件
    if (block.requiredFlag) {
      // TODO: 需要player store的hasFlag方法
      // const playerStore = usePlayerStore()
      // if (playerStore.hasFlag(block.requiredFlag)) {
      //   return { blocked: false }
      // }
    }

    if (block.requiredItem) {
      // TODO: 需要player store的hasItem方法
      // const playerStore = usePlayerStore()
      // if (playerStore.hasItem(block.requiredItem)) {
      //   return { blocked: false }
      // }
    }

    return { blocked: true, block }
  }

  // 尝试向某个方向移动
  function tryMove(direction: Direction8): {
    moved: boolean
    node: MapNode | null
    blocked?: boolean
    blockReason?: string
  } {
    const node = currentNode.value
    if (!node) return { moved: false, node: null }

    const targetId = node.connections[direction]
    if (!targetId) return { moved: false, node: null }

    // 检查是否被阻挡
    const blockCheck = isPathBlocked(node.id, direction)
    if (blockCheck.blocked) {
      return {
        moved: false,
        node: null,
        blocked: true,
        blockReason: blockCheck.block?.onBlockMessage || blockCheck.block?.reason,
      }
    }

    const targetNode = graph.value.nodes[targetId]
    if (!targetNode) return { moved: false, node: null }

    // 移动成功
    graph.value.currentNodeId = targetId
    graph.value.visitedNodes.add(targetId)

    return { moved: true, node: targetNode }
  }

  // 直接传送到某个节点（用于小地图点击）
  function teleportTo(nodeId: string): boolean {
    // 只能传送到已访问的节点
    if (!graph.value.visitedNodes.has(nodeId)) return false
    
    const targetNode = graph.value.nodes[nodeId]
    if (!targetNode) return false

    graph.value.currentNodeId = nodeId
    return true
  }

  // 检查节点是否已访问
  function isVisited(nodeId: string): boolean {
    return graph.value.visitedNodes.has(nodeId)
  }

  // 获取所有已访问的节点
  function getVisitedNodesList(): MapNode[] {
    return Array.from(graph.value.visitedNodes)
      .map(id => graph.value.nodes[id])
      .filter(Boolean)
  }

  function reset() {
    graph.value = buildWorldGraph()
  }

  return {
    graph,
    currentNodeId,
    currentNode,
    visitedNodes,
    availableDirections,
    tryMove,
    teleportTo,
    isVisited,
    getVisitedNodesList,
    reset,
    // 动态阻挡方法
    blockPath,
    unblockPath,
    isPathBlocked,
  }
})

// Made with Bob
