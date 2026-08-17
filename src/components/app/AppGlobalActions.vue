<template>
  <div class="app-global-actions" aria-label="Global commands">
    <q-btn
      flat
      dense
      round
      :icon="themeIcon"
      :aria-label="themeLabel"
      class="app-global-action"
      @click="$emit('toggle-theme')"
    >
      <q-tooltip>{{ themeLabel }}</q-tooltip>
    </q-btn>
    <q-btn flat dense round icon="settings" aria-label="Settings" class="app-global-action">
      <q-tooltip>Settings</q-tooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  themeIcon: string;
  themeLabel: string;
}>();

defineEmits<{
  'toggle-theme': [];
}>();
</script>

<style scoped>
.app-global-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
  -webkit-app-region: no-drag;
  app-region: no-drag;
}

.app-global-action {
  width: 38px;
  height: 38px;
  min-height: 38px;
  color: var(--app-text-muted);
  background: var(--app-settings-bg);
  border: 1px solid var(--app-command-group-border);
  border-radius: var(--app-radius);
}

.app-global-action :deep(.q-icon) {
  font-size: 22px;
}

.app-global-action:hover {
  color: var(--app-text);
  background: var(--app-surface-raised);
  border-color: var(--app-border-strong);
}
</style>
