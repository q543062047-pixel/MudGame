import { usePlayerStore } from '@/stores/player'
import { useGameStore } from '@/stores/game'
import { useWorldStore } from '@/stores/world'
import type { SaveData } from '@/types'

const SAVE_KEY = 'wuxia_game_save'

/**
 * 游戏存档系统
 * 提供保存、读取、查询存档功能
 */
export function useSave() {
  const playerStore = usePlayerStore()
  const gameStore = useGameStore()
  const worldStore = useWorldStore()

  /**
   * 保存游戏
   */
  function save(): boolean {
    try {
      console.log('=== 开始保存游戏 ===')
      console.log('当前节点ID:', worldStore.currentNodeId)
      
      const saveData: SaveData = {
        id: `save_${Date.now()}`,
        name: `存档 ${new Date().toLocaleString('zh-CN')}`,
        timestamp: Date.now(),
        character: JSON.parse(JSON.stringify(playerStore.character)),
        currentNodeId: worldStore.currentNodeId,
        flags: JSON.parse(JSON.stringify(gameStore.flags)),
        counters: JSON.parse(JSON.stringify(gameStore.counters)),
        gameTime: gameStore.gameDay
      }
      
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData))
      console.log('保存成功！', saveData)
      return true
    } catch (e) {
      console.error('保存失败:', e)
      return false
    }
  }

  /**
   * 读取游戏
   */
  function load(): boolean {
    try {
      console.log('=== 开始读取游戏 ===')
      const json = localStorage.getItem(SAVE_KEY)
      if (!json) {
        console.log('没有找到存档')
        return false
      }

      const saveData: SaveData = JSON.parse(json)
      console.log('读取到存档:', saveData)

      // 恢复角色数据
      playerStore.character = JSON.parse(JSON.stringify(saveData.character))
      
      // 恢复游戏状态
      gameStore.flags = JSON.parse(JSON.stringify(saveData.flags))
      gameStore.counters = JSON.parse(JSON.stringify(saveData.counters || {}))
      gameStore.gameDay = saveData.gameTime
      gameStore.setPhase('story')
      
      // 恢复地图位置 - 直接设置，不使用 teleportTo（它要求节点已访问）
      worldStore.reset()
      // 直接修改 graph 的 currentNodeId
      worldStore.graph.currentNodeId = saveData.currentNodeId
      // 标记为已访问
      worldStore.graph.visitedNodes.add(saveData.currentNodeId)
      
      console.log('读档完成，当前节点:', worldStore.currentNodeId)
      return true
    } catch (e) {
      console.error('读档失败:', e)
      return false
    }
  }

  /**
   * 获取存档信息（用于显示）
   */
  function getSaveInfo(): SaveData | null {
    try {
      const json = localStorage.getItem(SAVE_KEY)
      if (!json) return null
      return JSON.parse(json)
    } catch {
      return null
    }
  }

  /**
   * 检查是否有存档
   */
  function hasSave(): boolean {
    return !!localStorage.getItem(SAVE_KEY)
  }

  /**
   * 删除存档
   */
  function deleteSave(): void {
    localStorage.removeItem(SAVE_KEY)
  }

  return {
    save,
    load,
    getSaveInfo,
    hasSave,
    deleteSave
  }
}

// Made with Bob
