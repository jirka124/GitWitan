<template>
  <section class="changed-files-panel" :aria-label="panelLabel">
    <header class="changed-files-panel-header">
      <div>
        <div class="changed-files-panel-title">{{ title }}</div>
        <div class="changed-files-panel-count">{{ countLabel }}</div>
      </div>
    </header>

    <ChangedFilesTree
      :nodes="nodes"
      :active-key="activeKey"
      :action-icon="actionIcon"
      :action-label="actionLabel"
      @select-file="$emit('select-file', $event)"
      @action="$emit('action-node', $event)"
    />
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
  activeKey?: string | undefined;
}>();

defineEmits<{
  'select-file': [node: ChangeTreeNode];
  'action-node': [node: ChangeTreeNode];
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
</style>
