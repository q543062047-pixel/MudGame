<template>
  <div class="game-view">
    <!-- 左侧：角色面板 -->
    <CharacterPanel
      @use-item="handleUseItem"
      @save="handleSave"
      @back-home="goHome"
    />

    <!-- 右侧：主游戏区 -->
    <main class="game-main">
      <!-- 顶部标题栏 -->
      <header class="game-header">
        <div class="header-location">
          <span class="location-icon">◉</span>
          <span>{{ locationText }}</span>
        </div>
        <div class="header-title">江湖志·问剑录</div>
        <div class="header-day">第 {{ gameStore.gameDay }} 日</div>
      </header>

      <!-- 内容区（剧情 or 战斗） -->
      <Transition name="phase-switch" mode="out-in">
        <!-- 战斗界面 -->
        <BattleView v-if="gameStore.phase === 'battle'" key="battle" />

        <!-- 剧情界面 -->
        <div v-else class="story-area" key="story">
          <TextOutput
            :paragraphs="currentParagraphs"
            :atmosphere="currentAtmosphere"
            @done="onTextDone"
          />
          <ChoiceMenu
            :choices="currentChoices"
            :show="showChoices"
            @select="handleChoice"
          />
        </div>
      </Transition>
    </main>

    <!-- 存档提示 -->
    <Transition name="toast">
      <div v-if="saveToast" class="save-toast">✓ 存档成功</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'
import { useGameEngine } from '@/composables/useGameEngine'
import { useSave } from '@/composables/useSave'
import CharacterPanel from '@/components/game/CharacterPanel.vue'
import TextOutput from '@/components/game/TextOutput.vue'
import ChoiceMenu from '@/components/game/ChoiceMenu.vue'
import BattleView from '@/components/game/BattleView.vue'
import type { Choice } from '@/types'

const router = useRouter()
const gameStore = useGameStore()
const playerStore = usePlayerStore()
const { getCurrentNode, selectChoice } = useGameEngine()
const { save } = useSave()

const showChoices = ref(false)
const saveToast = ref(false)

const currentNode = computed(() => getCurrentNode())
const currentParagraphs = computed(() => currentNode.value?.text ?? [])
const currentChoices = computed(() => currentNode.value?.choices ?? [])
const currentAtmosphere = computed(() => currentNode.value?.atmosphere ?? 'normal')

const locationText = computed(() => {
  const id = gameStore.currentNodeId
  if (id.startsWith('city')) return '苍梧城'
  if (id.startsWith('forest') || id.startsWith('road')) return '青云山道'
  if (id.startsWith('tavern') || id.startsWith('chapter_end')) return '醉仙楼'
  if (id.startsWith('herbal')) return '百草堂'
  if (id.startsWith('rescue') || id.startsWith('meet')) return '林间小道'
  if (id.startsWith('ask') || id === 'start') return '青云山'
  return '江湖'
})

// 节点变化时重置选项显示
watch(
  () => gameStore.currentNodeId,
  () => { showChoices.value = false },
  { immediate: true }
)

function onTextDone() {
  if (currentChoices.value.length > 0) {
    showChoices.value = true
  }
}

function handleChoice(choice: Choice) {
  showChoices.value = false
  selectChoice(choice)
}

function handleUseItem(itemId: string) {
  playerStore.useItem(itemId)
}

function handleSave() {
  save()
  saveToast.value = true
  setTimeout(() => { saveToast.value = false }, 2000)
}

function goHome() {
  router.push('/')
}

onMounted(() => {
  if (gameStore.phase === 'menu') {
    router.push('/')
  }
})
</script>

<style scoped>
.game-view {
  width: 100vw;
  height: 100vh;
  display: flex;
  background: var(--color-paper);
  overflow: hidden;
}

.game-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 24px;
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-paper-dark);
  flex-shrink: 0;
}

.header-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-ink-faint);
  letter-spacing: 2px;
}
.location-icon {
  color: var(--color-vermilion);
  font-size: 10px;
  animation: breathe 2s ease-in-out infinite;
}

.header-title {
  font-family: var(--font-title);
  font-size: 15px;
  color: var(--color-ink);
  letter-spacing: 3px;
}

.header-day {
  font-size: 11px;
  color: var(--color-ink-faint);
  letter-spacing: 2px;
}

.story-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 阶段切换动画 */
.phase-switch-enter-active { animation: fadeInUp 0.3s ease both; }
.phase-switch-leave-active { transition: opacity 0.2s; }
.phase-switch-leave-to { opacity: 0; }

/* 存档提示 */
.save-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-ink);
  color: var(--color-paper);
  padding: 8px 24px;
  font-size: 13px;
  letter-spacing: 3px;
  font-family: var(--font-serif);
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  z-index: 100;
}

.toast-enter-active { animation: fadeInUp 0.25s ease; }
.toast-leave-active { transition: opacity 0.3s; }
.toast-leave-to { opacity: 0; }
</style>
