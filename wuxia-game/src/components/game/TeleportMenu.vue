<template>
  <div class="teleport-menu-overlay" @click.self="$emit('close')">
    <div class="teleport-menu">
      <div class="menu-header">
        <h2>🐎 乘车前往</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="menu-content">
        <div v-if="teleportPoints.length === 0" class="empty-message">
          <p>此处暂无可用的车马服务</p>
        </div>

        <div v-else class="teleport-list">
          <div
            v-for="point in teleportPoints"
            :key="point.id"
            class="teleport-item"
            :class="{ disabled: !canUseTeleport(point) }"
            @click="handleTeleport(point)"
          >
            <div class="item-header">
              <span class="item-icon">{{ point.icon || '🐎' }}</span>
              <span class="item-name">{{ point.name }}</span>
            </div>

            <div v-if="point.description" class="item-description">
              {{ point.description }}
            </div>

            <div class="item-footer">
              <div v-if="point.cost" class="item-cost">
                <span class="cost-label">费用：</span>
                <span class="cost-value" :class="{ insufficient: playerGold < point.cost }">
                  {{ point.cost }} 两
                </span>
              </div>

              <div v-if="!canUseTeleport(point)" class="item-requirement">
                {{ getBlockReason(point) }}
              </div>

              <div v-else class="item-status">
                <span class="status-ready">✓ 可用</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="menu-footer">
        <div class="player-gold">
          <span class="gold-label">持有银两：</span>
          <span class="gold-value">{{ playerGold }} 两</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTeleport } from '@/composables/useTeleport'
import { usePlayerStore } from '@/stores/player'
import type { TeleportPoint } from '@/types'

const emit = defineEmits<{
  close: []
  teleport: [point: TeleportPoint]
}>()

const playerStore = usePlayerStore()
const { currentTeleportPoints, canTeleport, getTeleportBlockReason, teleport } = useTeleport()

const teleportPoints = computed(() => currentTeleportPoints.value)
const playerGold = computed(() => playerStore.character.gold)

function canUseTeleport(point: TeleportPoint): boolean {
  return canTeleport(point)
}

function getBlockReason(point: TeleportPoint): string {
  return getTeleportBlockReason(point) || '未知原因'
}

function handleTeleport(point: TeleportPoint) {
  if (!canUseTeleport(point)) {
    return
  }

  const success = teleport(point)
  if (success) {
    emit('teleport', point)
    emit('close')
  }
}
</script>

<style scoped>
.teleport-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.teleport-menu {
  background: linear-gradient(135deg, #f5e6d3 0%, #e8d4b8 100%);
  border: 3px solid #8b7355;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #8b7355;
  background: linear-gradient(to bottom, #f5e6d3, #ede0cc);
}

.menu-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #5c4a3a;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #8b7355;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: all 0.2s;
}

.close-btn:hover {
  color: #5c4a3a;
  transform: scale(1.1);
}

.menu-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.empty-message {
  text-align: center;
  padding: 3rem 1rem;
  color: #8b7355;
  font-size: 1.1rem;
}

.teleport-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.teleport-item {
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid #c4a57b;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.teleport-item:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.9);
  border-color: #8b7355;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.teleport-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(200, 200, 200, 0.3);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.item-icon {
  font-size: 1.5rem;
}

.item-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #5c4a3a;
}

.item-description {
  color: #6b5d4f;
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #d4c4a8;
}

.item-cost {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cost-label {
  color: #8b7355;
  font-size: 0.9rem;
}

.cost-value {
  color: #d4af37;
  font-weight: bold;
  font-size: 1rem;
}

.cost-value.insufficient {
  color: #c44;
}

.item-requirement {
  color: #c44;
  font-size: 0.9rem;
  font-style: italic;
}

.item-status {
  color: #4a7c59;
  font-size: 0.9rem;
  font-weight: bold;
}

.status-ready {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.menu-footer {
  padding: 1rem 1.5rem;
  border-top: 2px solid #8b7355;
  background: linear-gradient(to top, #f5e6d3, #ede0cc);
}

.player-gold {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gold-label {
  color: #8b7355;
  font-size: 1rem;
}

.gold-value {
  color: #d4af37;
  font-weight: bold;
  font-size: 1.1rem;
}

/* 滚动条样式 */
.menu-content::-webkit-scrollbar {
  width: 8px;
}

.menu-content::-webkit-scrollbar-track {
  background: rgba(139, 115, 85, 0.1);
  border-radius: 4px;
}

.menu-content::-webkit-scrollbar-thumb {
  background: rgba(139, 115, 85, 0.4);
  border-radius: 4px;
}

.menu-content::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 115, 85, 0.6);
}
</style>