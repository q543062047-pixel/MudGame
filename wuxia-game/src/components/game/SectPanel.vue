<template>
  <div class="sect-panel">
    <div class="sect-header">
      <div class="sect-icon" :style="{ color: currentSect?.color }">
        {{ currentSect?.icon || '无' }}
      </div>
      <div class="sect-info">
        <div class="sect-name">{{ currentSect?.name || '无门无派' }}</div>
        <div class="sect-title">{{ currentSectTitle }}</div>
      </div>
    </div>

    <div v-if="currentSect" class="sect-body">
      <!-- 声望进度 -->
      <div class="sect-reputation">
        <div class="rep-label">
          <span>门派声望</span>
          <span class="rep-value">{{ currentSectReputation }}</span>
        </div>
        <div class="rep-bar">
          <div 
            class="rep-fill" 
            :style="{ 
              width: `${levelProgress * 100}%`,
              backgroundColor: currentSect.color 
            }"
          />
        </div>
        <div v-if="nextLevelReputation" class="rep-next">
          下一等级需要: {{ nextLevelReputation }}
        </div>
        <div v-else class="rep-max">
          已达最高等级
        </div>
      </div>

      <!-- 门派属性加成 -->
      <div class="sect-attributes">
        <div class="attr-title">门派加成</div>
        <div class="attr-list">
          <div class="attr-item">
            <span class="attr-label">气血</span>
            <span class="attr-value">+{{ currentSect.attributes.hp }}</span>
          </div>
          <div class="attr-item">
            <span class="attr-label">内力</span>
            <span class="attr-value">+{{ currentSect.attributes.mp }}</span>
          </div>
          <div class="attr-item">
            <span class="attr-label">攻击</span>
            <span class="attr-value">+{{ currentSect.attributes.attack }}</span>
          </div>
          <div class="attr-item">
            <span class="attr-label">防御</span>
            <span class="attr-value">+{{ currentSect.attributes.defense }}</span>
          </div>
          <div class="attr-item">
            <span class="attr-label">速度</span>
            <span class="attr-value">+{{ currentSect.attributes.speed }}</span>
          </div>
        </div>
      </div>

      <!-- 门派描述 -->
      <div class="sect-description">
        {{ currentSect.description }}
      </div>
    </div>

    <div v-else class="sect-empty">
      <p>你目前没有加入任何门派</p>
      <p class="hint">探索江湖，寻找合适的门派加入吧！</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSect } from '@/composables/useSect'

const {
  currentSect,
  currentSectReputation,
  currentSectLevel,
  currentSectTitle,
  nextLevelReputation,
  levelProgress,
} = useSect()
</script>

<style scoped>
.sect-panel {
  background: rgba(90, 58, 24, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  padding: 16px;
  color: #f5e6d3;
}

.sect-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.sect-icon {
  font-size: 32px;
  font-weight: bold;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 2px solid currentColor;
}

.sect-info {
  flex: 1;
}

.sect-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.sect-title {
  font-size: 14px;
  color: #d4af37;
}

.sect-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sect-reputation {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: 6px;
}

.rep-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.rep-value {
  color: #d4af37;
  font-weight: bold;
}

.rep-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.rep-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.rep-next,
.rep-max {
  font-size: 12px;
  color: #b8a070;
  text-align: right;
}

.rep-max {
  color: #d4af37;
}

.sect-attributes {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: 6px;
}

.attr-title {
  font-size: 14px;
  margin-bottom: 8px;
  color: #d4af37;
}

.attr-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.attr-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.attr-label {
  color: #b8a070;
}

.attr-value {
  color: #70c070;
  font-weight: bold;
}

.sect-description {
  font-size: 13px;
  line-height: 1.6;
  color: #c0a070;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border-left: 3px solid rgba(212, 175, 55, 0.5);
}

.sect-empty {
  text-align: center;
  padding: 32px 16px;
  color: #b8a070;
}

.sect-empty p {
  margin: 8px 0;
}

.hint {
  font-size: 13px;
  color: #8a7050;
}
</style>