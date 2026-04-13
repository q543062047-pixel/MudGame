import { ref } from 'vue'
import type { RandomEvent, NodeEffect } from '@/types'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'

// 随机事件库
const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: 'find_gold',
    name: '意外之财',
    description: '你在路边发现了一个钱袋，里面有些碎银。',
    probability: 0.15,
    effects: [
      { type: 'changeGold', value: 20 }
    ]
  },
  {
    id: 'meet_merchant',
    name: '行商过客',
    description: '一位行商路过，愿意以优惠价格出售丹药。',
    probability: 0.12,
    choices: [
      {
        text: '购买回血丹（20两）',
        next: '',
        condition: { type: 'gold', value: 20, operator: '>=' },
        effects: [
          { type: 'changeGold', value: -20 },
          { type: 'addItem', target: 'healing_pill', value: 1 }
        ]
      },
      {
        text: '婉言谢绝',
        next: '',
        effects: []
      }
    ]
  },
  {
    id: 'wild_herbs',
    name: '野生草药',
    description: '你在林间发现了一些野生草药，可以采集。',
    probability: 0.1,
    conditions: [
      { type: 'stat', target: 'hp', value: 80, operator: '<=' }
    ],
    effects: [
      { type: 'changeHp', value: 15 }
    ]
  },
  {
    id: 'mysterious_old_man',
    name: '神秘老者',
    description: '一位白发老者坐在路边，见你走来，微微一笑："年轻人，可愿听老夫讲个故事？"',
    probability: 0.08,
    choices: [
      {
        text: '恭敬聆听',
        next: '',
        effects: [
          { type: 'changeReputation', value: 5 },
          { type: 'setFlag', flag: 'met_mysterious_elder' }
        ]
      },
      {
        text: '匆匆离去',
        next: '',
        effects: []
      }
    ]
  },
  {
    id: 'bandit_ambush',
    name: '山贼伏击',
    description: '突然从林中窜出几个山贼！"此路是我开，留下买路财！"',
    probability: 0.1,
    choices: [
      {
        text: '交出10两银子',
        next: '',
        condition: { type: 'gold', value: 10, operator: '>=' },
        effects: [
          { type: 'changeGold', value: -10 }
        ]
      },
      {
        text: '拔剑相向',
        next: '',
        effects: [
          { type: 'changeHp', value: -15 },
          { type: 'changeReputation', value: 3 }
        ]
      },
      {
        text: '施展轻功逃离',
        next: '',
        effects: [
          { type: 'changeHp', value: -5 }
        ]
      }
    ]
  },
  {
    id: 'injured_traveler',
    name: '受伤旅人',
    description: '路边躺着一位受伤的旅人，奄奄一息。',
    probability: 0.09,
    choices: [
      {
        text: '施以援手（消耗1个丹药）',
        next: '',
        condition: { type: 'item', target: 'healing_pill' },
        effects: [
          { type: 'removeItem', target: 'healing_pill', value: 1 },
          { type: 'changeReputation', value: 10 },
          { type: 'setFlag', flag: 'saved_traveler' }
        ]
      },
      {
        text: '无能为力，继续前行',
        next: '',
        effects: []
      }
    ]
  },
  {
    id: 'ancient_stele',
    name: '古碑残文',
    description: '你发现了一块古老的石碑，上面刻着模糊的武学心法。',
    probability: 0.06,
    effects: [
      { type: 'changeMp', value: 10 },
      { type: 'setFlag', flag: 'found_ancient_stele' }
    ]
  }
]

export function useRandomEvents() {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const currentEvent = ref<RandomEvent | null>(null)

  // 检查事件条件
  function checkConditions(event: RandomEvent): boolean {
    if (!event.conditions) return true
    
    const player = playerStore.character
    return event.conditions.every(cond => {
      const { type, target, value, operator } = cond
      let actual = 0

      switch (type) {
        case 'gold':
          actual = player.gold
          break
        case 'reputation':
          actual = player.reputation
          break
        case 'stat':
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
    })
  }

  // 触发随机事件
  function triggerRandomEvent(): RandomEvent | null {
    // 过滤出满足条件的事件
    const availableEvents = RANDOM_EVENTS.filter(e => checkConditions(e))
    if (availableEvents.length === 0) return null

    // 根据概率随机选择
    const rand = Math.random()
    let cumulative = 0

    for (const event of availableEvents) {
      cumulative += event.probability
      if (rand <= cumulative) {
        currentEvent.value = event
        return event
      }
    }

    return null
  }

  // 应用事件效果
  function applyEventEffects(effects: NodeEffect[]) {
    for (const effect of effects) {
      switch (effect.type) {
        case 'addItem':
          if (effect.target) playerStore.addItem(effect.target, effect.value ?? 1)
          break
        case 'removeItem':
          if (effect.target) playerStore.removeItem(effect.target, effect.value ?? 1)
          break
        case 'changeHp':
          if (effect.value !== undefined) playerStore.changeHp(effect.value)
          break
        case 'changeMp':
          if (effect.value !== undefined) playerStore.changeMp(effect.value)
          break
        case 'changeGold':
          if (effect.value !== undefined) playerStore.changeGold(effect.value)
          break
        case 'changeReputation':
          if (effect.value !== undefined) playerStore.changeReputation(effect.value)
          break
        case 'learnSkill':
          if (effect.target) playerStore.learnSkill(effect.target)
          break
        case 'setFlag':
          if (effect.flag) gameStore.setFlag(effect.flag)
          break
      }
    }
  }

  // 清除当前事件
  function clearEvent() {
    currentEvent.value = null
  }

  return {
    currentEvent,
    triggerRandomEvent,
    applyEventEffects,
    clearEvent
  }
}

// Made with Bob
