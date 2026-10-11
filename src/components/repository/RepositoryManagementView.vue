<template>
  <section class="repository-management-view" aria-label="Repository management">
    <RepositoryManagementHeader
      :can-go-back="canGoBack"
      :repository-count="repositories.length"
      @back="$emit('back')"
      @clone="openCloneDialog"
      @init-repository="openInitRepositoryPicker"
      @add-existing-repository="openAddExistingRepositoryPicker"
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
            :active-repository-key="activeRepository?.key"
            @select="selectTrackedRepository"
            @open="openRepository"
          />
        </template>

        <template #after>
          <RepositoryManagementDetail
            v-if="activeRepository"
            :repository="activeRepository"
            :icon-options="repositoryIconOptions"
            @open-repository="openActiveRepository"
            @open-remote="openRemote"
          />
          <section
            v-else
            class="repository-management-empty-detail"
            aria-label="No repository selected"
          >
            <div class="repository-management-welcome">
              <img :src="appIcon" alt="GitWitan" class="repository-management-welcome-logo" />
              <span class="repository-management-welcome-brand">GitWitan</span>
              <h1>Your Git workspace</h1>
              <p v-if="repositories.length">
                Select a repository to inspect its status and configuration. Double-click a
                repository to open it directly.
              </p>
              <p v-else>
                Add or initialize a repository to get started. Once added, double-click it to open
                it directly.
              </p>
            </div>
          </section>
        </template>
      </q-splitter>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRepositoryCommandDialogsStore } from '../../stores/repositoryCommandDialogs';
import { useRepositoryManagementStore } from '../../stores/repositoryManagement';
import { useRepositorySnapshotsStore } from '../../stores/repositorySnapshots';
import appIconDark from '../../assets/app-icon-dark.svg';
import appIconLight from '../../assets/app-icon-light.svg';
import RepositoryManagementDetail from './management/RepositoryManagementDetail.vue';
import RepositoryManagementHeader from './management/RepositoryManagementHeader.vue';
import RepositoryManagementList from './management/RepositoryManagementList.vue';
import { repositoryIconOptions } from './management/repository-management.mock';
import type { ManagedRepository } from './management/repository-management.types';

const props = defineProps<{
  canGoBack: boolean;
}>();

const emit = defineEmits<{
  back: [];
  openRepository: [repositoryKey: string];
}>();

const $q = useQuasar();
const appIcon = computed(() => ($q.dark.isActive ? appIconDark : appIconLight));
const dialogsStore = useRepositoryCommandDialogsStore();
const repositoryManagementStore = useRepositoryManagementStore();
const snapshotsStore = useRepositorySnapshotsStore();
onMounted(() => {
  removeSnapshotListener = snapshotsStore.onChanged((snapshot) =>
    repositoryManagementStore.applySnapshot(snapshot),
  );
  void snapshotsStore.initialize();
  void repositoryManagementStore.load();
});

let removeSnapshotListener: (() => void) | undefined;
onUnmounted(() => removeSnapshotListener?.());
const repositories = computed(() => repositoryManagementStore.repositories);
const activeRepositoryKey = ref<string>();
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
    return repositories.value;
  }

  return repositories.value.filter((repository) => {
    const searchableText = `${repository.name} ${repository.path}`.toLocaleLowerCase();

    return searchableText.includes(query);
  });
});

const activeRepository = computed<ManagedRepository | undefined>(() =>
  repositories.value.find((repository) => repository.key === activeRepositoryKey.value),
);

const onResize = (size: { width: number; height: number }) => {
  managementViewBox.value = size;
};

const openCloneDialog = () => {
  dialogsStore.openCloneDialog();
};

const selectTrackedRepository = (repositoryKey: string | undefined) => {
  if (repositoryKey) {
    activeRepositoryKey.value = repositoryKey;
    repositorySearchQuery.value = '';
    void repositoryManagementStore.refresh(repositoryKey);
  }
};

const openInitRepositoryPicker = async () => {
  selectTrackedRepository(await repositoryManagementStore.openInitRepositoryPicker());
};

const openAddExistingRepositoryPicker = async () => {
  selectTrackedRepository(await repositoryManagementStore.openAddExistingRepositoryPicker());
};

const openRepository = (repositoryKey: string) => {
  activeRepositoryKey.value = repositoryKey;
  emit('openRepository', repositoryKey);
};

const openActiveRepository = () => {
  if (activeRepository.value) openRepository(activeRepository.value.key);
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

.repository-management-empty-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 32px;
  background: transparent;
}

.repository-management-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 340px;
  text-align: center;
}

.repository-management-welcome-logo {
  width: 68px;
  height: 68px;
  margin-bottom: 12px;
}

.repository-management-welcome-brand,
.repository-management-welcome h1,
.repository-management-welcome p {
  margin: 0;
}

.repository-management-welcome-brand {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.repository-management-welcome h1 {
  margin-top: 10px;
  color: var(--app-text);
  font-size: 20px;
  font-weight: 750;
}

.repository-management-welcome p {
  margin-top: 9px;
  color: var(--app-caption);
  font-size: 12px;
  line-height: 1.6;
}
</style>
