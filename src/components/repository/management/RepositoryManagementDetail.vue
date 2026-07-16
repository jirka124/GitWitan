<template>
  <main class="repository-management-detail">
    <RepositoryManagementDetailHeader
      :repository="repository"
      :icon-options="iconOptions"
      @open="$emit('openRepository')"
    />
    <RepositoryStatsGrid :repository="repository" />
    <RepositoryTrackingPanel />
    <RepositoryRemotesTable
      :remotes="repository.remotes"
      @open-remote="$emit('openRemote', $event)"
    />
  </main>
</template>

<script setup lang="ts">
import RepositoryManagementDetailHeader from './RepositoryManagementDetailHeader.vue';
import RepositoryRemotesTable from './RepositoryRemotesTable.vue';
import RepositoryStatsGrid from './RepositoryStatsGrid.vue';
import RepositoryTrackingPanel from './RepositoryTrackingPanel.vue';
import type { ManagedRepository, RepositoryIconOption } from './repository-management.types';

defineProps<{
  repository: ManagedRepository;
  iconOptions: RepositoryIconOption[];
}>();

defineEmits<{
  openRepository: [];
  openRemote: [remoteUrl: string];
}>();
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
</style>
