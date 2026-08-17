<template>
  <div class="repository-management-trigger-wrap" aria-label="Repository management">
    <q-btn
      flat
      dense
      round
      icon="folder_open"
      aria-label="Repository management"
      :aria-pressed="active"
      class="repository-management-trigger"
      :class="{ 'repository-management-trigger-active': active }"
      @click="$emit('open')"
    >
      <q-tooltip>Repository Management</q-tooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  active: boolean;
}>();

defineEmits<{
  open: [];
}>();
</script>

<style scoped>
.repository-management-trigger-wrap {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 48px;
  padding-right: 10px;
  border-right: 1px solid var(--app-border);
  -webkit-app-region: no-drag;
  app-region: no-drag;
}

.repository-management-trigger {
  width: 38px;
  height: 38px;
  min-height: 38px;
  color: var(--app-text-muted);
  border: 1px solid transparent;
  border-radius: var(--app-radius);
}

.repository-management-trigger :deep(.q-icon) {
  font-size: 22px;
}

.repository-management-trigger-active,
.repository-management-trigger:hover {
  color: var(--app-text);
  background: var(--app-surface-raised);
  border-color: var(--app-border-strong);
}

@media (max-width: 760px) {
  .repository-management-trigger-wrap {
    padding-right: 6px;
  }
}
</style>
