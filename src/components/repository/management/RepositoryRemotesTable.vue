<template>
  <section class="repository-management-band">
    <header class="management-section-header">
      <h2>Remotes</h2>
    </header>

    <div class="remote-table" role="table" aria-label="Repository remotes">
      <div class="remote-row remote-row-head" role="row">
        <span role="columnheader">Name</span>
        <span role="columnheader">Remote</span>
        <span role="columnheader">Status</span>
        <span role="columnheader">Last fetch</span>
      </div>
      <div v-for="remote in remotes" :key="remote.name" class="remote-row" role="row">
        <span role="cell">{{ remote.name }}</span>
        <span role="cell">
          <button type="button" class="remote-link" @click="$emit('openRemote', remote.href)">
            Open remote
            <q-icon name="open_in_new" />
          </button>
        </span>
        <span role="cell">
          <span class="remote-status" :class="`remote-status-${remote.tone}`">
            {{ remote.status }}
          </span>
        </span>
        <span role="cell">{{ remote.lastFetch }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ManagedRepositoryRemote } from './repository-management.types';

defineProps<{
  remotes: ManagedRepositoryRemote[];
}>();

defineEmits<{
  openRemote: [remoteUrl: string];
}>();
</script>

<style scoped>
.repository-management-band {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--app-border);
}

.management-section-header {
  margin-bottom: 8px;
}

.management-section-header h2 {
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.remote-table {
  overflow: hidden;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius);
}

.remote-row {
  display: grid;
  grid-template-columns: 120px minmax(120px, 1fr) 120px 120px;
  min-height: 32px;
  border-top: 1px solid var(--app-border);
}

.remote-row:first-child {
  border-top: 0;
}

.remote-row span {
  overflow: hidden;
  padding: 7px 8px;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remote-row-head {
  color: var(--app-caption);
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  background: var(--app-surface-subtle);
}

.remote-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--app-accent);
  font-weight: 700;
  font: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: default;
  text-decoration: none;
}

.remote-link:hover {
  text-decoration: underline;
}

.remote-link :deep(.q-icon) {
  font-size: 13px;
}

.remote-status {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  height: 18px;
  padding: 0 6px;
  font-size: 10px;
  font-weight: 800;
  border: 1px solid transparent;
  border-radius: 999px;
}

.remote-status-ok {
  color: var(--app-accent);
  background: color-mix(in srgb, var(--app-accent) 12%, transparent);
  border-color: color-mix(in srgb, var(--app-accent) 28%, transparent);
}

.remote-status-warning,
.remote-status-stale {
  color: var(--app-status-warning);
  background: color-mix(in srgb, var(--app-status-warning) 12%, transparent);
  border-color: color-mix(in srgb, var(--app-status-warning) 28%, transparent);
}

@media (max-width: 640px) {
  .remote-row {
    grid-template-columns: 1fr;
  }
}
</style>
