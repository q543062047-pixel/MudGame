<template>
  <div class="game-view">
    <div class="bg-layer"></div>

    <!-- 顶部栏 -->
    <GameHeader />

    <!-- 主区域 -->
    <div class="game-body">
      <!-- 剧情区 -->
      <StoryPanel />

      <!-- 侧边栏 -->
      <SidePanel />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import GameHeader from '@/components/GameHeader.vue'
import StoryPanel from '@/components/StoryPanel.vue'
import SidePanel from '@/components/SidePanel.vue'

const store = useGameStore()

onMounted(() => {
  if (store.messages.length === 0) {
    store.startGame()
  }
})
</script>

<style scoped>
.game-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.bg-layer {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse at 15% 50%, rgba(160, 100, 30, 0.05) 0%, transparent 55%),
    radial-gradient(ellipse at 85% 20%, rgba(100, 50, 15, 0.06) 0%, transparent 50%);
  pointer-events: none;
}

.game-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
  z-index: 1;
}
</style>
