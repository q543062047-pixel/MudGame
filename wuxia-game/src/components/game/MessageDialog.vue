<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="message-dialog-overlay" @click.self="close">
        <div class="message-dialog-modal">
          <div class="message-icon">⚠️</div>
          <div class="message-content">{{ message }}</div>
          <button class="message-button" @click="close">确定</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')

function show(msg: string) {
  message.value = msg
  visible.value = true
}

function close() {
  visible.value = false
}

defineExpose({
  show,
  close,
})
</script>

<style scoped>
.message-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.message-dialog-modal {
  background: linear-gradient(135deg, #2a1810 0%, #1a0f08 100%);
  border: 2px solid #8b6914;
  border-radius: 12px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  text-align: center;
}

.message-icon {
  font-size: 48px;
  margin-bottom: 20px;
  animation: bounce 0.6s ease-out;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.message-content {
  color: #f0e6d2;
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 25px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.message-button {
  background: linear-gradient(135deg, #8b6914 0%, #6b4910 100%);
  color: #f0e6d2;
  border: 2px solid #a0841a;
  border-radius: 8px;
  padding: 12px 40px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.message-button:hover {
  background: linear-gradient(135deg, #a0841a 0%, #8b6914 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.message-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .message-dialog-modal,
.modal-leave-active .message-dialog-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .message-dialog-modal {
  transform: scale(0.8) translateY(-20px);
}

.modal-leave-to .message-dialog-modal {
  transform: scale(0.8) translateY(20px);
}
</style>