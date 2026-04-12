// stores/gameStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchStory } from '@/services/aiService'

// 门派配置
export const FACTIONS = [
  {
    name: '少林寺',
    alignment: '正义',
    desc: '棍法精妙 · 内力深厚',
    flavor: '佛门圣地，武学渊博，以慈悲之心行侠仗义。',
    stats: { atk: 85, agi: 60, int: 90 },
    items: ['戒律牌', '少林棍法秘籍'],
    quests: [{ name: '寻访师兄下落', desc: '师兄外出历练已久，杳无音讯，须前往打听。' }]
  },
  {
    name: '武当派',
    alignment: '正道',
    desc: '剑法飘逸 · 太极无双',
    flavor: '道家圣地，刚柔并济，以无为之道御天下之刚。',
    stats: { atk: 75, agi: 85, int: 80 },
    items: ['青锋剑', '太极心法残卷'],
    quests: [{ name: '护送道家典籍', desc: '一批珍贵道典遭人觊觎，需护送至武当山。' }]
  },
  {
    name: '天魔教',
    alignment: '邪道',
    desc: '魔功诡异 · 出奇制胜',
    flavor: '行事神秘，不拘善恶，以魔道之力开辟一番天地。',
    stats: { atk: 95, agi: 75, int: 70 },
    items: ['魔刀残片', '天魔步法图'],
    quests: [{ name: '寻找失散教众', desc: '正道围剿后，诸多同门下落不明。' }]
  },
  {
    name: '逍遥派',
    alignment: '散修',
    desc: '无拘无束 · 随心所欲',
    flavor: '不属任何势力，漫游四海，以自在之心笑看江湖风云。',
    stats: { atk: 70, agi: 95, int: 75 },
    items: ['酒葫芦', '逍遥游残页'],
    quests: [{ name: '寻访逍遥仙踪', desc: '传说逍遥派先人留有无上秘籍，踪迹成谜。' }]
  }
]

export const useGameStore = defineStore('game', () => {
  // ── 玩家状态 ──
  const player = ref({
    name: '',
    faction: '',
    alignment: '',
    hp: 100,
    maxHp: 100,
    mp: 80,
    maxMp: 80,
    atk: 70,
    agi: 70,
    int: 70,
    reputation: 0,
    items: [],
    quests: []
  })

  // ── 剧情 ──
  const messages = ref([])    // { id, type: 'narrate'|'dialogue'|'system'|'player', text }
  const choices = ref([])
  const history = ref([])     // Anthropic messages 格式

  // ── UI 状态 ──
  const isLoading = ref(false)
  const error = ref(null)
  const turnCount = ref(0)

  // ── 计算属性 ──
  const hpPercent = computed(() => Math.round((player.value.hp / player.value.maxHp) * 100))
  const mpPercent = computed(() => Math.round((player.value.mp / player.value.maxMp) * 100))

  // ── 创建角色 ──
  function createPlayer(name, factionData) {
    player.value = {
      name,
      faction: factionData.name,
      alignment: factionData.alignment,
      hp: 100, maxHp: 100,
      mp: 80,  maxMp: 80,
      reputation: 0,
      ...factionData.stats,
      items: [...factionData.items],
      quests: [...factionData.quests]
    }
    messages.value = []
    choices.value = []
    history.value = []
    turnCount.value = 0
    error.value = null
  }

  // ── 添加消息 ──
  function addMessage(type, text) {
    messages.value.push({
      id: Date.now() + Math.random(),
      type,
      text
    })
  }

  // ── 应用状态变化 ──
  function applyStateChanges(changes) {
    const p = player.value

    if (changes.hp != null) {
      p.hp = Math.max(0, Math.min(p.maxHp, p.hp + changes.hp))
    }
    if (changes.mp != null) {
      p.mp = Math.max(0, Math.min(p.maxMp, p.mp + changes.mp))
    }
    if (changes.rep != null) {
      p.reputation += changes.rep
    }
    if (changes.addItem) {
      if (!p.items.includes(changes.addItem)) p.items.push(changes.addItem)
    }
    if (changes.removeItem) {
      p.items = p.items.filter(i => i !== changes.removeItem)
    }
    if (changes.addQuest) {
      if (!p.quests.find(q => q.name === changes.addQuest)) {
        p.quests.push({ name: changes.addQuest, desc: '' })
      }
    }
    if (changes.removeQuest) {
      p.quests = p.quests.filter(q => q.name !== changes.removeQuest)
    }
  }

  // ── 处理 AI 响应 ──
  function handleAIResponse({ rawText, narrative, choices: newChoices, stateChanges }) {
    // 分类消息
    for (const line of narrative) {
      const type = (line.startsWith('「') || line.startsWith('"') || line.startsWith('"'))
        ? 'dialogue'
        : 'narrate'
      addMessage(type, line)
    }

    // 更新状态
    applyStateChanges(stateChanges)

    // 存入对话历史
    history.value.push({ role: 'assistant', content: rawText })

    // 更新选项
    choices.value = newChoices
    turnCount.value++
  }

  // ── 开场 ──
  async function startGame() {
    isLoading.value = true
    error.value = null
    addMessage('system', '── 踏入江湖 ──')

    try {
      const result = await fetchStory(player.value, [], null)
      handleAIResponse(result)
    } catch (e) {
      error.value = e.message
      addMessage('system', '江湖路远，消息难传……（' + e.message + '）')
    } finally {
      isLoading.value = false
    }
  }

  // ── 玩家行动 ──
  async function playerAction(actionText) {
    if (isLoading.value) return
    isLoading.value = true
    error.value = null
    choices.value = []

    addMessage('player', actionText)

    // 存入对话历史
    history.value.push({ role: 'user', content: actionText })

    try {
      const result = await fetchStory(player.value, history.value, actionText)
      handleAIResponse(result)
    } catch (e) {
      error.value = e.message
      addMessage('system', '风云突变，江湖暂息……（' + e.message + '）')
      choices.value = ['再试一次']
    } finally {
      isLoading.value = false
    }
  }

  // ── 重试最后一次 ──
  async function retryLast() {
    const lastUser = [...history.value].reverse().find(m => m.role === 'user')
    if (!lastUser) return
    history.value = history.value.slice(0, -1)
    await playerAction(lastUser.content)
  }

  return {
    player, messages, choices, history,
    isLoading, error, turnCount,
    hpPercent, mpPercent,
    createPlayer, startGame, playerAction, retryLast
  }
})