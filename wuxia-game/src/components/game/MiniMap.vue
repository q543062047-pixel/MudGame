<template>
  <div class="mini-map">
    <div class="mini-header">
      <span class="mini-title">地图</span>
      <span class="mini-count">{{ visitedCount }}/{{ totalCount }}</span>
    </div>
    <div class="mini-grid">
      <div
        v-for="node in allNodes"
        :key="node.id"
        class="mini-node"
        :class="{
          current: node.id === currentNodeId,
          visited: isVisited(node.id),
          unvisited: !isVisited(node.id),
        }"
        :style="{
          gridColumn: node.mapX + 1,
          gridRow: node.mapY + 1,
          '--node-color': node.color || '#8a9a6a',
        }"
        :title="isVisited(node.id) ? node.name : '???'"
        @click="handleNodeClick(node.id)"
      >
        <span class="mini-icon">{{ isVisited(node.id) ? (node.icon || '●') : '?' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorldStore } from '@/stores/world'
import { WORLD_NODES } from '@/data/worldGraph'

const ws = useWorldStore()

const currentNodeId = computed(() => ws.currentNodeId)
const allNodes = computed(() => Object.values(WORLD_NODES))
const visitedCount = computed(() => ws.visitedNodes.size)
const totalCount = computed(() => allNodes.value.length)

function isVisited(nodeId: string): boolean {
  return ws.isVisited(nodeId)
}

function handleNodeClick(nodeId: string) {
  if (isVisited(nodeId) && nodeId !== currentNodeId.value) {
    // 只能传送到已访问的节点
    ws.teleportTo(nodeId)
  }
}
</script>

<style scoped>
.mini-map {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 200px;
  background: rgba(10, 15, 8, 0.95);
  border: 2px solid #3a4a2a;
  border-radius: 8px;
  padding: 10px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  z-index: 100;
}

.mini-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #2a3a1a;
}

.mini-title {
  font-family: var(--font-serif);
  font-size: 12px;
  font-weight: 700;
  color: #b0c080;
  letter-spacing: 2px;
}

.mini-count {
  font-size: 10px;
  color: #7a8a6a;
  font-family: var(--font-mono);
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(12, 1fr);
  gap: 2px;
  aspect-ratio: 1;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  padding: 4px;
}

.mini-node {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(40, 50, 30, 0.4);
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s;
}

.mini-node.unvisited {
  background: rgba(20, 25, 15, 0.3);
  opacity: 0.3;
  cursor: default;
}

.mini-node.visited {
  background: var(--node-color);
  opacity: 0.6;
  border-color: var(--node-color);
}

.mini-node.visited:hover {
  opacity: 1;
  transform: scale(1.2);
  z-index: 10;
  box-shadow: 0 0 8px var(--node-color);
}

.mini-node.current {
  background: #e0d0a0;
  opacity: 1;
  border-color: #fff;
  animation: pulse 2s ease-in-out infinite;
  z-index: 5;
}

.mini-icon {
  font-family: var(--font-serif);
  font-size: 8px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
  line-height: 1;
}

.mini-node.current .mini-icon {
  color: #1a1e12;
  text-shadow: 0 0 4px rgba(224, 208, 160, 0.8);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 4px rgba(224, 208, 160, 0.6);
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 0 12px rgba(224, 208, 160, 0.9);
  }
}
</style>