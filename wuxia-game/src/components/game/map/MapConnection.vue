<template>
  <path
    :d="`M ${x1} ${y1} L ${x2} ${y2}`"
    class="connection-line"
    :class="{ active: isActive, blocked: isBlocked }"
    :stroke-dasharray="isBlocked ? '5,5' : 'none'"
    fill="none"
  />
</template>

<script setup lang="ts">
/**
 * MapConnection - 地图连接线组件
 * 
 * 用于渲染两个节点之间的连接线
 * 支持激活状态和阻挡状态的视觉反馈
 */

interface Props {
  /** 起点 X 坐标 */
  x1: number
  /** 起点 Y 坐标 */
  y1: number
  /** 终点 X 坐标 */
  x2: number
  /** 终点 Y 坐标 */
  y2: number
  /** 是否为激活状态（两端节点都已访问） */
  isActive?: boolean
  /** 是否被阻挡 */
  isBlocked?: boolean
}

withDefaults(defineProps<Props>(), {
  isActive: false,
  isBlocked: false,
})
</script>

<style scoped>
.connection-line {
  stroke: #6a5a3a;
  stroke-width: 2;
  stroke-dasharray: 5, 5;
  opacity: 0;
  animation: fadeIn 0.5s ease-out forwards;
  transition: stroke 0.3s ease,
              stroke-width 0.3s ease;
}

.connection-line.active {
  stroke: #b8a070;
  stroke-width: 3;
  stroke-dasharray: none;
  animation: fadeInActive 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.4;
  }
}

@keyframes fadeInActive {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.8;
  }
}

/* 被阻挡的连接线 */
.connection-line.blocked {
  stroke: #ff4444 !important;
  stroke-width: 2.5;
  opacity: 0.6 !important;
  animation: none;
}

.connection-line.blocked.active {
  stroke: #ff6666 !important;
  stroke-width: 3;
}
</style>