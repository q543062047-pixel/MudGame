<template>
  <aside class="side-panel">
    <!-- 角色信息 -->
    <section class="panel-section">
      <h3 class="section-title">侠客</h3>
      <div class="char-name">{{ player.name }}</div>
      <div class="char-sub">{{ player.faction }} · {{ player.alignment }}</div>

      <!-- 生命条 -->
      <BarMeter
        label="生命"
        :value="player.hp"
        :max="player.maxHp"
        :percent="store.hpPercent"
        color="#b03020"
      />
      <BarMeter
        label="内力"
        :value="player.mp"
        :max="player.maxMp"
        :percent="store.mpPercent"
        color="#3060a0"
      />

      <!-- 属性 -->
      <div class="attrs">
        <div class="attr-row">
          <span class="attr-label">武力</span>
          <div class="attr-bar-wrap">
            <div class="attr-bar" :style="{ width: player.atk + '%' }"></div>
          </div>
          <span class="attr-val">{{ player.atk }}</span>
        </div>
        <div class="attr-row">
          <span class="attr-label">轻功</span>
          <div class="attr-bar-wrap">
            <div class="attr-bar" :style="{ width: player.agi + '%' }"></div>
          </div>
          <span class="attr-val">{{ player.agi }}</span>
        </div>
        <div class="attr-row">
          <span class="attr-label">内功</span>
          <div class="attr-bar-wrap">
            <div class="attr-bar" :style="{ width: player.int + '%' }"></div>
          </div>
          <span class="attr-val">{{ player.int }}</span>
        </div>
      </div>

      <div class="rep-row">
        <span class="attr-label">声望</span>
        <span class="rep-val" :class="repClass">{{ reputationLabel }}</span>
      </div>
    </section>

    <!-- 背包 -->
    <section class="panel-section">
      <h3 class="section-title">背包</h3>
      <div v-if="player.items.length === 0" class="empty-hint">空空如也</div>
      <div class="items-list">
        <div v-for="item in player.items" :key="item" class="item-pill">
          {{ item }}
        </div>
      </div>
    </section>

    <!-- 任务 -->
    <section class="panel-section">
      <h3 class="section-title">任务</h3>
      <div v-if="player.quests.length === 0" class="empty-hint">尚无任务</div>
      <div v-for="q in player.quests" :key="q.name" class="quest-item">
        <span class="quest-dot">▸</span>
        <span>{{ q.name }}</span>
      </div>
    </section>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import BarMeter from './BarMeter.vue'

const store = useGameStore()
const player = computed(() => store.player)

const repClass = computed(() => {
  const r = player.value.reputation
  if (r >= 50) return 'rep-hero'
  if (r >= 10) return 'rep-good'
  if (r <= -20) return 'rep-evil'
  return 'rep-neutral'
})

const reputationLabel = computed(() => {
  const r = player.value.reputation
  if (r >= 100) return `${r} · 天下第一`
  if (r >= 50)  return `${r} · 名震江湖`
  if (r >= 20)  return `${r} · 小有名气`
  if (r >= 5)   return `${r} · 初出茅庐`
  if (r <= -30) return `${r} · 臭名昭著`
  if (r <= -10) return `${r} · 名声狼藉`
  return `${r} · 无名之辈`
})
</script>

<style scoped>
.side-panel {
  width: var(--sidebar-width);
  flex-shrink: 0;
  overflow-y: auto;
  padding: 16px 14px;
  background: rgba(6, 4, 1, 0.95);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-section { display: flex; flex-direction: column; gap: 8px; }

.section-title {
  font-size: 10px;
  color: var(--color-gold-dim);
  letter-spacing: 5px;
  border-bottom: 1px solid var(--color-border-dim);
  padding-bottom: 6px;
  margin-bottom: 4px;
  font-weight: 400;
}

.char-name {
  font-size: 18px;
  color: var(--color-gold);
  font-weight: 700;
  letter-spacing: 3px;
}

.char-sub { font-size: 11px; color: var(--color-text-faint); letter-spacing: 1px; }

/* 属性条 */
.attrs { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }

.attr-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.attr-label { font-size: 11px; color: var(--color-text-faint); width: 28px; }

.attr-bar-wrap {
  flex: 1;
  height: 3px;
  background: var(--color-border-dim);
  border-radius: 2px;
  overflow: hidden;
}

.attr-bar {
  height: 100%;
  background: var(--color-gold-dim);
  border-radius: 2px;
  transition: width 0.8s ease;
  max-width: 100%;
}

.attr-val { font-size: 11px; color: var(--color-text-mute); width: 24px; text-align: right; }

.rep-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.rep-val { font-size: 12px; }
.rep-hero    { color: #d4a020; }
.rep-good    { color: #70b060; }
.rep-neutral { color: var(--color-text-faint); }
.rep-evil    { color: #c04030; }

/* 背包 */
.empty-hint { font-size: 12px; color: var(--color-text-faint); }

.items-list { display: flex; flex-wrap: wrap; gap: 5px; }

.item-pill {
  background: rgba(40, 28, 8, 0.7);
  border: 1px solid var(--color-border-dim);
  color: var(--color-text-mute);
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 2px;
  transition: all var(--transition);
}

.item-pill:hover {
  border-color: var(--color-border);
  color: var(--color-text-dim);
}

/* 任务 */
.quest-item {
  display: flex;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-mute);
  line-height: 1.6;
}

.quest-dot { color: var(--color-gold-dim); flex-shrink: 0; }
</style>
