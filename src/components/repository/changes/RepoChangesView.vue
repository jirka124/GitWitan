<template>
  <q-resize-observer @resize="onResize" />
  <q-splitter
    v-model="changesPreviewSplitter"
    :horizontal="$q.screen.lt.sm"
    :limits="changesPreviewSplitterLimits"
    unit="px"
    class="changes-view-splitter"
  >
    <template #before>
      <section class="changes-file-column" aria-label="Local changes files">
        <ChangedFilesPanel
          title="Unstaged"
          :count-label="`${unstagedFileCount} files changed`"
          action-icon="add_circle_outline"
          action-label="Stage"
          panel-label="Unstaged files"
          :nodes="unstagedTree"
          :active-key="activeChange?.area === 'unstaged' ? activeChange.node.key : undefined"
          @select-file="selectChange('unstaged', $event)"
          @action-node="requestChangeAction('stage', $event)"
        />

        <ChangedFilesPanel
          title="Staged"
          :count-label="`${stagedFileCount} files ready`"
          action-icon="remove_circle_outline"
          action-label="Unstage"
          panel-label="Staged files"
          :nodes="stagedTree"
          :active-key="activeChange?.area === 'staged' ? activeChange.node.key : undefined"
          @select-file="selectChange('staged', $event)"
          @action-node="requestChangeAction('unstage', $event)"
        />
      </section>
    </template>

    <template #after>
      <DiffPreviewPanel :active-change="activeChange" />
    </template>
  </q-splitter>

  <CommitPanel
    v-model:subject="commitSubject"
    v-model:description="commitDescription"
    v-model:amend="amendCommit"
    :staged-file-count="stagedFileCount"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import type { ChangeTreeNode } from '../../../types/repository';
import ChangedFilesPanel from './ChangedFilesPanel.vue';
import CommitPanel from './CommitPanel.vue';
import DiffPreviewPanel from './DiffPreviewPanel.vue';

type ChangeArea = 'unstaged' | 'staged';
type ChangeAction = 'stage' | 'unstage';

type ActiveChange = {
  area: ChangeArea;
  node: ChangeTreeNode;
};

defineProps<{
  unstagedTree: ChangeTreeNode[];
  stagedTree: ChangeTreeNode[];
  unstagedFileCount: number;
  stagedFileCount: number;
}>();

const $q = useQuasar();
const changesViewBox = ref({ width: 100, height: 100 });
const changesPreviewSplitter = ref(200);
const commitSubject = ref('');
const commitDescription = ref('');
const amendCommit = ref(false);
const activeChange = ref<ActiveChange>();

const changesPreviewSplitterLimits = computed<[number, number]>(() => [
  200,
  changesViewBox.value.width - 8,
]);

const onResize = (size: { width: number; height: number }) => {
  changesViewBox.value = size;
};

const selectChange = (area: ChangeArea, node: ChangeTreeNode) => {
  activeChange.value = { area, node };
};

const requestChangeAction = (action: ChangeAction, node: ChangeTreeNode) => {
  if (!node.children?.length) {
    activeChange.value = { area: action === 'stage' ? 'unstaged' : 'staged', node };
  }
};
</script>

<style scoped>
.changes-view-splitter {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.changes-view-splitter :deep(.q-splitter__before),
.changes-view-splitter :deep(.q-splitter__after) {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.changes-view-splitter :deep(.q-splitter__separator) {
  background: var(--app-border);
}

.changes-view-splitter.q-splitter--horizontal :deep(.q-splitter__separator) {
  width: auto;
  height: 1px;
}

.changes-view-splitter :deep(.q-splitter__separator:hover) {
  background: var(--app-border-strong);
}

.changes-file-column {
  display: grid;
  grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--app-surface);
  border-right: 0;
}
</style>
