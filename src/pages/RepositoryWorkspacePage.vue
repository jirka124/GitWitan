<template>
  <q-page class="repository-workspace">
    <RepositorySwitcher />

    <main class="repository-workspace-grid">
      <q-splitter
        v-model="repositorySplitter"
        :horizontal="$q.screen.lt.md"
        :limits="repositorySplitterLimits"
        unit="px"
        class="repository-root-splitter"
      >
        <template #before>
          <RepositorySidebar v-model:active-view="activeView" />
        </template>

        <template #after>
          <RepositoryMainView
            v-model:active-view="activeView"
            :unstaged-tree="unstagedTree"
            :staged-tree="stagedTree"
            :unstaged-file-count="unstagedFileCount"
            :staged-file-count="stagedFileCount"
          />
        </template>
      </q-splitter>
    </main>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import RepositoryMainView from '../components/repository/RepositoryMainView.vue';
import RepositorySidebar from '../components/repository/RepositorySidebar.vue';
import RepositorySwitcher from '../components/repository/RepositorySwitcher.vue';
import type { ChangeTreeNode, RepositoryView } from '../types/repository';

const $q = useQuasar();

const activeView = ref<RepositoryView>('history');
const repositorySplitter = ref(200);

const repositorySplitterLimits = computed<[number, number]>(() => [200, $q.screen.width - 8]);

const unstagedTree: ChangeTreeNode[] = [
  {
    key: 'unstaged-src',
    label: 'src',
    icon: 'folder',
    children: [
      {
        key: 'unstaged-src-layouts',
        label: 'layouts',
        icon: 'folder',
        children: [
          {
            key: 'unstaged-src-layouts-main-layout',
            label: 'MainLayout.vue',
            caption: 'src/layouts/MainLayout.vue',
            icon: 'description',
            status: 'modified',
            badge: 'M',
          },
        ],
      },
      {
        key: 'unstaged-src-css',
        label: 'css',
        icon: 'folder',
        children: [
          {
            key: 'unstaged-src-css-app',
            label: 'app.css',
            caption: 'src/css/app.css',
            icon: 'description',
            status: 'modified',
            badge: 'M',
          },
        ],
      },
      {
        key: 'unstaged-src-services',
        label: 'services',
        icon: 'folder',
        children: [
          {
            key: 'unstaged-src-services-git-service',
            label: 'git-service.ts',
            caption: 'src/services/git-service.ts',
            icon: 'description',
            status: 'added',
            badge: 'A',
          },
        ],
      },
      {
        key: 'unstaged-src-components',
        label: 'components',
        icon: 'folder',
        children: [
          {
            key: 'unstaged-src-components-repository-picker',
            label: 'RepositoryPicker.vue',
            caption: 'src/components/RepositoryPicker.vue',
            icon: 'description',
            status: 'untracked',
            badge: 'U',
          },
        ],
      },
    ],
  },
];

const stagedTree: ChangeTreeNode[] = [
  {
    key: 'staged-src',
    label: 'src',
    icon: 'folder',
    children: [
      {
        key: 'staged-src-pages',
        label: 'pages',
        icon: 'folder',
        children: [
          {
            key: 'staged-src-pages-index',
            label: 'IndexPage.vue',
            caption: 'src/pages/IndexPage.vue',
            icon: 'description',
            status: 'modified',
            badge: 'M',
          },
        ],
      },
      {
        key: 'staged-src-stores',
        label: 'stores',
        icon: 'folder',
        children: [
          {
            key: 'staged-src-stores-types',
            label: 'types.ts',
            caption: 'src/stores/types.ts',
            icon: 'description',
            status: 'added',
            badge: 'A',
          },
        ],
      },
    ],
  },
];

const countFiles = (nodes: ChangeTreeNode[]): number =>
  nodes.reduce((total, node) => total + (node.children ? countFiles(node.children) : 1), 0);

const unstagedFileCount = computed(() => countFiles(unstagedTree));
const stagedFileCount = computed(() => countFiles(stagedTree));
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

.repository-workspace-grid {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.repository-root-splitter {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.repository-root-splitter :deep(.q-splitter__before),
.repository-root-splitter :deep(.q-splitter__after) {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.repository-root-splitter :deep(.q-splitter__separator) {
  background: var(--app-border);
}

.repository-root-splitter.q-splitter--horizontal :deep(.q-splitter__separator) {
  width: auto;
  height: 1px;
}

.repository-root-splitter :deep(.q-splitter__separator:hover) {
  background: var(--app-border-strong);
}
</style>
