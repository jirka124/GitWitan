<template>
  <section class="history-view-content" aria-label="Repository commit history">
    <header class="history-toolbar">
      <div class="history-toolbar-title">
        <div class="history-title">Commit History</div>
        <div class="history-subtitle">selected-repo / main</div>
      </div>

      <div class="history-toolbar-actions" aria-label="History controls">
        <q-btn flat dense round icon="refresh" aria-label="Refresh history">
          <q-tooltip>Refresh history</q-tooltip>
        </q-btn>
        <q-btn flat dense round icon="account_tree" aria-label="Toggle graph lanes">
          <q-tooltip>Toggle graph lanes</q-tooltip>
        </q-btn>
        <q-btn flat dense round icon="filter_alt" aria-label="Filter commits">
          <q-tooltip>Filter commits</q-tooltip>
        </q-btn>
      </div>
    </header>

    <div class="history-table" role="table" aria-label="Commit graph" :style="graphStyle">
      <div class="history-row history-row-header" role="row">
        <div class="history-graph-heading" role="columnheader">Graph</div>
        <div role="columnheader">Message</div>
        <div role="columnheader">Refs</div>
        <div role="columnheader">Committer</div>
        <div role="columnheader">ID</div>
        <div role="columnheader">Time</div>
        <div class="history-stat-heading" role="columnheader">Changes</div>
      </div>

      <button
        v-for="commit in renderedCommits"
        :key="commit.id"
        class="history-row history-commit-row"
        :class="{ 'history-commit-row-active': commit.id === selectedCommitId }"
        type="button"
        role="row"
        @click="$emit('selectCommit', commit.id)"
      >
        <div class="history-graph-cell" role="cell" aria-hidden="true">
          <svg class="history-graph-svg" :viewBox="`0 0 ${graphWidth} 36`" focusable="false">
            <path
              v-for="line in commit.graph.segments"
              :key="line.key"
              :d="line.d"
              :stroke="line.color"
              class="history-graph-line"
            />
            <circle
              :cx="laneX(commit.graph.lane)"
              cy="18"
              r="5"
              :fill="commit.graph.color"
              class="history-graph-dot"
            />
          </svg>
        </div>

        <div class="history-message-cell" role="cell">
          <q-icon :name="commit.kindIcon" />
          <span>{{ commit.message }}</span>
        </div>

        <div class="history-refs-cell" role="cell">
          <HistoryRefBadge v-for="ref in commit.refs" :key="ref.label" :commit-ref="ref" />
        </div>

        <div class="history-muted-cell" role="cell">{{ commit.committer }}</div>
        <div class="history-id-cell" role="cell">{{ commit.shortId }}</div>
        <div class="history-muted-cell" role="cell">{{ commit.time }}</div>
        <div class="history-change-stat" role="cell">
          <span class="history-added">+{{ commit.stats.added }}</span>
          <span class="history-removed">-{{ commit.stats.removed }}</span>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import HistoryRefBadge from './HistoryRefBadge.vue';
import { graphWidthForMaxLane, laneX, renderCommitGraph } from './historyGraph';
import type { HistoryCommit } from './history.types';

const props = defineProps<{
  commits: HistoryCommit[];
  selectedCommitId: string;
}>();

defineEmits<{
  selectCommit: [commitId: string];
}>();

const graphModel = computed(() => renderCommitGraph(props.commits));
const renderedCommits = computed(() => graphModel.value.rendered);
const graphWidth = computed(() => graphWidthForMaxLane(graphModel.value.maxLane));
const graphStyle = computed(() => ({ '--history-graph-width': `${graphWidth.value}px` }));
</script>

<style scoped>
.history-view-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--app-surface-deep);
}

.history-toolbar {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--app-border);
}

.history-title {
  margin-bottom: 2px;
  color: var(--app-text);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.history-subtitle {
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 600;
}

.history-toolbar-actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: var(--app-icon-muted);
}

.history-table {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow: auto;
}

.history-row {
  display: grid;
  grid-template-columns:
    var(--history-graph-width, 124px) minmax(260px, 2.2fr) minmax(170px, 1.1fr)
    minmax(120px, 0.8fr) 82px 96px 82px;
  align-items: center;
  width: 100%;
  min-width: calc(var(--history-graph-width, 124px) + 856px);
}

.history-row-header {
  position: sticky;
  top: 0;
  z-index: 1;
  height: 30px;
  padding: 0 10px;
  color: var(--app-caption);
  font-size: 10px;
  font-weight: 800;
  text-align: left;
  text-transform: uppercase;
  background: var(--app-surface);
  border-bottom: 1px solid var(--app-border);
}

.history-commit-row {
  height: 36px;
  padding: 0 10px;
  color: var(--app-text);
  font: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--app-border) 72%, transparent);
  cursor: pointer;
}

.history-commit-row:hover {
  background: var(--app-hover-soft);
}

.history-commit-row-active {
  background: color-mix(in srgb, var(--app-accent) 13%, transparent);
  box-shadow: inset 2px 0 0 var(--app-accent);
}

.history-graph-cell,
.history-graph-heading {
  padding-right: 6px;
}

.history-graph-svg {
  display: block;
  width: var(--history-graph-width, 124px);
  height: 36px;
}

.history-graph-line {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.history-graph-dot {
  stroke: var(--app-surface-deep);
  stroke-width: 2;
}

.history-message-cell,
.history-refs-cell,
.history-change-stat {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 6px;
}

.history-message-cell :deep(.q-icon) {
  flex: 0 0 auto;
  color: var(--app-icon-muted);
  font-size: 16px;
}

.history-message-cell span,
.history-muted-cell,
.history-id-cell {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-muted-cell {
  color: var(--app-text-muted);
}

.history-id-cell {
  color: var(--app-caption);
  font-family: Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
}

.history-refs-cell {
  flex-wrap: nowrap;
  overflow: hidden;
}

.history-stat-heading,
.history-change-stat {
  justify-content: flex-end;
}

.history-added {
  color: var(--app-accent);
}

.history-removed {
  color: var(--app-danger);
}
</style>
