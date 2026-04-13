<template>
  <div class="game-view">
    <CharacterPanel
      @use-item="ps.useItem($event)"
      @save="doSave"
      @back-home="router.push('/')"
    />

    <div class="game-right">
      <header class="hdr">
        <span class="hdr-loc"><span class="hdr-dot">◉</span>{{ ws.currentNode?.name || '未知' }}</span>
        <span class="hdr-title">江湖志·問劍錄</span>
        <span class="hdr-day">第 {{ gs.gameDay }} 日</span>
      </header>

      <Transition name="phase" mode="out-in">
        <!-- 战斗 -->
        <BattleView v-if="gs.phase==='battle'" key="battle"/>

        <!-- 节点探索 -->
        <NodeView
          v-else
          key="explore"
          @move="onMove"
          @talk-to-npc="handleNpcTalk"
          @trigger-scenario="handleTriggerScenario"
        />
      </Transition>
    </div>

    <!-- 小地图 -->
    <MiniMap />

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
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'
import { useWorldStore } from '@/stores/world'
import { useGameEngine } from '@/composables/useGameEngine'
import { useSaveSlots } from '@/composables/useSaveSlots'
import { useTypewriter } from '@/composables/useTypewriter'
import { useRandomEvents } from '@/composables/useRandomEvents'
import { useAchievements } from '@/composables/useAchievements'
import CharacterPanel from '@/components/game/CharacterPanel.vue'
import BattleView from '@/components/game/BattleView.vue'
import NodeView from '@/components/game/NodeView.vue'
import MiniMap from '@/components/game/MiniMap.vue'
import CutsceneOverlay from '@/components/game/CutsceneOverlay.vue'
import type { Choice, NodeEffect, Direction8, MapNode } from '@/types'

const router = useRouter()
const gs = useGameStore()
const ps = usePlayerStore()
const ws = useWorldStore()
const { getCurrentNode, selectChoice, checkCondition, goToNode } = useGameEngine()
const { saveToSlot } = useSaveSlots()
const { triggerRandomEvent, applyEventEffects, currentEvent: randomEvent, clearEvent } = useRandomEvents()
const { checkAchievements, newAchievements, clearNewUnlocks } = useAchievements()

// 存档提示
const saveToast = ref(false)
function doSave() {
  saveToSlot(0)
  saveToast.value = true
  setTimeout(() => saveToast.value = false, 2000)
}

// 移动处理
function onMove(direction: Direction8, node: MapNode) {
  // 检查是否触发剧情
  if (node.scenarioId) {
    openCutscene(node.scenarioId)
    return
  }

  // 随机事件触发（10%概率）
  if (Math.random() < 0.1) {
    const event = triggerRandomEvent()
    if (event && event.effects) {
      applyEventEffects(event.effects)
    }
  }

  // 检查成就
  const unlocked = checkAchievements()
  if (unlocked.length > 0) {
    setTimeout(() => clearNewUnlocks(), 3000)
  }
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
  
  closeCutscene()
  
  if (ch.next === gs.currentNodeId) {
    if (ch.effects) {
      const { applyEffects } = useGameEngine()
      applyEffects(ch.effects)
    }
    return
  }
  
  selectChoice(ch)
}

// 监听phase变化，战斗时关闭过场
watch(() => gs.phase, (p) => {
  if (p === 'battle') closeCutscene()
})

// 监听节点变化
watch(() => gs.currentNodeId, (newId) => {
  if (gs.phase === 'battle') return
  
  const node = getCurrentNode()
  if (node?.battle) return
  
  if (isCutsceneId(newId) && !cutsceneOn.value) {
    nextTick(() => renderCutscene())
  }
})

function isCutsceneId(nodeId: string): boolean {
  const node = getCurrentNode()
  return !!(node && node.text && node.text.length > 0)
}

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

// NPC 交互处理
function handleNpcTalk(npc: any) {
  console.log('与NPC对话:', npc.name)
}

function handleTriggerScenario(scenarioId: string) {
  openCutscene(scenarioId)
}
</script>

<style scoped>
.game-view {
  display: flex;
  height: 100vh;
  background: var(--bg-dark);
  color: var(--text-light);
  font-family: var(--font-sans);
  overflow: hidden;
}

.game-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: linear-gradient(135deg, #1a2410 0%, #0e1408 100%);
  border-bottom: 2px solid #2a3a1a;
  flex-shrink: 0;
}

.hdr-loc {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #8aa060;
  letter-spacing: 1px;
}

.hdr-dot {
  color: #e0b040;
  animation: breathe 2s ease-in-out infinite;
}

.hdr-title {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 700;
  color: #d0c090;
  letter-spacing: 3px;
}

.hdr-day {
  font-size: 12px;
  color: #6a7a5a;
  font-family: var(--font-mono);
}

.phase-enter-active, .phase-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.phase-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.phase-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 随机事件弹窗 */
.event-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(4px);
}

.event-box {
  background: linear-gradient(135deg, #1a2410 0%, #0e1408 100%);
  border: 2px solid #4a5a3a;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.event-title {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 700;
  color: #e0d0a0;
  margin-bottom: 12px;
  text-align: center;
  letter-spacing: 2px;
}

.event-desc {
  font-size: 14px;
  line-height: 1.8;
  color: #b0c080;
  margin-bottom: 20px;
  text-indent: 2em;
}

.event-choices {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-btn {
  padding: 10px 20px;
  background: rgba(80, 100, 50, 0.3);
  border: 1px solid #5a7a3a;
  border-radius: 6px;
  color: #b0d080;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font-serif);
  font-size: 14px;
}

.event-btn:hover {
  background: rgba(100, 120, 60, 0.4);
  border-color: #7a9a5a;
  transform: translateY(-2px);
}

.event-enter-active, .event-leave-active {
  transition: opacity 0.3s;
}
.event-enter-from, .event-leave-to {
  opacity: 0;
}

/* 成就提示 */
.ach-list {
  position: fixed;
  top: 80px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 150;
}

.ach-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #2a3a1a 0%, #1a2410 100%);
  border: 2px solid #5a7a3a;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  min-width: 280px;
}

.ach-icon {
  font-size: 32px;
  line-height: 1;
}

.ach-info {
  flex: 1;
}

.ach-name {
  font-family: var(--font-serif);
  font-size: 14px;
  font-weight: 700;
  color: #e0d0a0;
  margin-bottom: 4px;
}

.ach-desc {
  font-size: 12px;
  color: #8a9a6a;
}

.ach-enter-active {
  transition: all 0.4s;
}
.ach-leave-active {
  transition: all 0.3s;
}
.ach-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.ach-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

/* 存档提示 */
.save-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: rgba(80, 120, 60, 0.95);
  border: 1px solid #a0d080;
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  z-index: 300;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s;
}
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

@keyframes breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>