<template>
  <header class="game-header">
    <div class="left">
      <span class="logo" @click="router.push('/')">江湖志</span>
      <span class="divider-v">|</span>
      <span class="turn-count">第 {{ store.turnCount }} 回</span>
    </div>

    <div class="stats">
      <StatBadge label="生命" :value="store.player.hp" :max="store.player.maxHp" color="red" />
      <StatBadge label="内力" :value="store.player.mp" :max="store.player.maxMp" color="blue" />
      <StatBadge label="声望" :value="store.player.reputation" color="gold" />
    </div>

    <div class="right">
      <button class="restart-btn" @click="handleRestart">重新开始</button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import StatBadge from './StatBadge.vue'

const router = useRouter()
const store = useGameStore()

function handleRestart() {
  if (confirm('确定要重新开始？当前进度将丢失。')) {
    router.push('/create')
  }
}
</script>

<style scoped>
.game-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid var(--color-border);
  background: rgba(8, 5, 1, 0.95);
  flex-shrink: 0;
  z-index: 10;
  position: relative;
}

.left { display: flex; align-items: center; gap: 12px; }

.logo {
  font-family: var(--font-display);
  font-size: 20px;
  color: var(--color-gold);
  letter-spacing: 5px;
  cursor: pointer;
  transition: color var(--transition);
}

.logo:hover { color: var(--color-gold-light); }

.divider-v { color: var(--color-border); font-size: 14px; }

.turn-count {
  font-size: 12px;
  color: var(--color-text-faint);
  letter-spacing: 1px;
}

.stats {
  display: flex;
  gap: 20px;
  align-items: center;
}

.right { display: flex; gap: 10px; }

.restart-btn {
  background: none;
  border: 1px solid var(--color-border-dim);
  color: var(--color-text-faint);
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 2px;
  letter-spacing: 1px;
  transition: all var(--transition);
}

.restart-btn:hover {
  border-color: var(--color-border);
  color: var(--color-text-mute);
}
</style>
