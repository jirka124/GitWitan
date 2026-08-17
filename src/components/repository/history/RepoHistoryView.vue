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
      />
    </template>

    <template #after>
      <CommitDetailPanel :commit="selectedCommit" />
    </template>
  </q-splitter>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import CommitDetailPanel from './CommitDetailPanel.vue';
import CommitGraphTable from './CommitGraphTable.vue';
import { historyCommits } from './history.mock';
import type { HistoryCommit } from './history.types';

const commits = historyCommits;
const detailSplitter = ref(68);
const selectedCommitId = ref('a91f2c7');
const detailSplitterLimits = computed<[number, number]>(() => [45, 84]);
const fallbackCommit = commits[0] as HistoryCommit;
const selectedCommit = computed<HistoryCommit>(
  () => commits.find((commit) => commit.id === selectedCommitId.value) ?? fallbackCommit,
);
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

.history-view-splitter :deep(.q-splitter__separator:hover) {
  background: var(--app-border-strong);
}
</style>
