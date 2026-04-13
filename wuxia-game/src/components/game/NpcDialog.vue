<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="npc" class="npc-dialog-overlay" @click.self="$emit('close')">
        <div class="npc-dialog-modal">
          <div class="nd-hd">
            <div class="nd-info">
              <span class="nd-icon">{{ npc.icon }}</span>
              <div>
                <div class="nd-name">{{ npc.name }}</div>
                <div class="nd-title">{{ npc.title }}</div>
              </div>
            </div>
            <button class="nd-close" @click="$emit('close')">✕</button>
          </div>
          <div class="nd-body">
            <p class="nd-text">{{ currentDialogue }}</p>
          </div>
          <div class="nd-foot">
            <button class="nd-btn" @click="$emit('next')">
              {{ isLastDialogue ? '告辞' : '继续' }}
            </button>
            <button
              v-if="npc.scenarioId"
              class="nd-btn special"
              @click="$emit('trigger-scenario', npc.scenarioId)"
            >
              【与之深谈】
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NPC } from '@/data/npcData'

interface Props {
  npc: NPC | null
  dialogueIndex: number
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  next: []
  'trigger-scenario': []
}>()

const currentDialogue = computed(() => {
  if (!props.npc) return ''
  return props.npc.dialogues[props.dialogueIndex % props.npc.dialogues.length]
})

const isLastDialogue = computed(() => {
  if (!props.npc) return true
  return props.dialogueIndex >= props.npc.dialogues.length - 1
})
</script>

<style scoped>
/* 遮罩层 */
.npc-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

/* 弹窗主体 */
.npc-dialog-modal {
  background: linear-gradient(135deg, #1a1e12 0%, #0e1208 100%);
  border: 2px solid #3a4a2a;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nd-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 2px solid #2a3a1a;
  background: rgba(20, 25, 15, 0.8);
  flex-shrink: 0;
}

.nd-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nd-icon {
  font-size: 32px;
  line-height: 1;
  filter: drop-shadow(0 0 8px currentColor);
}

.nd-name {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 700;
  color: #e0d0a0;
  letter-spacing: 2px;
}

.nd-title {
  font-size: 11px;
  color: #8a9a6a;
  letter-spacing: 1px;
  margin-top: 4px;
}

.nd-close {
  background: none;
  border: none;
  color: #7a8a6a;
  cursor: pointer;
  font-size: 20px;
  padding: 4px 8px;
  transition: all 0.2s;
  border-radius: 4px;
}

.nd-close:hover {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.nd-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  background: rgba(15, 20, 10, 0.6);
}

.nd-text {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 400;
  line-height: 2.2;
  letter-spacing: 2px;
  color: #c0d0a0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.nd-foot {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 2px solid #2a3a1a;
  background: rgba(20, 25, 15, 0.8);
  flex-shrink: 0;
}

.nd-btn {
  flex: 1;
  padding: 10px 20px;
  background: rgba(80, 100, 50, 0.3);
  border: 1px solid #5a7a3a;
  border-radius: 6px;
  font-family: var(--font-serif);
  font-size: 14px;
  color: #b0d080;
  cursor: pointer;
  letter-spacing: 2px;
  transition: all 0.2s;
}

.nd-btn:hover {
  background: rgba(100, 120, 60, 0.5);
  border-color: #7a9a5a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 140, 60, 0.3);
}

.nd-btn.special {
  border-color: #d4a574;
  color: #f0d0a0;
  background: rgba(180, 140, 80, 0.2);
}

.nd-btn.special:hover {
  background: rgba(200, 160, 100, 0.3);
  border-color: #e0b584;
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.4);
}

/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .npc-dialog-modal,
.modal-leave-active .npc-dialog-modal {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .npc-dialog-modal {
  transform: scale(0.9) translateY(-20px);
  opacity: 0;
}

.modal-leave-to .npc-dialog-modal {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}
</style>