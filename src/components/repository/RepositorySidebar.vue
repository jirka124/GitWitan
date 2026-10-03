<template>
  <aside class="repository-sidebar">
    <div class="repository-sidebar-header"><div class="repository-sidebar-name">{{ repositoryName }}</div></div>
    <q-list dense padding class="repository-navigation">
      <q-item clickable :active="activeView === 'history'" @click="$emit('update:activeView', 'history')"><q-item-section avatar><q-icon name="history" /></q-item-section><q-item-section>History</q-item-section></q-item>
      <q-item clickable :active="activeView === 'changes'" @click="$emit('update:activeView', 'changes')"><q-item-section avatar><q-icon name="difference" /></q-item-section><q-item-section>Local Changes</q-item-section></q-item>
    </q-list>
    <q-separator />
    <q-list dense class="repository-tree">
      <q-expansion-item dense default-opened icon="account_tree" label="Branches" :caption="`${branches.length} local`" class="repository-tree-section">
        <q-item v-for="branch in branches" :key="branch.name" class="repository-tree-item" :class="{ 'repository-tree-item-current': branch.isCurrent }"><q-item-section avatar><q-icon name="account_tree" /></q-item-section><q-item-section><q-item-label>{{ branch.name }}</q-item-label><q-item-label caption>{{ branch.isCurrent ? 'current branch' : 'local branch' }}</q-item-label></q-item-section></q-item>
      </q-expansion-item>
      <q-expansion-item dense default-opened icon="cloud_queue" label="Remotes" :caption="`${remoteNames.length} sources`" class="repository-tree-section">
        <q-expansion-item v-for="remote in remoteNames" :key="remote" dense default-opened class="repository-tree-nested" icon="dns" :label="remote" :caption="`${remoteBranches[remote]?.length ?? 0} branches`">
          <q-item v-for="branch in remoteBranches[remote]" :key="branch.name" class="repository-tree-item repository-tree-child"><q-item-section avatar><q-icon name="commit" /></q-item-section><q-item-section><q-item-label>{{ branch.name }}</q-item-label><q-item-label caption>{{ remote }}/{{ branch.name }}</q-item-label></q-item-section></q-item>
        </q-expansion-item>
      </q-expansion-item>
      <q-expansion-item dense default-opened icon="inventory_2" label="Stashes" :caption="`${stashes.length} saved states`" class="repository-tree-section">
        <q-item v-for="stash in stashes" :key="stash.id" class="repository-tree-item"><q-item-section avatar><q-icon name="inventory_2" /></q-item-section><q-item-section><q-item-label>{{ stash.message }}</q-item-label><q-item-label caption>{{ stash.id }}</q-item-label></q-item-section></q-item>
      </q-expansion-item>
    </q-list>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { RepositoryBranch, RepositoryRemoteBranch, RepositoryStash } from '../../types/repository-data';
import type { RepositoryView } from '../../types/repository';

defineProps<{ activeView: RepositoryView }>();
defineEmits<{ 'update:activeView': [view: RepositoryView] }>();

const route = useRoute();
const repositoryName = ref('No repository');
const branches = ref<RepositoryBranch[]>([]);
const remoteBranches = ref<Record<string, RepositoryRemoteBranch[]>>({});
const stashes = ref<RepositoryStash[]>([]);
const remoteNames = computed(() => Object.keys(remoteBranches.value));

const loadOverview = async () => {
  if (typeof route.params.repositoryId !== 'string' || !window.gitwitanRepositories) return;
  const [overview, records] = await Promise.all([
    window.gitwitanRepositories.overview(route.params.repositoryId),
    window.gitwitanRepositories.list(),
  ]);
  repositoryName.value = records.find((record) => record.repository.id === overview.repositoryId)?.repository.displayName ?? 'Repository';
  branches.value = overview.branches;
  remoteBranches.value = overview.remoteBranches.reduce<Record<string, RepositoryRemoteBranch[]>>(
    (groups, branch) => ({ ...groups, [branch.remote]: [...(groups[branch.remote] ?? []), branch] }),
    {},
  );
  stashes.value = overview.stashes;
};

onMounted(() => void loadOverview());
watch(() => route.params.repositoryId, () => void loadOverview());
</script>

<style scoped>
.repository-sidebar { width: 100%; height: 100%; overflow: auto; background: var(--app-surface); }
.repository-sidebar-header { padding: 10px 12px 8px; border-bottom: 1px solid var(--app-border); }
.repository-sidebar-name { overflow: hidden; color: var(--app-text-muted); font-size: 12px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.repository-navigation { padding: 6px 0; }
.repository-tree { padding: 8px 6px 12px; }
.repository-tree-section { margin-bottom: 6px; border: 1px solid color-mix(in srgb, var(--app-accent) 12%, transparent); border-radius: var(--app-radius); }
.repository-tree-item { min-height: 30px; padding: 3px 10px 3px 20px; color: var(--app-text-muted); }
.repository-tree-item-current { color: var(--app-text); background: color-mix(in srgb, var(--app-accent) 14%, transparent); }
.repository-tree-child { padding-left: 36px; }
</style>
