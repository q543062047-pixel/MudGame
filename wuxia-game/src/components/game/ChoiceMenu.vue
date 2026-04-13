<template>
  <Transition name="in">
    <div v-if="show" class="choice-wrap">
      <div class="sep"><span class="sl"/><span class="sm">选择应对</span><span class="sl"/></div>
      <div class="choices">
        <button
          v-for="(ch,i) in choices" :key="i"
          class="cbtn" :class="{ locked: !avail(ch) }"
          :disabled="!avail(ch)"
          @click="pick(ch)"
        >
          <span class="idx">{{ nums[i]||i+1 }}</span>
          <span class="txt">{{ ch.text }}</span>
          <span v-if="!avail(ch)" class="lock">（条件不足）</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Choice } from '@/types'
import { useGameEngine } from '@/composables/useGameEngine'
const props = defineProps<{ choices: Choice[]; show: boolean }>()
const emit = defineEmits<{ select: [c: Choice] }>()
const { checkCondition } = useGameEngine()
const nums = ['一','二','三','四','五','六']
const avail = (c: Choice) => checkCondition(c)
const pick  = (c: Choice) => { if (avail(c)) emit('select', c) }
</script>

<style scoped>
.choice-wrap {
  padding: 8px 22px 16px;
  border-top: 1px solid var(--border-faint);
  background: var(--bg-surface);
  flex-shrink: 0;
}

.sep { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.sl  { flex:1; height:1px; background: var(--border-faint); }
.sm  { font-size: 10px; color: var(--text-on-paper-faint); letter-spacing: 3px; white-space: nowrap; }

.choices { display: flex; flex-direction: column; gap: 5px; }

.cbtn {
  display: flex; align-items: flex-start; gap: 10px;
  width: 100%; padding: 8px 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-faint);
  border-left: 3px solid transparent;
  cursor: pointer; text-align: left;
  font-family: var(--font-serif); font-size: 14px; font-weight: 400;
  color: var(--text-on-paper); letter-spacing: 1.5px; line-height: 1.7;
  transition: all .14s;
}
.cbtn:hover:not(.locked) {
  border-left-color: var(--accent-red);
  background: #e8d0a0;
  color: var(--text-primary);
}
.cbtn.locked { opacity: .35; cursor: not-allowed; }

.idx  { font-size: 11px; color: var(--accent-red); font-weight: 600; min-width: 14px; padding-top: 2px; flex-shrink: 0; }
.txt  { flex: 1; }
.lock { font-size: 11px; color: var(--text-on-paper-faint); align-self: center; }

.in-enter-active { animation: fadeInUp .28s ease both; }
.in-leave-active { transition: opacity .14s; }
.in-leave-to     { opacity: 0; }
</style>
