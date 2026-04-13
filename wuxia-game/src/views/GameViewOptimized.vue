<template>
  <div class="game-view">
    <CharacterPanel
      @use-item="ps.useItem($event)"
      @save="doSave"
      @back-home="router.push('/')"
    />

    <div class="game-right">
      <header class="hdr">
        <span class="hdr-loc"><span class="hdr-dot">◉</span>{{ locLabel }}</span>
        <span class="hdr-title">江湖志·問劍錄</span>
        <span class="hdr-day">第 {{ gs.gameDay }} 日</span>
      </header>

      <Transition name="phase" mode="out-in">
        <!-- 战斗 -->
        <BattleView v-if="gs.phase==='battle'" key="battle"/>

        <!-- 地图 + 探索 -->
        <div v-else class="main-layout" key="story">
          <div class="map-zone">
            <MapGrid ref="mapRef" @move="onMove" @enterCell="onEnterCell"/>
          </div>
          <div class="v-sep"/>
          <ExplorePanel
            :npcs="cellNpcs"
            :active-npc="activeNpc"
            :dialogue-index="dialogueIdx"
            :lines="exploreLines"
            :atmosphere="exploreAtm"
            @talk-to="talkTo"
            @close-npc="closeNpc"
            @next-dialogue="nextDialogue"
            @trigger-scenario="triggerNpcScenario"
          />
        </div>
      </Transition>
    </div>

    <!-- 过场全屏 -->
    <CutsceneOverlay
      :visible="cutsceneOn"
      :atmosphere="csAtm"
      :history="csHistory"
      :displayed-text="csDisplayed"
      :is-typing="csTyping"
      :paragraph-queue="csParagraphQueue"
      :choices="csChoices"
      :check-condition="checkCondition"
      @click="csClick"
      @select-choice="handleCsChoice"
    />

    <!-- 随机事件弹窗 -->
    <Transition name="event">
      <div v-if="randomEvent" class="event-modal" @click.self="closeRandomEvent">
        <div class="event-box">
          <div class="event-title">{{ randomEvent.name }}</div>
          <div class="event-desc">{{ randomEvent.description }}</div>
          <div v-if="randomEvent.choices" class="event-choices">
            <button
              v-for="(ch, i) in randomEvent.choices" :key="i"
              class="event-btn"
              @click="handleEventChoice(ch)"
            >
              {{ ch.text }}
            </button>
          </div>
          <button v-else class="event-btn" @click="closeRandomEvent">确定</button>
        </div>
      </div>
    </Transition>

    <!-- 成就解锁提示 -->
    <TransitionGroup name="ach" tag="div" class="ach-list">
      <div v-for="ach in newAchievements" :key="ach.id" class="ach-toast">
        <span class="ach-icon">{{ ach.icon }}</span>
        <div class="ach-info">
          <div class="ach-name">成就解锁：{{ ach.name }}</div>
          <div class="ach-desc">{{ ach.description }}</div>
        </div>
      </div>
    </TransitionGroup>

    <Transition name="toast">
      <div v-if="saveToast" class="save-toast">✓ 存档成功</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'
import { useWorldStore } from '@/stores/world'
import { useGameEngine } from '@/composables/useGameEngine'
import { useSaveSlots } from '@/composables/useSaveSlots'
import { useTypewriter } from '@/composables/useTypewriter'
import { useRandomEvents } from '@/composables/useRandomEvents'
import { useAchievements } from '@/composables/useAchievements'
import { NPC_DATA, CELL_DESCRIPTIONS, TERRAIN_DESCRIPTIONS } from '@/data/npcData'
import { TERRAIN_TYPE_NAMES } from '@/data/worldMap'
import { getAllScenarioIds } from '@/data/storyConfig'
import CharacterPanel from '@/components/game/CharacterPanel.vue'
import BattleView from '@/components/game/BattleView.vue'
import MapGrid from '@/components/game/MapGrid.vue'
import CutsceneOverlay from '@/components/game/CutsceneOverlay.vue'
import ExplorePanel from '@/components/game/ExplorePanel.vue'
import type { Choice, MapCell, NodeEffect } from '@/types'
import type { NPC } from '@/data/npcData'

const router = useRouter()
const gs = useGameStore()
const ps = usePlayerStore()
const ws = useWorldStore()
const { getCurrentNode, getNode, selectChoice, checkCondition, goToNode } = useGameEngine()
const { saveToSlot } = useSaveSlots()
const { triggerRandomEvent, applyEventEffects, currentEvent: randomEvent, clearEvent } = useRandomEvents()
const { checkAchievements, newUnlocks: newAchievements, clearNewUnlocks } = useAchievements()

// 从配置文件自动获取所有剧情节点ID
const ALL_SCENARIO_IDS = getAllScenarioIds()

function isCutsceneId(id: string) {
  return ALL_SCENARIO_IDS.has(id)
}

// 探索文字区
const exploreLines = ref<string[]>(['踏上征途，江湖在望。'])
const exploreAtm = ref<string>('normal')

function setExploreText(lines: string[], atm = 'normal') {
  exploreLines.value = lines
  exploreAtm.value = atm
}

// NPC 交互
const cellNpcs = ref<NPC[]>([])
const activeNpc = ref<NPC | null>(null)
const dialogueIdx = ref(0)

function talkTo(npc: NPC) {
  activeNpc.value = npc
  dialogueIdx.value = 0
}

function nextDialogue() {
  if (!activeNpc.value) return
  if (dialogueIdx.value < activeNpc.value.dialogues.length - 1) {
    dialogueIdx.value++
  } else {
    closeNpc()
  }
}

function closeNpc() {
  activeNpc.value = null
}

function triggerNpcScenario() {
  const sid = activeNpc.value?.scenarioId
  closeNpc()
  if (sid) openCutscene(sid)
}

// 地图移动
function onMove(cell: MapCell, moved: boolean) {
  if (!moved) {
    const terrain = TERRAIN_DESCRIPTIONS[cell.type]
    setExploreText([terrain?.[0] ?? '此路不通。'], 'normal')
  }
}

function onEnterCell(cell: MapCell) {
  activeNpc.value = null
  dialogueIdx.value = 0

  const key = `${cell.y},${cell.x}`
  cellNpcs.value = NPC_DATA[key] ?? []

  // 更新探索文字
  const cellDesc = CELL_DESCRIPTIONS[key]
  if (cellDesc?.length) {
    setExploreText(cellDesc, cellAtm(cell.type))
  } else {
    const pool = TERRAIN_DESCRIPTIONS[cell.type]
    const line = pool
      ? pool[Math.floor(Math.random() * pool.length)]
      : `你来到了${cell.name || TERRAIN_TYPE_NAMES[cell.type]}。`
    setExploreText([line], cellAtm(cell.type))
  }

  // 检查地图触发（从 CELL_META 读取）
  if (cell.scenarioId && !gs.flags[`visited_${cell.scenarioId}`]) {
    ws.clearEvent(cell.x, cell.y)
    setTimeout(() => openCutscene(cell.scenarioId!), 400)
  } else {
    // 随机事件触发（10%概率）
    if (Math.random() < 0.1) {
      const event = triggerRandomEvent()
      if (event && event.effects) {
        applyEventEffects(event.effects)
      }
    }
  }

  // 检查成就
  const unlocked = checkAchievements()
  if (unlocked.length > 0) {
    setTimeout(() => clearNewUnlocks(), 3000)
  }
}

function cellAtm(type: string) {
  if (['forest', 'dungeon'].includes(type)) return 'tense'
  if (['temple', 'mountain'].includes(type)) return 'peaceful'
  return 'normal'
}

// 过场系统
const cutsceneOn = ref(false)
const csAtm = ref('normal')
const csHistory = ref<string[]>([])
const csParagraphQueue = ref<string[]>([])
const csChoices = ref<Choice[]>([])

const {
  displayedText: csDisplayed,
  isTyping: csTyping,
  typeText: csType,
  skipTyping: csSkip,
  reset: csReset,
} = useTypewriter()

function openCutscene(nodeId: string) {
  if (gs.phase === 'battle') return
  goToNode(nodeId)
  if (gs.phase === 'battle') return
  renderCutscene()
}

function renderCutscene() {
  const node = getCurrentNode()
  if (!node) return
  cutsceneOn.value = true
  csAtm.value = node.atmosphere ?? 'normal'
  csHistory.value = []
  csChoices.value = []
  csParagraphQueue.value = [...node.text]
  csReset()
  nextCsPara()
}

function closeCutscene() {
  cutsceneOn.value = false
  csReset()
}

async function nextCsPara() {
  if (!csParagraphQueue.value.length) {
    csChoices.value = getCurrentNode()?.choices ?? []
    gs.setFlag(`visited_${gs.currentNodeId}`)
    return
  }
  const para = csParagraphQueue.value.shift()!
  await csType(para, 30)
  if (csParagraphQueue.value.length) {
    csHistory.value.push(para)
    csDisplayed.value = ''
  } else {
    csChoices.value = getCurrentNode()?.choices ?? []
    gs.setFlag(`visited_${gs.currentNodeId}`)
  }
}

function csClick() {
  if (csTyping.value) {
    const idx = csHistory.value.length
    csSkip(getCurrentNode()?.text[idx] ?? '')
    if (!csParagraphQueue.value.length) {
      csChoices.value = getCurrentNode()?.choices ?? []
    }
  } else if (csParagraphQueue.value.length) {
    csHistory.value.push(csDisplayed.value)
    csDisplayed.value = ''
    nextCsPara()
  }
}

function handleCsChoice(ch: Choice) {
  if (!checkCondition(ch)) return
  
  // 先关闭过场
  closeCutscene()
  
  // 如果选择的 next 指向自己（表示结束过场），只应用效果
  if (ch.next === gs.currentNodeId) {
    if (ch.effects) {
      const { applyEffects } = useGameEngine()
      applyEffects(ch.effects)
    }
    return
  }
  
  // 否则正常处理选择跳转（会自动处理战斗）
  selectChoice(ch)
}

watch(() => gs.phase, (p) => {
  if (p === 'battle') closeCutscene()
})

watch(() => gs.currentNodeId, (newId) => {
  if (gs.phase === 'battle') return
  
  // 检查新节点是否是战斗节点
  const node = getCurrentNode()
  if (node?.battle) {
    // 战斗节点不显示过场，直接返回
    return
  }
  
  if (isCutsceneId(newId) && !cutsceneOn.value) {
    nextTick(() => renderCutscene())
  }
})

// 随机事件处理
function handleEventChoice(choice: Choice) {
  if (choice.effects) {
    applyEventEffects(choice.effects)
  }
  closeRandomEvent()
}

function closeRandomEvent() {
  clearEvent()
}

// 杂项
const saveToast = ref(false)
const mapRef = ref()

const locLabel = computed(() => {
  const c = ws.currentCell
  return c.name || TERRAIN_TYPE_NAMES[c.type] || '江湖'
})

function doSave() {
  saveToSlot(1, '快速存档')
  saveToast.value = true
  setTimeout(() => {
    saveToast.value = false
  }, 2000)
}

onMounted(() => {
  if (gs.phase === 'menu') {
    router.push('/')
    return
  }
  const cell = ws.currentCell
  const key = `${cell.y},${cell.x}`
  setExploreText(CELL_DESCRIPTIONS[key] ?? ['踏上征途，江湖在望。'])
  cellNpcs.value = NPC_DATA[key] ?? []
  if (!gs.flags['visited_start']) {
    setTimeout(() => openCutscene('start'), 300)
  }
  nextTick(() => mapRef.value?.$el?.focus?.())
})
</script>

<style scoped>
.game-view {
  width: 100vw; height: 100vh;
  display: flex; background: var(--bg-app); overflow: hidden;
}

.game-right {
  flex: 1; display: flex; flex-direction: column;
  overflow: hidden; min-width: 0;
}

.hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 18px;
  background: var(--bg-dark); border-bottom: 1px solid #3a2810;
  flex-shrink: 0; min-height: 32px;
}
.hdr-loc { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--dark-text-muted); letter-spacing:2px; }
.hdr-dot { color:#4ab870; font-size:9px; animation:breathe 2s ease-in-out infinite; }
.hdr-title { font-family:var(--font-title); font-size:13px; color:var(--dark-text-sub); letter-spacing:3px; }
.hdr-day { font-size:10px; color:var(--dark-text-faint); letter-spacing:2px; }

.main-layout { flex:1; display:flex; flex-direction:column; overflow:hidden; }
.map-zone { flex:2; min-height:0; overflow:hidden; }
.v-sep {
  height: 2px; flex-shrink: 0;
  background: linear-gradient(90deg, transparent, var(--border-mid) 30%, var(--border-strong) 50%, var(--border-mid) 70%, transparent);
}

.phase-enter-active { animation: fadeInUp .25s ease both; }
.phase-leave-active { transition: opacity .15s; }
.phase-leave-to { opacity: 0; }

/* 随机事件弹窗 */
.event-modal {
  position: fixed; inset: 0; z-index: 250;
  background: rgba(0,0,0,0.8);
  display: flex; align-items: center; justify-content: center;
}
.event-box {
  width: min(500px, 90vw);
  background: var(--bg-panel);
  border: 2px solid var(--border-strong);
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
}
.event-title {
  font-family: var(--font-title);
  font-size: 20px; color: var(--accent-red);
  letter-spacing: 3px; margin-bottom: 16px;
  text-align: center;
}
.event-desc {
  font-family: var(--font-serif);
  font-size: 15px; line-height: 2;
  color: var(--text-on-paper);
  letter-spacing: 2px; margin-bottom: 20px;
}
.event-choices {
  display: flex; flex-direction: column; gap: 8px;
}
.event-btn {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid var(--border-mid);
  font-family: var(--font-serif);
  font-size: 14px; color: var(--text-on-paper-sub);
  cursor: pointer; letter-spacing: 2px;
  transition: all .15s;
}
.event-btn:hover {
  border-color: var(--accent-red);
  color: var(--accent-red);
  background: rgba(192,57,43,.05);
}

.event-enter-active { animation: fadeInUp .3s ease both; }
.event-leave-active { transition: opacity .25s; }
.event-leave-to { opacity: 0; }

/* 成就提示 */
.ach-list {
  position: fixed; top: 80px; right: 20px;
  display: flex; flex-direction: column; gap: 10px;
  z-index: 300;
}
.ach-toast {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 18px;
  background: var(--bg-dark);
  border: 1px solid var(--accent-red);
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  min-width: 280px;
}
.ach-icon { font-size: 24px; }
.ach-info { flex: 1; }
.ach-name {
  font-family: var(--font-serif);
  font-size: 14px; font-weight: 500;
  color: var(--accent-red);
  letter-spacing: 2px;
}
.ach-desc {
  font-size: 11px; color: var(--dark-text-muted);
  letter-spacing: 1px; margin-top: 2px;
}

.ach-enter-active { animation: slideInRight .4s ease both; }
.ach-leave-active { transition: all .3s; }
.ach-leave-to { opacity: 0; transform: translateX(20px); }

.save-toast {
  position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
  background:var(--bg-dark); border:1px solid var(--border-mid);
  color:var(--dark-text-sub); padding:6px 20px;
  font-size:12px; letter-spacing:3px; font-family:var(--font-serif);
  box-shadow:0 4px 16px rgba(0,0,0,.4); z-index:300;
}
.toast-enter-active { animation:fadeInUp .2s ease; }
.toast-leave-active { transition:opacity .25s; }
.toast-leave-to { opacity:0; }

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(100px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>