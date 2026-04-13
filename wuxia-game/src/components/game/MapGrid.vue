<template>
  <div class="map-root" tabindex="0" ref="rootEl"
    @keydown="onKey"
    @keydown.up.prevent="move(0,-1)"
    @keydown.down.prevent="move(0,1)"
    @keydown.left.prevent="move(-1,0)"
    @keydown.right.prevent="move(1,0)"
  >
    <!-- 地图视口 -->
    <div class="viewport">
      <div v-for="(row, ry) in viewport" :key="ry" class="map-row">
        <div
          v-for="(cell, cx) in row"
          :key="cx"
          class="cell"
          :class="{
            player:      isPlayer(cell),
            explored:    cell.explored,
            fog:         !cell.explored && !isNear(cell),
            near:        !cell.explored && isNear(cell),
            blocked:     !walkable(cell.type),
            'has-npc':   hasNpc(cell),
            'has-event': cell.hasEvent && cell.explored && !isPlayer(cell),
          }"
          :style="cellStyle(cell)"
          @click="clickCell(cell)"
        >
          <!-- 方向阻挡指示器 -->
          <div v-if="isPlayer(cell) && cell.blockedDirections" class="direction-indicators">
            <div v-if="cell.blockedDirections.includes('north')" class="dir-block north"></div>
            <div v-if="cell.blockedDirections.includes('south')" class="dir-block south"></div>
            <div v-if="cell.blockedDirections.includes('east')" class="dir-block east"></div>
            <div v-if="cell.blockedDirections.includes('west')" class="dir-block west"></div>
          </div>
          
          <!-- 玩家 -->
          <span v-if="isPlayer(cell)" class="player-glyph">俠</span>
          <!-- NPC标记 -->
          <span v-else-if="hasNpc(cell) && cell.explored" class="npc-glyph">人</span>
          <!-- 地形图标 -->
          <span v-else class="terrain-glyph">{{ glyph(cell) }}</span>
          <!-- 地点名 -->
          <span v-if="cell.name && cell.explored && !isPlayer(cell)" class="cell-label">{{ cell.name }}</span>
        </div>
      </div>
    </div>

    <!-- 底部信息栏 -->
    <div class="map-footer">
      <span class="footer-loc">
        <span class="loc-name">{{ currentCell.name || typeLabel(currentCell.type) }}</span>
      </span>
      <span class="footer-hint">WASD / 方向键移动 · 点击相邻格</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWorldStore } from '@/stores/world'
import { CELL_COLORS, CELL_ICONS, isWalkable, TERRAIN_TYPE_NAMES } from '@/data/worldMap'
import { NPC_DATA } from '@/data/npcData'
import type { MapCell, CellType, Direction } from '@/types'

const emit = defineEmits<{
  move: [cell: MapCell, moved: boolean]
  enterCell: [cell: MapCell]
}>()

const rootEl = ref<HTMLElement>()
const ws = useWorldStore()

// 视口：以玩家为中心的 11×7 窗口
const VW = 11
const VH = 7

const viewport   = computed(() => ws.getViewport(VW, VH))
const playerX    = computed(() => ws.playerX)
const playerY    = computed(() => ws.playerY)
const currentCell = computed(() => ws.currentCell)

function isPlayer(c: MapCell) { return c.x === playerX.value && c.y === playerY.value }
function isNear(c: MapCell) { return Math.abs(c.x - playerX.value) <= 1 && Math.abs(c.y - playerY.value) <= 1 }
function walkable(t: CellType) { return isWalkable(t) }
function hasNpc(c: MapCell) { return !!NPC_DATA[`${c.y},${c.x}`]?.length }
function typeLabel(t: CellType) { return TERRAIN_TYPE_NAMES[t] ?? '未知' }

function glyph(c: MapCell) {
  if (!c.explored && !isNear(c)) return ''
  return CELL_ICONS[c.type] ?? '·'
}

function cellStyle(c: MapCell) {
  if (!c.explored && !isNear(c)) return { background: '#080808', borderColor: '#111' }
  const col = CELL_COLORS[c.type] ?? CELL_COLORS.plain
  return {
    background:   col.bg,
    borderColor:  col.border,
    opacity:      (!c.explored && isNear(c)) ? 0.55 : 1,
    '--cell-text': col.text,
  }
}

function move(dx: -1|0|1, dy: -1|0|1) {
  const { moved, cell } = ws.tryMove({ dx, dy } as Direction)
  if (cell) emit('move', cell, moved)
  if (moved && cell) emit('enterCell', cell)
}

function onKey(e: KeyboardEvent) {
  const m: Record<string, [-1|0|1, -1|0|1]> = {
    w:[0,-1], W:[0,-1], ArrowUp:[0,-1],
    s:[0,1],  S:[0,1],  ArrowDown:[0,1],
    a:[-1,0], A:[-1,0], ArrowLeft:[-1,0],
    d:[1,0],  D:[1,0],  ArrowRight:[1,0],
    q:[-1,-1],Q:[-1,-1], e:[1,-1],E:[1,-1],
    z:[-1,1], Z:[-1,1],  c:[1,1], C:[1,1],
  }
  const dir = m[e.key]
  if (dir) { e.preventDefault(); move(dir[0], dir[1]) }
}

function clickCell(c: MapCell) {
  const dx = (c.x - playerX.value) as -1|0|1
  const dy = (c.y - playerY.value) as -1|0|1
  if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0)) move(dx, dy)
}

onMounted(() => rootEl.value?.focus())
</script>

<style scoped>
.map-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--map-bg, #0e1208);
  outline: none;
  user-select: none;
}

.viewport {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 6px;
  gap: 3px;
  overflow: hidden;
}

.map-row {
  display: flex;
  flex: 1;
  gap: 3px;
}

.cell {
  flex: 1;
  border: 1px solid #111;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: filter .1s;
  overflow: hidden;
  min-width: 0;
}

.cell:hover:not(.blocked):not(.player) { filter: brightness(1.5); }
.cell.blocked { cursor: default; }
.cell.fog { background: #060606 !important; border-color: #0e0e0e !important; }

.player-glyph {
  font-family: var(--font-serif);
  font-size: clamp(11px, 1.4vw, 17px);
  font-weight: 700;
  color: #fffbe0;
  text-shadow: 0 0 6px rgba(255,220,80,.9);
  animation: breathe 1.8s ease-in-out infinite;
  line-height: 1;
}

.npc-glyph {
  font-family: var(--font-serif);
  font-size: clamp(10px, 1.1vw, 14px);
  color: #e0c060;
  line-height: 1;
  animation: breathe 2.4s ease-in-out infinite;
}

.terrain-glyph {
  font-family: var(--font-serif);
  font-size: clamp(9px, 1vw, 13px);
  color: var(--cell-text, #4a5a34);
  opacity: .75;
  line-height: 1;
}
.cell.explored .terrain-glyph { opacity: 1; }

.cell-label {
  position: absolute;
  bottom: 1px;
  left: 0; right: 0;
  font-size: clamp(6px, .6vw, 9px);
  text-align: center;
  color: rgba(255,240,180,.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1;
  padding: 0 1px;
  pointer-events: none;
}

.has-event::after {
  content: '';
  position: absolute;
  top: 2px; right: 2px;
  width: 3px; height: 3px;
  border-radius: 50%;
  background: #e0b040;
  animation: breathe 1.5s ease-in-out infinite;
}

.map-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px;
  border-top: 1px solid #1a2410;
  background: #0a0e06;
  flex-shrink: 0;
}

.footer-loc { font-size: 11px; color: #8aa060; letter-spacing: 1.5px; }
.loc-name { color: #b0c878; }
.footer-hint { font-size: 10px; color: #2a3a1a; letter-spacing: 1px; }

/* 方向阻挡指示器 */
.direction-indicators {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.dir-block {
  position: absolute;
  background: rgba(220, 60, 60, 0.7);
  box-shadow: 0 0 4px rgba(220, 60, 60, 0.8);
}

.dir-block.north {
  top: 0;
  left: 20%;
  right: 20%;
  height: 3px;
  border-radius: 0 0 2px 2px;
}

.dir-block.south {
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 3px;
  border-radius: 2px 2px 0 0;
}

.dir-block.east {
  right: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  border-radius: 2px 0 0 2px;
}

.dir-block.west {
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  border-radius: 0 2px 2px 0;
}

@keyframes breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: .6; }
}
</style>
