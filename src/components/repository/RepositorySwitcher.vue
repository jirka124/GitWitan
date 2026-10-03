<template>
  <section class="repository-switcher" aria-label="Open repositories">
    <button
      v-for="repository in openRepositories"
      :key="repository.key"
      class="repository-switcher-item"
      :class="{ 'repository-switcher-item-active': repository.key === activeRepositoryId }"
      type="button"
      @click="openRepository(repository.key)"
    >
      <span>{{ repository.name }}</span>
    </button>

    <button
      class="repository-switcher-add"
      type="button"
      aria-label="Add or manage repositories"
      @click="openRepositoryManagement"
    >
      <q-icon name="add" />
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRepositoryManagementStore } from '../../stores/repositoryManagement';
import { useRepositorySessionStore } from '../../stores/repositorySession';

const route = useRoute();
const router = useRouter();
const repositoryManagementStore = useRepositoryManagementStore();
const repositorySessionStore = useRepositorySessionStore();

const activeRepositoryId = computed(() =>
  typeof route.params.repositoryId === 'string' ? route.params.repositoryId : undefined,
);
const openRepositories = computed(() =>
  repositorySessionStore.openRepositoryIds
    .map((repositoryId) =>
      repositoryManagementStore.repositories.find((repository) => repository.key === repositoryId),
    )
    .filter((repository) => repository !== undefined),
);

onMounted(async () => {
  await repositoryManagementStore.load();

  if (activeRepositoryId.value) {
    repositorySessionStore.open(activeRepositoryId.value);
  }
});

const openRepositoryManagement = () => {
  void router.push('/');
};

const openRepository = (repositoryId: string) => {
  repositorySessionStore.open(repositoryId);
  void router.push({ name: 'repository-workspace', params: { repositoryId } });
};
</script>

<style scoped>
.repository-switcher {
  display: flex;
  flex: 0 0 var(--repo-switcher-height);
  align-items: stretch;
  gap: 1px;
  min-height: 0;
  padding: 0 8px;
  overflow-x: auto;
  overflow-y: hidden;
  background: var(--app-surface-deep);
  border-bottom: 1px solid var(--app-border);
  -webkit-app-region: no-drag;
  app-region: no-drag;
}

.repository-switcher-item,
.repository-switcher-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  height: 100%;
  color: var(--app-text-muted);
  font: inherit;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  cursor: default;
}

.repository-switcher-item {
  max-width: 180px;
  padding: 0 12px;
}

.repository-switcher-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.repository-switcher-item-active {
  color: var(--app-text);
  background: var(--app-surface);
  border-bottom-color: var(--app-accent);
}

.repository-switcher-add {
  flex: 0 0 32px;
  color: var(--app-text-muted);
}

.repository-switcher-item:hover,
.repository-switcher-add:hover {
  color: var(--app-text);
  background: var(--app-surface-raised);
}
</style>
