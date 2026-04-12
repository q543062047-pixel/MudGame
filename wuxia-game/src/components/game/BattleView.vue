<template>
  <div class="battle-wrap">
    <!-- 标题 -->
    <div class="battle-header">
      <div class="battle-title">⚔ 战斗</div>
      <div class="battle-round">第 {{ gameStore.battleRound }} 回合</div>
    </div>

    <!-- 双方状态 -->
    <div class="combatants">
      <!-- 我方 -->
      <div class="combatant player-side">
        <div class="comb-name">{{ player.name }}</div>
        <div class="comb-title">{{ player.title }}</div>
        <div class="bar-row">
          <span class="bar-label">气血</span>
          <div class="bar-track">
            <div class="bar-fill hp" :style="{ width: hpPct + '%' }" />
          </div>
          <span class="bar-num">{{ player.hp }}/{{ player.maxHp }}</span>
        </div>
        <div class="bar-row">
          <span class="bar-label">内力</span>
          <div class="bar-track">
            <div class="bar-fill mp" :style="{ width: mpPct + '%' }" />
          </div>
          <span class="bar-num">{{ player.mp }}/{{ player.maxMp }}</span>
        </div>
      </div>

      <div class="vs-mark">VS</div>

      <!-- 敌方 -->
      <div class="combatant enemy-side" v-if="enemy">
        <div class="comb-name enemy-name">{{ enemy.name }}</div>
        <div class="comb-title">{{ enemy.title }}</div>
        <div class="bar-row">
          <span class="bar-label">气血</span>
          <div class="bar-track">
            <div class="bar-fill hp enemy" :style="{ width: enemyHpPct + '%' }" />
          </div>
          <span class="bar-num">{{ enemy.hp }}/{{ enemy.maxHp }}</span>
        </div>
        <div class="comb-desc">{{ enemy.description }}</div>
      </div>
    </div>

    <div class="battle-divider" />

    <!-- 战斗日志 -->
    <div class="battle-log" ref="logEl">
      <div
        v-for="(log, i) in gameStore.battleLogs"
        :key="i"
        class="log-entry"
        :class="log.actor === player.name ? 'player-log' : 'enemy-log'"
      >
        <span class="log-round">[{{ log.round }}]</span>
        <span class="log-actor">{{ log.actor }}</span>
        使出
        <span class="log-skill">「{{ log.action }}」</span>
        <span v-if="log.damage" class="log-dmg">造成 {{ log.damage }} 点伤害</span>
      </div>
      <div v-if="gameStore.battleLogs.length === 0" class="log-empty">
        战斗一触即发……
      </div>
    </div>

    <div class="battle-divider" />

    <!-- 出招选择 -->
    <div class="action-section">
      <div class="action-label">选择出招</div>
      <div class="skill-actions">
        <button
          v-for="skill in player.skills"
          :key="skill.id"
          class="skill-action-btn"
          :class="{ disabled: skill.mpCost > player.mp }"
          :disabled="skill.mpCost > player.mp"
          @click="attack(skill)"
        >
          <div class="skill-action-name">{{ skill.name }}</div>
          <div class="skill-action-info">
            <span v-if="skill.mpCost > 0" class="mp-cost">{{ skill.mpCost }} 内力</span>
            <span v-else class="mp-cost free">无消耗</span>
          </div>
        </button>
      </div>

      <div class="other-actions">
        <button class="other-btn medicine" @click="showItems = !showItems">
          服药
        </button>
        <button class="other-btn flee" @click="tryFlee">
          逃跑
        </button>
      </div>

      <!-- 药品快捷 -->
      <Transition name="fade">
        <div v-if="showItems" class="medicine-list">
          <div
            v-for="item in medicines"
            :key="item.id"
            class="med-item"
            @click="useItem(item.id)"
          >
            {{ item.name }}（回复 {{ item.effect?.hp ?? item.effect?.mp }} 点）
          </div>
          <div v-if="medicines.length === 0" class="med-empty">囊中无药</div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'
import { useBattle } from '@/composables/useBattle'
import type { Skill } from '@/types'

const gameStore = useGameStore()
const playerStore = usePlayerStore()
const { playerAttack, flee } = useBattle()

const player = computed(() => playerStore.character)
const enemy = computed(() => gameStore.currentEnemy)
const hpPct = computed(() => playerStore.hpPercent)
const mpPct = computed(() => playerStore.mpPercent)
const enemyHpPct = computed(() => enemy.value ? (enemy.value.hp / enemy.value.maxHp) * 100 : 0)
const medicines = computed(() => player.value.inventory.filter(i => i.type === 'medicine'))

const showItems = ref(false)
const logEl = ref<HTMLElement>()

watch(
  () => gameStore.battleLogs.length,
  () => nextTick(() => {
    if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
  })
)

function attack(skill: Skill) {
  playerAttack(skill)
}

function tryFlee() {
  flee()
}

function useItem(itemId: string) {
  playerStore.useItem(itemId)
  showItems.value = false
}
</script>

<style scoped>
.battle-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #1a0502;
  color: #e8d5b0;
}

.battle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: rgba(139, 0, 0, 0.3);
  border-bottom: 1px solid rgba(180, 50, 30, 0.5);
}

.battle-title {
  font-family: var(--font-title);
  font-size: 18px;
  letter-spacing: 4px;
  color: #e8d5b0;
}

.battle-round {
  font-size: 12px;
  letter-spacing: 2px;
  color: rgba(232, 213, 176, 0.6);
}

.combatants {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  background: rgba(0,0,0,0.3);
}

.combatant {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.comb-name {
  font-family: var(--font-serif);
  font-size: 16px;
  letter-spacing: 3px;
  color: #e8d5b0;
}
.enemy-name { color: #e88080; }
.comb-title {
  font-size: 11px;
  color: rgba(232, 213, 176, 0.5);
  letter-spacing: 2px;
}
.comb-desc {
  font-size: 11px;
  color: rgba(232, 213, 176, 0.4);
  line-height: 1.6;
  letter-spacing: 1px;
  margin-top: 4px;
}

.vs-mark {
  font-family: var(--font-title);
  font-size: 20px;
  color: #c0392b;
  align-self: center;
  padding: 0 8px;
  text-shadow: 0 0 20px rgba(192,57,43,0.5);
}

.bar-row { display: flex; align-items: center; gap: 6px; }
.bar-label { font-size: 10px; color: rgba(232,213,176,0.5); width: 22px; }
.bar-track {
  flex: 1;
  height: 5px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  overflow: hidden;
}
.bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
.bar-fill.hp { background: linear-gradient(90deg, #8b0000, #c0392b); }
.bar-fill.hp.enemy { background: linear-gradient(90deg, #4a0000, #8b2020); }
.bar-fill.mp { background: linear-gradient(90deg, #0a2040, #1a5276); }
.bar-num { font-size: 10px; color: rgba(232,213,176,0.5); width: 52px; text-align: right; }

.battle-divider {
  height: 1px;
  background: rgba(180, 130, 60, 0.2);
}

.battle-log {
  flex: 1;
  overflow-y: auto;
  padding: 12px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 80px;
  max-height: 180px;
}

.log-entry {
  font-size: 13px;
  line-height: 1.8;
  letter-spacing: 1px;
  color: rgba(232, 213, 176, 0.7);
  animation: fadeInUp 0.2s ease both;
}
.log-entry.player-log { color: #e8d5b0; }
.log-entry.enemy-log { color: #e89090; }
.log-round { color: rgba(232,213,176,0.3); margin-right: 4px; }
.log-actor { font-weight: 500; margin-right: 2px; }
.log-skill { color: #e8c060; }
.log-dmg { margin-left: 4px; }
.log-empty { font-size: 12px; color: rgba(232,213,176,0.3); letter-spacing: 2px; text-align: center; padding: 8px 0; }

.action-section {
  padding: 14px 24px 20px;
  background: rgba(0,0,0,0.2);
}

.action-label {
  font-size: 11px;
  letter-spacing: 3px;
  color: rgba(232,213,176,0.4);
  margin-bottom: 10px;
}

.skill-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.skill-action-btn {
  padding: 8px 16px;
  background: rgba(139, 0, 0, 0.2);
  border: 1px solid rgba(180, 50, 30, 0.4);
  color: #e8d5b0;
  cursor: pointer;
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 1px;
  transition: all 0.15s;
  text-align: left;
}
.skill-action-btn:hover {
  background: rgba(139,0,0,0.4);
  border-color: rgba(192,57,43,0.8);
}
.skill-action-btn.disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.skill-action-name { margin-bottom: 2px; }
.skill-action-info { }
.mp-cost { font-size: 10px; color: rgba(41, 128, 185, 0.8); }
.mp-cost.free { color: rgba(46, 125, 82, 0.8); }

.other-actions {
  display: flex;
  gap: 8px;
}

.other-btn {
  padding: 7px 20px;
  background: transparent;
  border: 1px solid rgba(232, 213, 176, 0.2);
  color: rgba(232, 213, 176, 0.5);
  cursor: pointer;
  font-family: var(--font-serif);
  font-size: 12px;
  letter-spacing: 2px;
  transition: all 0.15s;
}
.other-btn:hover { border-color: rgba(232,213,176,0.5); color: #e8d5b0; }
.other-btn.flee:hover { border-color: #e8c060; color: #e8c060; }

.medicine-list {
  margin-top: 8px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(180,130,60,0.3);
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.med-item {
  font-size: 12px;
  color: rgba(232,213,176,0.7);
  cursor: pointer;
  padding: 4px 6px;
  transition: color 0.15s;
  letter-spacing: 1px;
}
.med-item:hover { color: #e8d5b0; }
.med-empty { font-size: 12px; color: rgba(232,213,176,0.3); text-align: center; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
