<template>
  <aside class="char-panel">
    <div class="panel-header">
      <span class="char-name">{{ char.name }}</span>
      <span class="char-title">{{ char.title }}</span>
    </div>

    <div class="divider-thin" />

    <!-- 气血内力 -->
    <div class="stat-bars">
      <div class="bar-row">
        <span class="bar-label">气血</span>
        <div class="bar-track">
          <div class="bar-fill hp" :style="{ width: hpPercent + '%' }" />
        </div>
        <span class="bar-val">{{ char.hp }}/{{ char.maxHp }}</span>
      </div>
      <div class="bar-row">
        <span class="bar-label">内力</span>
        <div class="bar-track">
          <div class="bar-fill mp" :style="{ width: mpPercent + '%' }" />
        </div>
        <span class="bar-val">{{ char.mp }}/{{ char.maxMp }}</span>
      </div>
    </div>

    <div class="divider-thin" />

    <!-- 属性数值 -->
    <div class="attrs">
      <div class="attr-row">
        <span class="attr-label">攻击</span>
        <span class="attr-val">{{ char.attack }}</span>
        <span class="attr-label">防御</span>
        <span class="attr-val">{{ char.defense }}</span>
      </div>
      <div class="attr-row">
        <span class="attr-label">身法</span>
        <span class="attr-val">{{ char.speed }}</span>
        <span class="attr-label">声望</span>
        <span class="attr-val reputation">{{ char.reputation }}</span>
      </div>
      <div class="attr-row">
        <span class="attr-label">银两</span>
        <span class="attr-val gold">{{ char.gold }} 两</span>
      </div>
    </div>

    <div class="divider-thin" />

    <!-- 功法 -->
    <div class="section-title">已修功法</div>
    <div class="skill-list">
      <div v-for="skill in char.skills" :key="skill.id" class="skill-item">
        <span class="skill-name">{{ skill.name }}</span>
        <span class="skill-cost" v-if="skill.mpCost > 0">{{ skill.mpCost }}内</span>
        <span class="skill-cost free" v-else>无耗</span>
      </div>
      <div v-if="char.skills.length === 0" class="empty-hint">尚无功法</div>
    </div>

    <div class="divider-thin" />

    <!-- 背包 -->
    <div class="section-title">
      行囊
      <span class="item-count">（{{ char.inventory.length }}）</span>
    </div>
    <div class="item-list">
      <div
        v-for="item in char.inventory"
        :key="item.id"
        class="item-row"
        :title="item.description"
      >
        <span class="item-type-dot" :class="item.type" />
        <span class="item-name">{{ item.name }}</span>
        <span class="item-qty" v-if="item.quantity > 1">×{{ item.quantity }}</span>
        <button
          v-if="item.type === 'medicine'"
          class="use-btn"
          @click="emit('useItem', item.id)"
        >用</button>
      </div>
      <div v-if="char.inventory.length === 0" class="empty-hint">行囊空空</div>
    </div>

    <div class="divider-thin" />

    <!-- 操作按钮 -->
    <div class="action-btns">
      <button class="action-btn" @click="emit('save')">存档</button>
      <button class="action-btn danger" @click="emit('backHome')">回到主页</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'

const emit = defineEmits<{
  useItem: [itemId: string]
  save: []
  backHome: []
}>()

const playerStore = usePlayerStore()
const char = computed(() => playerStore.character)
const hpPercent = computed(() => playerStore.hpPercent)
const mpPercent = computed(() => playerStore.mpPercent)
</script>

<style scoped>
.char-panel {
  width: 220px;
  min-width: 220px;
  height: 100%;
  background: var(--color-paper-dark);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  padding: 16px 14px;
  flex-shrink: 0;
}

.panel-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 10px;
}

.char-name {
  font-family: var(--font-title);
  font-size: 20px;
  color: var(--color-ink);
  letter-spacing: 3px;
}

.char-title {
  font-size: 11px;
  color: var(--color-vermilion);
  letter-spacing: 2px;
}

.divider-thin {
  height: 1px;
  background: var(--color-border-light);
  margin: 10px 0;
}

.stat-bars { display: flex; flex-direction: column; gap: 6px; }
.bar-row { display: flex; align-items: center; gap: 6px; }
.bar-label { font-size: 11px; color: var(--color-ink-faint); width: 24px; letter-spacing: 1px; }
.bar-track {
  flex: 1;
  height: 6px;
  background: rgba(0,0,0,0.1);
  border-radius: 3px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}
.bar-fill.hp { background: linear-gradient(90deg, #c0392b, #e74c3c); }
.bar-fill.mp { background: linear-gradient(90deg, #1a5276, #2980b9); }
.bar-val { font-size: 10px; color: var(--color-ink-faint); width: 50px; text-align: right; }

.attrs { display: flex; flex-direction: column; gap: 5px; }
.attr-row { display: flex; align-items: center; gap: 4px; }
.attr-label { font-size: 11px; color: var(--color-ink-faint); width: 28px; }
.attr-val { font-size: 13px; color: var(--color-ink-light); font-weight: 500; flex: 1; }
.attr-val.reputation { color: var(--color-jade); }
.attr-val.gold { color: var(--color-gold); }

.section-title {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--color-ink-faint);
  margin-bottom: 6px;
}
.item-count { font-size: 10px; }

.skill-list, .item-list { display: flex; flex-direction: column; gap: 4px; }

.skill-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  padding: 3px 6px;
  background: rgba(0,0,0,0.04);
  border-radius: 3px;
}
.skill-name { color: var(--color-ink-light); }
.skill-cost { font-size: 10px; color: #2980b9; }
.skill-cost.free { color: var(--color-jade); }

.item-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 3px 4px;
  border-radius: 3px;
  transition: background 0.15s;
}
.item-row:hover { background: rgba(0,0,0,0.05); }
.item-name { color: var(--color-ink-light); flex: 1; }
.item-qty { font-size: 10px; color: var(--color-ink-faint); }

.item-type-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.item-type-dot.medicine { background: #c0392b; }
.item-type-dot.weapon { background: var(--color-ink); }
.item-type-dot.armor { background: var(--color-jade); }
.item-type-dot.misc { background: var(--color-gold); }

.use-btn {
  font-size: 10px;
  padding: 1px 5px;
  background: rgba(192,57,43,0.1);
  border: 1px solid rgba(192,57,43,0.3);
  color: var(--color-vermilion);
  cursor: pointer;
  border-radius: 2px;
  font-family: var(--font-serif);
  transition: all 0.15s;
}
.use-btn:hover { background: rgba(192,57,43,0.2); }

.empty-hint {
  font-size: 11px;
  color: var(--color-ink-faint);
  text-align: center;
  padding: 4px 0;
  letter-spacing: 1px;
}

.action-btns {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: auto;
  padding-top: 4px;
}
.action-btn {
  padding: 7px 0;
  background: transparent;
  border: 1px solid var(--color-border-light);
  font-family: var(--font-serif);
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--color-ink-faint);
  cursor: pointer;
  transition: all 0.15s;
}
.action-btn:hover { border-color: var(--color-border); color: var(--color-ink-light); }
.action-btn.danger:hover { border-color: var(--color-vermilion); color: var(--color-vermilion); }
</style>
