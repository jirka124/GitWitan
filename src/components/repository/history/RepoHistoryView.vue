<template>
  <q-splitter
    v-model="detailSplitter"
    horizontal
    :limits="detailSplitterLimits"
    class="history-view-splitter"
  >
    <template #before>
      <div class="history-view-content">
        <div class="history-empty-state">
          <q-icon name="commit" size="32px" />
          <h1>Open a repository to inspect history</h1>
          <p>Commit lists and graph controls will live here.</p>
        </div>
      </div>
    </template>

    <template #after>
      <section class="history-detail-panel" aria-label="History details">
        <div class="history-detail-title">Details</div>
        <div class="history-detail-empty">Select a commit to view its metadata and diff.</div>
      </section>
    </template>
  </q-splitter>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const detailSplitter = ref(88);
const detailSplitterLimits = computed<[number, number]>(() => [40, 90]);
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
  background: var(--app-border);
}

.history-view-splitter :deep(.q-splitter__separator:hover) {
  background: var(--app-border-strong);
}

.history-view-content {
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.history-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 32px;
  color: var(--app-text-muted);
  text-align: center;
}

.history-empty-state h1 {
  margin: 12px 0 4px;
  color: var(--app-text);
  font-size: 18px;
  font-weight: 650;
}

.history-empty-state p {
  color: var(--app-text-muted);
}

.history-detail-panel {
  min-width: 0;
  min-height: 0;
  height: 100%;
  padding: var(--app-panel-padding);
  overflow: auto;
  background: var(--app-surface);
  border-top: 0;
}

.history-detail-title {
  margin-bottom: 10px;
  color: var(--app-text);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.history-detail-empty {
  color: var(--app-text-muted);
}
</style>
