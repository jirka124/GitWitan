<template>
  <section class="repository-detail-header">
    <div class="repository-detail-heading">
      <div class="repository-detail-name-row">
        <RepositoryIconPicker :active-icon="repository.icon" :icon-options="iconOptions" />
        <h1>{{ repository.name }}</h1>
      </div>
      <p>{{ repository.path }}</p>
    </div>

    <div class="repository-detail-actions">
      <q-btn
        unelevated
        dense
        no-caps
        icon="arrow_forward"
        label="Open Repository"
        class="repository-open-button"
        @click="$emit('open')"
      />
      <q-btn flat dense round icon="drive_file_move" aria-label="Reveal repository">
        <q-tooltip>Reveal in Explorer</q-tooltip>
      </q-btn>
      <q-btn flat dense round icon="more_horiz" aria-label="More repository actions">
        <q-tooltip>More</q-tooltip>
      </q-btn>
    </div>
  </section>
</template>

<script setup lang="ts">
import RepositoryIconPicker from './RepositoryIconPicker.vue';
import type { ManagedRepository, RepositoryIconOption } from './repository-management.types';

defineProps<{
  repository: ManagedRepository;
  iconOptions: RepositoryIconOption[];
}>();

defineEmits<{
  open: [];
}>();
</script>

<style scoped>
.repository-detail-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  min-height: 62px;
  padding: 4px 0 14px;
  border-bottom: 1px solid var(--app-border);
}

.repository-detail-heading {
  display: grid;
  grid-template-rows: auto auto;
  align-content: center;
  align-self: center;
  justify-self: start;
  row-gap: 5px;
  min-width: 0;
  padding: 8px 0 22px;
}

.repository-detail-name-row {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  min-height: 0;
  line-height: 1;
}

.repository-detail-heading h1,
.repository-detail-heading p {
  margin: 0;
}

.repository-detail-heading h1 {
  overflow: hidden;
  color: var(--app-text);
  font-size: 17px;
  font-weight: 800;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.repository-detail-heading p {
  overflow: hidden;
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.repository-detail-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
}

.repository-open-button {
  min-height: 34px;
  padding: 5px 13px;
  color: var(--app-bg);
  background: var(--app-accent);
  border-radius: 4px;
}

.repository-open-button :deep(.q-icon) {
  color: var(--app-bg);
  font-size: 17px;
}

.repository-open-button:hover {
  color: var(--app-bg) !important;
  background: color-mix(in srgb, var(--app-accent) 86%, white 14%) !important;
}

.repository-open-button:hover :deep(.q-icon) {
  color: var(--app-bg) !important;
}

.repository-open-button :deep(.q-btn__content) {
  gap: 5px;
  font-size: 11px;
  font-weight: 800;
}

.repository-detail-actions :deep(.q-btn:not(.repository-open-button)) {
  width: 30px;
  height: 30px;
  min-height: 30px;
  color: var(--app-text-muted);
  border-radius: 4px;
}

.repository-detail-actions :deep(.q-btn:hover) {
  color: var(--app-text);
  background: var(--app-surface-raised);
}

.repository-detail-actions :deep(.q-icon) {
  font-size: 18px;
}

@media (max-width: 640px) {
  .repository-detail-header {
    align-items: center;
    grid-template-columns: minmax(0, 1fr);
  }

  .repository-detail-actions {
    flex-wrap: wrap;
  }
}
</style>
