<template>
  <div class="home">
    <div class="bg-layer"></div>

    <div class="center">
      <div class="ornament">✦ ✦ ✦</div>
      <h1 class="title">江湖志</h1>
      <p class="subtitle">AI 驱动 · 武侠文字冒险</p>

      <div class="taglines">
        <p>千里江湖，皆在笔端</p>
        <p>你的每一步，塑造独一无二的传说</p>
      </div>

      <div class="features">
        <div class="feature">
          <span class="feat-icon">⚔</span>
          <span>AI实时生成剧情</span>
        </div>
        <div class="feature">
          <span class="feat-icon">🏯</span>
          <span>四大门派可选</span>
        </div>
        <div class="feature">
          <span class="feat-icon">📜</span>
          <span>自由行动无限可能</span>
        </div>
      </div>

      <button class="enter-btn" @click="$router.push('/create')">
        踏入江湖
      </button>

      <p class="hint">需要 Anthropic API Key · 请在游戏中配置</p>
    </div>
  </div>
</template>

<script setup>
// HomeView — 纯静态落地页
</script>

<style scoped>
.home {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.bg-layer {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 60%, rgba(180, 120, 40, 0.08) 0%, transparent 55%),
    radial-gradient(ellipse at 75% 30%, rgba(100, 50, 20, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.center {
  position: relative;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}

.ornament { color: var(--color-gold-mute); letter-spacing: 8px; font-size: 18px; }

.title {
  font-family: var(--font-display);
  font-size: clamp(48px, 8vw, 80px);
  color: var(--color-gold);
  letter-spacing: 16px;
  line-height: 1;
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-mute);
  letter-spacing: 4px;
}

.taglines {
  color: var(--color-text-dim);
  font-size: 15px;
  line-height: 2;
  letter-spacing: 1px;
}

.features {
  display: flex;
  gap: 2rem;
  margin: 0.5rem 0;
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--color-text-mute);
  font-size: 13px;
}

.feat-icon { font-size: 22px; }

.enter-btn {
  font-family: var(--font-display);
  font-size: 20px;
  letter-spacing: 8px;
  color: var(--color-gold-light);
  background: rgba(120, 75, 20, 0.5);
  border: 1px solid var(--color-gold);
  padding: 14px 50px;
  border-radius: 3px;
  transition: all var(--transition);
  margin-top: 0.5rem;
}

.enter-btn:hover {
  background: rgba(160, 100, 30, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(180, 120, 40, 0.2);
}

.hint {
  font-size: 12px;
  color: var(--color-text-faint);
  letter-spacing: 1px;
}
</style>