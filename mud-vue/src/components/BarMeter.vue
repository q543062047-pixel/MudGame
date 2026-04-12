<template>
  <div class="bar-meter">
    <div class="bar-header">
      <span class="bar-label">{{ label }}</span>
      <span class="bar-text">{{ value }} / {{ max }}</span>
    </div>
    <div class="bar-track">
      <div
        class="bar-fill"
        :style="{ width: percent + '%', background: color }"
      ></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label:   String,
  value:   Number,
  max:     Number,
  percent: Number,
  color:   { type: String, default: '#b03020' }
})
</script>

<style scoped>
.bar-meter { display: flex; flex-direction: column; gap: 4px; }

.bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bar-label { font-size: 11px; color: var(--color-text-faint); }
.bar-text  { font-size: 11px; color: var(--color-text-mute); }

.bar-track {
  height: 4px;
  background: var(--color-border-dim);
  border-radius: 2px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease;
  max-width: 100%;
}
</style>
