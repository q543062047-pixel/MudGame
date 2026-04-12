<template>
  <div class="text-output" ref="outputEl" @click="handleClick">
    <!-- 氛围标记 -->
    <div class="atmosphere-bar" :class="atmosphere" />

    <!-- 历史文字（已读段落） -->
    <div class="history-section">
      <TransitionGroup name="paragraph" tag="div">
        <div
          v-for="(para, i) in historyParagraphs"
          :key="`h-${i}`"
          class="paragraph history"
        >{{ para }}</div>
      </TransitionGroup>
    </div>

    <!-- 当前正在打字的段落 -->
    <div v-if="displayedText" class="paragraph current" ref="currentEl">
      {{ displayedText }}<span v-if="isTyping" class="cursor">▎</span>
    </div>

    <!-- 打字完成提示 -->
    <div v-if="!isTyping && paragraphQueue.length > 0" class="next-hint" @click.stop="nextParagraph">
      ── 点击继续 ──
    </div>

    <!-- 空状态 -->
    <div v-if="!displayedText && historyParagraphs.length === 0" class="idle-hint">
      正在载入故事……
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useTypewriter } from '@/composables/useTypewriter'

const props = defineProps<{
  paragraphs: string[]
  atmosphere?: string
}>()

const emit = defineEmits<{
  done: []
}>()

const outputEl = ref<HTMLElement>()
const currentEl = ref<HTMLElement>()
const historyParagraphs = ref<string[]>([])
const paragraphQueue = ref<string[]>([])

const { displayedText, isTyping, typeText, skipTyping, reset } = useTypewriter()

// 当 paragraphs 变化时重置并开始打字
watch(
  () => props.paragraphs,
  async (newParagraphs) => {
    reset()
    historyParagraphs.value = []
    paragraphQueue.value = [...newParagraphs]
    await nextTick()
    await nextParagraph()
  },
  { immediate: true }
)

async function nextParagraph() {
  if (paragraphQueue.value.length === 0) {
    emit('done')
    return
  }
  const para = paragraphQueue.value.shift()!
  await typeText(para, 35)
  // 完成后压入历史，清空当前
  if (paragraphQueue.value.length > 0) {
    historyParagraphs.value.push(para)
    displayedText.value = ''
    scrollToBottom()
  } else {
    scrollToBottom()
    emit('done')
  }
}

function handleClick() {
  if (isTyping.value) {
    // 跳过打字
    const fullText = paragraphQueue.value.length > 0
      ? props.paragraphs[historyParagraphs.value.length]
      : props.paragraphs[props.paragraphs.length - 1]
    skipTyping(fullText)
  } else if (paragraphQueue.value.length > 0) {
    nextParagraph()
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (outputEl.value) {
      outputEl.value.scrollTop = outputEl.value.scrollHeight
    }
  })
}
</script>

<style scoped>
.text-output {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px 16px;
  cursor: default;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.atmosphere-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  transition: background 1s ease;
}
.atmosphere-bar.peaceful { background: linear-gradient(90deg, transparent, var(--color-jade), transparent); }
.atmosphere-bar.tense { background: linear-gradient(90deg, transparent, var(--color-vermilion), transparent); }
.atmosphere-bar.battle { background: linear-gradient(90deg, transparent, #8b0000, transparent); animation: breathe 0.8s ease-in-out infinite; }
.atmosphere-bar.mystery { background: linear-gradient(90deg, transparent, var(--color-gold), transparent); }
.atmosphere-bar.normal { background: linear-gradient(90deg, transparent, var(--color-border), transparent); }

.history-section { display: flex; flex-direction: column; }

.paragraph {
  font-family: var(--font-serif);
  font-size: 16px;
  line-height: 2.2;
  letter-spacing: 2px;
  color: var(--color-ink-light);
  margin-bottom: 4px;
  user-select: none;
}

.paragraph.history {
  color: var(--color-ink-faint);
  opacity: 0.7;
}

.paragraph.current {
  color: var(--color-ink);
  animation: fadeInUp 0.3s ease both;
}

.cursor {
  display: inline-block;
  color: var(--color-vermilion);
  animation: breathe 0.7s ease-in-out infinite;
  margin-left: 1px;
}

.next-hint {
  font-size: 12px;
  letter-spacing: 4px;
  color: var(--color-ink-faint);
  text-align: center;
  padding: 12px 0 4px;
  animation: breathe 2s ease-in-out infinite;
  cursor: pointer;
}
.next-hint:hover { color: var(--color-vermilion); }

.idle-hint {
  font-size: 13px;
  color: var(--color-ink-faint);
  letter-spacing: 3px;
  text-align: center;
  padding-top: 40px;
}

/* 历史段落入场动画 */
.paragraph-enter-active { transition: all 0.3s ease; }
.paragraph-enter-from { opacity: 0; transform: translateY(6px); }
</style>
