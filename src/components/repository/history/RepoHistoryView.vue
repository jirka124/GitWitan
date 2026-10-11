<template>
  <q-splitter
    v-model="detailSplitter"
    horizontal
    :limits="detailSplitterLimits"
    class="history-view-splitter"
  >
    <template #before>
      <CommitGraphTable
        :commits="commits"
        :selected-commit-id="selectedCommitId"
        @select-commit="selectedCommitId = $event"
        @refresh="loadHistory(true)"
      />
    </template>
    <template #after>
      <CommitDetailPanel v-if="selectedCommit" :commit="selectedCommit" />
      <div v-else class="history-empty">No commits found</div>
    </template>
  </q-splitter>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import CommitDetailPanel from './CommitDetailPanel.vue';
import CommitGraphTable from './CommitGraphTable.vue';
import type { HistoryCommit } from './history.types';
import type { RepositoryHistoryEntry } from '../../../types/repository-data';
import { useRepositorySnapshotsStore } from '../../../stores/repositorySnapshots';

const route = useRoute();
const detailSplitter = ref(68);
const selectedCommitId = ref('');
const snapshotsStore = useRepositorySnapshotsStore();
const repositoryId = computed(() =>
  typeof route.params.repositoryId === 'string' ? route.params.repositoryId : undefined,
);
const entries = computed<RepositoryHistoryEntry[]>(() =>
  repositoryId.value ? (snapshotsStore.snapshots[repositoryId.value]?.overview?.history ?? []) : [],
);
const detailSplitterLimits = computed<[number, number]>(() => [45, 84]);

const commits = computed<HistoryCommit[]>(() =>
  entries.value.map((entry) => ({
    ...entry,
    fullId: entry.id,
    time: entry.committedAt,
    kindIcon: entry.parents.length > 1 ? 'call_merge' : 'commit',
    refs: entry.refs.map((ref) => ({
      ...ref,
      icon: ref.type === 'tag' ? 'sell' : ref.type === 'origin' ? 'cloud' : 'account_tree',
    })),
    stats: entry.stats,
    changes: entry.changes.map((change) => ({
      ...change,
      status: change.kind,
      badge: change.kind.charAt(0).toUpperCase(),
    })),
  })),
);
const selectedCommit = computed(() =>
  commits.value.find((commit) => commit.id === selectedCommitId.value),
);

const loadHistory = async (force = false) => {
  if (!repositoryId.value) return;
  if (force) await snapshotsStore.forceRefresh(repositoryId.value);
  else await snapshotsStore.load(repositoryId.value);
  selectedCommitId.value = entries.value[0]?.id ?? '';
};

onMounted(() => void loadHistory());
watch(
  () => route.params.repositoryId,
  () => void loadHistory(),
);
watch(entries, (nextEntries) => {
  if (!nextEntries.some((entry) => entry.id === selectedCommitId.value)) {
    selectedCommitId.value = nextEntries[0]?.id ?? '';
  }
});
</script>

<style scoped>
.history-view-splitter {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  min-height: 0;
}
.history-view-splitter :deep(.q-splitter__before),
.history-view-splitter :deep(.q-splitter__after) {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
.history-view-splitter :deep(.q-splitter__separator) {
  height: 1px;
  background: var(--app-border);
}
.history-empty {
  display: grid;
  height: 100%;
  place-items: center;
  color: var(--app-text-muted);
  background: var(--app-surface);
}
</style>
