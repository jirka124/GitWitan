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
      <q-expansion-item
        dense
        default-opened
        icon="account_tree"
        expand-icon="keyboard_arrow_right"
        label="Branches"
        caption="3 local"
        class="repository-tree-section repository-tree-section-branches"
      >
        <q-item clickable class="repository-tree-item repository-tree-item-current">
          <q-item-section avatar>
            <q-icon name="account_tree" />
          </q-item-section>
          <q-item-section>
            <q-item-label>main</q-item-label>
            <q-item-label caption>current branch</q-item-label>
          </q-item-section>
          <q-item-section side>
            <span class="repository-tree-pill">current</span>
          </q-item-section>
        </q-item>
        <q-item clickable class="repository-tree-item">
          <q-item-section avatar>
            <q-icon name="account_tree" />
          </q-item-section>
          <q-item-section>
            <q-item-label>feature/sidebar-polish</q-item-label>
            <q-item-label caption>local branch</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable class="repository-tree-item">
          <q-item-section avatar>
            <q-icon name="account_tree" />
          </q-item-section>
          <q-item-section>
            <q-item-label>release/mvp-shell</q-item-label>
            <q-item-label caption>local branch</q-item-label>
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item
        dense
        default-opened
        icon="cloud_queue"
        expand-icon="keyboard_arrow_right"
        label="Remotes"
        caption="2 sources"
        class="repository-tree-section repository-tree-section-remotes"
      >
        <q-expansion-item
          dense
          default-opened
          class="repository-tree-nested"
          expand-icon="keyboard_arrow_right"
          icon="dns"
          label="origin"
          caption="3 branches"
        >
          <q-item clickable class="repository-tree-item repository-tree-child">
            <q-item-section avatar>
              <q-icon name="commit" />
            </q-item-section>
            <q-item-section>
              <q-item-label>main</q-item-label>
              <q-item-label caption>origin/main</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable class="repository-tree-item repository-tree-child">
            <q-item-section avatar>
              <q-icon name="commit" />
            </q-item-section>
            <q-item-section>
              <q-item-label>develop</q-item-label>
              <q-item-label caption>origin/develop</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable class="repository-tree-item repository-tree-child">
            <q-item-section avatar>
              <q-icon name="commit" />
            </q-item-section>
            <q-item-section>
              <q-item-label>feature/git-service</q-item-label>
              <q-item-label caption>origin/feature/git-service</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-expansion-item
          dense
          class="repository-tree-nested"
          expand-icon="keyboard_arrow_right"
          icon="dns"
          label="upstream"
          caption="2 branches"
        >
          <q-item clickable class="repository-tree-item repository-tree-child">
            <q-item-section avatar>
              <q-icon name="commit" />
            </q-item-section>
            <q-item-section>
              <q-item-label>main</q-item-label>
              <q-item-label caption>upstream/main</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable class="repository-tree-item repository-tree-child">
            <q-item-section avatar>
              <q-icon name="commit" />
            </q-item-section>
            <q-item-section>
              <q-item-label>preview</q-item-label>
              <q-item-label caption>upstream/preview</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>
      </q-expansion-item>

      <q-expansion-item
        dense
        default-opened
        icon="inventory_2"
        expand-icon="keyboard_arrow_right"
        label="Stashes"
        caption="2 saved states"
        class="repository-tree-section repository-tree-section-stashes"
      >
        <q-item clickable class="repository-tree-item repository-tree-stash">
          <q-item-section avatar>
            <q-icon name="inventory_2" />
          </q-item-section>
          <q-item-section>
            <q-item-label>WIP: sidebar density pass</q-item-label>
            <q-item-label caption>stash@{0}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable class="repository-tree-item repository-tree-stash">
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
  width: 100%;
  height: 100%;
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
  padding: 8px 6px 12px;
}

.repository-tree-section {
  margin-bottom: 6px;
  overflow: hidden;
  border: 1px solid transparent;
  border-radius: var(--app-radius);
}

.repository-tree-section :deep(> .q-expansion-item__container > .q-item) {
  min-height: 36px;
  padding: 5px 8px;
  color: var(--app-text);
  background: var(--app-hover-soft);
  border-radius: var(--app-radius);
}

.repository-tree-section :deep(> .q-expansion-item__container > .q-item .q-item__label) {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.repository-tree-section :deep(> .q-expansion-item__container > .q-item .q-item__label--caption) {
  color: var(--app-caption);
  font-size: 10px;
  font-weight: 650;
  text-transform: none;
}

.repository-tree-section :deep(> .q-expansion-item__container > .q-item .q-icon) {
  color: var(--app-accent);
  font-size: 16px;
}

.repository-tree-section :deep(.q-expansion-item__content) {
  position: relative;
  padding: 0;
}

.repository-tree-section :deep(.q-expansion-item__content::before) {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 18px;
  width: 1px;
  content: '';
  background: var(--app-border);
}

.repository-tree :deep(.q-expansion-item__toggle-icon) {
  color: var(--app-icon-muted) !important;
  font-size: 16px !important;
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
  min-height: 30px;
  margin-top: 2px;
  padding-left: 20px;
  padding-right: 8px;
  border-radius: 4px;
  font-size: 12px;
}

.repository-tree-item :deep(.q-item__label) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.repository-tree-item :deep(.q-item__label--caption) {
  color: var(--app-caption);
  font-size: 10px;
  line-height: 1.2;
}

.repository-tree-item-current {
  color: var(--app-text);
  background: color-mix(in srgb, var(--app-accent) 14%, transparent);
}

.repository-tree-item-current :deep(.q-icon) {
  color: var(--app-accent);
}

.repository-tree-pill {
  display: inline-flex;
  align-items: center;
  height: 17px;
  padding: 0 6px;
  color: var(--app-accent);
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
  background: color-mix(in srgb, var(--app-accent) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--app-accent) 28%, transparent);
  border-radius: 999px;
}

.repository-tree-nested {
  margin: 2px 0;
}

.repository-tree-nested :deep(> .q-expansion-item__container > .q-item) {
  min-height: 32px;
  padding: 4px 8px 4px 20px;
  color: var(--app-nested-text);
  background: transparent;
  border-radius: 4px;
}

.repository-tree-nested :deep(> .q-expansion-item__container > .q-item .q-item__label) {
  font-size: 12px;
  font-weight: 750;
  text-transform: none;
}

.repository-tree-nested :deep(> .q-expansion-item__container > .q-item .q-item__label--caption) {
  color: var(--app-caption);
  font-size: 10px;
  font-weight: 600;
}

.repository-tree-nested :deep(> .q-expansion-item__container > .q-item .q-icon) {
  color: var(--app-folder);
}

.repository-tree-child {
  padding-left: 36px;
}

.repository-tree-stash {
  min-height: 34px;
}

.repository-tree :deep(.q-item:hover) {
  color: var(--app-text);
  background: var(--app-hover-soft);
}

.repository-tree-section-branches {
  border-color: color-mix(in srgb, var(--app-accent) 12%, transparent);
}

.repository-tree-section-remotes {
  border-color: color-mix(in srgb, var(--app-folder) 14%, transparent);
}

.repository-tree-section-stashes {
  border-color: color-mix(in srgb, var(--app-status-warning) 14%, transparent);
}

.repository-tree-section-stashes :deep(> .q-expansion-item__container > .q-item .q-icon),
.repository-tree-stash :deep(.q-icon) {
  color: var(--app-status-warning);
}

@media (max-width: 760px) {
  .repository-sidebar {
    border-right: 0;
    border-bottom: 0;
  }
}
</style>
