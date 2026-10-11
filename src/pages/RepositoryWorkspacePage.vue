<template>
  <q-page class="repository-workspace">
    <RepositorySwitcher />

    <main class="repository-workspace-grid">
      <q-splitter
        v-model="repositorySplitter"
        :horizontal="$q.screen.lt.md"
        :limits="repositorySplitterLimits"
        unit="px"
        class="repository-root-splitter"
      >
        <template #before>
          <RepositorySidebar v-model:active-view="activeView" />
        </template>

        <template #after>
          <RepositoryMainView
            v-model:active-view="activeView"
            :unstaged-tree="workspaceStore.unstagedTree"
            :staged-tree="workspaceStore.stagedTree"
            :unstaged-file-count="workspaceStore.unstagedTree.length"
            :staged-file-count="workspaceStore.stagedTree.length"
          />
        </template>
      </q-splitter>
    </main>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import RepositoryMainView from '../components/repository/RepositoryMainView.vue';
import RepositorySidebar from '../components/repository/RepositorySidebar.vue';
import RepositorySwitcher from '../components/repository/RepositorySwitcher.vue';
import { useRepositoryWorkspaceStore } from '../stores/repositoryWorkspace';
import { useRepositorySnapshotsStore } from '../stores/repositorySnapshots';
import type { RepositoryView } from '../types/repository';

const $q = useQuasar();
const route = useRoute();
const workspaceStore = useRepositoryWorkspaceStore();
const snapshotsStore = useRepositorySnapshotsStore();

const loadRepositoryStatus = () => {
  if (typeof route.params.repositoryId === 'string') {
    void workspaceStore.load(route.params.repositoryId);
  }
};

onMounted(loadRepositoryStatus);
watch(() => route.params.repositoryId, loadRepositoryStatus);
watch(
  () => {
    const repositoryId = route.params.repositoryId;
    return typeof repositoryId === 'string'
      ? snapshotsStore.snapshots[repositoryId]?.status
      : undefined;
  },
  (status) => {
    if (status) workspaceStore.applyStatus(status);
  },
);

const activeView = ref<RepositoryView>('history');
const repositorySplitter = ref(200);

const repositorySplitterLimits = computed<[number, number]>(() => [200, $q.screen.width - 8]);
</script>

<style scoped>
.repository-workspace {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--app-header-height));
  min-height: 0;
  overflow: hidden;
  background: var(--app-bg);
}

.repository-workspace-grid {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.repository-root-splitter {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.repository-root-splitter :deep(.q-splitter__before),
.repository-root-splitter :deep(.q-splitter__after) {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.repository-root-splitter :deep(.q-splitter__separator) {
  background: var(--app-border);
}

.repository-root-splitter.q-splitter--horizontal :deep(.q-splitter__separator) {
  width: auto;
  height: 1px;
}

.repository-root-splitter :deep(.q-splitter__separator:hover) {
  background: var(--app-border-strong);
}
</style>
