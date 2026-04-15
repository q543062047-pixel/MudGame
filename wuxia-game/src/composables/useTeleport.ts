import { computed, ref } from 'vue'
import { useWorldStore } from '@/stores/world'
import { usePlayerStore } from '@/stores/player'
import { useGameStore } from '@/stores/game'
import type { TeleportPoint } from '@/types'

// 全局共享的传送点状态（单例模式）
const globalTeleportPoints = ref<TeleportPoint[]>([])

/**
 * 传送系统 Composable
 * 管理地图节点之间的快速传送（通过NPC提供的乘车服务）
 */
export function useTeleport() {
  const worldStore = useWorldStore()
  const playerStore = usePlayerStore()
  const gameStore = useGameStore()

  // 使用全局共享的传送点
  const currentTeleportPoints = globalTeleportPoints

  /**
   * 设置当前可用的传送点（从NPC获取）
   */
  function setTeleportPoints(points: TeleportPoint[]) {
    globalTeleportPoints.value = points
    console.log('[Teleport] 设置传送点:', points)
  }

  /**
   * 清空传送点
   */
  function clearTeleportPoints() {
    globalTeleportPoints.value = []
    console.log('[Teleport] 清空传送点')
  }

  /**
   * 获取可用的传送点（满足条件的）
   */
  const availableTeleportPoints = computed((): TeleportPoint[] => {
    return currentTeleportPoints.value.filter(point => canTeleport(point))
  })

  /**
   * 检查是否可以使用传送点
   */
  function canTeleport(point: TeleportPoint): boolean {
    const player = playerStore.character

    // 检查目标节点是否存在
    if (!worldStore.graph.nodes[point.targetNodeId]) {
      console.error(`[Teleport] 目标节点不存在: ${point.targetNodeId}`)
      return false
    }

    // 检查是否到达过目标地点（必须先去过才能乘车前往）
    if (!worldStore.isVisited(point.targetNodeId)) {
      return false
    }

    // 检查金钱
    if (point.cost && player.gold < point.cost) {
      return false
    }

    // 检查标志位
    if (point.requiredFlag && !gameStore.hasFlag(point.requiredFlag)) {
      return false
    }

    // 检查物品
    if (point.requiredItem && !player.inventory.some(i => i.id === point.requiredItem)) {
      return false
    }

    // 检查声望
    if (point.requiredReputation && player.reputation < point.requiredReputation) {
      return false
    }

    return true
  }

  /**
   * 获取传送点不可用的原因
   */
  function getTeleportBlockReason(point: TeleportPoint): string | null {
    const player = playerStore.character

    // 检查目标节点是否存在
    if (!worldStore.graph.nodes[point.targetNodeId]) {
      return '目的地不存在'
    }

    // 检查是否到达过目标地点
    if (!worldStore.isVisited(point.targetNodeId)) {
      const targetNode = worldStore.graph.nodes[point.targetNodeId]
      return `尚未到达过${targetNode?.name || '该地'}，无法乘车前往`
    }

    // 检查金钱
    if (point.cost && player.gold < point.cost) {
      return `需要 ${point.cost} 两银子`
    }

    // 检查标志位
    if (point.requiredFlag && !gameStore.hasFlag(point.requiredFlag)) {
      return '尚未解锁此路线'
    }

    // 检查物品
    if (point.requiredItem) {
      const item = player.inventory.find(i => i.id === point.requiredItem)
      if (!item) {
        return `需要物品：${point.requiredItem}`
      }
    }

    // 检查声望
    if (point.requiredReputation && player.reputation < point.requiredReputation) {
      return `需要声望：${point.requiredReputation}`
    }

    return null
  }

  /**
   * 执行传送
   */
  function teleport(point: TeleportPoint): boolean {
    if (!canTeleport(point)) {
      const reason = getTeleportBlockReason(point)
      console.warn(`[Teleport] 无法传送: ${reason}`)
      return false
    }

    // 扣除费用
    if (point.cost) {
      playerStore.changeGold(-point.cost)
      console.log(`[Teleport] 支付传送费用: ${point.cost} 两`)
    }

    // 执行传送（直接修改 currentNodeId，因为传送不受已访问限制）
    worldStore.graph.currentNodeId = point.targetNodeId
    
    // 标记已访问
    worldStore.graph.visitedNodes.add(point.targetNodeId)

    // 设置传送标志
    gameStore.setFlag(`teleported_to_${point.targetNodeId}`)

    console.log(`[Teleport] 乘车成功: ${point.name} -> ${point.targetNodeId}`)
    return true
  }

  return {
    // 状态
    currentTeleportPoints,
    availableTeleportPoints,

    // 方法
    setTeleportPoints,
    clearTeleportPoints,
    canTeleport,
    getTeleportBlockReason,
    teleport,
  }
}

// Made with Bob
