<template>
  <q-toolbar class="app-workbar">
    <div class="repo-management-actions" aria-label="Repository management">
      <q-btn
        flat
        dense
        round
        icon="folder_open"
        aria-label="Repository management"
        :aria-pressed="isRepositoryManagementRoute"
        class="repo-management-trigger"
        :class="{ 'repo-management-trigger-active': isRepositoryManagementRoute }"
        @click="openRepositoryManagement"
      >
        <q-tooltip>Repository Management</q-tooltip>
      </q-btn>
    </div>

    <CurrentRepoStatus />

    <RepoCommandBar
      :theme-icon="themeIcon"
      :theme-label="themeLabel"
      @toggle-theme="$emit('toggle-theme')"
    />
  </q-toolbar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CurrentRepoStatus from './CurrentRepoStatus.vue';
import RepoCommandBar from './RepoCommandBar.vue';

defineProps<{
  themeIcon: string;
  themeLabel: string;
}>();

defineEmits<{
  'toggle-theme': [];
}>();

const route = useRoute();
const router = useRouter();

const isRepositoryManagementRoute = computed(() => route.path === '/');

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

.repo-management-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 48px;
  padding-right: 10px;
  border-right: 1px solid var(--app-border);
  -webkit-app-region: no-drag;
  app-region: no-drag;
}

.repo-management-trigger {
  width: 38px;
  height: 38px;
  min-height: 38px;
  color: var(--app-text-muted);
  border: 1px solid transparent;
  border-radius: var(--app-radius);
}

.repo-management-trigger :deep(.q-icon) {
  font-size: 22px;
}

.repo-management-trigger-active,
.repo-management-trigger:hover {
  color: var(--app-text);
  background: var(--app-surface-raised);
  border-color: var(--app-border-strong);
}

@media (max-width: 760px) {
  .app-workbar {
    gap: 8px;
  }

  .repo-management-actions {
    padding-right: 6px;
  }
}
</style>
