<template>
  <q-page class="repository-workspace">
    <RepositorySwitcher />
    <RepositoryManagementView
      :can-go-back="canGoBack"
      @back="goBack"
      @open-repository="openRepository"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import RepositoryManagementView from '../components/repository/RepositoryManagementView.vue';
import RepositorySwitcher from '../components/repository/RepositorySwitcher.vue';
import { useRepositorySessionStore } from '../stores/repositorySession';

const route = useRoute();
const router = useRouter();
const repositorySessionStore = useRepositorySessionStore();

const canGoBack = computed(() => {
  void route.fullPath;
  return Boolean(window.history.state.back);
});

const goBack = () => {
  router.back();
};

const openRepository = (repositoryId: string) => {
  repositorySessionStore.open(repositoryId);
  void router.push({ name: 'repository-workspace', params: { repositoryId } });
};
</script>

<style scoped>
.repository-workspace {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--app-header-height));
  min-height: 0;
  overflow: hidden;
  background: var(--app-bg);
}
</style>
