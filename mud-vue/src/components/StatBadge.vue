<template>
  <div class="stat-badge">
    <span class="label">{{ label }}</span>
    <span class="value" :class="color">{{ value }}</span>
    <span v-if="max != null" class="max">/ {{ max }}</span>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: Number,
  max: { type: Number, default: null },
  color: { type: String, default: 'gold' }
})
</script>

<style scoped>
.stat-badge {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 13px;
}

.label { color: var(--color-text-faint); }

.value { font-weight: 600; font-size: 15px; }
.value.gold  { color: var(--color-gold); }
.value.red   { color: #d05040; }
.value.blue  { color: #7ab0c0; }

.max { color: var(--color-text-faint); font-size: 12px; }
</style>
