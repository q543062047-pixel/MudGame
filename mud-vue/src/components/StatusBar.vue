<template>
  <div>
    <h3>角色</h3>
    <p>HP: {{ player.hp }}</p>
    <p>内力: {{ player.mp }}</p>
  </div>
</template>

<script>
export default {
  props: ["player"]
};
</script>