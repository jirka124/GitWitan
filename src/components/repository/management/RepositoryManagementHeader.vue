<template>
  <header class="repository-management-header">
    <div class="repository-management-heading">
      <q-btn
        v-if="canGoBack"
        flat
        dense
        round
        icon="arrow_back"
        aria-label="Back to previous view"
        class="management-back-button"
        @click="$emit('back')"
      >
        <q-tooltip>Back</q-tooltip>
      </q-btn>

      <div>
        <div class="repository-management-title">Repository Management</div>
        <div class="repository-management-subtitle">
          {{ repositoryCount }} repositories tracked locally
        </div>
      </div>
    </div>

    <div class="repository-management-actions">
      <q-btn flat dense no-caps icon="download" label="Clone" class="management-command" />
      <q-btn flat dense no-caps icon="create_new_folder" label="Init" class="management-command" />
      <q-btn flat dense no-caps icon="add" label="Add Existing" class="management-command" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  canGoBack: boolean;
  repositoryCount: number;
}>();

defineEmits<{
  back: [];
}>();
</script>

<style scoped>
.repository-management-header {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-height: 58px;
  padding: 10px 12px;
  background: var(--app-surface);
  border-bottom: 1px solid var(--app-border);
}

.management-back-button {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  min-height: 30px;
  color: var(--app-text-muted);
  border-radius: 4px;
}

.management-back-button:hover {
  color: var(--app-text);
  background: var(--app-surface-raised);
}

.management-back-button :deep(.q-icon) {
  font-size: 18px;
}

.repository-management-title {
  margin-bottom: 2px;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
}

.repository-management-subtitle {
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 600;
}

.repository-management-heading,
.repository-management-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
}

.management-command {
  min-height: 30px;
  padding: 3px 8px;
  color: var(--app-text-muted);
  border-radius: 4px;
}

.management-command :deep(.q-icon) {
  color: var(--app-accent);
  font-size: 17px;
}

.management-command :deep(.q-btn__content) {
  gap: 4px;
  font-size: 11px;
  font-weight: 750;
}

.management-command:hover {
  color: var(--app-text);
  background: var(--app-surface-raised);
}

@media (max-width: 640px) {
  .repository-management-header {
    align-items: stretch;
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .repository-management-actions {
    flex-wrap: wrap;
  }
}
</style>
