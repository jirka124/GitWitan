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
      <DiffPreviewPanel
        :active-change="activeChange"
        :diff-content="diffContent"
        :is-loading="isLoadingDiff"
      />
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
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useRepositoryWorkspaceStore } from '../../../stores/repositoryWorkspace';
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

const props = defineProps<{
  unstagedTree: ChangeTreeNode[];
  stagedTree: ChangeTreeNode[];
  unstagedFileCount: number;
  stagedFileCount: number;
}>();

const $q = useQuasar();
const route = useRoute();
const workspaceStore = useRepositoryWorkspaceStore();
const changesViewBox = ref({ width: 100, height: 100 });
const changesPreviewSplitter = ref(200);
const commitSubject = ref('');
const commitDescription = ref('');
const amendCommit = ref(false);
const activeChange = ref<ActiveChange>();
const diffContent = ref('');
const isLoadingDiff = ref(false);
let diffRequestId = 0;

const changesPreviewSplitterLimits = computed<[number, number]>(() => [
  200,
  changesViewBox.value.width - 8,
]);

const onResize = (size: { width: number; height: number }) => {
  changesViewBox.value = size;
};

const currentRepositoryId = () =>
  typeof route.params.repositoryId === 'string' ? route.params.repositoryId : undefined;

const clearActiveChange = () => {
  diffRequestId += 1;
  activeChange.value = undefined;
  diffContent.value = '';
  isLoadingDiff.value = false;
};

const isCurrentDiffRequest = (
  requestId: number,
  repositoryId: string | undefined,
  area: ChangeArea,
  nodeKey: string,
) =>
  requestId === diffRequestId &&
  repositoryId === currentRepositoryId() &&
  activeChange.value?.area === area &&
  activeChange.value.node.key === nodeKey;

const selectChange = async (area: ChangeArea, node: ChangeTreeNode) => {
  const repositoryId = currentRepositoryId();
  const requestId = ++diffRequestId;
  activeChange.value = { area, node };
  diffContent.value = '';
  isLoadingDiff.value = true;

  const filePath = node.caption ?? node.label;

  try {
    const content =
      repositoryId && window.gitwitanRepositories
        ? await window.gitwitanRepositories.diff(
            repositoryId,
            filePath,
            area === 'staged',
            node.status === 'untracked',
          )
        : '';

    if (isCurrentDiffRequest(requestId, repositoryId, area, node.key)) {
      diffContent.value = content;
    }
  } catch (error: unknown) {
    if (isCurrentDiffRequest(requestId, repositoryId, area, node.key)) {
      diffContent.value = error instanceof Error ? error.message : 'Unable to load diff.';
    }
  } finally {
    if (isCurrentDiffRequest(requestId, repositoryId, area, node.key)) {
      isLoadingDiff.value = false;
    }
  }
};

const containsNode = (nodes: ChangeTreeNode[], key: string): boolean =>
  nodes.some((node) => node.key === key || (node.children && containsNode(node.children, key)));

watch(
  () => route.params.repositoryId,
  () => clearActiveChange(),
);

watch(
  () => [props.unstagedTree, props.stagedTree] as const,
  ([unstagedTree, stagedTree]) => {
    const selectedChange = activeChange.value;
    if (!selectedChange) return;

    const tree = selectedChange.area === 'unstaged' ? unstagedTree : stagedTree;
    if (!containsNode(tree, selectedChange.node.key)) clearActiveChange();
  },
);

const collectFilePaths = (node: ChangeTreeNode): string[] => {
  if (!node.children?.length) {
    return node.caption ? [node.caption] : [];
  }

  return node.children.flatMap(collectFilePaths);
};

const requestChangeAction = async (action: ChangeAction, node: ChangeTreeNode) => {
  if (typeof route.params.repositoryId !== 'string') return;

  const filePaths = [...new Set(collectFilePaths(node))];
  if (!filePaths.length) return;

  if (action === 'stage') await workspaceStore.stage(route.params.repositoryId, filePaths);
  else await workspaceStore.unstage(route.params.repositoryId, filePaths);

  clearActiveChange();
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
