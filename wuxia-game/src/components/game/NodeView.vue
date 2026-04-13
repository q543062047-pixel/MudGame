<template>
  <div class="node-view">
    <!-- 地图可视化区域 -->
    <div class="map-canvas">
      <svg class="map-svg" viewBox="-100 -150 1000 900">
        <!-- 连接线 -->
        <g v-if="showConnections" class="connections">
          <path
            v-for="(conn, i) in visibleConnections"
            :key="i"
            :d="`M ${conn.x1} ${conn.y1} L ${conn.x2} ${conn.y2}`"
            class="connection-line"
            :class="{ active: conn.isActive, blocked: conn.isBlocked }"
            :stroke-dasharray="conn.isBlocked ? '5,5' : 'none'"
            fill="none"
          />
        </g>
        
        <!-- 节点 -->
        <g class="nodes">
          <g
            v-for="n in visibleNodes"
            :key="n.id"
            class="node-group"
            :class="{
              current: n.id === currentNodeId,
              visited: isVisited(n.id),
              connected: isConnected(n.id)
            }"
            :transform="`translate(${n.x}, ${n.y})`"
            @click="handleNodeClick(n)"
          >
            <circle class="node-circle" r="30" />
            <text class="node-icon-text" dy="8">{{ n.icon }}</text>
            <text class="node-name-text" dy="50">{{ n.name }}</text>
          </g>
        </g>
      </svg>
    </div>

    <!-- 当前节点信息栏 -->
    <div class="node-info-bar">
      <div class="info-content">
        <div class="info-header">
          <span class="info-icon" :style="{ color: node?.color }">{{ node?.icon || '●' }}</span>
          <span class="info-name">{{ node?.name || '未知地点' }}</span>
          <span class="info-type">{{ typeLabel }}</span>
        </div>
        <p class="info-desc">{{ node?.description || '这里一片荒芜...' }}</p>
        
        <!-- NPC列表 -->
        <div v-if="currentNpcs.length > 0" class="npc-list">
          <div class="npc-label">此处有：</div>
          <div class="npc-items">
            <button
              v-for="npc in currentNpcs"
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

    <!-- NPC对话框 -->
    <NpcDialog
      v-if="activeNpc"
      :npc="activeNpc"
      :dialogue-index="dialogueIndex"
      @close="closeNpc"
      @next="nextDialogue"
      @trigger-scenario="triggerNpcScenario"
    />
    
    <!-- 消息弹窗 -->
    <MessageDialog ref="messageDialog" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useWorldStore } from '@/stores/world'
import { WORLD_NODES } from '@/data/worldGraph'
import { NPC_DATA } from '@/data/npcData'
import NpcDialog from './NpcDialog.vue'
import MessageDialog from './MessageDialog.vue'
import type { MapNode } from '@/types'
import type { NPC } from '@/data/npcData'

const emit = defineEmits<{
  move: [direction: string, node: MapNode]
  talkToNpc: [npc: NPC]
  triggerScenario: [scenarioId: string]
}>()

const ws = useWorldStore()
const messageDialog = ref<InstanceType<typeof MessageDialog>>()

// Demo: 在神秘洞窟添加测试阻挡
onMounted(() => {
  // 阻挡神秘洞窟向东的路径（返回西行小道）
  ws.blockPath('mysterious_cave', 'east', {
    blocked: true,
    reason: '洞口坍塌',
    onBlockMessage: '洞口被巨石堵住了，无法返回！需要找到炸药才能炸开。',
  })
})

const node = computed(() => ws.currentNode)
const currentNodeId = computed(() => ws.currentNodeId)

// 控制连接线显示的状态
const showConnections = ref(true)

// 监听节点变化，延迟显示连接线
watch(currentNodeId, () => {
  showConnections.value = false
  setTimeout(() => {
    showConnections.value = true
  }, 350) // 等待节点移动动画完成（稍长于0.3s）
})

const typeLabel = computed(() => {
  const labels: Record<string, string> = {
    town: '城镇',
    wild: '野外',
    dungeon: '险地',
    special: '特殊',
    sect: '门派',
  }
  return node.value ? labels[node.value.type] || '未知' : ''
})

// 计算可见节点（当前节点 + 2格范围内的节点）- 使用绝对坐标
const visibleNodes = computed(() => {
  const current = node.value
  if (!current) return []
  
  const nodes: Array<MapNode & { x: number; y: number; distance: number }> = []
  const visited = new Set<string>()
  
  // 中心点坐标
  const centerX = 400
  const centerY = 300
  const gridSize = 120 // 每个网格单位的像素大小（增大间距）
  
  // BFS 遍历2格范围内的所有节点
  const queue: Array<{ nodeId: string; distance: number }> = [
    { nodeId: current.id, distance: 0 }
  ]
  
  visited.add(current.id)
  
  while (queue.length > 0) {
    const { nodeId, distance } = queue.shift()!
    const currentNode = WORLD_NODES[nodeId]
    
    if (!currentNode) continue
    
    // 使用绝对坐标计算位置（相对于当前节点）
    const deltaX = currentNode.mapX - current.mapX
    const deltaY = currentNode.mapY - current.mapY
    const x = centerX + deltaX * gridSize
    const y = centerY + deltaY * gridSize
    
    // 添加当前节点到结果
    nodes.push({
      ...currentNode,
      x,
      y,
      distance,
    })
    
    // 如果距离小于2，继续探索相邻节点
    if (distance < 2) {
      Object.entries(currentNode.connections).forEach(([dir, targetId]) => {
        if (!visited.has(targetId)) {
          visited.add(targetId)
          const newDistance = distance + 1
          queue.push({ nodeId: targetId, distance: newDistance })
        }
      })
    }
  }
  
  return nodes
})

// 计算连接线（显示所有可见节点之间的连接）
const visibleConnections = computed(() => {
  const nodes = visibleNodes.value
  if (nodes.length === 0) return []
  
  const connections: Array<{
    x1: number
    y1: number
    x2: number
    y2: number
    isActive: boolean
    isBlocked: boolean
  }> = []
  
  const nodePositionMap = new Map<string, { x: number; y: number }>()
  nodes.forEach(n => {
    nodePositionMap.set(n.id, { x: n.x, y: n.y })
  })
  
  const nodeRadius = 30 // 节点圆圈半径
  
  // 遍历所有可见节点，绘制它们的连接线
  nodes.forEach(n => {
    const sourcePos = nodePositionMap.get(n.id)
    if (!sourcePos) return
    
    Object.entries(n.connections).forEach(([dir, targetId]) => {
      const targetPos = nodePositionMap.get(targetId)
      if (targetPos) {
        // 只绘制一次（避免重复）
        const connectionKey = [n.id, targetId].sort().join('-')
        const alreadyDrawn = connections.some(c => {
          const key = [
            `${c.x1},${c.y1}`,
            `${c.x2},${c.y2}`
          ].sort().join('-')
          return key === [
            `${sourcePos.x},${sourcePos.y}`,
            `${targetPos.x},${targetPos.y}`
          ].sort().join('-')
        })
        
        if (!alreadyDrawn) {
          // 计算线条方向和长度
          const dx = targetPos.x - sourcePos.x
          const dy = targetPos.y - sourcePos.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // 计算单位向量
          const unitX = dx / distance
          const unitY = dy / distance
          
          // 线条起点和终点在圆圈边缘
          const x1 = sourcePos.x + unitX * nodeRadius
          const y1 = sourcePos.y + unitY * nodeRadius
          const x2 = targetPos.x - unitX * nodeRadius
          const y2 = targetPos.y - unitY * nodeRadius
          
          // 检查是否被阻挡（检查两个方向）
          const blocked1 = ws.isPathBlocked(n.id, dir as any).blocked
          const blocked2 = ws.isPathBlocked(targetId, getReverseDirection(dir as any)).blocked
          
          connections.push({
            x1,
            y1,
            x2,
            y2,
            isActive: ws.isVisited(targetId) && ws.isVisited(n.id),
            isBlocked: blocked1 || blocked2,
          })
        }
      }
    })
  })
  
  return connections
})

// 获取反向方向
function getReverseDirection(dir: string): any {
  const reverseMap: Record<string, string> = {
    north: 'south',
    south: 'north',
    east: 'west',
    west: 'east',
    northeast: 'southwest',
    southwest: 'northeast',
    northwest: 'southeast',
    southeast: 'northwest',
  }
  return reverseMap[dir] || dir
}

function isVisited(nodeId: string): boolean {
  return ws.isVisited(nodeId)
}

function isConnected(nodeId: string): boolean {
  // 检查节点是否在可见范围内（3格以内）
  return visibleNodes.value.some(n => n.id === nodeId && n.id !== currentNodeId.value)
}

function handleNodeClick(clickedNode: MapNode) {
  if (clickedNode.id === currentNodeId.value) return
  
  // 只允许点击直接相邻的节点进行移动
  const isDirectlyConnected = node.value &&
    Object.values(node.value.connections).includes(clickedNode.id)
  
  if (!isDirectlyConnected) return
  
  // 找到方向
  const direction = Object.entries(node.value!.connections).find(
    ([_, targetId]) => targetId === clickedNode.id
  )?.[0]
  
  if (direction) {
    const result = ws.tryMove(direction as any)
    console.log('tryMove result:', result)
    if (result.moved && result.node) {
      emit('move', direction, result.node)
    } else if (result.blocked && result.blockReason) {
      // 显示阻挡消息
      console.log('Showing block message:', result.blockReason)
      console.log('messageDialog ref:', messageDialog.value)
      messageDialog.value?.show(result.blockReason)
    }
  }
}

// NPC 相关
const activeNpc = ref<NPC | null>(null)
const dialogueIndex = ref(0)

// 获取当前节点的 NPC
const currentNpcs = computed(() => {
  const current = node.value
  if (!current) return []
  
  // 使用节点坐标查找 NPC
  const key = `${current.mapY},${current.mapX}`
  const npcs = NPC_DATA[key]
  return npcs || []
})

function handleNpcClick(npc: NPC) {
  activeNpc.value = npc
  dialogueIndex.value = 0
  emit('talkToNpc', npc)
}

function closeNpc() {
  activeNpc.value = null
  dialogueIndex.value = 0
}

function nextDialogue() {
  if (!activeNpc.value) return
  dialogueIndex.value++
  if (dialogueIndex.value >= activeNpc.value.dialogues.length) {
    closeNpc()
  }
}

function triggerNpcScenario(scenarioId: string) {
  closeNpc()
  emit('triggerScenario', scenarioId)
}
</script>

<style scoped>
.node-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #0e1208 0%, #1a1e12 100%);
  overflow: hidden;
}

/* 地图画布 */
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

/* 连接线 */
.connection-line {
  stroke: #3a4a2a;
  stroke-width: 2;
  stroke-dasharray: 5, 5;
  opacity: 0;
  animation: fadeIn 0.5s ease-out forwards;
  transition: stroke 0.3s ease,
              stroke-width 0.3s ease;
}

.connection-line.active {
  stroke: #7a9a5a;
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

/* 节点组 */
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

/* 信息栏 */
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

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>
