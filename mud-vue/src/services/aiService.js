// services/aiService.js
// 使用 OpenAI（ChatGPT）驱动武侠文字 MUD

const API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'openrouter/free'

console.log('API KEY:', import.meta.env.VITE_OPENROUTER_API_KEY)

/**
 * 构建系统提示词
 */
function buildSystemPrompt(player) {
  const factionTrait =
    player.faction === '天魔教'
      ? '玩家来自邪道门派，正道人士会戒备甚至敌对，但邪道人士视其为同道'
      : player.faction === '逍遥派'
      ? '玩家无拘无束，各方势力对其态度中立，随玩家行为而变化'
      : '玩家来自正道门派，普通百姓对其尊敬，邪道人士有所戒备'

  return `你是一个武侠文字冒险游戏的叙事引擎。用古典优雅的中文描写江湖世界，文笔要有金庸、古龙武侠小说的韵味。

玩家档案：
- 姓名：${player.name}
- 门派：${player.faction}（${player.alignment}）
- 武力：${player.atk} | 轻功：${player.agi} | 内力：${player.int}
- 生命：${player.hp}/${player.maxHp} | 内力：${player.mp}/${player.maxMp}
- 声望：${player.reputation}
- 携带：${player.items.join('、') || '空无一物'}
- 任务：${player.quests.map(q => q.name).join('、') || '无'}

${factionTrait}

━━━ 输出格式（严格遵守，不可更改）━━━

第一部分：叙事内容（2~4段，每段50~120字）
- 描写场景环境、NPC对话、战斗经过、内心活动
- 对话用「」包裹
- 纯叙事段落直接写，不加任何前缀

第二部分：选项（恰好3个，每个独占一行）
CHOICE:选项内容（不超过20字）
CHOICE:选项内容
CHOICE:选项内容

第三部分：状态指令（可选，根据剧情决定）
HP:+15   或  HP:-20
MP:+10   或  MP:-15
REP:+5   或  REP:-3
ITEM+:物品名称
ITEM-:物品名称
QUEST+:任务名称
QUEST-:任务名称

━━━ 设计要求 ━━━
- 叙事要有层次：先环境，再行动，再结果
- 选项包含【智】【武】【情】三种思路
- 不同选项有风险差异
- 控制节奏，不要每回合大事件
- 禁止在叙事段落出现"CHOICE:"
- 必须使用纯中文输出，禁止使用英文或中英混合。

如果输出格式不符合要求，请自行修正后再输出。`
}

/**
 * 解析 AI 返回
 */
export function parseAIResponse(rawText) {
  const lines = rawText.split('\n')
  const narrative = []
  const choices = []
  const stateChanges = {}

  for (const line of lines) {
    const t = line.trim()
    if (!t) continue

    if (t.startsWith('CHOICE:')) {
      choices.push(t.slice(7).trim())
    } else if (/^HP:[+-]?\d+/.test(t)) {
      stateChanges.hp = parseInt(t.slice(3))
    } else if (/^MP:[+-]?\d+/.test(t)) {
      stateChanges.mp = parseInt(t.slice(3))
    } else if (/^REP:[+-]?\d+/.test(t)) {
      stateChanges.rep = parseInt(t.slice(4))
    } else if (t.startsWith('ITEM+:')) {
      stateChanges.addItem = t.slice(6).trim()
    } else if (t.startsWith('ITEM-:')) {
      stateChanges.removeItem = t.slice(6).trim()
    } else if (t.startsWith('QUEST+:')) {
      stateChanges.addQuest = t.slice(7).trim()
    } else if (t.startsWith('QUEST-:')) {
      stateChanges.removeQuest = t.slice(7).trim()
    } else {
      narrative.push(t)
    }
  }

  // 兜底选项（防AI抽风）
  while (choices.length < 3) {
    choices.push(['继续前行', '原地观察', '向人打听'][choices.length])
  }

  return { narrative, choices, stateChanges }
}

/**
 * 调用 AI 获取剧情
 */
export async function fetchStory(player, history, userAction) {
  const systemPrompt = buildSystemPrompt(player)

  let messages

  if (!userAction) {
    // 开场
    messages = [
      {
        role: 'user',
        content: `游戏开场。请描写${player.name}（${player.faction}弟子）初入江湖，在繁华武林集镇的情景，并给出三个不同风格的初始选择。`
      }
    ]
  } else {
    messages = history.slice(-12)
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.85, // 更有文采
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error?.message || `HTTP ${response.status}`)
    }

    const data = await response.json()

    const rawText =
      data.choices?.[0]?.message?.content || ''

    return { rawText, ...parseAIResponse(rawText) }

  } catch (error) {
    console.error('AI请求失败:', error)

    // fallback（防止游戏卡死）
    return {
      rawText: '',
      narrative: ['江湖风云突变，一时难以看清局势。'],
      choices: ['继续前行', '稍作休息', '观察四周'],
      stateChanges: {}
    }
  }
}