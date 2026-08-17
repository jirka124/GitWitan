<template>
  <div class="repo-command-bar" aria-label="Active repository commands">
    <div class="repo-command-group repo-command-branch-group" aria-label="Branch commands">
      <q-btn flat no-caps icon="account_tree" label="main" class="repo-command repo-branch-command">
        <q-icon name="keyboard_arrow_down" class="repo-command-caret" />
        <q-tooltip>Branch</q-tooltip>
      </q-btn>
    </div>

    <div class="repo-command-group" aria-label="Sync commands">
      <q-btn flat no-caps icon="sync" label="Fetch" class="repo-command" @click="openFetchDialog" />
      <q-btn flat no-caps icon="south" label="Pull" class="repo-command" @click="openPullDialog" />
      <q-btn flat no-caps icon="north" label="Push" class="repo-command" @click="openPushDialog" />
    </div>

    <div class="repo-command-group" aria-label="Change commands">
      <q-btn
        flat
        no-caps
        icon="call_merge"
        label="Merge"
        class="repo-command"
        @click="openMergeDialog"
      />
      <q-btn
        flat
        no-caps
        icon="inventory_2"
        label="Stash"
        class="repo-command"
        @click="openStashDialog"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRepositoryCommandDialogsStore } from '../../stores/repositoryCommandDialogs';

const dialogsStore = useRepositoryCommandDialogsStore();

const openFetchDialog = () => {
  dialogsStore.openFetchDialog();
};

const openPullDialog = () => {
  dialogsStore.openPullDialog();
};

const openPushDialog = () => {
  dialogsStore.openPushDialog();
};

const openMergeDialog = () => {
  dialogsStore.openMergeDialog();
};

const openStashDialog = () => {
  dialogsStore.openStashDialog();
};
</script>

<style scoped>
.repo-command-bar {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
  -webkit-app-region: no-drag;
  app-region: no-drag;
}

.repo-command-group {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 2px;
  min-width: 0;
  padding: 3px;
  background: var(--app-command-group-bg);
  border: 1px solid var(--app-command-group-border);
  border-radius: var(--app-radius);
}

.repo-command {
  min-height: 36px;
  padding: 4px 9px;
  color: var(--app-text);
  border-radius: 4px;
}

.repo-command :deep(.q-icon) {
  color: var(--app-accent);
  font-size: 20px;
}

.repo-command :deep(.q-btn__content) {
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
}

.repo-command:hover {
  background: var(--app-surface-raised);
}

.repo-branch-command {
  min-width: 104px;
  justify-content: flex-start;
}

.repo-command-caret {
  margin-left: 2px;
  color: var(--app-text-muted) !important;
  font-size: 18px !important;
}

@media (max-width: 1080px) {
  .repo-command {
    min-width: 42px;
    padding-right: 8px;
    padding-left: 8px;
  }

  .repo-command :deep(.q-btn__content span.block) {
    display: none;
  }
}
</style>
