<template>
  <div class="node-info-bar">
    <div class="info-content">
      <div class="info-header">
        <span class="info-icon" :style="{ color: node?.color }">{{ node?.icon || '●' }}</span>
        <span class="info-name">{{ node?.name || '未知地点' }}</span>
        <span class="info-type">{{ typeLabel }}</span>
      </div>
      <p class="info-desc">{{ node?.description || '这里一片荒芜...' }}</p>
      
      <!-- NPC列表 -->
      <div v-if="npcs.length > 0" class="npc-list">
        <div class="npc-label">此处有：</div>
        <div class="npc-items">
          <button
            v-for="npc in npcs"
            :key="npc.id"
            class="npc-btn"
            @click="handleNpcClick(npc)"
          >
            <span class="npc-avatar">{{ npc.avatar || '👤' }}</span>
            <span class="npc-name">{{ npc.name }}</span>
            <span v-if="npc.title" class="npc-title">{{ npc.title }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * NodeInfoBar - 节点信息栏组件
 *
 * 显示当前节点的详细信息和NPC列表
 */
import type { MapNode } from '@/types'
import type { NPC } from '@/data/npcData'
import { NODE_TYPE_LABELS } from '@/constants/map'
import { computed } from 'vue'

interface Props {
  /** 当前节点 */
  node: MapNode | null
  /** 当前节点的NPC列表 */
  npcs?: NPC[]
}

const props = withDefaults(defineProps<Props>(), {
  npcs: () => [],
})

const emit = defineEmits<{
  npcClick: [npc: NPC]
}>()

const typeLabel = computed(() => {
  return props.node ? NODE_TYPE_LABELS[props.node.type] || '未知' : ''
})

function handleNpcClick(npc: NPC) {
  emit('npcClick', npc)
}
</script>

<style scoped>
.node-info-bar {
  flex-shrink: 0;
  background: rgba(10, 15, 8, 0.95);
  border-top: 2px solid #3a4a2a;
  padding: 16px 20px;
  backdrop-filter: blur(8px);
}

.info-content {
  max-width: 800px;
  margin: 0 auto;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.info-icon {
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 700;
  text-shadow: 0 0 6px currentColor;
  line-height: 1;
}

.info-name {
  flex: 1;
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 700;
  color: #e0d0a0;
  letter-spacing: 2px;
}

.info-type {
  font-size: 11px;
  color: #8a9a6a;
  padding: 3px 10px;
  background: rgba(80, 100, 50, 0.2);
  border: 1px solid #4a5a3a;
  border-radius: 10px;
  letter-spacing: 1px;
}

.info-desc {
  font-size: 13px;
  line-height: 1.6;
  color: #a0b080;
  margin: 0;
}

/* NPC 列表 */
.npc-list {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #2a3a1a;
}

.npc-label {
  font-size: 11px;
  color: #7a8a6a;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.npc-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.npc-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(80, 100, 50, 0.3);
  border: 1px solid #5a7a3a;
  border-radius: 6px;
  color: #b0d080;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font-sans);
}

.npc-btn:hover {
  background: rgba(100, 120, 60, 0.4);
  border-color: #7a9a5a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 140, 60, 0.3);
}

.npc-avatar {
  font-size: 16px;
  line-height: 1;
}

.npc-name {
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
}

.npc-title {
  font-size: 10px;
  color: #8a9a6a;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
</style>