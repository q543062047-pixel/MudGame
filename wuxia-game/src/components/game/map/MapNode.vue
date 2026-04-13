<template>
  <g
    class="node-group"
    :class="{
      current: isCurrent,
      visited: isVisited,
      connected: isConnected
    }"
    :transform="`translate(${x}, ${y})`"
    @click="handleClick"
  >
    <circle class="node-circle" r="30" />
    <text class="node-icon-text" dy="8">{{ icon }}</text>
    <text class="node-name-text" dy="50">{{ name }}</text>
  </g>
</template>

<script setup lang="ts">
/**
 * MapNode - 地图节点组件
 * 
 * 用于渲染单个地图节点
 * 支持当前节点、已访问、可连接等不同状态的视觉反馈
 */

interface Props {
  /** 节点 ID */
  id: string
  /** 节点名称 */
  name: string
  /** 节点图标 */
  icon: string
  /** X 坐标（屏幕坐标） */
  x: number
  /** Y 坐标（屏幕坐标） */
  y: number
  /** 是否为当前节点 */
  isCurrent?: boolean
  /** 是否已访问 */
  isVisited?: boolean
  /** 是否可连接（在可见范围内） */
  isConnected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isCurrent: false,
  isVisited: false,
  isConnected: false,
})

const emit = defineEmits<{
  click: [nodeId: string]
}>()

function handleClick() {
  emit('click', props.id)
}
</script>

<style scoped>
.node-group {
  cursor: pointer;
  transition: all 0.3s ease;
}

.node-group.current .node-circle {
  fill: #e0d0a0;
  stroke: #fff;
  stroke-width: 3;
  filter: drop-shadow(0 0 12px rgba(224, 208, 160, 0.8));
  animation: pulse 2s ease-in-out infinite;
}

.node-group.visited .node-circle {
  fill: rgba(80, 100, 50, 0.6);
  stroke: #7a9a5a;
  stroke-width: 2;
}

.node-group.connected:not(.current):not(.visited) .node-circle {
  fill: rgba(60, 70, 40, 0.4);
  stroke: #5a6a4a;
  stroke-width: 2;
  stroke-dasharray: 4, 4;
}

.node-group:not(.current):not(.visited):not(.connected) {
  opacity: 0.3;
  pointer-events: none;
}

.node-group.connected:hover:not(.current) .node-circle {
  fill: rgba(100, 120, 60, 0.8);
  stroke: #a0c080;
  stroke-width: 3;
  transform: scale(1.1);
}

.node-circle {
  transition: all 0.3s;
}

.node-icon-text {
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 700;
  fill: #fff;
  text-anchor: middle;
  pointer-events: none;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
}

.node-group.current .node-icon-text {
  fill: #1a1e12;
  font-size: 28px;
}

.node-name-text {
  font-family: var(--font-serif);
  font-size: 12px;
  fill: #b0c080;
  text-anchor: middle;
  pointer-events: none;
  paint-order: stroke fill;
  stroke: #0a0f08;
  stroke-width: 4px;
  stroke-linejoin: round;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8));
}

.node-group.current .node-name-text {
  fill: #e0d0a0;
  font-size: 14px;
  font-weight: 700;
  stroke: #0a0f08;
  stroke-width: 5px;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>