import { usePlayerStore } from '@/stores/player'
import { useGameStore } from '@/stores/game'
import { useWorldStore } from '@/stores/world'
import type { SaveData } from '@/types'

const SAVE_KEY = 'wuxia_saves'

export function useSave() {
  const playerStore = usePlayerStore()
  const gameStore = useGameStore()

  function getSaves(): SaveData[] {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  function save(slotName?: string) {
    const worldStore = useWorldStore()
    const saves = getSaves()
    const saveData: SaveData = {
      id: Date.now().toString(),
      name: slotName || `存档 ${new Date().toLocaleString('zh-CN')}`,
      timestamp: Date.now(),
      character: { ...playerStore.character },
      currentNodeId: gameStore.currentNodeId,
      flags: { ...gameStore.flags },
      gameTime: gameStore.gameDay,
      playerX: worldStore.playerX,
      playerY: worldStore.playerY
    }
    // Keep max 5 saves
    saves.unshift(saveData)
    if (saves.length > 5) saves.pop()
    localStorage.setItem(SAVE_KEY, JSON.stringify(saves))
    return saveData
  }

  function load(saveId: string): boolean {
    const worldStore = useWorldStore()
    const saves = getSaves()
    const saveData = saves.find(s => s.id === saveId)
    if (!saveData) return false

    playerStore.character.name = saveData.character.name
    playerStore.character.hp = saveData.character.hp
    playerStore.character.maxHp = saveData.character.maxHp
    playerStore.character.mp = saveData.character.mp
    playerStore.character.maxMp = saveData.character.maxMp
    playerStore.character.gold = saveData.character.gold
    playerStore.character.reputation = saveData.character.reputation
    playerStore.character.inventory = saveData.character.inventory
    playerStore.character.skills = saveData.character.skills

    gameStore.currentNodeId = saveData.currentNodeId
    gameStore.flags = saveData.flags
    gameStore.gameDay = saveData.gameTime
    gameStore.setPhase('story')

    // 恢复地图位置
    worldStore.reset()
    worldStore.map.playerX = saveData.playerX ?? 2
    worldStore.map.playerY = saveData.playerY ?? 2

    return true
  }

  function deleteSave(saveId: string) {
    const saves = getSaves().filter(s => s.id !== saveId)
    localStorage.setItem(SAVE_KEY, JSON.stringify(saves))
  }

  return { getSaves, save, load, deleteSave }
}
