<template>
  <section class="repository-main-view">
    <q-tab-panels v-model="activeView" animated class="repository-main-view-panels">
      <q-tab-panel name="history" class="repository-main-view-panel">
        <RepoHistoryView />
      </q-tab-panel>

      <q-tab-panel name="changes" class="repository-main-view-panel">
        <RepoChangesView
          :unstaged-tree="unstagedTree"
          :staged-tree="stagedTree"
          :unstaged-file-count="unstagedFileCount"
          :staged-file-count="stagedFileCount"
        />
      </q-tab-panel>
    </q-tab-panels>
  </section>
</template>

<script setup lang="ts">
import type { ChangeTreeNode, RepositoryView } from '../../types/repository';
import RepoChangesView from './changes/RepoChangesView.vue';
import RepoHistoryView from './history/RepoHistoryView.vue';

const activeView = defineModel<RepositoryView>('activeView', { required: true });

defineProps<{
  unstagedTree: ChangeTreeNode[];
  stagedTree: ChangeTreeNode[];
  unstagedFileCount: number;
  stagedFileCount: number;
}>();
</script>

<style scoped>
.repository-main-view {
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  background: var(--app-surface-deep);
}

.repository-main-view-panels {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: transparent;
  color: var(--app-text);
}

.repository-main-view-panels :deep(.q-panel),
.repository-main-view-panels :deep(.q-tab-panel) {
  min-height: 0;
}

.repository-main-view-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 0;
  overflow: hidden;
}
</style>
