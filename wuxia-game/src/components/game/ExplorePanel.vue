<template>
  <div class="explore-zone">
    <!-- NPC 列表栏 -->
    <div v-if="npcs.length && !activeNpc" class="npc-bar">
      <span class="npc-label">在场人物</span>
      <button
        v-for="npc in npcs" :key="npc.id"
        class="npc-tag" @click="$emit('talk-to', npc)"
      >
        <span class="npc-tag-icon">{{ npc.icon }}</span>{{ npc.name }}
      </button>
    </div>

    <!-- NPC 对话 -->
    <NpcDialog
      v-if="activeNpc"
      :npc="activeNpc"
      :dialogue-index="dialogueIndex"
      @close="$emit('close-npc')"
      @next="$emit('next-dialogue')"
      @trigger-scenario="$emit('trigger-scenario')"
    />

    <!-- 地点/移动描述 -->
    <div v-if="!activeNpc" class="explore-text">
      <div class="explore-atm" :class="atmosphere"/>
      <div class="explore-content">
        <TransitionGroup name="eline" tag="div" class="elines">
          <p v-for="(line, i) in lines" :key="i" class="eline">{{ line }}</p>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NpcDialog from './NpcDialog.vue'
import type { NPC } from '@/data/npcData'

interface Props {
  npcs: NPC[]
  activeNpc: NPC | null
  dialogueIndex: number
  lines: string[]
  atmosphere?: string
}

withDefaults(defineProps<Props>(), {
  atmosphere: 'normal'
})

defineEmits<{
  'talk-to': [npc: NPC]
  'close-npc': []
  'next-dialogue': []
  'trigger-scenario': []
}>()
</script>

<style scoped>
.explore-zone {
  flex: 1; min-height: 0;
  display: flex; flex-direction: column;
  background: var(--bg-panel);
  overflow: hidden;
}

/* NPC 列表栏 */
.npc-bar {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 7px 18px; flex-shrink: 0;
  border-bottom: 1px solid var(--border-faint);
  background: var(--bg-surface);
}
.npc-label { font-size:10px; color:var(--text-on-paper-faint); letter-spacing:2px; }
.npc-tag {
  display: flex; align-items: center; gap: 5px;
  padding: 3px 12px;
  background: transparent; border: 1px solid var(--border-mid);
  font-family: var(--font-serif); font-size:12px;
  color: var(--text-on-paper-sub); cursor: pointer; letter-spacing:1px;
  transition: all .13s;
}
.npc-tag:hover { border-color:var(--accent-red); color:var(--accent-red); background:rgba(192,57,43,.05); }
.npc-tag-icon { font-size:13px; }

/* 探索文字区 */
.explore-text {
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
}
.explore-atm {
  height: 2px; flex-shrink: 0; transition: background .7s;
}
.explore-atm.peaceful { background: linear-gradient(90deg,transparent,#2e7d52 50%,transparent); }
.explore-atm.tense    { background: linear-gradient(90deg,transparent,#c0392b 50%,transparent); }
.explore-atm.normal   { background: linear-gradient(90deg,transparent,#c9a96e 50%,transparent); }
.explore-atm.mystery  { background: linear-gradient(90deg,transparent,#b8860b 50%,transparent); }

.explore-content {
  flex: 1; overflow-y: auto; padding: 16px 22px;
}
.elines { display: flex; flex-direction: column; gap: 4px; }
.eline {
  font-family: var(--font-serif);
  font-size: 14px; font-weight: 400;
  line-height: 2; letter-spacing: 2px;
  color: var(--text-on-paper-sub);
  animation: fadeInUp .25s ease both;
}

.eline-enter-active { transition: all .25s ease; }
.eline-enter-from   { opacity:0; transform:translateY(5px); }
</style>