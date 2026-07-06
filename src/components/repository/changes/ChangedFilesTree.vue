<template>
  <q-tree
    :nodes="nodes"
    node-key="key"
    default-expand-all
    dense
    no-connectors
    class="changed-files-tree"
  >
    <template #default-header="prop">
      <div
        class="changed-files-tree-row"
        :class="{
          'changed-files-tree-folder': prop.node.children,
          'changed-files-tree-file': !prop.node.children,
        }"
      >
        <q-icon
          :name="prop.node.icon"
          class="changed-files-tree-icon"
          :class="{ 'changed-files-tree-folder-icon': prop.node.children }"
        />
        <span
          v-if="!prop.node.children"
          class="changed-files-status"
          :class="`changed-files-status-${prop.node.status}`"
        >
          {{ prop.node.badge }}
        </span>
        <div class="changed-files-tree-copy">
          <div class="changed-files-tree-label">
            <span class="changed-files-tree-label-short">{{ prop.node.label }}</span>
            <span v-if="prop.node.caption" class="changed-files-tree-label-full">
              {{ prop.node.caption }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </q-tree>
</template>

<script setup lang="ts">
import type { ChangeTreeNode } from '../../../types/repository';

defineProps<{
  nodes: ChangeTreeNode[];
}>();
</script>

<style scoped>
.changed-files-tree {
  flex: 1 1 auto;
  min-height: 0;
  padding: 4px 0;
  overflow: auto;
  color: var(--app-text);
}

.changed-files-tree :deep(.q-tree__node-header) {
  min-height: 24px;
  margin-top: 0;
  padding: 0 6px 0 3px;
  border-radius: 0;
}

.changed-files-tree :deep(.q-tree__node-header:hover) {
  background: var(--app-hover-soft);
}

.changed-files-tree :deep(.q-tree__arrow) {
  color: var(--app-icon-muted);
  font-size: 15px;
}

.changed-files-tree :deep(.q-tree__node--child) {
  padding-left: 8px;
}

.changed-files-tree-row {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  min-width: 0;
}

.changed-files-tree-folder {
  color: var(--app-folder);
  font-weight: 650;
}

.changed-files-tree-icon {
  flex: 0 0 auto;
  color: var(--app-icon-muted);
  font-size: 13px;
}

.changed-files-tree-folder-icon {
  color: var(--app-folder);
  font-size: 15px;
}

.changed-files-tree-copy {
  flex: 1 1 auto;
  min-width: 0;
}

.changed-files-tree-label {
  overflow: hidden;
  color: var(--app-text);
  font-size: 11px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.changed-files-tree-folder .changed-files-tree-label {
  color: var(--app-folder-text);
  font-size: 12px;
  font-weight: 650;
  text-transform: none;
}

.changed-files-tree-label-full {
  display: none;
}

.changed-files-tree
  :deep(.q-tree__node-header:hover)
  .changed-files-tree-file
  .changed-files-tree-label-short {
  display: none;
}

.changed-files-tree
  :deep(.q-tree__node-header:hover)
  .changed-files-tree-file
  .changed-files-tree-label-full {
  display: inline;
}

.changed-files-tree-folder .changed-files-tree-label-full {
  display: none;
}

.changed-files-tree-folder .changed-files-tree-label-short {
  display: inline;
}

.changed-files-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  color: var(--app-bg);
  font-size: 9px;
  font-weight: 800;
  border-radius: 4px;
}

.changed-files-status-modified {
  background: var(--app-status-warning);
}

.changed-files-status-added,
.changed-files-status-untracked {
  background: var(--app-accent);
}
</style>
