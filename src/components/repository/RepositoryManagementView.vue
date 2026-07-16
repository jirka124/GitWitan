<template>
  <section class="repository-management-view" aria-label="Repository management">
    <RepositoryManagementHeader
      :can-go-back="canGoBack"
      :repository-count="repositories.length"
      @back="$emit('back')"
    />

    <div class="repository-management-content">
      <q-resize-observer @resize="onResize" />
      <q-splitter
        v-model="managementSplitter"
        :horizontal="$q.screen.lt.md"
        :limits="managementSplitterLimits"
        unit="px"
        class="repository-management-splitter"
      >
        <template #before>
          <RepositoryManagementList
            v-model:search-query="repositorySearchQuery"
            :repositories="filteredRepositories"
            :active-repository-key="activeRepository.key"
            @select="activeRepositoryKey = $event"
            @open="openRepository"
          />
        </template>

        <template #after>
          <RepositoryManagementDetail
            :repository="activeRepository"
            :icon-options="repositoryIconOptions"
            @open-repository="openActiveRepository"
            @open-remote="openRemote"
          />
        </template>
      </q-splitter>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import RepositoryManagementDetail from './management/RepositoryManagementDetail.vue';
import RepositoryManagementHeader from './management/RepositoryManagementHeader.vue';
import RepositoryManagementList from './management/RepositoryManagementList.vue';
import {
  managedRepositories,
  repositoryIconOptions,
} from './management/repository-management.mock';
import type { ManagedRepository } from './management/repository-management.types';

type GitWitanShell = {
  openExternal: (url: string) => Promise<void>;
};

declare global {
  interface Window {
    gitwitanShell?: GitWitanShell;
  }
}

const props = defineProps<{
  canGoBack: boolean;
}>();

const emit = defineEmits<{
  back: [];
  openRepository: [repositoryKey: string];
}>();

const $q = useQuasar();
const repositories = managedRepositories;
const fallbackRepository = repositories[0] as ManagedRepository;
const activeRepositoryKey = ref(fallbackRepository.key);
const repositorySearchQuery = ref('');
const managementViewBox = ref({ width: 100, height: 100 });
const managementSplitter = ref(300);

const managementSplitterLimits = computed<[number, number]>(() => {
  const availableSize = $q.screen.lt.md
    ? managementViewBox.value.height
    : managementViewBox.value.width;

  return [220, Math.max(220, availableSize - 8)];
});

const filteredRepositories = computed(() => {
  const query = repositorySearchQuery.value.trim().toLocaleLowerCase();

  if (!query) {
    return repositories;
  }

  return repositories.filter((repository) => {
    const searchableText = `${repository.name} ${repository.path}`.toLocaleLowerCase();

    return searchableText.includes(query);
  });
});

const activeRepository = computed<ManagedRepository>(
  () =>
    repositories.find((repository) => repository.key === activeRepositoryKey.value) ??
    fallbackRepository,
);

const onResize = (size: { width: number; height: number }) => {
  managementViewBox.value = size;
};

const openRepository = (repositoryKey: string) => {
  activeRepositoryKey.value = repositoryKey;
  emit('openRepository', repositoryKey);
};

const openActiveRepository = () => {
  openRepository(activeRepository.value.key);
};

const openRemote = (remoteUrl: string) => {
  if (window.gitwitanShell) {
    void window.gitwitanShell.openExternal(remoteUrl);
    return;
  }

  window.open(remoteUrl, '_blank', 'noopener,noreferrer');
};

void props;
</script>

<style scoped>
.repository-management-view {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  color: var(--app-text);
  background: var(--app-bg);
}

.repository-management-content {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.repository-management-splitter {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.repository-management-splitter :deep(.q-splitter__before),
.repository-management-splitter :deep(.q-splitter__after) {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.repository-management-splitter :deep(.q-splitter__separator) {
  background: var(--app-border);
}

.repository-management-splitter.q-splitter--horizontal :deep(.q-splitter__separator) {
  width: auto;
  height: 1px;
}

.repository-management-splitter :deep(.q-splitter__separator:hover) {
  background: var(--app-border-strong);
}
</style>
