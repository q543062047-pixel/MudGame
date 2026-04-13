<template>
  <div class="home-wrap">
    <div class="home-box">
      <div class="top-line"/>
      <div class="title-area">
        <div class="sub">江湖志</div>
        <h1 class="main">問劍錄</h1>
        <div class="era">洪武二十年 · 苍梧城</div>
      </div>
      <div class="divider"><span class="dl"/><span class="dm">◆</span><span class="dl"/></div>
      <nav class="menu">
        <button class="mbtn primary" @click="startNew">开始新游</button>
        <button class="mbtn" :class="{ off: !hasSaves }" @click="openSaves">读取存档</button>
        <button class="mbtn" @click="showAbout=!showAbout">关于此作</button>
      </nav>
      <Transition name="fade">
        <div v-if="showAbout" class="panel">
          <p>《江湖志·问剑录》是一部武侠纯文字游戏 Demo。</p>
          <p>以明代江湖为背景，讲述青云门弟子叶云舟的故事。</p>
          <p class="tech">Vue 3 · TypeScript · Pinia · Vite</p>
        </div>
      </Transition>
      <Transition name="fade">
        <div v-if="showSaves" class="panel">
          <div class="saves-title">选择存档</div>
          <div v-if="!saves.length" class="no-save">暂无存档</div>
          <div v-for="s in saves" :key="s.id" class="save-row" @click="doLoad(s.id)">
            <span>{{ s.name }}</span><span class="save-date">{{ fmt(s.timestamp) }}</span>
          </div>
          <button class="close-btn" @click="showSaves=false">关闭</button>
        </div>
      </Transition>
      <div class="bottom-line"/>
      <div class="footer">WASD / 方向键行走 · 点击选项推进剧情</div>
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
const showSaves = ref(false)
const saves = ref(getSaves())
const hasSaves = computed(() => saves.value.length > 0)

function startNew() { startGame(); router.push('/game') }
function openSaves() {
  if (!hasSaves.value) return
  saves.value = getSaves(); showSaves.value = true; showAbout.value = false
}
function doLoad(id: string) { if (load(id)) router.push('/game') }
function fmt(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit' })
}
onMounted(() => saves.value = getSaves())
</script>

<style scoped>
.home-wrap {
  width:100vw; height:100vh;
  display:flex; align-items:center; justify-content:center;
  background: var(--bg-app);
  background-image:
    radial-gradient(ellipse at 30% 50%, rgba(100,60,10,.12) 0%, transparent 55%),
    radial-gradient(ellipse at 70% 50%, rgba(60,30,5,.08)  0%, transparent 55%);
}

.home-box {
  width:400px; padding:44px 36px;
  background: var(--bg-panel);
  border:1px solid var(--border-strong);
  box-shadow:0 0 0 1px var(--border-faint), 0 24px 60px rgba(0,0,0,.65);
  animation: inkDrop .7s ease both;
}

.top-line, .bottom-line {
  height:1px;
  background:linear-gradient(90deg,transparent,var(--border-mid),var(--border-strong),var(--border-mid),transparent);
}

.title-area { text-align:center; padding:26px 0 18px; }
.sub { font-size:11px; letter-spacing:6px; color:var(--text-on-paper-faint); margin-bottom:8px; }
.main {
  font-family:var(--font-title); font-size:52px; font-weight:400;
  color:var(--text-primary); letter-spacing:8px; line-height:1; margin-bottom:10px;
}
.era { font-size:11px; letter-spacing:4px; color:var(--accent-red); }

.divider { display:flex; align-items:center; gap:8px; margin:14px 0 22px; }
.dl { flex:1; height:1px; background:var(--border-faint); }
.dm { color:var(--accent-gold); font-size:9px; }

.menu { display:flex; flex-direction:column; gap:9px; margin-bottom:12px; }
.mbtn {
  width:100%; padding:11px 0;
  background:transparent; border:1px solid var(--border-mid); border-left:3px solid transparent;
  cursor:pointer; font-family:var(--font-serif); font-size:15px;
  color:var(--text-on-paper-sub); letter-spacing:5px; transition:all .16s;
}
.mbtn:hover { border-left-color:var(--accent-red); color:var(--text-primary); background:var(--bg-surface); }
.mbtn.primary {
  background:var(--text-primary); color:var(--bg-panel);
  border-color:var(--text-primary); border-left-color:var(--text-primary); letter-spacing:7px;
}
.mbtn.primary:hover { background:var(--text-secondary); border-color:var(--text-secondary); }
.mbtn.off { opacity:.3; cursor:not-allowed; }

.panel {
  background:var(--bg-surface); border:1px solid var(--border-faint);
  padding:14px 16px; margin-top:4px;
  font-size:13px; line-height:2; color:var(--text-on-paper-sub); letter-spacing:1px;
}
.tech { font-size:11px; color:var(--text-on-paper-faint); margin-top:4px; }

.saves-title { font-size:11px; letter-spacing:3px; color:var(--text-on-paper-faint); text-align:center; margin-bottom:8px; }
.no-save { text-align:center; font-size:12px; color:var(--text-on-paper-faint); }
.save-row {
  display:flex; justify-content:space-between; padding:7px 4px;
  border-bottom:1px solid var(--border-faint); cursor:pointer;
  font-size:12px; color:var(--text-on-paper-sub); transition:color .12s;
}
.save-row:hover { color:var(--text-primary); }
.save-date { font-size:10px; color:var(--text-on-paper-faint); }
.close-btn {
  display:block; margin:10px auto 0;
  background:none; border:none; color:var(--text-on-paper-faint);
  cursor:pointer; font-size:11px; font-family:var(--font-serif);
}
.close-btn:hover { color:var(--accent-red); }

.bottom-line { margin-top:22px; }
.footer { text-align:center; font-size:10px; color:var(--text-on-paper-faint); letter-spacing:2px; margin-top:12px; animation:breathe 3s ease-in-out infinite; }

.fade-enter-active,.fade-leave-active { transition:opacity .2s; }
.fade-enter-from,.fade-leave-to { opacity:0; }
</style>
