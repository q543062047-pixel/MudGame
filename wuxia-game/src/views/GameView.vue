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
        <!-- 战斗：独占 -->
        <BattleView v-if="gs.phase==='battle'" key="battle"/>

        <!-- 地图(2) + 探索文字(1) -->
        <div v-else class="main-layout" key="story">

          <div class="map-zone">
            <MapGrid ref="mapRef" @move="onMove" @enterCell="onEnterCell"/>
          </div>

          <div class="v-sep"/>

          <!-- ── 探索信息区（仅地图/NPC交互） ── -->
          <div class="explore-zone">

            <!-- 状态：NPC列表 -->
            <div v-if="cellNpcs.length && !activeNpc" class="npc-bar">
              <span class="npc-label">在场人物</span>
              <button
                v-for="npc in cellNpcs" :key="npc.id"
                class="npc-tag" @click="talkTo(npc)"
              >
                <span class="npc-tag-icon">{{ npc.icon }}</span>{{ npc.name }}
              </button>
            </div>

            <!-- 状态：NPC对话中 -->
            <div v-if="activeNpc" class="npc-dialog">
              <div class="nd-hd">
                <div class="nd-info">
                  <span class="nd-icon">{{ activeNpc.icon }}</span>
                  <div>
                    <div class="nd-name">{{ activeNpc.name }}</div>
                    <div class="nd-title">{{ activeNpc.title }}</div>
                  </div>
                </div>
                <button class="nd-close" @click="closeNpc">✕</button>
              </div>
              <div class="nd-body">
                <p class="nd-text">{{ currentDialogue }}</p>
              </div>
              <div class="nd-foot">
                <button class="nd-btn" @click="nextDialogue">
                  {{ dialogueIdx < activeNpc.dialogues.length-1 ? '继续' : '告辞' }}
                </button>
                <button v-if="activeNpc.scenarioId" class="nd-btn special"
                  @click="triggerNpcScenario">
                  【与之深谈】
                </button>
              </div>
            </div>

            <!-- 状态：地点/移动描述（默认） -->
            <div v-if="!activeNpc" class="explore-text">
              <div class="explore-atm" :class="exploreAtm"/>
              <div class="explore-content">
                <TransitionGroup name="eline" tag="div" class="elines">
                  <p v-for="(line, i) in exploreLines" :key="i" class="eline">{{ line }}</p>
                </TransitionGroup>
              </div>
            </div>

          </div>
        </div>
      </Transition>
    </div>

    <!-- ══ 过场全屏：所有主线剧情节点 ══ -->
    <Transition name="cutscene">
      <div v-if="cutsceneOn" class="cutscene" @click="csClick">
        <div class="cs-inner">
          <div class="cs-atm-bar" :class="csAtm"/>

          <div class="cs-body" ref="csBodyEl">
            <TransitionGroup name="csp" tag="div">
              <p v-for="(t,i) in csHistory" :key="`h${i}`" class="csp csp-old">{{ t }}</p>
            </TransitionGroup>
            <p v-if="csDisplayed" class="csp csp-cur">
              {{ csDisplayed }}<span v-if="csTyping" class="cs-cursor"/>
            </p>
          </div>

          <div v-if="!csTyping && csParagraphQueue.length" class="cs-hint">▸ 点击继续</div>

          <!-- 过场选项 -->
          <div v-if="!csTyping && !csParagraphQueue.length && csChoices.length" class="cs-choices">
            <div class="cs-sep">
              <span class="cs-line"/><span class="cs-mark">选择应对</span><span class="cs-line"/>
            </div>
            <button
              v-for="(ch, i) in csChoices" :key="i"
              class="cs-cbtn"
              :class="{ 'cs-locked': !checkCondition(ch) }"
              :disabled="!checkCondition(ch)"
              @click.stop="handleCsChoice(ch)"
            >
              <span class="cs-idx">{{ csNums[i] || i+1 }}</span>
              <span class="cs-txt">{{ ch.text }}</span>
              <span v-if="!checkCondition(ch)" class="cs-lock">（条件不足）</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

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
import { useSave } from '@/composables/useSave'
import { useTypewriter } from '@/composables/useTypewriter'
import { NPC_DATA, CELL_DESCRIPTIONS, TERRAIN_DESCRIPTIONS } from '@/data/npcData'
import { TERRAIN_TYPE_NAMES } from '@/data/worldMap'
import CharacterPanel from '@/components/game/CharacterPanel.vue'
import BattleView     from '@/components/game/BattleView.vue'
import MapGrid        from '@/components/game/MapGrid.vue'
import type { Choice, MapCell } from '@/types'
import type { NPC } from '@/data/npcData'

const router = useRouter()
const gs     = useGameStore()
const ps     = usePlayerStore()
const ws     = useWorldStore()
const { getCurrentNode, selectChoice, checkCondition, goToNode } = useGameEngine()
const { save } = useSave()

// ════════════════════════════════════════════════
// 主线剧情节点集合
// 这些节点全部走过场全屏，绝不出现在探索文字区
// ════════════════════════════════════════════════
const ALL_SCENARIO_IDS = new Set([
  'start', 'ask_master',
  'road_start',
  'forest_observe', 'forest_distract', 'forest_rescue',
  'rescue_win', 'rescue_lose', 'meet_scholar',
  'city_gate', 'city_argue', 'city_identity',
  'city_fight_guard', 'city_fight_win',
  'city_inside', 'city_explore',
  'herbal_shop',
  'tavern_arrive', 'chapter_end',
])

// 触发过场的地点绑定
// key = "cellY,cellX" → 对应的剧情节点 ID
const MAP_TRIGGER: Record<string, string> = {
  '2,2': 'start',          // 青云山起点（游戏开始时）
  '1,9': 'city_gate',      // 苍梧城入口
  '2,9': 'city_inside',    // 苍梧城内
  '4,9': 'herbal_shop',    // 百草堂
  '12,9': 'forest_rescue', // 废弃地牢
  '11,10': 'city_explore', // 林中茶舍→打探消息
}

function isCutsceneId(id: string) {
  return ALL_SCENARIO_IDS.has(id)
}

// ════════════════════════════════════════════════
// 探索文字区状态（地图信息，与主线完全独立）
// ════════════════════════════════════════════════
const exploreLines = ref<string[]>(['踏上征途，江湖在望。'])
const exploreAtm   = ref<string>('normal')

function setExploreText(lines: string[], atm = 'normal') {
  exploreLines.value = lines
  exploreAtm.value   = atm
}

// ════════════════════════════════════════════════
// NPC 交互系统
// ════════════════════════════════════════════════
const cellNpcs       = ref<NPC[]>([])
const activeNpc      = ref<NPC | null>(null)
const dialogueIdx    = ref(0)
const currentDialogue = computed(() =>
  activeNpc.value
    ? activeNpc.value.dialogues[dialogueIdx.value % activeNpc.value.dialogues.length]
    : ''
)

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

function closeNpc() { activeNpc.value = null }

function triggerNpcScenario() {
  const sid = activeNpc.value?.scenarioId
  closeNpc()
  if (sid) openCutscene(sid)
}

// ════════════════════════════════════════════════
// 地图移动回调
// ════════════════════════════════════════════════
function onMove(cell: MapCell, moved: boolean) {
  if (!moved) {
    // 撞墙：在探索区简短提示
    const terrain = TERRAIN_DESCRIPTIONS[cell.type]
    setExploreText([terrain?.[0] ?? '此路不通。'], 'normal')
  }
}

function onEnterCell(cell: MapCell) {
  activeNpc.value = null
  dialogueIdx.value = 0

  const key = `${cell.y},${cell.x}`

  // 1. 更新 NPC 列表
  cellNpcs.value = NPC_DATA[key] ?? []

  // 2. 更新探索文字（地点描述或地形描述）
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

  // 3. 检查是否有地图触发的主线剧情
  const triggerNode = MAP_TRIGGER[key]
  if (triggerNode && !gs.flags[`visited_${triggerNode}`]) {
    ws.clearEvent(cell.x, cell.y)
    // 延迟一拍让地点描述先显示
    setTimeout(() => openCutscene(triggerNode), 400)
  }
}

function cellAtm(type: string) {
  if (['forest', 'dungeon'].includes(type)) return 'tense'
  if (['temple', 'mountain'].includes(type)) return 'peaceful'
  if (['town', 'inn', 'shop'].includes(type)) return 'normal'
  return 'normal'
}

// ════════════════════════════════════════════════
// 过场系统 — 唯一负责所有主线剧情的呈现
// ════════════════════════════════════════════════
const cutsceneOn         = ref(false)
const csAtm              = ref('normal')
const csHistory          = ref<string[]>([])
const csParagraphQueue   = ref<string[]>([])
const csChoices          = ref<Choice[]>([])
const csNums             = ['一','二','三','四','五','六']
const csBodyEl           = ref<HTMLElement>()

const {
  displayedText: csDisplayed, isTyping: csTyping,
  typeText: csType, skipTyping: csSkip, reset: csReset,
} = useTypewriter()

function openCutscene(nodeId: string) {
  if (gs.phase === 'battle') return

  // 先切换到目标节点（应用 effects）
  goToNode(nodeId)
  if (gs.phase === 'battle') return

  // 渲染当前节点内容（watcher 不会重复触发，因为 cutsceneOn 已为 true）
  renderCutscene()
}

function renderCutscene() {
  const node = getCurrentNode()
  if (!node) return
  cutsceneOn.value        = true
  csAtm.value             = node.atmosphere ?? 'normal'
  csHistory.value         = []
  csChoices.value         = []
  csParagraphQueue.value  = [...node.text]
  csReset()
  nextCsPara()
}

function closeCutscene() { cutsceneOn.value = false; csReset() }

async function nextCsPara() {
  if (!csParagraphQueue.value.length) {
    csChoices.value = getCurrentNode()?.choices ?? []
    // 标记为已访问，防止重复触发
    gs.setFlag(`visited_${gs.currentNodeId}`)
    return
  }
  const para = csParagraphQueue.value.shift()!
  await csType(para, 30)
  if (csParagraphQueue.value.length) {
    csHistory.value.push(para)
    csDisplayed.value = ''
    nextTick(() => { if (csBodyEl.value) csBodyEl.value.scrollTop = csBodyEl.value.scrollHeight })
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
  // selectChoice 会切换 currentNodeId，watcher 会自动打开下一个过场
  selectChoice(ch)
}

// 进入战斗时关闭过场
watch(() => gs.phase, (p) => { if (p === 'battle') closeCutscene() })


// ════════════════════════════════════════════════
// 监听节点切换（autoNext / selectChoice 跳转后续节点）
// 如果新节点是主线节点且当前过场已关闭，自动打开
// ════════════════════════════════════════════════
watch(() => gs.currentNodeId, (newId) => {
  if (gs.phase === 'battle') return
  // autoNext 或 selectChoice 跳转后，若新节点是主线节点且过场未在运行，接续展示
  if (isCutsceneId(newId) && !cutsceneOn.value) {
    nextTick(() => renderCutscene())
  }
})

// ── 杂项 ──
const saveToast = ref(false)
const mapRef    = ref()

const locLabel = computed(() => {
  const c = ws.currentCell
  return c.name || TERRAIN_TYPE_NAMES[c.type] || '江湖'
})

function doSave() {
  save(); saveToast.value = true
  setTimeout(() => { saveToast.value = false }, 2000)
}

onMounted(() => {
  if (gs.phase === 'menu') { router.push('/'); return }
  const cell = ws.currentCell
  const key  = `${cell.y},${cell.x}`
  setExploreText(CELL_DESCRIPTIONS[key] ?? ['踏上征途，江湖在望。'])
  cellNpcs.value = NPC_DATA[key] ?? []
  // 游戏开始时打开初始过场
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

/* 顶栏 */
.hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 18px;
  background: var(--bg-dark); border-bottom: 1px solid #3a2810;
  flex-shrink: 0; min-height: 32px;
}
.hdr-loc   { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--dark-text-muted); letter-spacing:2px; }
.hdr-dot   { color:#4ab870; font-size:9px; animation:breathe 2s ease-in-out infinite; }
.hdr-title { font-family:var(--font-title); font-size:13px; color:var(--dark-text-sub); letter-spacing:3px; }
.hdr-day   { font-size:10px; color:var(--dark-text-faint); letter-spacing:2px; }

/* 主布局 */
.main-layout { flex:1; display:flex; flex-direction:column; overflow:hidden; }

/* 地图区 flex:2 */
.map-zone { flex:2; min-height:0; overflow:hidden; }

/* 分割线 */
.v-sep {
  height: 2px; flex-shrink: 0;
  background: linear-gradient(90deg, transparent, var(--border-mid) 30%, var(--border-strong) 50%, var(--border-mid) 70%, transparent);
}

/* 探索信息区 flex:1 */
.explore-zone {
  flex: 1; min-height: 0;
  display: flex; flex-direction: column;
  background: var(--bg-panel);
  overflow: hidden;
}

/* NPC 列表栏 */
.npc-bar {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 7px 18px; flex-shrink: 0;
  border-bottom: 1px solid var(--border-faint);
  background: var(--bg-surface);
}
.npc-label { font-size:10px; color:var(--text-on-paper-faint); letter-spacing:2px; }
.npc-tag {
  display: flex; align-items: center; gap: 5px;
  padding: 3px 12px;
  background: transparent; border: 1px solid var(--border-mid);
  font-family: var(--font-serif); font-size:12px;
  color: var(--text-on-paper-sub); cursor: pointer; letter-spacing:1px;
  transition: all .13s;
}
.npc-tag:hover { border-color:var(--accent-red); color:var(--accent-red); background:rgba(192,57,43,.05); }
.npc-tag-icon { font-size:13px; }

/* NPC 对话 */
.npc-dialog {
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
}
.nd-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 18px 8px;
  border-bottom: 1px solid var(--border-faint);
  background: var(--bg-surface); flex-shrink: 0;
}
.nd-info  { display: flex; align-items: center; gap: 10px; }
.nd-icon  { font-size: 22px; line-height: 1; }
.nd-name  { font-size:15px; font-weight:500; color:var(--text-primary); letter-spacing:2px; }
.nd-title { font-size:10px; color:var(--text-on-paper-faint); letter-spacing:1px; margin-top:2px; }
.nd-close { background:none; border:none; color:var(--text-on-paper-faint); cursor:pointer; font-size:16px; padding:4px; transition:color .12s; }
.nd-close:hover { color:var(--accent-red); }

.nd-body {
  flex: 1; overflow-y: auto; padding: 16px 22px;
}
.nd-text {
  font-family: var(--font-serif); font-size:15px; font-weight:400;
  line-height: 2.2; letter-spacing:2px;
  color: var(--text-on-paper);
}

.nd-foot {
  display: flex; gap: 8px; padding: 10px 18px;
  border-top: 1px solid var(--border-faint);
  background: var(--bg-surface); flex-shrink: 0;
}
.nd-btn {
  padding: 6px 18px; background:transparent;
  border: 1px solid var(--border-mid);
  font-family:var(--font-serif); font-size:13px;
  color:var(--text-on-paper-sub); cursor:pointer; letter-spacing:2px;
  transition: all .13s;
}
.nd-btn:hover { border-color:var(--border-strong); color:var(--text-primary); }
.nd-btn.special { border-color:var(--accent-red); color:var(--accent-red); }
.nd-btn.special:hover { background:rgba(192,57,43,.07); }

/* 探索文字区（地点/地形描述） */
.explore-text {
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
}
.explore-atm {
  height: 2px; flex-shrink: 0; transition: background .7s;
}
.explore-atm.peaceful { background: linear-gradient(90deg,transparent,#2e7d52 50%,transparent); }
.explore-atm.tense    { background: linear-gradient(90deg,transparent,#c0392b 50%,transparent); }
.explore-atm.normal   { background: linear-gradient(90deg,transparent,#c9a96e 50%,transparent); }
.explore-atm.mystery  { background: linear-gradient(90deg,transparent,#b8860b 50%,transparent); }

.explore-content {
  flex: 1; overflow-y: auto; padding: 16px 22px;
}
.elines { display: flex; flex-direction: column; gap: 4px; }
.eline {
  font-family: var(--font-serif);
  font-size: 14px; font-weight: 400;
  line-height: 2; letter-spacing: 2px;
  color: var(--text-on-paper-sub);
  animation: fadeInUp .25s ease both;
}

/* 阶段切换动画 */
.phase-enter-active { animation: fadeInUp .25s ease both; }
.phase-leave-active { transition: opacity .15s; }
.phase-leave-to { opacity: 0; }

/* TransitionGroup eline */
.eline-enter-active { transition: all .25s ease; }
.eline-enter-from   { opacity:0; transform:translateY(5px); }

/* ══════════════════════════════
   过场全屏 — 主线专属
   ══════════════════════════════ */
.cutscene {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(12, 7, 2, 0.97);
  display: flex; align-items: center; justify-content: center;
  cursor: default;
}

.cs-inner {
  width: min(740px, 90vw);
  max-height: 84vh;
  display: flex; flex-direction: column;
}

.cs-atm-bar {
  height: 2px; margin-bottom: 40px; flex-shrink: 0; transition: background .8s;
}
.cs-atm-bar.peaceful { background: linear-gradient(90deg,transparent,#2e7d52 50%,transparent); }
.cs-atm-bar.tense    { background: linear-gradient(90deg,transparent,#c0392b 50%,transparent); }
.cs-atm-bar.battle   { background: linear-gradient(90deg,transparent,#8b0000 50%,transparent); animation:breathe .7s infinite; }
.cs-atm-bar.mystery  { background: linear-gradient(90deg,transparent,#b8860b 50%,transparent); }
.cs-atm-bar.normal   { background: linear-gradient(90deg,transparent,#5a3a18 50%,transparent); }

.cs-body {
  flex: 1; overflow-y: auto;
  display: flex; flex-direction: column; gap: 6px;
  padding: 0 8px;
}

.csp {
  font-family: var(--font-serif);
  font-size: 18px; font-weight: 400;
  line-height: 2.3; letter-spacing: 3px;
  color: #f0e4c8;
}
.csp-old { color: #6a5030; }
.csp-cur { animation: fadeInUp .22s ease both; }

.cs-cursor {
  display: inline-block;
  width: 1px; height: 1em;
  background: #c0392b;
  vertical-align: text-bottom; margin-left: 2px;
  animation: blink .9s step-end infinite;
}

.cs-hint {
  font-size: 11px; letter-spacing: 4px; color: #4a3018;
  text-align: center; padding: 22px 0 6px;
  animation: breathe 2.2s ease-in-out infinite;
}

/* 过场选项 */
.cs-choices { padding-top: 28px; flex-shrink: 0; }
.cs-sep {
  display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
}
.cs-line { flex:1; height:1px; background:#2a1a08; }
.cs-mark { font-size:10px; color:#4a3018; letter-spacing:3px; white-space:nowrap; }

.cs-cbtn {
  display: flex; align-items: flex-start; gap: 14px;
  width: 100%; padding: 12px 20px; margin-bottom: 8px;
  background: rgba(255,240,200,.04);
  border: 1px solid #2a1a08; border-left: 3px solid transparent;
  cursor: pointer; text-align: left;
  font-family: var(--font-serif); font-size: 16px; font-weight: 400;
  color: #c8a870; letter-spacing: 2px; line-height: 1.8;
  transition: all .14s;
}
.cs-cbtn:hover:not(.cs-locked) {
  border-left-color: #c0392b;
  background: rgba(255,220,160,.07);
  color: #f0e4c8;
}
.cs-cbtn.cs-locked { opacity:.35; cursor:not-allowed; }

.cs-idx { font-size:12px; color:#c0392b; font-weight:600; min-width:16px; flex-shrink:0; padding-top:3px; }
.cs-txt { flex:1; }
.cs-lock { font-size:11px; color:#4a3018; align-self:center; }

/* 过场入退场 */
.cutscene-enter-active { animation: fadeInUp .4s ease both; }
.cutscene-leave-active { transition: opacity .3s; }
.cutscene-leave-to { opacity: 0; }

.csp-enter-active { transition: all .22s ease; }
.csp-enter-from   { opacity:0; transform:translateY(5px); }

/* Toast */
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
</style>
