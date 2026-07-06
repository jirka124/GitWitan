<template>
  <aside class="repository-sidebar">
    <div class="repository-sidebar-header">
      <div class="repository-sidebar-name">No repository</div>
    </div>

    <q-list dense padding class="repository-navigation">
      <q-item
        clickable
        :active="activeView === 'history'"
        @click="$emit('update:activeView', 'history')"
      >
        <q-item-section avatar>
          <q-icon name="history" />
        </q-item-section>
        <q-item-section>History</q-item-section>
      </q-item>

      <q-item
        clickable
        :active="activeView === 'changes'"
        @click="$emit('update:activeView', 'changes')"
      >
        <q-item-section avatar>
          <q-icon name="difference" />
        </q-item-section>
        <q-item-section>Local Changes</q-item-section>
      </q-item>
    </q-list>

    <q-separator />

    <q-list dense class="repository-tree">
      <q-expansion-item dense default-opened expand-icon="keyboard_arrow_right" label="Branches">
        <q-item clickable class="repository-tree-item repository-tree-item-current">
          <q-item-section avatar>
            <q-icon name="account_tree" />
          </q-item-section>
          <q-item-section>main</q-item-section>
        </q-item>
        <q-item clickable class="repository-tree-item">
          <q-item-section avatar>
            <q-icon name="account_tree" />
          </q-item-section>
          <q-item-section>feature/sidebar-polish</q-item-section>
        </q-item>
        <q-item clickable class="repository-tree-item">
          <q-item-section avatar>
            <q-icon name="account_tree" />
          </q-item-section>
          <q-item-section>release/mvp-shell</q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item dense default-opened expand-icon="keyboard_arrow_right" label="Remotes">
        <q-expansion-item
          dense
          default-opened
          class="repository-tree-nested"
          expand-icon="keyboard_arrow_right"
          label="origin"
        >
          <q-item clickable class="repository-tree-item repository-tree-child">
            <q-item-section avatar>
              <q-icon name="commit" />
            </q-item-section>
            <q-item-section>origin/main</q-item-section>
          </q-item>
          <q-item clickable class="repository-tree-item repository-tree-child">
            <q-item-section avatar>
              <q-icon name="commit" />
            </q-item-section>
            <q-item-section>origin/develop</q-item-section>
          </q-item>
          <q-item clickable class="repository-tree-item repository-tree-child">
            <q-item-section avatar>
              <q-icon name="commit" />
            </q-item-section>
            <q-item-section>origin/feature/git-service</q-item-section>
          </q-item>
        </q-expansion-item>

        <q-expansion-item
          dense
          class="repository-tree-nested"
          expand-icon="keyboard_arrow_right"
          label="upstream"
        >
          <q-item clickable class="repository-tree-item repository-tree-child">
            <q-item-section avatar>
              <q-icon name="commit" />
            </q-item-section>
            <q-item-section>upstream/main</q-item-section>
          </q-item>
          <q-item clickable class="repository-tree-item repository-tree-child">
            <q-item-section avatar>
              <q-icon name="commit" />
            </q-item-section>
            <q-item-section>upstream/preview</q-item-section>
          </q-item>
        </q-expansion-item>
      </q-expansion-item>

      <q-expansion-item dense default-opened expand-icon="keyboard_arrow_right" label="Stashes">
        <q-item clickable class="repository-tree-item">
          <q-item-section avatar>
            <q-icon name="inventory_2" />
          </q-item-section>
          <q-item-section>
            <q-item-label>WIP: sidebar density pass</q-item-label>
            <q-item-label caption>stash@{0}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable class="repository-tree-item">
          <q-item-section avatar>
            <q-icon name="inventory_2" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Before toolbar layout changes</q-item-label>
            <q-item-label caption>stash@{1}</q-item-label>
          </q-item-section>
        </q-item>
      </q-expansion-item>
    </q-list>
  </aside>
</template>

<script setup lang="ts">
import type { RepositoryView } from '../../types/repository';

defineProps<{
  activeView: RepositoryView;
}>();

defineEmits<{
  'update:activeView': [view: RepositoryView];
}>();
</script>

<style scoped>
.repository-sidebar {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  background: var(--app-surface);
  border-right: 0;
}

.repository-sidebar-header {
  padding: 10px 12px 8px;
  border-bottom: 1px solid var(--app-border);
}

.repository-sidebar-name {
  overflow: hidden;
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.repository-navigation {
  padding-top: 6px;
  padding-bottom: 6px;
}

.repository-sidebar :deep(.q-item) {
  min-height: 30px;
  padding: 3px 10px;
  color: var(--app-text-muted);
}

.repository-sidebar :deep(.q-item__section--avatar) {
  min-width: 24px;
  padding-right: 6px;
}

.repository-sidebar :deep(.q-icon) {
  color: var(--app-icon-muted);
  font-size: 15px;
}

.repository-navigation :deep(.q-item.q-router-link--active),
.repository-navigation :deep(.q-item--active) {
  color: var(--app-text);
  background: var(--app-surface-raised);
  border-right: 2px solid var(--app-accent);
}

.repository-tree {
  padding: 6px 0 10px;
}

.repository-tree :deep(.q-expansion-item__container > .q-item) {
  min-height: 28px;
  padding: 2px 10px;
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.repository-tree :deep(.q-expansion-item__toggle-icon) {
  color: var(--app-icon-muted);
  font-size: 16px;
  transform: rotate(0deg);
}

.repository-tree
  :deep(
    .q-expansion-item--expanded
      > .q-expansion-item__container
      > .q-item
      .q-expansion-item__toggle-icon
  ) {
  transform: rotate(90deg);
}

.repository-tree-item {
  min-height: 28px;
  padding-left: 16px;
  font-size: 12px;
}

.repository-tree-item :deep(.q-item__label--caption) {
  color: var(--app-caption);
  font-size: 11px;
}

.repository-tree-item-current {
  color: var(--app-text);
}

.repository-tree-item-current :deep(.q-icon) {
  color: var(--app-accent);
}

.repository-tree-nested :deep(> .q-expansion-item__container > .q-item) {
  padding-left: 18px;
  color: var(--app-nested-text);
  font-size: 12px;
  font-weight: 650;
  text-transform: none;
}

.repository-tree-child {
  padding-left: 34px;
}

.repository-tree :deep(.q-item:hover) {
  color: var(--app-text);
  background: var(--app-hover-soft);
}

@media (max-width: 760px) {
  .repository-sidebar {
    border-right: 0;
    border-bottom: 0;
  }
}
</style>
