import { ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'
import { useWorldStore } from '@/stores/world'
import type { SaveData } from '@/types'

const SAVE_KEY_PREFIX = 'wuxia_save_slot_'
const MAX_SLOTS = 3

export interface SaveSlot {
  id: number
  data: SaveData | null
  isEmpty: boolean
}

export function useSaveSlots() {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const worldStore = useWorldStore()

  const slots = ref<SaveSlot[]>([])

  // 初始化存档槽
  function initSlots() {
    slots.value = []
    for (let i = 1; i <= MAX_SLOTS; i++) {
      const data = loadSlot(i)
      slots.value.push({
        id: i,
        data,
        isEmpty: !data
      })
    }
  }

  // 加载指定槽位
  function loadSlot(slotId: number): SaveData | null {
    try {
      const json = localStorage.getItem(`${SAVE_KEY_PREFIX}${slotId}`)
      if (!json) return null
      return JSON.parse(json) as SaveData
    } catch (e) {
      console.error(`Failed to load slot ${slotId}:`, e)
      return null
    }
  }

  // 保存到指定槽位
  function saveToSlot(slotId: number, saveName?: string): boolean {
    try {
      const saveData: SaveData = {
        id: `slot_${slotId}_${Date.now()}`,
        name: saveName || `存档 ${slotId}`,
        timestamp: Date.now(),
        character: { ...playerStore.character },
        currentNodeId: gameStore.currentNodeId,
        flags: { ...gameStore.flags },
        gameTime: gameStore.gameDay
      }
      
      localStorage.setItem(`${SAVE_KEY_PREFIX}${slotId}`, JSON.stringify(saveData))
      initSlots() // 刷新槽位列表
      return true
    } catch (e) {
      console.error(`Failed to save to slot ${slotId}:`, e)
      return false
    }
  }

  // 从指定槽位读档
  function loadFromSlot(slotId: number): boolean {
    const data = loadSlot(slotId)
    if (!data) return false

    try {
      // 恢复角色状态
      playerStore.character = { ...data.character }
      
      // 恢复游戏状态
      gameStore.currentNodeId = data.currentNodeId
      gameStore.flags = { ...data.flags }
      gameStore.gameDay = data.gameTime
      gameStore.setPhase('story')
      
      // 恢复地图位置（节点式地图）
      // 使用 teleportTo 方法而不是直接赋值
      worldStore.teleportTo(data.currentNodeId)
      
      return true
    } catch (e) {
      console.error(`Failed to load from slot ${slotId}:`, e)
      return false
    }
  }

  // 删除指定槽位
  function deleteSlot(slotId: number): boolean {
    try {
      localStorage.removeItem(`${SAVE_KEY_PREFIX}${slotId}`)
      initSlots()
      return true
    } catch (e) {
      console.error(`Failed to delete slot ${slotId}:`, e)
      return false
    }
  }

  // 格式化时间戳
  function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 初始化
  initSlots()

  return {
    slots,
    saveToSlot,
    loadFromSlot,
    deleteSlot,
    formatTimestamp,
    initSlots
  }
}

// Made with Bob
