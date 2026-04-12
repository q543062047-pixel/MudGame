<template>
  <Transition name="choices-in">
    <div v-if="show" class="choice-wrap">
      <div class="choice-divider">
        <span class="line" /><span class="mark">▸ 选择你的应对 ◂</span><span class="line" />
      </div>
      <div class="choices">
        <button
          v-for="(choice, i) in choices"
          :key="i"
          class="choice-btn"
          :class="{ unavailable: !isAvailable(choice) }"
          :disabled="!isAvailable(choice)"
          @click="select(choice)"
        >
          <span class="choice-idx">{{ indexChar(i) }}</span>
          <span class="choice-text">{{ choice.text }}</span>
          <span v-if="!isAvailable(choice)" class="lock-hint">（条件不足）</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Choice } from '@/types'
import { useGameEngine } from '@/composables/useGameEngine'

const props = defineProps<{
  choices: Choice[]
  show: boolean
}>()

const emit = defineEmits<{
  select: [choice: Choice]
}>()

const { checkCondition } = useGameEngine()

const CHINESE_NUMS = ['一', '二', '三', '四', '五', '六']
function indexChar(i: number) { return CHINESE_NUMS[i] || String(i + 1) }

function isAvailable(choice: Choice) {
  return checkCondition(choice)
}

function select(choice: Choice) {
  if (!isAvailable(choice)) return
  emit('select', choice)
}
</script>

<style scoped>
.choice-wrap {
  padding: 8px 32px 24px;
  border-top: 1px solid var(--color-border-light);
  background: rgba(245, 230, 200, 0.5);
}

.choice-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.choice-divider .line {
  flex: 1;
  height: 1px;
  background: var(--color-border-light);
}
.choice-divider .mark {
  font-size: 11px;
  color: var(--color-ink-faint);
  letter-spacing: 2px;
  white-space: nowrap;
}

.choices {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.choice-btn {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: 1px solid var(--color-border-light);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-serif);
  font-size: 14px;
  color: var(--color-ink-light);
  letter-spacing: 1.5px;
  line-height: 1.8;
  transition: all 0.18s;
  position: relative;
  overflow: hidden;
}

.choice-btn::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--color-vermilion);
  transform: scaleY(0);
  transition: transform 0.18s;
}

.choice-btn:hover {
  background: rgba(192, 57, 43, 0.05);
  border-color: var(--color-border);
  color: var(--color-ink);
}
.choice-btn:hover::before { transform: scaleY(1); }

.choice-btn.unavailable {
  opacity: 0.4;
  cursor: not-allowed;
}
.choice-btn.unavailable::before { display: none; }

.choice-idx {
  font-size: 12px;
  color: var(--color-vermilion);
  font-weight: 600;
  min-width: 16px;
  padding-top: 2px;
}

.choice-text { flex: 1; }

.lock-hint {
  font-size: 11px;
  color: var(--color-ink-faint);
  align-self: center;
}

/* 入场动画 */
.choices-in-enter-active {
  animation: fadeInUp 0.35s ease both;
}
.choices-in-leave-active {
  transition: opacity 0.2s;
}
.choices-in-leave-to { opacity: 0; }
</style>
