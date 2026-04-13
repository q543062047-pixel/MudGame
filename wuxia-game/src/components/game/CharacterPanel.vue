<template>
  <aside class="char-panel">
    <div class="panel-head">
      <div class="char-name">{{ c.name }}</div>
      <div class="char-title">{{ c.title }}</div>
    </div>
    <div class="sep"/>

    <div class="bars">
      <div class="bar-row">
        <span class="bl">气血</span>
        <div class="bar-track">
          <div class="bar-fill hp" :style="{ width: hpPct+'%' }"/>
        </div>
        <span class="bv">{{ c.hp }}<em>/{{ c.maxHp }}</em></span>
      </div>
      <div class="bar-row">
        <span class="bl">内力</span>
        <div class="bar-track">
          <div class="bar-fill mp" :style="{ width: mpPct+'%' }"/>
        </div>
        <span class="bv">{{ c.mp }}<em>/{{ c.maxMp }}</em></span>
      </div>
    </div>
    <div class="sep"/>

    <div class="attrs">
      <div class="attr"><span class="ak">攻击</span><span class="av">{{ c.attack }}</span></div>
      <div class="attr"><span class="ak">防御</span><span class="av">{{ c.defense }}</span></div>
      <div class="attr"><span class="ak">身法</span><span class="av">{{ c.speed }}</span></div>
      <div class="attr"><span class="ak">声望</span><span class="av jade">{{ c.reputation }}</span></div>
      <div class="attr full"><span class="ak">银两</span><span class="av gold">{{ c.gold }} 两</span></div>
    </div>
    <div class="sep"/>

    <div class="sec-title">功法</div>
    <div class="skill-list">
      <div v-for="sk in c.skills" :key="sk.id" class="skill-item">
        <span class="sk-name">{{ sk.name }}</span>
        <span class="sk-cost" :class="{ free: sk.mpCost===0 }">{{ sk.mpCost>0 ? sk.mpCost+'内' : '无耗' }}</span>
      </div>
      <div v-if="!c.skills.length" class="empty">尚无功法</div>
    </div>
    <div class="sep"/>

    <div class="sec-title">行囊 <span class="cnt">（{{ c.inventory.length }}）</span></div>
    <div class="item-list">
      <div v-for="item in c.inventory" :key="item.id" class="item-row" :title="item.description">
        <span class="item-dot" :class="item.type"/>
        <span class="item-name">{{ item.name }}</span>
        <span class="item-qty" v-if="item.quantity>1">×{{ item.quantity }}</span>
        <button v-if="item.type==='medicine'" class="use-btn" @click="emit('useItem',item.id)">用</button>
      </div>
      <div v-if="!c.inventory.length" class="empty">行囊空空</div>
    </div>
    <div class="sep"/>

    <div class="actions">
      <button class="act-btn" @click="emit('save')">存 档</button>
      <button class="act-btn red" @click="emit('backHome')">返回主页</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
const emit = defineEmits<{ useItem:[id:string]; save:[]; backHome:[] }>()
const ps = usePlayerStore()
const c = computed(() => ps.character)
const hpPct = computed(() => ps.hpPercent)
const mpPct = computed(() => ps.mpPercent)
</script>

<style scoped>
.char-panel {
  width: 190px;
  min-width: 190px;
  height: 100%;
  background: var(--bg-dark);
  border-right: 1px solid #3a2810;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 14px 12px;
  flex-shrink: 0;
}

.panel-head { padding-bottom: 10px; }
.char-name {
  font-family: var(--font-title);
  font-size: 20px;
  color: var(--dark-text);
  letter-spacing: 3px;
  line-height: 1.2;
}
.char-title { font-size: 11px; color: #c0392b; letter-spacing: 2px; margin-top: 3px; }

.sep { height: 1px; background: #2a1c0a; margin: 8px 0; flex-shrink: 0; }

.bars { display: flex; flex-direction: column; gap: 7px; }
.bar-row { display: flex; align-items: center; gap: 6px; }
.bl { font-size: 10px; color: var(--dark-text-muted); width: 24px; flex-shrink: 0; }
.bar-track {
  flex: 1; height: 7px;
  background: rgba(255,255,255,0.07);
  border-radius: 4px; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.04);
}
.bar-fill { height: 100%; border-radius: 4px; transition: width .4s; }
/* 深色背景上的血条：用高饱和亮色，与轨道形成强对比 */
.bar-fill.hp { background: linear-gradient(90deg, #c02010, #f04020); }
.bar-fill.mp { background: linear-gradient(90deg, #0a3a70, #1a70d0); }
.bv { font-size: 10px; color: var(--dark-text-sub); min-width: 38px; text-align: right; }
.bv em { color: var(--dark-text-faint); font-style: normal; font-size: 9px; }

.attrs { display: flex; flex-wrap: wrap; gap: 4px 0; }
.attr { display: flex; align-items: center; width: 50%; }
.attr.full { width: 100%; }
.ak { font-size: 10px; color: var(--dark-text-muted); width: 26px; }
.av { font-size: 13px; color: var(--dark-text-sub); font-weight: 500; flex: 1; }
.av.jade { color: #4ab870; }
.av.gold { color: #d4a030; }

.sec-title { font-size: 10px; letter-spacing: 2px; color: var(--dark-text-faint); margin-bottom: 5px; }
.cnt { font-size: 10px; }

.skill-list, .item-list { display: flex; flex-direction: column; gap: 3px; }

.skill-item {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 11px; padding: 3px 6px;
  background: rgba(255,255,255,0.04); border-radius: 2px;
}
.sk-name { color: var(--dark-text-sub); }
.sk-cost { font-size: 9px; color: #3a80c0; }
.sk-cost.free { color: #4ab870; }

.item-row {
  display: flex; align-items: center; gap: 5px; font-size: 11px;
  padding: 3px 4px; border-radius: 2px; transition: background .12s;
}
.item-row:hover { background: rgba(255,255,255,0.05); }
.item-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.item-dot.medicine { background: #c0392b; }
.item-dot.weapon   { background: var(--dark-text-sub); }
.item-dot.armor    { background: #4ab870; }
.item-dot.misc     { background: #d4a030; }
.item-name { color: var(--dark-text-sub); flex: 1; }
.item-qty  { font-size: 9px; color: var(--dark-text-faint); }
.use-btn {
  font-size: 9px; padding: 1px 5px;
  background: rgba(192,57,43,.15); border: 1px solid rgba(192,57,43,.3);
  color: #c0392b; cursor: pointer; border-radius: 2px;
  font-family: var(--font-serif); transition: all .12s;
}
.use-btn:hover { background: rgba(192,57,43,.25); }

.empty { font-size: 10px; color: var(--dark-text-faint); text-align: center; padding: 4px 0; }

.actions { display: flex; flex-direction: column; gap: 5px; margin-top: auto; padding-top: 4px; }
.act-btn {
  padding: 7px 0; background: transparent;
  border: 1px solid #3a2810;
  font-family: var(--font-serif); font-size: 11px;
  letter-spacing: 3px; color: var(--dark-text-muted); cursor: pointer;
  transition: all .13s;
}
.act-btn:hover { border-color: #5a3818; color: var(--dark-text-sub); }
.act-btn.red:hover { border-color: #8b0000; color: #c0392b; }
</style>
