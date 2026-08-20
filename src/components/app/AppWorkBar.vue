<template>
  <q-toolbar class="app-workbar">
    <RepositoryManagementTrigger
      :active="isRepositoryManagementRoute"
      @open="openRepositoryManagement"
    />

    <RepositoryManagementBar
      v-if="isRepositoryManagementRoute"
      :repository-count="managedRepositoryCount"
    />

    <template v-else>
      <CurrentRepoStatus />
      <RepoCommandBar />
    </template>

    <AppGlobalActions
      :theme-icon="themeIcon"
      :theme-label="themeLabel"
      @toggle-theme="$emit('toggle-theme')"
    />

    <RepositoryCloneDialog @clone="$emit('clone', $event)" />

    <RepositoryFetchDialog @fetch="$emit('fetch', $event)" />

    <RepositoryPullDialog @pull="$emit('pull', $event)" />

    <RepositoryPushDialog @push="$emit('push', $event)" />

    <RepositoryMergeDialog @merge="$emit('merge', $event)" />

    <RepositoryStashDialog @stash="$emit('stash', $event)" />
  </q-toolbar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppGlobalActions from './AppGlobalActions.vue';
import CurrentRepoStatus from './CurrentRepoStatus.vue';
import RepoCommandBar from './RepoCommandBar.vue';
import RepositoryManagementBar from './RepositoryManagementBar.vue';
import RepositoryManagementTrigger from './RepositoryManagementTrigger.vue';
import RepositoryCloneDialog from '../repository/dialogs/RepositoryCloneDialog.vue';
import RepositoryFetchDialog from '../repository/dialogs/RepositoryFetchDialog.vue';
import RepositoryPullDialog from '../repository/dialogs/RepositoryPullDialog.vue';
import RepositoryPushDialog from '../repository/dialogs/RepositoryPushDialog.vue';
import RepositoryMergeDialog from '../repository/dialogs/RepositoryMergeDialog.vue';
import RepositoryStashDialog from '../repository/dialogs/RepositoryStashDialog.vue';
import { managedRepositories } from '../repository/management/repository-management.mock';
import type {
  CloneDialogPayload,
  FetchDialogPayload,
  MergeDialogPayload,
  PullDialogPayload,
  PushDialogPayload,
  StashDialogPayload,
} from '../../stores/repositoryCommandDialogs';

defineProps<{
  themeIcon: string;
  themeLabel: string;
}>();

defineEmits<{
  'toggle-theme': [];
  clone: [payload: CloneDialogPayload];
  fetch: [payload: FetchDialogPayload];
  pull: [payload: PullDialogPayload];
  push: [payload: PushDialogPayload];
  merge: [payload: MergeDialogPayload];
  stash: [payload: StashDialogPayload];
}>();

const route = useRoute();
const router = useRouter();

const isRepositoryManagementRoute = computed(() => route.path === '/');
const managedRepositoryCount = computed(() => managedRepositories.length);

const openRepositoryManagement = () => {
  if (!isRepositoryManagementRoute.value) {
    void router.push('/');
  }
};
</script>

<style scoped>
.app-workbar {
  min-height: var(--app-workbar-height);
  width: 100%;
  padding: 7px 10px 8px;
  gap: 12px;
  border-top: 1px solid var(--app-titlebar-border);
  -webkit-app-region: no-drag;
  app-region: no-drag;
}

@media (max-width: 760px) {
  .app-workbar {
    gap: 8px;
  }
}
</style>
