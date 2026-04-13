<template>
  <div class="map-canvas">
    <svg class="map-svg" viewBox="-100 -150 1000 900">
      <!-- 连接线 -->
      <g v-if="showConnections" class="connections">
        <MapConnection
          v-for="(conn, i) in connections"
          :key="i"
          :x1="conn.x1"
          :y1="conn.y1"
          :x2="conn.x2"
          :y2="conn.y2"
          :is-active="conn.isActive"
          :is-blocked="conn.isBlocked"
        />
      </g>
      
      <!-- 节点 -->
      <g class="nodes">
        <MapNode
          v-for="n in nodes"
          :key="n.id"
          :id="n.id"
          :name="n.name"
          :icon="n.icon"
          :x="n.x"
          :y="n.y"
          :is-current="n.id === currentNodeId"
          :is-visited="isVisited(n.id)"
          :is-connected="isConnected(n.id)"
          @click="handleNodeClick"
        />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
/**
 * MapCanvas - 地图画布组件
 * 
 * 负责渲染SVG地图，包含所有节点和连接线
 */
import MapConnection from './MapConnection.vue'
import MapNode from './MapNode.vue'
import type { MapNode as MapNodeType } from '@/types'

interface VisibleNode extends MapNodeType {
  x: number
  y: number
  distance: number
}

interface Connection {
  x1: number
  y1: number
  x2: number
  y2: number
  isActive: boolean
  isBlocked: boolean
}

interface Props {
  /** 可见节点列表 */
  nodes: VisibleNode[]
  /** 连接线列表 */
  connections: Connection[]
  /** 当前节点ID */
  currentNodeId: string
  /** 是否显示连接线 */
  showConnections?: boolean
  /** 节点访问检查函数 */
  isVisitedFn: (nodeId: string) => boolean
  /** 节点连接检查函数 */
  isConnectedFn: (nodeId: string) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  showConnections: true,
})

const emit = defineEmits<{
  nodeClick: [nodeId: string]
}>()

function isVisited(nodeId: string): boolean {
  return props.isVisitedFn(nodeId)
}

function isConnected(nodeId: string): boolean {
  return props.isConnectedFn(nodeId)
}

function handleNodeClick(nodeId: string) {
  emit('nodeClick', nodeId)
}
</script>

<style scoped>
.map-canvas {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
}

.map-svg {
  width: 100%;
  height: 100%;
  max-width: 800px;
  max-height: 600px;
}
</style>