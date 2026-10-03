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
      <pre v-if="isLoading" class="diff-preview-placeholder">Loading diff&</pre>
      <div v-else-if="diffLines.length" class="diff-lines" aria-label="File diff">
        <div
          v-for="(line, index) in diffLines"
          :key="`${index}:${line.content}`"
          class="diff-line"
          :class="`diff-line-${line.kind}`"
        >
          <span class="diff-line-marker" aria-hidden="true">{{ markerFor(line.kind) }}</span>
          <code>{{ line.content }}</code>
        </div>
      </div>
      <pre v-else class="diff-preview-placeholder">No textual diff is available for this file.</pre>
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

type DiffLineKind = 'added' | 'removed' | 'hunk' | 'context';

type DiffLine = {
  content: string;
  kind: DiffLineKind;
};

const props = defineProps<{
  activeChange?: ActiveChange | undefined;
  diffContent: string;
  isLoading: boolean;
}>();

const subtitle = computed(() =>
  props.activeChange
    ? (props.activeChange.node.caption ?? props.activeChange.node.label)
    : 'Select a changed file',
);

const diffLines = computed<DiffLine[]>(() =>
  props.diffContent
    .split(/\r?\n/)
    .filter((line) => !isGitMetadata(line))
    .map((rawContent) => {
      const kind = rawContent.startsWith('+')
        ? 'added'
        : rawContent.startsWith('-')
          ? 'removed'
          : rawContent.startsWith('@@')
            ? 'hunk'
            : 'context';

      return {
        kind,
        content: kind === 'hunk' ? rawContent : rawContent.slice(1),
      };
    }),
);

const markerFor = (kind: DiffLineKind) =>
  kind === 'added' ? '+' : kind === 'removed' ? '-' : kind === 'hunk' ? '>' : ' ';
const isGitMetadata = (line: string) =>
  line.startsWith('diff --git ') ||
  line.startsWith('index ') ||
  line.startsWith('--- ') ||
  line.startsWith('+++ ') ||
  line.startsWith('new file mode ') ||
  line.startsWith('deleted file mode ') ||
  line.startsWith('similarity index ') ||
  line.startsWith('rename from ') ||
  line.startsWith('rename to ');
</script>

<style scoped>
.diff-preview-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
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

.diff-preview-empty h1 {
  margin: 10px 0 4px;
  color: var(--app-text);
  font-size: 16px;
  font-weight: 650;
}

.diff-preview-empty p {
  margin: 0;
}

.diff-preview-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}

.diff-lines,
.diff-preview-placeholder {
  margin: 0;
  padding: 10px 0;
  font-family: Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
  line-height: 1.55;
}

.diff-preview-placeholder {
  padding: 14px;
  color: var(--app-text-muted);
  white-space: pre-wrap;
}

.diff-line {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr);
  min-height: 20px;
  padding-right: 12px;
  color: var(--app-text-muted);
  border-left: 3px solid transparent;
}

.diff-line-marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--app-caption);
  font-weight: 800;
  user-select: none;
}

.diff-line code {
  min-width: 0;
  overflow-wrap: anywhere;
  font: inherit;
  white-space: pre-wrap;
}

.diff-line-added {
  color: color-mix(in srgb, var(--app-accent) 85%, white);
  background: color-mix(in srgb, var(--app-accent) 14%, transparent);
  border-left-color: var(--app-accent);
}

.diff-line-added .diff-line-marker {
  color: var(--app-accent);
  background: color-mix(in srgb, var(--app-accent) 14%, transparent);
}

.diff-line-removed {
  color: color-mix(in srgb, var(--app-danger) 82%, white);
  background: color-mix(in srgb, var(--app-danger) 13%, transparent);
  border-left-color: var(--app-danger);
}

.diff-line-removed .diff-line-marker {
  color: var(--app-danger);
  background: color-mix(in srgb, var(--app-danger) 13%, transparent);
}

.diff-line-hunk {
  margin: 7px 0 3px;
  color: var(--app-caption);
  font-size: 11px;
  font-style: italic;
  background: color-mix(in srgb, var(--app-border) 35%, transparent);
  border-left-color: var(--app-border-strong);
}

.diff-line-hunk .diff-line-marker {
  color: var(--app-icon-muted);
}
</style>
