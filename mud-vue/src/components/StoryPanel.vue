<template>
  <div class="story-panel">
    <!-- 剧情滚动区 -->
    <div ref="scrollEl" class="story-scroll">
      <div class="scroll-inner">
        <TransitionGroup name="msg" tag="div">
          <div
            v-for="msg in store.messages"
            :key="msg.id"
            class="msg"
            :class="`msg-${msg.type}`"
          >
            {{ msg.text }}
          </div>
        </TransitionGroup>

        <!-- 加载中 -->
        <div v-if="store.isLoading" class="loading-row">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>

        <!-- 错误提示 -->
        <div v-if="store.error" class="error-row">
          <span>⚠ {{ store.error }}</span>
          <button class="retry-btn" @click="store.retryLast">重试</button>
        </div>
      </div>
    </div>

    <!-- 选项 + 输入区 -->
    <div class="choices-area">
      <div class="choices-label">▸ 你将如何行动？</div>

      <TransitionGroup name="choice" tag="div" class="choices-list">
        <button
          v-for="(choice, i) in store.choices"
          :key="choice + i"
          class="choice-btn"
          :disabled="store.isLoading"
          @click="handleChoice(choice)"
        >
          {{ choice }}
        </button>
      </TransitionGroup>

      <div class="input-row">
        <input
          ref="inputEl"
          v-model="freeText"
          class="free-input"
          placeholder="或者自行输入行动，自由掌控命运..."
          :disabled="store.isLoading"
          @keyup.enter="handleFree"
        />
        <button
          class="send-btn"
          :disabled="store.isLoading || !freeText.trim()"
          @click="handleFree"
        >
          出招
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const store = useGameStore()
const scrollEl = ref(null)
const inputEl  = ref(null)
const freeText = ref('')

// 自动滚动到底部
watch(
  () => [store.messages.length, store.isLoading],
  async () => {
    await nextTick()
    if (scrollEl.value) {
      scrollEl.value.scrollTop = scrollEl.value.scrollHeight
    }
  }
)

function handleChoice(choice) {
  store.playerAction(choice)
}

function handleFree() {
  const text = freeText.value.trim()
  if (!text || store.isLoading) return
  freeText.value = ''
  store.playerAction(text)
}
</script>

<style scoped>
.story-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid var(--color-border-dim);
}

/* 滚动区 */
.story-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px 16px;
}

.scroll-inner { display: flex; flex-direction: column; }

/* 消息样式 */
.msg {
  margin-bottom: 14px;
  line-height: 2;
  font-size: 15px;
  letter-spacing: 0.5px;
}

.msg-narrate {
  color: var(--color-text-dim);
  border-left: 2px solid var(--color-gold-mute);
  padding-left: 14px;
}

.msg-dialogue {
  color: var(--color-text);
  font-style: italic;
  padding-left: 14px;
}

.msg-system {
  color: var(--color-text-faint);
  font-size: 12px;
  text-align: center;
  letter-spacing: 4px;
  margin: 8px 0;
}

.msg-player {
  color: var(--color-info);
  border-left: 2px solid rgba(100, 160, 190, 0.5);
  padding-left: 14px;
}

/* 加载动画 */
.loading-row {
  display: flex;
  gap: 5px;
  padding: 8px 0 8px 16px;
  align-items: center;
}

.dot {
  width: 5px; height: 5px;
  background: var(--color-gold);
  border-radius: 50%;
  animation: pulse 1.3s infinite;
}
.dot:nth-child(2) { animation-delay: 0.3s; }
.dot:nth-child(3) { animation-delay: 0.6s; }

@keyframes pulse {
  0%, 100% { opacity: 0.2; transform: scale(0.9); }
  50%       { opacity: 1;   transform: scale(1.1); }
}

/* 错误 */
.error-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  color: #e05040;
  font-size: 13px;
  background: rgba(180, 40, 30, 0.08);
  border: 1px solid rgba(180, 40, 30, 0.2);
  border-radius: 3px;
  margin: 8px 0;
}

.retry-btn {
  background: none;
  border: 1px solid rgba(180, 40, 30, 0.4);
  color: #e05040;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 2px;
  transition: all var(--transition);
}
.retry-btn:hover { background: rgba(180, 40, 30, 0.15); }

/* 选项区 */
.choices-area {
  padding: 14px 20px;
  border-top: 1px solid var(--color-border-dim);
  background: rgba(6, 4, 1, 0.9);
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.choices-label {
  font-size: 11px;
  color: var(--color-text-faint);
  letter-spacing: 3px;
}

.choices-list { display: flex; flex-direction: column; gap: 6px; }

.choice-btn {
  background: rgba(40, 28, 8, 0.6);
  border: 1px solid var(--color-border-dim);
  color: var(--color-gold);
  padding: 9px 16px;
  font-size: 14px;
  border-radius: 3px;
  text-align: left;
  letter-spacing: 0.5px;
  transition: all var(--transition);
  line-height: 1.6;
}

.choice-btn:hover:not(:disabled) {
  background: rgba(80, 52, 14, 0.6);
  border-color: var(--color-gold-dim);
  color: var(--color-gold-light);
}

/* 自由输入 */
.input-row { display: flex; gap: 8px; }

.free-input {
  flex: 1;
  background: rgba(18, 12, 4, 0.8);
  border: 1px solid var(--color-border-dim);
  color: var(--color-text);
  padding: 9px 14px;
  font-size: 14px;
  border-radius: 3px;
  outline: none;
  transition: border-color var(--transition);
}

.free-input:focus { border-color: var(--color-gold-dim); }
.free-input::placeholder { color: var(--color-text-faint); }

.send-btn {
  background: rgba(80, 52, 14, 0.7);
  border: 1px solid var(--color-gold-dim);
  color: var(--color-gold-light);
  padding: 9px 18px;
  font-size: 14px;
  border-radius: 3px;
  white-space: nowrap;
  transition: all var(--transition);
  letter-spacing: 1px;
}

.send-btn:hover:not(:disabled) { background: rgba(110, 72, 20, 0.9); }
</style>
