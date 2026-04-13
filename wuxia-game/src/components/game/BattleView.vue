<template>
  <div class="battle">
    <!-- 顶栏 -->
    <div class="b-header">
      <span class="b-title">⚔ 战斗</span>
      <span class="b-round">第 {{ gs.battleRound }} 回合</span>
    </div>

    <!-- 双方 -->
    <div class="combatants">
      <div class="side">
        <div class="s-name">{{ p.name }}</div>
        <div class="s-sub">{{ p.title }}</div>
        <div class="brow">
          <span class="bl">气血</span>
          <div class="btrack"><div class="bfill hp" :style="{ width: hpPct+'%' }"/></div>
          <span class="bv hp-val">{{ p.hp }}<em>/{{ p.maxHp }}</em></span>
        </div>
        <div class="brow">
          <span class="bl">内力</span>
          <div class="btrack"><div class="bfill mp" :style="{ width: mpPct+'%' }"/></div>
          <span class="bv">{{ p.mp }}<em>/{{ p.maxMp }}</em></span>
        </div>
      </div>

      <div class="vs">VS</div>

      <div class="side enemy-side" v-if="enemy">
        <div class="s-name enemy-name">{{ enemy.name }}</div>
        <div class="s-sub">{{ enemy.title }}</div>
        <div class="brow">
          <span class="bl">气血</span>
          <div class="btrack"><div class="bfill ep" :style="{ width: epPct+'%' }"/></div>
          <span class="bv ep-val">{{ enemy.hp }}<em>/{{ enemy.maxHp }}</em></span>
        </div>
        <div class="enemy-desc">{{ enemy.description }}</div>
      </div>
    </div>

    <!-- 日志 -->
    <div class="log" ref="logEl">
      <div v-for="(log,i) in gs.battleLogs" :key="i"
        class="log-line" :class="log.actor===p.name ? 'lp':'le'">
        <span class="lr">[{{ log.round }}]</span>
        <span class="la">{{ log.actor }}</span>使出
        <span class="lk">「{{ log.action }}」</span>
        <span v-if="log.damage" class="ld">— 造成 <strong>{{ log.damage }}</strong> 伤害</span>
      </div>
      <div v-if="!gs.battleLogs.length" class="log-idle">战斗一触即发……</div>
    </div>

    <div class="hsep"/>

    <!-- 出招 -->
    <div class="actions">
      <div class="act-title">出招</div>
      <div class="skill-grid">
        <button v-for="sk in p.skills" :key="sk.id"
          class="sk-btn" :class="{ dim: sk.mpCost > p.mp }"
          :disabled="sk.mpCost > p.mp"
          @click="attack(sk)">
          <span class="sk-n">{{ sk.name }}</span>
          <span class="sk-m" :class="{ free: sk.mpCost===0 }">{{ sk.mpCost>0 ? sk.mpCost+'内':'无耗' }}</span>
        </button>
      </div>
      <div class="misc">
        <button class="misc-btn" @click="showMeds=!showMeds">服药</button>
        <button class="misc-btn flee" @click="flee">逃跑</button>
      </div>
      <Transition name="meds">
        <div v-if="showMeds" class="med-list">
          <div v-for="item in meds" :key="item.id" class="med-item" @click="useMed(item.id)">
            <span class="med-n">{{ item.name }}</span>
            <span class="med-e">回复{{ item.effect?.hp ?? item.effect?.mp }}点</span>
          </div>
          <div v-if="!meds.length" class="med-none">囊中无药</div>
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

const gs = useGameStore()
const ps = usePlayerStore()
const { playerAttack, flee } = useBattle()

const p       = computed(() => ps.character)
const enemy   = computed(() => gs.currentEnemy)
const hpPct   = computed(() => ps.hpPercent)
const mpPct   = computed(() => ps.mpPercent)
const epPct   = computed(() => enemy.value ? (enemy.value.hp / enemy.value.maxHp)*100 : 0)
const meds    = computed(() => p.value.inventory.filter(i => i.type==='medicine'))
const showMeds = ref(false)
const logEl   = ref<HTMLElement>()

watch(() => gs.battleLogs.length, () =>
  nextTick(() => { if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight })
)

const attack = (sk: Skill) => playerAttack(sk)
const useMed = (id: string) => { ps.useItem(id); showMeds.value = false }
</script>

<style scoped>
.battle {
  flex: 1; display: flex; flex-direction: column;
  overflow: hidden;
  background: var(--battle-bg);
  color: var(--battle-text);
}

/* 顶栏 */
.b-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 20px;
  background: #1a0808; border-bottom: 1px solid var(--battle-border);
  flex-shrink: 0;
}
.b-title { font-family: var(--font-serif); font-size: 14px; letter-spacing: 4px; color: #e06040; }
.b-round { font-size: 11px; color: #6a4030; letter-spacing: 2px;
  background: rgba(255,255,255,.04); border: 1px solid #3a1a1a; padding: 2px 8px; }

/* 对阵 */
.combatants {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 14px 20px; background: #140606;
  border-bottom: 1px solid var(--battle-border); flex-shrink: 0;
}
.side { flex:1; display:flex; flex-direction:column; gap:5px; }

.s-name { font-size: 15px; font-weight: 500; letter-spacing: 2px; color: #f0d8c0; }
.enemy-name { color: #f09070; }
.s-sub { font-size: 10px; color: #6a4030; letter-spacing: 2px; }
.enemy-desc { font-size: 10px; color: #5a3828; letter-spacing: 1px; line-height: 1.5; margin-top: 2px; }

.brow { display:flex; align-items:center; gap:5px; }
.bl   { font-size:10px; color:#4a2818; width:22px; flex-shrink:0; }
.btrack {
  flex:1; height:8px;
  /* 深色战斗背景：轨道需明显可见，用半透明白 */
  background: rgba(255,255,255,0.12);
  border-radius:4px; overflow:hidden;
  /* 加轮廓强化可见性 */
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
}
.bfill { height:100%; border-radius:4px; transition:width .4s; }
/* 玩家HP：亮绿→黄，与暗红背景形成色相+亮度双重对比 */
.bfill.hp { background: linear-gradient(90deg, #1a8040, #60d040); }
/* 玩家MP：亮蓝 */
.bfill.mp { background: linear-gradient(90deg, #0a4090, #2080e0); }
/* 敌人HP：橙红 */
.bfill.ep { background: linear-gradient(90deg, #802010, #e04020); }
.bv      { font-size:10px; color:#6a4030; min-width:40px; text-align:right; }
.hp-val  { color:#80d060; }
.ep-val  { color:#e06040; }
.bv em   { color:#3a1c10; font-style:normal; font-size:9px; }

.vs { display:flex; align-items:center; padding-top:16px; }
.vs { font-family:var(--font-title); font-size:16px; color:#6a1808; padding:0 8px;
      text-shadow:0 0 10px rgba(180,40,10,.4); }

/* 日志 */
.log {
  flex:1; overflow-y:auto; padding:8px 20px;
  display:flex; flex-direction:column; gap:2px;
  min-height:50px; max-height:140px; background:#0e0404;
}
.log-line { font-size:13px; line-height:1.7; letter-spacing:1px; animation:fadeInUp .18s ease both; }
.lp { color:#c8a888; }
.le { color:#c07060; }
.lr { color:#2a1010; margin-right:4px; }
.la { font-weight:600; margin-right:2px; }
.lk { color:#d4a040; }
.ld { margin-left:4px; }
.ld strong { color:#f07050; }
.log-idle { font-size:11px; color:#2a1010; letter-spacing:2px; text-align:center; padding:6px 0; }

.hsep { height:1px; background:var(--battle-border); flex-shrink:0; }

/* 出招区 */
.actions { padding:10px 20px 14px; background:#120404; flex-shrink:0; }
.act-title { font-size:10px; letter-spacing:3px; color:#3a1818; margin-bottom:7px; }

.skill-grid { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px; }

.sk-btn {
  padding:6px 12px; background:#1e0a0a; border:1px solid #4a1818;
  color:#e0c0a0; cursor:pointer; font-family:var(--font-serif); font-size:12px;
  letter-spacing:1px; transition:all .12s; display:flex; flex-direction:column; gap:1px;
}
.sk-btn:hover:not(.dim) { background:#2e1010; border-color:#7a2828; }
.sk-btn.dim { opacity:.3; cursor:not-allowed; }
.sk-n { color:#e0c0a0; }
.sk-m { font-size:9px; color:#3a80c0; }
.sk-m.free { color:#3a9060; }

.misc { display:flex; gap:6px; }
.misc-btn {
  padding:5px 16px; background:transparent; border:1px solid #2a1010;
  color:#5a3020; cursor:pointer; font-family:var(--font-serif); font-size:11px;
  letter-spacing:2px; transition:all .12s;
}
.misc-btn:hover { border-color:#5a2020; color:#9a5040; }
.misc-btn.flee:hover { border-color:#b8860b; color:#d4a030; }

.med-list { margin-top:6px; background:#160606; border:1px solid #3a1010; padding:6px 10px; display:flex; flex-direction:column; gap:4px; }
.med-item { display:flex; justify-content:space-between; font-size:11px; color:#b09080; cursor:pointer; padding:2px 4px; transition:color .12s; }
.med-item:hover { color:#e0c0a0; }
.med-e { font-size:10px; color:#507040; }
.med-none { font-size:10px; color:#3a1818; text-align:center; }

.meds-enter-active { animation:slideDown .18s ease both; }
.meds-leave-active { transition:opacity .14s; }
.meds-leave-to { opacity:0; }
</style>
