import { ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'
import { useWorldStore } from '@/stores/world'
import { storyLoader } from '@/engine/StoryLoader'
import type { StoryBinding, Condition, StoryData } from '@/types'

/**
 * 剧情触发器
 * 负责检查和触发地图节点上的剧情
 */
export function useStoryTrigger() {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const worldStore = useWorldStore()

  // 当前触发的剧情
  const currentStory = ref<StoryData | null>(null)
  const isStoryActive = ref(false)

  /**
   * 检查节点的剧情触发
   * @param nodeId 节点ID
   */
  async function checkStoryTriggers(nodeId: string): Promise<void> {
    const node = worldStore.graph.nodes[nodeId]
    if (!node || !node.stories || node.stories.length === 0) {
      return
    }

    // 按优先级排序（优先级高的在前）
    const sortedBindings = [...node.stories].sort((a, b) => {
      const priorityA = a.priority ?? 0
      const priorityB = b.priority ?? 0
      return priorityB - priorityA
    })

    // 检查每个剧情绑定
    for (const binding of sortedBindings) {
      if (shouldTrigger(binding)) {
        await triggerStory(binding.storyId, binding)
        break // 一次只触发一个剧情
      }
    }
  }

  /**
   * 判断是否应该触发剧情
   * @param binding 剧情绑定
   * @param nodeId 节点ID
   */
  function shouldTrigger(binding: StoryBinding): boolean {
    console.log(`[StoryTrigger] 检查剧情: ${binding.storyId}, 触发类型: ${binding.trigger}`)
    
    // 检查触发类型
    switch (binding.trigger) {
      case 'auto':
        // 自动触发，每次进入都触发
        break

      case 'first_visit':
        // 首次访问触发
        const firstVisitKey = `story_${binding.storyId}_triggered`
        if (gameStore.hasFlag(firstVisitKey)) {
          console.log(`[StoryTrigger] ${binding.storyId} 已触发过 (first_visit)`)
          return false // 已经触发过
        }
        break

      case 'conditional':
        // 条件触发，需要检查条件
        if (!binding.condition) {
          console.log(`[StoryTrigger] ${binding.storyId} 没有条件配置`)
          return false
        }
        const conditionMet = evaluateCondition(binding.condition)
        console.log(`[StoryTrigger] ${binding.storyId} 条件检查结果: ${conditionMet}`, binding.condition)
        if (!conditionMet) {
          return false
        }
        break

      case 'manual':
        // 手动触发，不在这里处理
        return false
    }

    // 检查触发次数限制
    const maxTriggers = binding.maxTriggers !== undefined ? binding.maxTriggers : 1
    if (maxTriggers > 0) {
      const countKey = `story_${binding.storyId}_count`
      const currentCount = gameStore.getCounter(countKey)
      console.log(`[StoryTrigger] ${binding.storyId} 触发次数: ${currentCount}/${maxTriggers}`)
      if (currentCount >= maxTriggers) {
        console.log(`[StoryTrigger] ${binding.storyId} 已达到最大触发次数`)
        return false // 已达到最大触发次数
      }
    }
    // maxTriggers === 0 表示无限次触发

    console.log(`[StoryTrigger] ${binding.storyId} 可以触发`)
    return true
  }

  /**
   * 评估条件
   * @param condition 条件
   */
  function evaluateCondition(condition: Condition): boolean {
    const { type, target, value, operator, flag, itemId } = condition
    const player = playerStore.character

    // 检查 flag 条件（前置剧情完成标志）
    if (type === 'flag') {
      return flag ? gameStore.hasFlag(flag) : false
    }

    // 检查 hasItem 条件（拥有物品）
    if (type === 'hasItem') {
      return itemId ? player.inventory.some(i => i.id === itemId) : false
    }

    let actual = 0
    switch (type) {
      case 'gold':
        actual = player.gold
        break
      case 'reputation':
        actual = player.reputation
        break
      case 'stat':
        if (target === 'gold') actual = player.gold
        if (target === 'reputation') actual = player.reputation
        if (target === 'hp') actual = player.hp
        if (target === 'mp') actual = player.mp
        break
      case 'item':
        return target ? player.inventory.some(i => i.id === target) : true
      case 'skill':
        return target ? player.skills.some(s => s.id === target) : true
    }

    if (value === undefined) return true
    switch (operator) {
      case '>=': return actual >= value
      case '<=': return actual <= value
      case '==': return actual === value
      case '>': return actual > value
      default: return actual >= value
    }
  }

  /**
   * 触发剧情
   * @param storyId 剧情ID
   * @param binding 剧情绑定（可选）
   */
  async function triggerStory(storyId: string, binding?: StoryBinding): Promise<void> {
    try {
      // 加载剧情数据
      const story = await storyLoader.load(storyId)
      
      // 设置当前剧情
      currentStory.value = story
      isStoryActive.value = true

      // 增加触发次数计数
      if (binding) {
        const countKey = `story_${storyId}_count`
        gameStore.incrementCounter(countKey)
        
        // 兼容旧的 first_visit 触发方式
        if (binding.trigger === 'first_visit') {
          gameStore.setFlag(`story_${storyId}_triggered`)
        }
      }

      // 触发剧情事件（供外部监听）
      console.log(`[StoryTrigger] 触发剧情: ${story.name} (${storyId})`)
    } catch (error) {
      console.error(`[StoryTrigger] 触发剧情失败: ${storyId}`, error)
    }
  }

  /**
   * 手动触发剧情（用于玩家点击交互）
   * @param storyId 剧情ID
   */
  async function manualTrigger(storyId: string): Promise<void> {
    await triggerStory(storyId)
  }

  /**
   * 结束当前剧情
   */
  function endStory(): void {
    currentStory.value = null
    isStoryActive.value = false
  }

  /**
   * 获取节点的可手动触发剧情列表
   * @param nodeId 节点ID
   */
  function getManualStories(nodeId: string): StoryBinding[] {
    const node = worldStore.graph.nodes[nodeId]
    if (!node || !node.stories) {
      return []
    }

    return node.stories.filter(binding => {
      // 只返回手动触发的剧情
      if (binding.trigger !== 'manual') {
        return false
      }

      // 检查条件
      if (binding.condition && !evaluateCondition(binding.condition)) {
        return false
      }

      // 检查触发次数限制
      const maxTriggers = binding.maxTriggers !== undefined ? binding.maxTriggers : 1
      if (maxTriggers > 0) {
        const countKey = `story_${binding.storyId}_count`
        const currentCount = gameStore.getCounter(countKey)
        if (currentCount >= maxTriggers) {
          return false
        }
      }

      return true
    })
  }

  return {
    currentStory,
    isStoryActive,
    checkStoryTriggers,
    triggerStory,
    manualTrigger,
    endStory,
    getManualStories,
    evaluateCondition
  }
}

// Made with Bob
