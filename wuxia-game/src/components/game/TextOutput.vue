<template>
  <div class="text-output" ref="el" @click="handleClick">
    <div class="atm-line" :class="atmosphere"/>
    <TransitionGroup name="para" tag="div" class="history">
      <p v-for="(p,i) in history" :key="i" class="para old">{{ p }}</p>
    </TransitionGroup>
    <p v-if="displayed" class="para current">
      {{ displayed }}<span v-if="typing" class="cursor"/>
    </p>
    <div v-if="!typing && queue.length>0" class="hint" @click.stop="next">▸ 点击继续</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useTypewriter } from '@/composables/useTypewriter'

const props = defineProps<{ paragraphs: string[]; atmosphere?: string }>()
const emit = defineEmits<{ done:[] }>()

const el = ref<HTMLElement>()
const history = ref<string[]>([])
const queue = ref<string[]>([])
const { displayedText: displayed, isTyping: typing, typeText, skipTyping, reset } = useTypewriter()

watch(() => props.paragraphs, async (p) => {
  reset(); history.value = []; queue.value = [...p]
  await nextTick(); next()
}, { immediate: true })

async function next() {
  if (!queue.value.length) { emit('done'); return }
  const para = queue.value.shift()!
  await typeText(para, 30)
  if (queue.value.length) {
    history.value.push(para); displayed.value = ''
    nextTick(() => { if (el.value) el.value.scrollTop = el.value.scrollHeight })
  } else {
    nextTick(() => { if (el.value) el.value.scrollTop = el.value.scrollHeight })
    emit('done')
  }
}

function handleClick() {
  if (typing.value) {
    skipTyping(props.paragraphs[history.value.length] ?? '')
    if (!queue.value.length) emit('done')
  } else if (queue.value.length) next()
}
</script>

<style scoped>
.text-output {
  flex: 1; overflow-y: auto;
  padding: 14px 22px 10px;
  display: flex; flex-direction: column;
  background: var(--bg-panel);
  cursor: default;
}

.atm-line {
  height: 2px; margin: -14px -22px 12px; flex-shrink: 0;
  transition: background .8s;
}
.atm-line.peaceful { background: linear-gradient(90deg,transparent,#2e7d52 50%,transparent); }
.atm-line.tense    { background: linear-gradient(90deg,transparent,#c0392b 50%,transparent); }
.atm-line.battle   { background: linear-gradient(90deg,transparent,#8b0000 50%,transparent); animation: breathe .7s infinite; }
.atm-line.mystery  { background: linear-gradient(90deg,transparent,#b8860b 50%,transparent); }
.atm-line.normal   { background: linear-gradient(90deg,transparent,#c9a96e 50%,transparent); }

.history { display: flex; flex-direction: column; }

.para {
  font-family: var(--font-serif);
  font-size: 15px; font-weight: 400;
  line-height: 2.1; letter-spacing: 2px;
  color: var(--text-on-paper);
  margin-bottom: 2px;
}
.para.old     { color: var(--text-on-paper-muted); }
.para.current { color: var(--text-on-paper); animation: fadeInUp .22s ease both; }

.cursor {
  display: inline-block;
  width: 1px; height: 1em;
  background: var(--accent-red);
  vertical-align: text-bottom;
  margin-left: 2px;
  animation: blink .9s step-end infinite;
}

.hint {
  font-size: 11px; letter-spacing: 3px;
  color: var(--text-on-paper-faint);
  text-align: center; padding: 8px 0 2px;
  animation: breathe 2.2s ease-in-out infinite;
  cursor: pointer; transition: color .15s;
}
.hint:hover { color: var(--accent-red); }

.para-enter-active { transition: all .22s ease; }
.para-enter-from   { opacity: 0; transform: translateY(4px); }
</style>
