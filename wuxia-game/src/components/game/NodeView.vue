<template>
  <div class="node-view">
    <!-- 地图可视化区域 -->
    <MapCanvas
      :nodes="visibleNodes"
      :connections="visibleConnections"
      :current-node-id="currentNodeId"
      :show-connections="showConnections"
      :is-visited-fn="isVisited"
      :is-connected-fn="isConnected"
      @node-click="handleNodeClick"
    />

    <!-- 当前节点信息栏 -->
    <NodeInfoBar
      :node="node"
      :npcs="currentNpcs"
      @npc-click="handleNpcClick"
      @teleport-click="handleTeleportClick"
    />

    <!-- NPC对话框 -->
    <NpcDialog
      v-if="activeNpc"
      :npc="activeNpc"
      :dialogue-index="dialogueIndex"
      @close="closeNpc"
      @next="nextDialogue"
      @trigger-scenario="triggerNpcScenario"
      @open-travel="openTravelMenu"
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
import MapCanvas from './map/MapCanvas.vue'
import NodeInfoBar from './map/NodeInfoBar.vue'
import type { MapNode } from '@/types'
import type { NPC } from '@/data/npcData'
import { useNodeVisibility } from '@/composables/map/useNodeVisibility'
import { useMapConnections } from '@/composables/map/useMapConnections'
import { getDirectionFromDelta } from '@/utils/map/directions'

const emit = defineEmits<{
  move: [direction: string, node: MapNode]
  talkToNpc: [npc: NPC]
  triggerScenario: [scenarioId: string]
  openTeleport: [npc: NPC]
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

// 使用 composables 计算可见节点和连接线
const { visibleNodes } = useNodeVisibility(
  computed(() => node.value),
  WORLD_NODES,
  { range: 2, centerX: 400, centerY: 300 }
)

const { visibleConnections } = useMapConnections(
  visibleNodes,
  computed(() => (nodeId: string) => ws.isVisited(nodeId)),
  computed(() => (nodeId: string, direction: any) => ws.isPathBlocked(nodeId, direction))
)

function isVisited(nodeId: string): boolean {
  return ws.isVisited(nodeId)
}

function isConnected(nodeId: string): boolean {
  // 检查节点是否在可见范围内（3格以内）
  return visibleNodes.value.some(n => n.id === nodeId && n.id !== currentNodeId.value)
}

function handleNodeClick(clickedNodeId: string) {
  if (clickedNodeId === currentNodeId.value) return
  
  const clickedNode = WORLD_NODES[clickedNodeId]
  if (!clickedNode) return
  
  // 只允许点击直接相邻的节点进行移动
  const isDirectlyConnected = node.value &&
    Object.values(node.value.connections).includes(clickedNode.id)
  
  if (!isDirectlyConnected) return
  
  // 使用工具函数计算方向
  if (node.value) {
    const deltaX = clickedNode.mapX - node.value.mapX
    const deltaY = clickedNode.mapY - node.value.mapY
    const direction = getDirectionFromDelta(deltaX, deltaY)
    
    if (direction) {
      const result = ws.tryMove(direction)
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

function handleTeleportClick() {
  // 这个方法现在不再使用，因为传送通过NPC触发
  // emit('openTeleport')
}

function openTravelMenu() {
  if (activeNpc.value) {
    const npc = activeNpc.value
    // 先关闭 NPC 对话框
    closeNpc()
    // 延迟打开乘车菜单，确保对话框关闭动画完成
    setTimeout(() => {
      emit('openTeleport', npc)
    }, 100)
  }
}
</script>

<style scoped>
.node-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #1c1008 0%, #2a1e10 100%);
  overflow: hidden;
}
</style>
