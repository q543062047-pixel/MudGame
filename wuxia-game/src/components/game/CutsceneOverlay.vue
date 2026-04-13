<template>
  <Transition name="cutscene">
    <div v-if="visible" class="cutscene" @click="handleClick">
      <div class="cs-inner">
        <div class="cs-atm-bar" :class="atmosphere"/>

        <div class="cs-body" ref="bodyEl">
          <TransitionGroup name="csp" tag="div">
            <p v-for="(t,i) in history" :key="`h${i}`" class="csp csp-old">{{ t }}</p>
          </TransitionGroup>
          <p v-if="displayedText" class="csp csp-cur">
            {{ displayedText }}<span v-if="isTyping" class="cs-cursor"/>
          </p>
        </div>

        <div v-if="!isTyping && paragraphQueue.length" class="cs-hint">▸ 点击继续</div>

        <!-- 选项 -->
        <div v-if="!isTyping && !paragraphQueue.length && choices.length" class="cs-choices">
          <div class="cs-sep">
            <span class="cs-line"/><span class="cs-mark">选择应对</span><span class="cs-line"/>
          </div>
          <button
            v-for="(ch, i) in choices" :key="i"
            class="cs-cbtn"
            :class="{ 'cs-locked': !checkCondition(ch) }"
            :disabled="!checkCondition(ch)"
            @click.stop="$emit('select-choice', ch)"
          >
            <span class="cs-idx">{{ NUMS[i] || i+1 }}</span>
            <span class="cs-txt">{{ ch.text }}</span>
            <span v-if="!checkCondition(ch)" class="cs-lock">（条件不足）</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Choice } from '@/types'

interface Props {
  visible: boolean
  atmosphere?: string
  history: string[]
  displayedText: string
  isTyping: boolean
  paragraphQueue: string[]
  choices: Choice[]
  checkCondition: (choice: Choice) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  atmosphere: 'normal'
})

const emit = defineEmits<{
  click: []
  'select-choice': [choice: Choice]
}>()

const NUMS = ['一','二','三','四','五','六']
const bodyEl = ref<HTMLElement>()

const handleClick = () => emit('click')

// 自动滚动到底部
watch(() => props.history.length, () => {
  nextTick(() => {
    if (bodyEl.value) {
      bodyEl.value.scrollTop = bodyEl.value.scrollHeight
    }
  })
})
</script>

<style scoped>
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

.cutscene-enter-active { animation: fadeInUp .4s ease both; }
.cutscene-leave-active { transition: opacity .3s; }
.cutscene-leave-to { opacity: 0; }

.csp-enter-active { transition: all .22s ease; }
.csp-enter-from   { opacity:0; transform:translateY(5px); }
</style>