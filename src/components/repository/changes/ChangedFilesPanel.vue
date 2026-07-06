<template>
  <section class="changed-files-panel" :aria-label="panelLabel">
    <header class="changed-files-panel-header">
      <div>
        <div class="changed-files-panel-title">{{ title }}</div>
        <div class="changed-files-panel-count">{{ countLabel }}</div>
      </div>
      <q-btn
        flat
        dense
        no-caps
        :icon="actionIcon"
        :label="actionLabel"
        class="changed-files-panel-action"
      />
    </header>

    <ChangedFilesTree :nodes="nodes" />
  </section>
</template>

<script setup lang="ts">
import type { ChangeTreeNode } from '../../../types/repository';
import ChangedFilesTree from './ChangedFilesTree.vue';

defineProps<{
  title: string;
  countLabel: string;
  actionIcon: string;
  actionLabel: string;
  panelLabel: string;
  nodes: ChangeTreeNode[];
}>();
</script>

<style scoped>
.changed-files-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.changed-files-panel + .changed-files-panel {
  border-top: 1px solid var(--app-border);
}

.changed-files-panel-header {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 48px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--app-border);
}

.changed-files-panel-title {
  margin-bottom: 2px;
  color: var(--app-text);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.changed-files-panel-count {
  overflow: hidden;
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.changed-files-panel-action {
  flex: 0 0 auto;
  min-height: 28px;
  padding: 3px 7px;
  color: var(--app-text-muted);
  border-radius: 4px;
}

.changed-files-panel-action :deep(.q-icon) {
  color: var(--app-accent);
  font-size: 17px;
}

.changed-files-panel-action :deep(.q-btn__content) {
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
}

.changed-files-panel-action:hover {
  color: var(--app-text);
  background: var(--app-surface-raised);
}
</style>
