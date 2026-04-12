<template>
  <div class="create-page">
    <div class="bg-layer"></div>

    <!-- API Key 配置 -->
    <div v-if="!apiKeyOk" class="api-overlay">
      <div class="api-card">
        <h2>配置 API Key</h2>
        <p>本游戏由 Claude AI 驱动，需要 Anthropic API Key</p>
        <input
          v-model="apiKeyInput"
          type="password"
          class="api-input"
          placeholder="sk-ant-..."
          @keyup.enter="saveApiKey"
        />
        <button class="confirm-btn" @click="saveApiKey" :disabled="!apiKeyInput.trim()">
          确认
        </button>
        <p class="api-hint">
          Key 仅存储在本地浏览器，不会上传任何服务器
        </p>
      </div>
    </div>

    <div class="create-wrap">
      <!-- 顶部返回 -->
      <button class="back-btn" @click="$router.push('/')">← 返回</button>

      <div class="ornament">✦ ✦ ✦</div>
      <h1 class="title">创建侠客</h1>
      <p class="sub">在江湖留名，从此刻开始</p>

      <div class="form">
        <!-- 姓名 -->
        <div class="field">
          <label class="field-label">侠客之名</label>
          <input
            v-model="nameInput"
            class="text-input"
            placeholder="请赐下大名..."
            maxlength="8"
            @input="nameError = ''"
          />
          <span v-if="nameError" class="field-error">{{ nameError }}</span>
        </div>

        <!-- 门派选择 -->
        <div class="field">
          <label class="field-label">选择门派</label>
          <div class="faction-grid">
            <button
              v-for="f in FACTIONS"
              :key="f.name"
              class="faction-card"
              :class="{ selected: selectedFaction?.name === f.name }"
              @click="selectedFaction = f"
            >
              <span class="faction-name">{{ f.name }}</span>
              <span class="faction-tag">{{ f.alignment }}</span>
              <span class="faction-desc">{{ f.desc }}</span>
              <span class="faction-flavor">{{ f.flavor }}</span>
              <div class="faction-stats" v-if="selectedFaction?.name === f.name">
                <span>武 {{ f.stats.atk }}</span>
                <span>轻 {{ f.stats.agi }}</span>
                <span>内 {{ f.stats.int }}</span>
              </div>
            </button>
          </div>
          <span v-if="factionError" class="field-error">{{ factionError }}</span>
        </div>

        <!-- 初始物品预览 -->
        <div v-if="selectedFaction" class="preview">
          <span class="preview-label">起始物品：</span>
          <span v-for="item in selectedFaction.items" :key="item" class="item-tag">{{ item }}</span>
        </div>

        <button class="start-btn" @click="handleStart">
          踏入江湖
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore, FACTIONS } from '@/stores/gameStore'

const router = useRouter()
const store = useGameStore()

const nameInput = ref('')
const selectedFaction = ref(null)
const nameError = ref('')
const factionError = ref('')

const apiKeyInput = ref('')
const apiKeyOk = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('anthropic_api_key')
  if (saved) apiKeyOk.value = true
})

function saveApiKey() {
  const key = apiKeyInput.value.trim()
  if (!key) return
  localStorage.setItem('anthropic_api_key', key)
  apiKeyOk.value = true
}

function handleStart() {
  nameError.value = ''
  factionError.value = ''

  if (!nameInput.value.trim()) {
    nameError.value = '请输入侠客姓名'
    return
  }
  if (!selectedFaction.value) {
    factionError.value = '请选择一个门派'
    return
  }

  store.createPlayer(nameInput.value.trim(), selectedFaction.value)
  router.push('/game')
}
</script>

<style scoped>
.create-page {
  height: 100vh;
  overflow-y: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1rem 4rem;
  position: relative;
}

.bg-layer {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 40%, rgba(140, 90, 30, 0.07) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(100, 50, 15, 0.08) 0%, transparent 50%);
  pointer-events: none;
}

/* API overlay */
.api-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 3, 1, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.api-card {
  background: #110d07;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 2.5rem;
  max-width: 400px;
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
}

.api-card h2 {
  font-family: var(--font-display);
  font-size: 22px;
  color: var(--color-gold);
  letter-spacing: 4px;
}

.api-card p {
  color: var(--color-text-mute);
  font-size: 13px;
  line-height: 1.8;
}

.api-input {
  background: rgba(20, 14, 4, 0.9);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 10px 14px;
  border-radius: 3px;
  font-size: 14px;
  outline: none;
  width: 100%;
}

.api-input:focus { border-color: var(--color-gold-dim); }

.confirm-btn {
  background: rgba(100, 65, 15, 0.7);
  border: 1px solid var(--color-gold-dim);
  color: var(--color-gold-light);
  padding: 10px;
  border-radius: 3px;
  font-size: 15px;
  transition: all var(--transition);
}

.confirm-btn:hover:not(:disabled) { background: rgba(140, 90, 20, 0.8); }

.api-hint { font-size: 11px; color: var(--color-text-faint); }

/* 主体 */
.create-wrap {
  position: relative;
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}

.back-btn {
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--color-text-faint);
  font-size: 13px;
  letter-spacing: 1px;
  transition: color var(--transition);
  margin-bottom: 0.5rem;
}

.back-btn:hover { color: var(--color-text-mute); }

.ornament { color: var(--color-gold-mute); letter-spacing: 8px; font-size: 16px; }

.title {
  font-family: var(--font-display);
  font-size: 36px;
  color: var(--color-gold);
  letter-spacing: 10px;
}

.sub { color: var(--color-text-faint); font-size: 13px; letter-spacing: 2px; }

.form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.field { display: flex; flex-direction: column; gap: 8px; }

.field-label {
  font-size: 12px;
  color: var(--color-gold-dim);
  letter-spacing: 4px;
}

.field-error { font-size: 12px; color: #e05040; letter-spacing: 1px; }

.text-input {
  background: rgba(20, 14, 4, 0.8);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 12px 16px;
  border-radius: 3px;
  font-size: 16px;
  outline: none;
  transition: border-color var(--transition);
}

.text-input:focus { border-color: var(--color-gold-dim); }
.text-input::placeholder { color: var(--color-text-faint); }

/* 门派卡片 */
.faction-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.faction-card {
  background: rgba(25, 18, 6, 0.7);
  border: 1px solid var(--color-border-dim);
  color: var(--color-text-mute);
  padding: 16px 14px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  text-align: left;
  transition: all var(--transition);
}

.faction-card:hover:not(.selected) {
  border-color: var(--color-border);
  color: var(--color-text-dim);
}

.faction-card.selected {
  border-color: var(--color-gold);
  background: rgba(90, 58, 15, 0.4);
  color: var(--color-text);
}

.faction-name {
  font-size: 18px;
  font-weight: 700;
  color: inherit;
  letter-spacing: 2px;
}

.faction-card.selected .faction-name { color: var(--color-gold); }

.faction-tag {
  font-size: 10px;
  color: var(--color-text-faint);
  letter-spacing: 1px;
}

.faction-desc {
  font-size: 12px;
  color: var(--color-text-mute);
  letter-spacing: 1px;
}

.faction-flavor {
  font-size: 11px;
  color: var(--color-text-faint);
  line-height: 1.6;
  margin-top: 2px;
}

.faction-stats {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-gold-dim);
}

/* 物品预览 */
.preview {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-label { font-size: 12px; color: var(--color-text-faint); }

.item-tag {
  display: inline-block;
  background: rgba(60, 40, 10, 0.6);
  border: 1px solid var(--color-border-dim);
  color: var(--color-text-mute);
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 2px;
}

/* 开始按钮 */
.start-btn {
  font-family: var(--font-display);
  font-size: 20px;
  letter-spacing: 8px;
  color: var(--color-gold-light);
  background: rgba(120, 75, 20, 0.6);
  border: 1px solid var(--color-gold);
  padding: 14px;
  border-radius: 3px;
  transition: all var(--transition);
  margin-top: 0.5rem;
}

.start-btn:hover:not(:disabled) {
  background: rgba(160, 100, 30, 0.8);
  transform: translateY(-1px);
}
</style>
