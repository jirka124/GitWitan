<template>
  <section class="repository-status-grid" aria-label="Repository status">
    <div class="repository-status-item">
      <span>Changes</span>
      <strong>{{ repository.dirtyCount }} files</strong>
    </div>
    <div class="repository-status-item">
      <span>Last fetch</span>
      <strong>{{ repository.lastFetch }}</strong>
    </div>
    <div class="repository-status-item">
      <span>Commits</span>
      <strong>{{ repository.commitCount }}</strong>
    </div>
    <div class="repository-status-item">
      <span>Last commit</span>
      <strong>{{ repository.lastCommit }}</strong>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ManagedRepository } from './repository-management.types';

defineProps<{
  repository: ManagedRepository;
}>();
</script>

<style scoped>
.repository-status-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 8px;
  margin: 12px 0;
}

.repository-status-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  padding: 9px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius);
}

.repository-status-item span {
  color: var(--app-caption);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.repository-status-item strong {
  overflow: hidden;
  font-size: 12px;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .repository-status-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .repository-status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
