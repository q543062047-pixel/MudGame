import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useGameStore } from '@/stores/game'
import { getSect, getSectLevel, getSectTitle } from '@/data/sects'
import type { Sect, CharacterSectInfo } from '@/types'

/**
 * 门派系统 Composable
 * 管理角色的门派信息、声望、等级等
 */
export function useSect() {
  const playerStore = usePlayerStore()
  const gameStore = useGameStore()

  /**
   * 获取当前门派信息
   */
  const currentSect = computed((): Sect | undefined => {
    return getSect(playerStore.character.sect)
  })

  /**
   * 获取当前门派声望
   */
  const currentSectReputation = computed((): number => {
    return playerStore.character.reputation
  })

  /**
   * 获取当前门派等级
   */
  const currentSectLevel = computed((): number => {
    const sect = currentSect.value
    if (!sect) return 0
    return getSectLevel(sect, currentSectReputation.value)
  })

  /**
   * 获取当前门派称号
   */
  const currentSectTitle = computed((): string => {
    const sect = currentSect.value
    if (!sect) return '无门无派'
    return getSectTitle(sect, currentSectReputation.value)
  })

  /**
   * 获取下一等级所需声望
   */
  const nextLevelReputation = computed((): number | null => {
    const sect = currentSect.value
    if (!sect) return null
    
    const currentLevel = currentSectLevel.value
    const nextLevel = sect.reputationLevels.find(l => l.level === currentLevel + 1)
    
    return nextLevel ? nextLevel.minReputation : null
  })

  /**
   * 获取升级进度（0-1）
   */
  const levelProgress = computed((): number => {
    const sect = currentSect.value
    if (!sect) return 0
    
    const currentLevel = currentSectLevel.value
    const currentLevelData = sect.reputationLevels.find(l => l.level === currentLevel)
    const nextLevelData = sect.reputationLevels.find(l => l.level === currentLevel + 1)
    
    if (!currentLevelData || !nextLevelData) return 1 // 已满级
    
    const current = currentSectReputation.value
    const min = currentLevelData.minReputation
    const max = nextLevelData.minReputation
    
    return (current - min) / (max - min)
  })

  /**
   * 加入门派
   */
  function joinSect(sectId: string): boolean {
    const sect = getSect(sectId)
    if (!sect) {
      console.error(`[Sect] 门派不存在: ${sectId}`)
      return false
    }

    // 检查是否已经在其他门派
    if (playerStore.character.sect && playerStore.character.sect !== 'none') {
      console.warn(`[Sect] 已经加入门派: ${playerStore.character.sect}`)
      return false
    }

    // 加入门派
    playerStore.character.sect = sectId
    playerStore.character.reputation = 0
    playerStore.character.title = getSectTitle(sect, 0)

    // 应用门派属性加成
    applySectAttributes(sect)

    // 学习门派初始技能
    learnSectSkills(sect)

    // 设置加入标志
    gameStore.setFlag(`joined_sect_${sectId}`)
    
    console.log(`[Sect] 加入门派: ${sect.name}`)
    return true
  }

  /**
   * 离开门派
   */
  function leaveSect(): boolean {
    const sect = currentSect.value
    if (!sect) {
      console.warn('[Sect] 当前没有门派')
      return false
    }

    // 移除门派属性加成
    removeSectAttributes(sect)

    // 重置门派信息
    playerStore.character.sect = 'none'
    playerStore.character.reputation = 0
    playerStore.character.title = '无门无派'

    // 设置离开标志
    gameStore.setFlag(`left_sect_${sect.id}`)
    
    console.log(`[Sect] 离开门派: ${sect.name}`)
    return true
  }

  /**
   * 增加门派声望
   */
  function addReputation(amount: number): void {
    const oldLevel = currentSectLevel.value
    playerStore.changeReputation(amount)
    const newLevel = currentSectLevel.value

    // 检查是否升级
    if (newLevel > oldLevel) {
      onLevelUp(oldLevel, newLevel)
    }
  }

  /**
   * 应用门派属性加成
   */
  function applySectAttributes(sect: Sect): void {
    const char = playerStore.character
    char.maxHp += sect.attributes.hp
    char.hp += sect.attributes.hp
    char.maxMp += sect.attributes.mp
    char.mp += sect.attributes.mp
    char.attack += sect.attributes.attack
    char.defense += sect.attributes.defense
    char.speed += sect.attributes.speed
  }

  /**
   * 移除门派属性加成
   */
  function removeSectAttributes(sect: Sect): void {
    const char = playerStore.character
    char.maxHp -= sect.attributes.hp
    char.hp = Math.min(char.hp, char.maxHp)
    char.maxMp -= sect.attributes.mp
    char.mp = Math.min(char.mp, char.maxMp)
    char.attack -= sect.attributes.attack
    char.defense -= sect.attributes.defense
    char.speed -= sect.attributes.speed
  }

  /**
   * 学习门派技能
   */
  function learnSectSkills(sect: Sect): void {
    // 学习门派初始技能（第一个技能）
    if (sect.skills.length > 0) {
      playerStore.learnSkill(sect.skills[0])
    }
  }

  /**
   * 门派升级回调
   */
  function onLevelUp(oldLevel: number, newLevel: number): void {
    const sect = currentSect.value
    if (!sect) return

    const newTitle = getSectTitle(sect, currentSectReputation.value)
    playerStore.character.title = newTitle

    console.log(`[Sect] 门派等级提升: ${oldLevel} -> ${newLevel}`)
    console.log(`[Sect] 获得新称号: ${newTitle}`)

    // 触发升级事件
    gameStore.setFlag(`sect_level_${newLevel}`)

    // 解锁新技能
    if (sect.skills[newLevel]) {
      playerStore.learnSkill(sect.skills[newLevel])
      console.log(`[Sect] 学会新技能: ${sect.skills[newLevel]}`)
    }
  }

  /**
   * 检查是否可以购买门派商店物品
   */
  function canBuySectItem(itemId: string): boolean {
    const sect = currentSect.value
    if (!sect) return false

    const item = sect.shopItems.find(i => i.itemId === itemId)
    if (!item) return false

    // 检查声望要求
    if (currentSectReputation.value < item.requiredReputation) {
      return false
    }

    // 检查金钱
    if (playerStore.character.gold < item.price) {
      return false
    }

    return true
  }

  /**
   * 购买门派商店物品
   */
  function buySectItem(itemId: string): boolean {
    if (!canBuySectItem(itemId)) {
      return false
    }

    const sect = currentSect.value!
    const item = sect.shopItems.find(i => i.itemId === itemId)!

    // 扣除金钱
    playerStore.changeGold(-item.price)

    // 添加物品
    playerStore.addItem(itemId, 1)

    console.log(`[Sect] 购买物品: ${itemId}`)
    return true
  }

  return {
    // 状态
    currentSect,
    currentSectReputation,
    currentSectLevel,
    currentSectTitle,
    nextLevelReputation,
    levelProgress,

    // 方法
    joinSect,
    leaveSect,
    addReputation,
    canBuySectItem,
    buySectItem,
  }
}

// Made with Bob
