<template>
  <div class="direction-pad">
    <div class="pad-title">可前往方向</div>
    <div class="pad-grid">
      <!-- 第一行：西北、北、东北 -->
      <button 
        class="dir-btn nw" 
        :class="{ active: hasDirection('northwest') }"
        :disabled="!hasDirection('northwest')"
        @click="move('northwest')"
      >
        <span class="dir-key">Q</span>
        <span class="dir-label">西北</span>
        <span v-if="hasDirection('northwest')" class="dir-target">{{ getTargetName('northwest') }}</span>
      </button>
      
      <button 
        class="dir-btn n" 
        :class="{ active: hasDirection('north') }"
        :disabled="!hasDirection('north')"
        @click="move('north')"
      >
        <span class="dir-key">W</span>
        <span class="dir-label">北</span>
        <span v-if="hasDirection('north')" class="dir-target">{{ getTargetName('north') }}</span>
      </button>
      
      <button 
        class="dir-btn ne" 
        :class="{ active: hasDirection('northeast') }"
        :disabled="!hasDirection('northeast')"
        @click="move('northeast')"
      >
        <span class="dir-key">E</span>
        <span class="dir-label">东北</span>
        <span v-if="hasDirection('northeast')" class="dir-target">{{ getTargetName('northeast') }}</span>
      </button>

      <!-- 第二行：西、中心、东 -->
      <button 
        class="dir-btn w" 
        :class="{ active: hasDirection('west') }"
        :disabled="!hasDirection('west')"
        @click="move('west')"
      >
        <span class="dir-key">A</span>
        <span class="dir-label">西</span>
        <span v-if="hasDirection('west')" class="dir-target">{{ getTargetName('west') }}</span>
      </button>
      
      <div class="dir-center">
        <span class="center-icon">●</span>
        <span class="center-label">当前</span>
      </div>
      
      <button 
        class="dir-btn e" 
        :class="{ active: hasDirection('east') }"
        :disabled="!hasDirection('east')"
        @click="move('east')"
      >
        <span class="dir-key">D</span>
        <span class="dir-label">东</span>
        <span v-if="hasDirection('east')" class="dir-target">{{ getTargetName('east') }}</span>
      </button>

      <!-- 第三行：西南、南、东南 -->
      <button 
        class="dir-btn sw" 
        :class="{ active: hasDirection('southwest') }"
        :disabled="!hasDirection('southwest')"
        @click="move('southwest')"
      >
        <span class="dir-key">Z</span>
        <span class="dir-label">西南</span>
        <span v-if="hasDirection('southwest')" class="dir-target">{{ getTargetName('southwest') }}</span>
      </button>
      
      <button 
        class="dir-btn s" 
        :class="{ active: hasDirection('south') }"
        :disabled="!hasDirection('south')"
        @click="move('south')"
      >
        <span class="dir-key">S</span>
        <span class="dir-label">南</span>
        <span v-if="hasDirection('south')" class="dir-target">{{ getTargetName('south') }}</span>
      </button>
      
      <button 
        class="dir-btn se" 
        :class="{ active: hasDirection('southeast') }"
        :disabled="!hasDirection('southeast')"
        @click="move('southeast')"
      >
        <span class="dir-key">C</span>
        <span class="dir-label">东南</span>
        <span v-if="hasDirection('southeast')" class="dir-target">{{ getTargetName('southeast') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Direction8 } from '@/types'

interface DirectionInfo {
  direction: Direction8
  targetId: string
  targetNode: any
}

const props = defineProps<{
  availableDirections: DirectionInfo[]
}>()

const emit = defineEmits<{
  move: [direction: Direction8]
}>()

const directionMap = computed(() => {
  const map = new Map<Direction8, DirectionInfo>()
  props.availableDirections.forEach(info => {
    map.set(info.direction, info)
  })
  return map
})

function hasDirection(dir: Direction8): boolean {
  return directionMap.value.has(dir)
}

function getTargetName(dir: Direction8): string {
  const info = directionMap.value.get(dir)
  return info?.targetNode?.name || ''
}

function move(dir: string) {
  if (hasDirection(dir as Direction8)) {
    emit('move', dir as Direction8)
  }
}
</script>

<style scoped>
.direction-pad {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pad-title {
  font-family: var(--font-serif);
  font-size: 14px;
  color: #a0b080;
  letter-spacing: 2px;
  text-align: center;
}

.pad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-width: 400px;
  margin: 0 auto;
}

.dir-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 8px;
  background: rgba(30, 40, 20, 0.6);
  border: 1px solid #2a3a1a;
  border-radius: 6px;
  color: #6a7a5a;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 70px;
}

.dir-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: rgba(20, 25, 15, 0.4);
}

.dir-btn.active {
  background: rgba(60, 80, 40, 0.4);
  border-color: #5a7a3a;
  color: #b0d080;
}

.dir-btn.active:hover:not(:disabled) {
  background: rgba(80, 100, 50, 0.5);
  border-color: #7a9a5a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 140, 60, 0.3);
}

.dir-key {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid currentColor;
  border-radius: 3px;
  opacity: 0.7;
}

.dir-label {
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
}

.dir-target {
  font-size: 10px;
  color: #8a9a6a;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dir-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 8px;
  background: rgba(80, 100, 50, 0.2);
  border: 2px solid #5a7a3a;
  border-radius: 6px;
  min-height: 70px;
}

.center-icon {
  font-size: 24px;
  color: #e0d0a0;
  text-shadow: 0 0 8px rgba(224, 208, 160, 0.5);
}

.center-label {
  font-family: var(--font-serif);
  font-size: 12px;
  color: #a0b080;
  letter-spacing: 1px;
}

/* 键盘提示动画 */
@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.dir-btn.active .dir-key {
  animation: pulse 2s ease-in-out infinite;
}
</style>