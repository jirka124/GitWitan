<template>
  <section class="diff-preview-panel" aria-label="Selected file preview">
    <div class="diff-preview-header">
      <div>
        <div class="diff-preview-title">Diff Preview</div>
        <div class="diff-preview-subtitle">{{ subtitle }}</div>
      </div>
      <span v-if="activeChange" class="diff-preview-area">{{ activeChange.area }}</span>
    </div>

    <div v-if="!activeChange" class="diff-preview-empty">
      <q-icon name="difference" size="30px" />
      <h1>No file selected</h1>
      <p>Click a changed file to preview its diff.</p>
    </div>

    <div v-else class="diff-preview-content">
      <header class="diff-preview-file-header">
        <q-icon :name="activeChange.node.icon" />
        <div>
          <h1>{{ activeChange.node.label }}</h1>
          <p>{{ activeChange.node.caption ?? activeChange.node.label }}</p>
        </div>
        <span
          v-if="activeChange.node.badge"
          class="diff-preview-status"
          :class="`diff-preview-status-${activeChange.node.status}`"
        >
          {{ activeChange.node.badge }}
        </span>
      </header>

      <div class="diff-preview-placeholder">
        <div class="diff-line diff-line-context">@@ example preview @@</div>
        <div class="diff-line diff-line-removed">- previous content will render here</div>
        <div class="diff-line diff-line-added">+ changed content will render here</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ChangeTreeNode } from '../../../types/repository';

type ActiveChange = {
  area: 'unstaged' | 'staged';
  node: ChangeTreeNode;
};

const props = defineProps<{
  activeChange?: ActiveChange | undefined;
}>();

const subtitle = computed(() => {
  if (!props.activeChange) {
    return 'Select a changed file';
  }

  return props.activeChange.node.caption ?? props.activeChange.node.label;
});
</script>

<style scoped>
.diff-preview-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--app-surface-deep);
}

.diff-preview-header {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 48px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--app-border);
}

.diff-preview-title {
  margin-bottom: 2px;
  color: var(--app-text);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.diff-preview-subtitle {
  overflow: hidden;
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.diff-preview-area {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 7px;
  color: var(--app-accent);
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  border: 1px solid color-mix(in srgb, var(--app-accent) 30%, transparent);
  border-radius: 999px;
}

.diff-preview-empty {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 28px;
  color: var(--app-text-muted);
  text-align: center;
}

.diff-preview-empty h1,
.diff-preview-file-header h1 {
  margin: 0;
  color: var(--app-text);
  font-size: 16px;
  font-weight: 650;
}

.diff-preview-empty h1 {
  margin-top: 10px;
  margin-bottom: 4px;
}

.diff-preview-empty p,
.diff-preview-file-header p {
  margin: 0;
  color: var(--app-text-muted);
}

.diff-preview-content {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.diff-preview-file-header {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--app-border);
}

.diff-preview-file-header :deep(.q-icon) {
  color: var(--app-accent);
  font-size: 16px;
}

.diff-preview-file-header h1,
.diff-preview-file-header p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.diff-preview-file-header h1 {
  font-size: 13px;
}

.diff-preview-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: var(--app-bg);
  font-size: 10px;
  font-weight: 800;
  border-radius: 4px;
}

.diff-preview-status-modified {
  background: var(--app-status-warning);
}

.diff-preview-status-added,
.diff-preview-status-untracked {
  background: var(--app-accent);
}

.diff-preview-placeholder {
  flex: 1 1 auto;
  min-height: 0;
  padding: 12px;
  overflow: auto;
  font-family: Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
}

.diff-line {
  min-height: 20px;
  padding: 1px 8px;
  border-left: 2px solid transparent;
}

.diff-line-context {
  color: var(--app-caption);
}

.diff-line-removed {
  color: var(--app-danger);
  background: color-mix(in srgb, var(--app-danger) 10%, transparent);
  border-left-color: var(--app-danger);
}

.diff-line-added {
  color: var(--app-accent);
  background: color-mix(in srgb, var(--app-accent) 10%, transparent);
  border-left-color: var(--app-accent);
}
</style>
