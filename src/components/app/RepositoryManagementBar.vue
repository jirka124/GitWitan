<template>
  <section class="repository-management-bar" aria-label="Repository management status">
    <div class="repository-management-bar-copy">
      <div class="repository-management-bar-title">Repository Management</div>
      <div class="repository-management-bar-state">{{ repositoryCount }} repositories tracked</div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  repositoryCount: number;
}>();
</script>

<style scoped>
.repository-management-bar {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: center;
  min-width: 220px;
  min-height: 46px;
  padding: 7px 12px 8px;
  overflow: hidden;
  background: var(--app-surface-subtle);
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius);
  box-shadow: inset 0 1px 0 var(--app-inset-highlight);
  -webkit-app-region: no-drag;
  app-region: no-drag;
}

.repository-management-bar-copy {
  min-width: 0;
}

.repository-management-bar-title {
  overflow: hidden;
  color: var(--app-text);
  font-size: 14px;
  font-weight: 750;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.repository-management-bar-state {
  overflow: hidden;
  margin-top: 2px;
  color: var(--app-accent);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

@media (max-width: 760px) {
  .repository-management-bar {
    min-width: 140px;
    padding-right: 10px;
    padding-left: 10px;
  }
}
</style>
