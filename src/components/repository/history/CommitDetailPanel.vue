<template>
  <section class="history-detail-panel" aria-label="Selected commit details">
    <header class="history-detail-header">
      <div>
        <div class="history-detail-title">Commit Details</div>
        <h1>{{ commit.message }}</h1>
      </div>
      <span class="history-detail-id">{{ commit.shortId }}</span>
    </header>

    <div class="history-detail-body">
      <dl class="history-metadata-grid">
        <div>
          <dt>Committer</dt>
          <dd>{{ commit.committer }}</dd>
        </div>
        <div>
          <dt>Author</dt>
          <dd>{{ commit.author }}</dd>
        </div>
        <div>
          <dt>Committed</dt>
          <dd>{{ commit.committedAt }}</dd>
        </div>
        <div>
          <dt>Full SHA</dt>
          <dd>{{ commit.fullId }}</dd>
        </div>
      </dl>

      <div v-if="commit.refs.length" class="history-detail-refs">
        <HistoryRefBadge v-for="ref in commit.refs" :key="ref.label" :commit-ref="ref" />
      </div>

      <section class="history-changes-section" aria-label="Commit changes">
        <div class="history-section-heading">
          <span>Changes</span>
          <span>{{ commit.changes.length }} files</span>
        </div>

        <div class="history-changes-list">
          <div v-for="change in commit.changes" :key="change.path" class="history-change-row">
            <span class="history-change-badge" :class="`history-change-badge-${change.status}`">
              {{ change.badge }}
            </span>
            <span class="history-change-path">{{ change.path }}</span>
            <span class="history-change-delta">
              <span class="history-added">+{{ change.added }}</span>
              <span class="history-removed">-{{ change.removed }}</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import HistoryRefBadge from './HistoryRefBadge.vue';
import type { HistoryCommit } from './history.types';

defineProps<{
  commit: HistoryCommit;
}>();
</script>

<style scoped>
.history-detail-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  background: var(--app-surface);
}

.history-detail-header {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--app-border);
}

.history-detail-title {
  margin-bottom: 2px;
  color: var(--app-text);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.history-detail-header h1 {
  max-width: 72vw;
  margin: 0;
  overflow: hidden;
  color: var(--app-text);
  font-size: 16px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-detail-id {
  color: var(--app-caption);
  font-family: Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
}

.history-detail-body {
  flex: 1 1 auto;
  min-height: 0;
  padding: var(--app-panel-padding);
  overflow: auto;
}

.history-metadata-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}

.history-metadata-grid div {
  min-width: 0;
}

.history-metadata-grid dt {
  margin-bottom: 3px;
  color: var(--app-caption);
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.history-metadata-grid dd {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--app-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-detail-refs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.history-changes-section {
  margin-top: 14px;
  overflow: hidden;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius);
}

.history-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 30px;
  padding: 0 10px;
  color: var(--app-caption);
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  background: var(--app-surface-deep);
  border-bottom: 1px solid var(--app-border);
}

.history-changes-list {
  display: grid;
}

.history-change-row {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--app-border) 65%, transparent);
}

.history-change-row:last-child {
  border-bottom: 0;
}

.history-change-badge {
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

.history-change-badge-modified,
.history-change-badge-renamed {
  background: var(--app-status-warning);
}

.history-change-badge-added {
  background: var(--app-accent);
}

.history-change-badge-deleted {
  background: var(--app-danger);
}

.history-change-path {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-change-delta {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 6px;
}

.history-added {
  color: var(--app-accent);
}

.history-removed {
  color: var(--app-danger);
}

@media (max-width: 920px) {
  .history-metadata-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
