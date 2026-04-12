<template>
  <div class="home-wrap">
    <!-- 背景纹理 -->
    <div class="bg-texture" />

    <div class="home-container">
      <!-- 顶部装饰线 -->
      <div class="deco-line top" />

      <!-- 标题区 -->
      <div class="title-section">
        <div class="title-sub">江湖志</div>
        <h1 class="title-main">問劍錄</h1>
        <div class="title-desc">洪武二十年 · 苍梧城</div>
      </div>

      <!-- 分隔装饰 -->
      <div class="deco-divider">
        <span class="line" /><span class="diamond">◆</span><span class="line" />
      </div>

      <!-- 菜单按钮 -->
      <nav class="menu-nav">
        <button class="menu-btn primary" @click="startNewGame">
          <span class="btn-inner">开始新游</span>
        </button>
        <button
          class="menu-btn"
          :class="{ disabled: !hasSaves }"
          @click="openSaveMenu"
        >
          <span class="btn-inner">读取存档</span>
        </button>
        <button class="menu-btn" @click="showAbout = !showAbout">
          <span class="btn-inner">关于此作</span>
        </button>
      </nav>

      <!-- 关于面板 -->
      <Transition name="fade">
        <div v-if="showAbout" class="about-panel">
          <p>《江湖志·问剑录》是一部武侠纯文字游戏 Demo。</p>
          <p>以明代江湖为背景，讲述青云门弟子叶云舟初入江湖的故事。</p>
          <p class="about-tech">技术栈：Vue 3 · TypeScript · Pinia · Vite</p>
        </div>
      </Transition>

      <!-- 存档列表 -->
      <Transition name="fade">
        <div v-if="showSaveMenu" class="about-panel save-panel">
          <div class="save-title">选择存档</div>
          <div v-if="saves.length === 0" class="no-save">暂无存档</div>
          <div
            v-for="s in saves"
            :key="s.id"
            class="save-item"
            @click="loadSave(s.id)"
          >
            <span class="save-name">{{ s.name }}</span>
            <span class="save-date">{{ formatDate(s.timestamp) }}</span>
          </div>
          <button class="close-btn" @click="showSaveMenu = false">✕ 关闭</button>
        </div>
      </Transition>

      <!-- 底部装饰线 -->
      <div class="deco-line bottom" />

      <div class="footer-text">按任意方向键或点击开始</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameEngine } from '@/composables/useGameEngine'
import { useSave } from '@/composables/useSave'

const router = useRouter()
const { startGame } = useGameEngine()
const { getSaves, load } = useSave()

const showAbout = ref(false)
const showSaveMenu = ref(false)
const saves = ref(getSaves())
const hasSaves = computed(() => saves.value.length > 0)

function startNewGame() {
  startGame()
  router.push('/game')
}

function openSaveMenu() {
  if (!hasSaves.value) return
  saves.value = getSaves()
  showSaveMenu.value = true
  showAbout.value = false
}

function loadSave(id: string) {
  if (load(id)) {
    router.push('/game')
  }
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(() => {
  saves.value = getSaves()
})
</script>

<style scoped>
.home-wrap {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a0a02;
  position: relative;
  overflow: hidden;
}

.bg-texture {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(139, 80, 20, 0.15) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 50%, rgba(100, 40, 10, 0.1) 0%, transparent 60%);
  pointer-events: none;
}

.home-container {
  width: 420px;
  padding: 48px 40px;
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  box-shadow:
    0 0 0 6px rgba(180, 130, 60, 0.15),
    0 0 0 7px var(--color-border),
    0 20px 60px rgba(0,0,0,0.6);
  position: relative;
  animation: inkDrop 0.8s ease both;
}

.deco-line {
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-border), var(--color-gold), var(--color-border), transparent);
}

.title-section {
  text-align: center;
  padding: 28px 0 20px;
}

.title-sub {
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 6px;
  color: var(--color-ink-faint);
  margin-bottom: 8px;
}

.title-main {
  font-family: var(--font-title);
  font-size: 56px;
  font-weight: 400;
  color: var(--color-ink);
  letter-spacing: 8px;
  line-height: 1;
  margin-bottom: 12px;
  text-shadow: 2px 2px 0 rgba(0,0,0,0.08);
}

.title-desc {
  font-size: 12px;
  letter-spacing: 4px;
  color: var(--color-vermilion);
  font-family: var(--font-serif);
}

.deco-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0 28px;
}

.deco-divider .line {
  flex: 1;
  height: 1px;
  background: var(--color-border-light);
}

.deco-divider .diamond {
  color: var(--color-gold);
  font-size: 10px;
}

.menu-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.menu-btn {
  width: 100%;
  padding: 12px 0;
  background: transparent;
  border: 1px solid var(--color-border);
  cursor: pointer;
  font-family: var(--font-serif);
  font-size: 16px;
  color: var(--color-ink-light);
  letter-spacing: 4px;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.menu-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-paper-dark);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.2s;
}

.menu-btn:hover::before { transform: scaleX(1); }
.menu-btn:hover { color: var(--color-vermilion); border-color: var(--color-vermilion); }

.menu-btn.primary {
  background: var(--color-ink);
  color: var(--color-paper);
  border-color: var(--color-ink);
  letter-spacing: 6px;
}
.menu-btn.primary::before { background: var(--color-ink-light); }
.menu-btn.primary:hover { color: var(--color-paper-light); }

.menu-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-inner {
  position: relative;
  z-index: 1;
}

.about-panel {
  background: var(--color-paper-dark);
  border: 1px solid var(--color-border-light);
  padding: 16px 20px;
  margin-top: 8px;
  font-size: 13px;
  line-height: 2;
  color: var(--color-ink-light);
  letter-spacing: 1px;
}

.about-tech {
  color: var(--color-ink-faint);
  font-size: 11px;
  margin-top: 4px;
}

.save-panel { }
.save-title {
  font-size: 13px;
  letter-spacing: 3px;
  color: var(--color-ink-faint);
  margin-bottom: 10px;
  text-align: center;
}
.no-save {
  text-align: center;
  color: var(--color-ink-faint);
  font-size: 13px;
  padding: 8px 0;
}
.save-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 4px;
  border-bottom: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: color 0.15s;
  font-size: 13px;
}
.save-item:hover { color: var(--color-vermilion); }
.save-date { color: var(--color-ink-faint); font-size: 11px; }
.close-btn {
  display: block;
  margin: 10px auto 0;
  background: none;
  border: none;
  color: var(--color-ink-faint);
  cursor: pointer;
  font-size: 12px;
  font-family: var(--font-serif);
}
.close-btn:hover { color: var(--color-vermilion); }

.deco-line.bottom { margin-top: 28px; }
.footer-text {
  text-align: center;
  font-size: 11px;
  color: var(--color-ink-faint);
  letter-spacing: 2px;
  margin-top: 16px;
  animation: breathe 3s ease-in-out infinite;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
