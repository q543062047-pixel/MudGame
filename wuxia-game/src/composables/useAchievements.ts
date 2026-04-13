import { ref, computed } from 'vue'
import type { Achievement } from '@/types'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'

const STORAGE_KEY = 'wuxia_achievements'

// 成就定义
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_battle',
    name: '初试锋芒',
    description: '完成第一场战斗',
    icon: '⚔️',
    condition: { type: 'flag', target: 'battle_completed' },
    unlocked: false
  },
  {
    id: 'rescue_scholar',
    name: '侠义之心',
    description: '救下白衣书生',
    icon: '🛡️',
    condition: { type: 'flag', target: 'rescued_scholar' },
    unlocked: false
  },
  {
    id: 'enter_city',
    name: '初入江湖',
    description: '进入苍梧城',
    icon: '🏛️',
    condition: { type: 'flag', target: 'entered_city' },
    unlocked: false
  },
  {
    id: 'collect_jade',
    name: '师恩难忘',
    description: '获得师父赠予的玉佩',
    icon: '💎',
    condition: { type: 'item_collect', target: 'jade_pendant' },
    unlocked: false
  },
  {
    id: 'reputation_50',
    name: '小有名气',
    description: '声望达到50点',
    icon: '⭐',
    condition: { type: 'reputation', value: 50 },
    unlocked: false
  },
  {
    id: 'chapter1_complete',
    name: '问剑之路',
    description: '完成第一章',
    icon: '📜',
    condition: { type: 'flag', target: 'chapter1_complete' },
    unlocked: false
  }
]

export function useAchievements() {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const achievements = ref<Achievement[]>([...ACHIEVEMENTS])
  const newUnlocks = ref<Achievement[]>([])

  // 从本地存储加载
  function loadAchievements() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const unlocked = JSON.parse(saved) as string[]
        achievements.value.forEach(ach => {
          if (unlocked.includes(ach.id)) {
            ach.unlocked = true
          }
        })
      }
    } catch (e) {
      console.error('Failed to load achievements:', e)
    }
  }

  // 保存到本地存储
  function saveAchievements() {
    try {
      const unlocked = achievements.value
        .filter(a => a.unlocked)
        .map(a => a.id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked))
    } catch (e) {
      console.error('Failed to save achievements:', e)
    }
  }

  // 检查并解锁成就
  function checkAchievements() {
    const player = playerStore.character
    let hasNewUnlock = false

    achievements.value.forEach(ach => {
      if (ach.unlocked) return

      let shouldUnlock = false
      const { type, target, value } = ach.condition

      switch (type) {
        case 'flag':
          shouldUnlock = target ? gameStore.hasFlag(target) : false
          break
        case 'item_collect':
          shouldUnlock = target ? player.inventory.some(i => i.id === target) : false
          break
        case 'reputation':
          shouldUnlock = value !== undefined ? player.reputation >= value : false
          break
        case 'battle_win':
          shouldUnlock = target ? gameStore.hasFlag(`battle_win_${target}`) : false
          break
        case 'ending':
          shouldUnlock = target ? gameStore.hasFlag(`ending_${target}`) : false
          break
      }

      if (shouldUnlock) {
        ach.unlocked = true
        ach.unlockedAt = Date.now()
        newUnlocks.value.push(ach)
        hasNewUnlock = true
      }
    })

    if (hasNewUnlock) {
      saveAchievements()
    }

    return newUnlocks.value
  }

  // 清除新解锁提示
  function clearNewUnlocks() {
    newUnlocks.value = []
  }

  // 统计
  const unlockedCount = computed(() => 
    achievements.value.filter(a => a.unlocked).length
  )
  const totalCount = computed(() => achievements.value.length)
  const progress = computed(() => 
    totalCount.value > 0 ? (unlockedCount.value / totalCount.value) * 100 : 0
  )

  // 初始化
  loadAchievements()

  return {
    achievements,
    newUnlocks,
    unlockedCount,
    totalCount,
    progress,
    checkAchievements,
    clearNewUnlocks,
    loadAchievements
  }
}

// Made with Bob
