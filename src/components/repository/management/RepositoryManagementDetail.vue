<template>
  <main class="repository-management-detail">
    <RepositoryManagementDetailHeader
      :repository="repository"
      :icon-options="iconOptions"
      @open="$emit('openRepository')"
    />
    <div v-if="repository.error" class="repository-refresh-warning" role="status">
      <q-icon name="error_outline" size="17px" />
      <span>
        {{
          repository.updatedAt
            ? "Couldn't refresh — showing cached data."
            : "Couldn't load repository data."
        }}
      </span>
      <q-btn
        flat
        dense
        round
        icon="info_outline"
        :aria-label="`Refresh error: ${repository.error}`"
        class="repository-refresh-error-detail"
      >
        <q-tooltip>{{ repository.error }}</q-tooltip>
      </q-btn>
    </div>
    <RepositoryStatsGrid :repository="repository" />

    <section v-if="repository.hasOverview" class="repository-overview-grid">
      <section class="repository-overview-card" aria-label="Working tree">
        <header class="repository-section-heading">
          <div>
            <span class="repository-section-kicker">Working tree</span>
            <h2>
              {{
                repository.dirtyCount
                  ? `${repository.dirtyCount} changed ${repository.dirtyCount === 1 ? 'file' : 'files'}`
                  : 'Clean'
              }}
            </h2>
          </div>
          <q-icon
            :name="repository.dirtyCount ? 'difference' : 'check_circle'"
            :class="repository.dirtyCount ? 'is-dirty' : 'is-clean'"
            size="20px"
          />
        </header>

        <div v-if="repository.dirtyCount" class="change-summary">
          <span v-if="repository.stagedChanges.length">
            {{ repository.stagedChanges.length }} staged
          </span>
          <span v-if="repository.unstagedChanges.length">
            {{ repository.unstagedChanges.length }} unstaged
          </span>
        </div>
        <p v-else class="repository-empty-copy">No local changes.</p>

        <ul v-if="visibleChanges.length" class="repository-compact-list">
          <li v-for="change in visibleChanges" :key="change.path">
            <span class="compact-item-label" :title="change.path">{{ change.path }}</span>
            <span class="change-state-list">
              <span
                v-if="change.staged"
                class="change-kind"
                :class="`change-kind-${change.staged}`"
              >
                S {{ changeLabel(change.staged) }}
              </span>
              <span
                v-if="change.unstaged"
                class="change-kind"
                :class="`change-kind-${change.unstaged}`"
              >
                U {{ changeLabel(change.unstaged) }}
              </span>
            </span>
          </li>
        </ul>
        <p v-if="hiddenChangeCount" class="repository-more-copy">
          +{{ hiddenChangeCount }} more {{ hiddenChangeCount === 1 ? 'file' : 'files' }}
        </p>
      </section>

      <section class="repository-overview-card" aria-label="Branches and stashes">
        <header class="repository-section-heading">
          <div>
            <span class="repository-section-kicker">References</span>
            <h2 :title="repository.branch ?? 'Detached HEAD'">
              {{ repository.branch ?? 'Detached HEAD' }}
            </h2>
          </div>
          <q-icon name="account_tree" size="20px" />
        </header>

        <div class="reference-summary">
          <span>{{ repository.branches.length }} local</span>
          <span>{{ repository.remoteBranches.length }} remote</span>
          <span
            >{{ repository.stashes.length }}
            {{ repository.stashes.length === 1 ? 'stash' : 'stashes' }}</span
          >
        </div>
        <ul v-if="visibleBranches.length" class="repository-compact-list repository-branch-list">
          <li v-for="branch in visibleBranches" :key="branch.name">
            <q-icon :name="branch.isCurrent ? 'adjust' : 'account_tree'" size="15px" />
            <span class="compact-item-label" :title="branch.name">{{ branch.name }}</span>
            <span v-if="branch.isCurrent" class="compact-item-meta">current</span>
          </li>
        </ul>
        <p v-else class="repository-empty-copy">No local branches found.</p>

        <div v-if="repository.stashes.length" class="stash-preview">
          <q-icon name="inventory_2" size="15px" />
          <span :title="repository.stashes[0]?.message">{{ repository.stashes[0]?.message }}</span>
        </div>
      </section>
    </section>

    <section v-if="repository.hasOverview" class="repository-management-band recent-activity">
      <header class="management-section-header">
        <div>
          <h2>Recent activity</h2>
          <p>Latest commits across all refs.</p>
        </div>
        <span class="activity-count">{{ repository.history.length }} loaded</span>
      </header>

      <ul v-if="recentCommits.length" class="recent-commit-list">
        <li v-for="commit in recentCommits" :key="commit.id">
          <span class="commit-id">{{ commit.shortId }}</span>
          <div class="commit-content">
            <strong :title="commit.message">{{ commit.message || 'No commit message' }}</strong>
            <span>{{ commit.author }} &middot; {{ formatCommitDate(commit.committedAt) }}</span>
          </div>
          <span v-if="commit.stats.added || commit.stats.removed" class="commit-stats">
            <b v-if="commit.stats.added">+{{ commit.stats.added }}</b>
            <i v-if="commit.stats.removed">-{{ commit.stats.removed }}</i>
          </span>
        </li>
      </ul>
      <p v-else class="repository-empty-copy">No commits found.</p>
    </section>

    <RepositoryRemotesTable
      :remotes="repository.remotes"
      @open-remote="$emit('openRemote', $event)"
    />
    <RepositoryTrackingPanel />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import RepositoryManagementDetailHeader from './RepositoryManagementDetailHeader.vue';
import RepositoryRemotesTable from './RepositoryRemotesTable.vue';
import RepositoryStatsGrid from './RepositoryStatsGrid.vue';
import RepositoryTrackingPanel from './RepositoryTrackingPanel.vue';
import type { ManagedRepository, RepositoryIconOption } from './repository-management.types';
import type { RepositoryChangeKind } from '../../../types/repository-data';

type ChangePreview = {
  path: string;
  staged: RepositoryChangeKind | undefined;
  unstaged: RepositoryChangeKind | undefined;
};

const props = defineProps<{
  repository: ManagedRepository;
  iconOptions: RepositoryIconOption[];
}>();

defineEmits<{
  openRepository: [];
  openRemote: [remoteUrl: string];
}>();

const changes = computed<ChangePreview[]>(() => {
  const changesByPath = new Map<string, ChangePreview>();

  const addChanges = (
    area: 'staged' | 'unstaged',
    entries: typeof props.repository.stagedChanges,
  ) => {
    for (const change of entries) {
      const item = changesByPath.get(change.path) ?? {
        path: change.path,
        staged: undefined,
        unstaged: undefined,
      };
      item[area] = change.kind;
      changesByPath.set(change.path, item);
    }
  };

  addChanges('staged', props.repository.stagedChanges);
  addChanges('unstaged', props.repository.unstagedChanges);
  return [...changesByPath.values()];
});
const visibleChanges = computed(() => changes.value.slice(0, 5));
const hiddenChangeCount = computed(() =>
  Math.max(0, changes.value.length - visibleChanges.value.length),
);
const visibleBranches = computed(() => props.repository.branches.slice(0, 4));
const recentCommits = computed(() => props.repository.history.slice(0, 5));

const changeLabel = (kind: RepositoryChangeKind) =>
  ({ modified: 'M', added: 'A', deleted: 'D', renamed: 'R', untracked: 'U' })[kind];

const formatCommitDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
</script>

<style scoped>
.repository-management-detail {
  min-width: 0;
  min-height: 0;
  height: 100%;
  padding: 12px;
  overflow: auto;
  background: var(--app-surface-deep);
}

.repository-overview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 12px 0;
}

.repository-overview-card {
  min-width: 0;
  padding: 11px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius);
}

.repository-refresh-warning {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 12px;
  padding: 7px 9px;
  color: var(--app-status-warning);
  font-size: 11px;
  background: color-mix(in srgb, var(--app-status-warning) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--app-status-warning) 25%, transparent);
  border-radius: var(--app-radius);
}

.repository-refresh-error-detail {
  margin-left: auto;
  color: var(--app-text-muted);
}

.repository-section-heading,
.management-section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.repository-section-heading h2,
.management-section-header h2,
.management-section-header p {
  margin: 0;
}

.repository-section-kicker {
  display: block;
  margin-bottom: 3px;
  color: var(--app-caption);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.repository-section-heading h2 {
  overflow: hidden;
  width: 100%;
  min-width: 0;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.repository-section-heading > div {
  flex: 1 1 auto;
  min-width: 0;
}

.repository-section-heading :deep(.q-icon) {
  flex: 0 0 auto;
  color: var(--app-text-muted);
}

.repository-section-heading :deep(.is-clean) {
  color: var(--app-accent);
}

.repository-section-heading :deep(.is-dirty) {
  color: var(--app-status-warning);
}

.change-summary,
.reference-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 5px 10px;
  margin: 10px 0 7px;
  color: var(--app-caption);
  font-size: 11px;
}

.repository-empty-copy,
.repository-more-copy {
  margin: 10px 0 0;
  color: var(--app-caption);
  font-size: 11px;
}

.repository-compact-list,
.recent-commit-list {
  padding: 0;
  margin: 9px 0 0;
  list-style: none;
}

.repository-compact-list li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 7px;
  min-height: 24px;
  color: var(--app-text-muted);
  font-size: 11px;
}

.repository-branch-list li {
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.compact-item-label {
  overflow: hidden;
  color: var(--app-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact-item-meta {
  color: var(--app-caption);
  font-size: 10px;
  text-transform: uppercase;
}

.change-state-list {
  display: inline-flex;
  gap: 3px;
}

.change-kind {
  display: inline-grid;
  min-width: 23px;
  height: 16px;
  padding: 0 3px;
  place-items: center;
  color: var(--app-text-muted);
  font-size: 10px;
  font-weight: 800;
  background: var(--app-surface-raised);
  border-radius: 3px;
}

.change-kind-added {
  color: var(--app-accent);
}
.change-kind-deleted {
  color: var(--app-danger);
}
.change-kind-modified,
.change-kind-renamed {
  color: var(--app-status-warning);
}

.stash-preview {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 7px;
  margin-top: 9px;
  padding-top: 8px;
  color: var(--app-text-muted);
  font-size: 11px;
  border-top: 1px solid var(--app-border);
}

.stash-preview span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.repository-management-band {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--app-border);
}

.management-section-header h2 {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.management-section-header p {
  margin-top: 2px;
  color: var(--app-caption);
  font-size: 11px;
}

.activity-count {
  color: var(--app-caption);
  font-size: 10px;
}

.recent-commit-list {
  overflow: hidden;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius);
}

.recent-commit-list li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 9px;
  align-items: center;
  min-height: 42px;
  padding: 6px 8px;
  border-top: 1px solid var(--app-border);
}

.recent-commit-list li:first-child {
  border-top: 0;
}

.commit-id {
  color: var(--app-accent);
  font-family: var(--app-font-mono, monospace);
  font-size: 10px;
}

.commit-content {
  min-width: 0;
}

.commit-content strong,
.commit-content span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.commit-content strong {
  font-size: 11px;
}

.commit-content span {
  margin-top: 2px;
  color: var(--app-caption);
  font-size: 10px;
}

.commit-stats {
  display: flex;
  gap: 5px;
  font-size: 10px;
  font-style: normal;
}

.commit-stats b {
  color: var(--app-accent);
}
.commit-stats i {
  color: var(--app-danger);
  font-style: normal;
}

@media (max-width: 760px) {
  .repository-overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
