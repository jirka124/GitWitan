<template>
  <aside class="repository-sidebar">
    <div class="repository-sidebar-header">
      <div class="repository-sidebar-name">{{ repositoryName }}</div>
    </div>
    <q-list dense padding class="repository-navigation">
      <q-item
        clickable
        :active="activeView === 'history'"
        @click="$emit('update:activeView', 'history')"
        ><q-item-section avatar><q-icon name="history" /></q-item-section
        ><q-item-section>History</q-item-section></q-item
      >
      <q-item
        clickable
        :active="activeView === 'changes'"
        @click="$emit('update:activeView', 'changes')"
        ><q-item-section avatar><q-icon name="difference" /></q-item-section
        ><q-item-section>Local Changes</q-item-section></q-item
      >
    </q-list>
    <q-separator />
    <q-list dense class="repository-tree">
      <q-expansion-item
        dense
        default-opened
        icon="account_tree"
        label="Branches"
        :caption="`${branches.length} local`"
        class="repository-tree-section"
        header-class="repository-tree-section-header"
      >
        <q-item
          v-for="branch in branches"
          :key="branch.name"
          clickable
          class="repository-tree-item"
          :class="{ 'repository-tree-item-current': branch.isCurrent }"
          :title="branch.name"
          ><q-item-section avatar><q-icon name="account_tree" /></q-item-section
          ><q-item-section class="repository-tree-item-content"
            ><q-item-label class="repository-tree-item-label">{{
              branch.name
            }}</q-item-label></q-item-section
          ></q-item
        >
      </q-expansion-item>
      <q-expansion-item
        dense
        default-opened
        icon="cloud_queue"
        label="Remotes"
        :caption="`${remoteNames.length} sources`"
        class="repository-tree-section"
        header-class="repository-tree-section-header"
      >
        <q-expansion-item
          v-for="remote in remoteNames"
          :key="remote"
          dense
          default-opened
          class="repository-tree-nested"
          icon="dns"
          :label="remote"
          :caption="`${remoteBranches[remote]?.length ?? 0} branches`"
          header-class="repository-tree-nested-header"
          :title="remote"
        >
          <q-item
            v-for="branch in remoteBranches[remote]"
            :key="branch.name"
            clickable
            class="repository-tree-item repository-tree-child"
            :title="`${remote}/${branch.name}`"
            ><q-item-section avatar><q-icon name="commit" /></q-item-section
            ><q-item-section class="repository-tree-item-content"
              ><q-item-label class="repository-tree-item-label">{{ branch.name }}</q-item-label
              ><q-item-label caption class="repository-tree-item-caption"
                >{{ remote }}/{{ branch.name }}</q-item-label
              ></q-item-section
            ></q-item
          >
        </q-expansion-item>
      </q-expansion-item>
      <q-expansion-item
        dense
        default-opened
        icon="inventory_2"
        label="Stashes"
        :caption="`${stashes.length} saved states`"
        class="repository-tree-section"
        header-class="repository-tree-section-header"
      >
        <q-item
          v-for="stash in stashes"
          :key="stash.id"
          clickable
          class="repository-tree-item"
          :title="stash.message"
          ><q-item-section avatar><q-icon name="inventory_2" /></q-item-section
          ><q-item-section class="repository-tree-item-content"
            ><q-item-label class="repository-tree-item-label">{{ stash.message }}</q-item-label
            ><q-item-label caption class="repository-tree-item-caption">{{
              stash.id
            }}</q-item-label></q-item-section
          ></q-item
        >
      </q-expansion-item>
    </q-list>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import type {
  RepositoryBranch,
  RepositoryRemoteBranch,
  RepositoryStash,
} from '../../types/repository-data';
import type { RepositoryView } from '../../types/repository';
import { useRepositorySnapshotsStore } from '../../stores/repositorySnapshots';

defineProps<{ activeView: RepositoryView }>();
defineEmits<{ 'update:activeView': [view: RepositoryView] }>();

const route = useRoute();
const snapshotsStore = useRepositorySnapshotsStore();
const repositoryId = computed(() =>
  typeof route.params.repositoryId === 'string' ? route.params.repositoryId : undefined,
);
const snapshot = computed(() =>
  repositoryId.value ? snapshotsStore.snapshots[repositoryId.value] : undefined,
);
const repositoryName = computed(() => snapshot.value?.repository.displayName ?? 'No repository');
const branches = computed<RepositoryBranch[]>(() => snapshot.value?.overview?.branches ?? []);
const remoteBranches = computed<Record<string, RepositoryRemoteBranch[]>>(() =>
  (snapshot.value?.overview?.remoteBranches ?? []).reduce<Record<string, RepositoryRemoteBranch[]>>(
    (groups, branch) => ({
      ...groups,
      [branch.remote]: [...(groups[branch.remote] ?? []), branch],
    }),
    {},
  ),
);
const stashes = computed<RepositoryStash[]>(() => snapshot.value?.overview?.stashes ?? []);
const remoteNames = computed(() => Object.keys(remoteBranches.value));

const loadOverview = async () => {
  if (repositoryId.value) await snapshotsStore.load(repositoryId.value);
};

onMounted(() => void loadOverview());
watch(
  () => route.params.repositoryId,
  () => void loadOverview(),
);
</script>

<style scoped>
.repository-sidebar {
  width: 100%;
  height: 100%;
  overflow: auto;
  background: var(--app-surface);
}
.repository-sidebar-header {
  padding: 10px 12px 8px;
  border-bottom: 1px solid var(--app-border);
}
.repository-sidebar-name {
  overflow: hidden;
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.repository-navigation {
  padding: 4px 0;
  font-size: 12.5px;
}
.repository-tree {
  padding: 5px 4px 10px;
}
.repository-tree-section {
  margin-bottom: 3px;
  border: 1px solid color-mix(in srgb, var(--app-border) 72%, transparent);
  border-radius: 4px;
}
.repository-tree-item {
  min-height: 24px;
  padding: 2px 8px 2px 14px;
  color: var(--app-text-muted);
  font-size: 12px;
}
.repository-tree-item + .repository-tree-item {
  margin-top: 2px;
}
.repository-tree-item-current {
  color: var(--app-text);
  background: color-mix(in srgb, var(--app-accent) 5%, transparent);
  box-shadow: inset 2px 0 color-mix(in srgb, var(--app-accent) 72%, transparent);
  font-weight: 550;
}
.repository-tree-item-content {
  min-width: 0;
}
.repository-tree-item-label,
.repository-tree-item-caption {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.repository-tree-item-caption {
  color: var(--app-caption);
  font-size: 10px;
  line-height: 12px;
}
.repository-tree-child {
  padding-left: 28px;
}
:deep(.repository-navigation .q-item) {
  min-height: 29px;
}
:deep(.repository-navigation .q-icon) {
  font-size: 18px;
}
:deep(.repository-tree-section-header) {
  min-height: 28px;
  padding: 2px 7px;
  background: color-mix(in srgb, var(--app-surface-raised) 72%, transparent);
  color: var(--app-text);
  font-size: 13px;
  font-weight: 600;
}
:deep(.repository-tree-section-header .q-item__section--avatar) {
  min-width: 24px;
}
:deep(.repository-tree-item .q-item__section--avatar) {
  min-width: 21px;
  padding-right: 5px;
}
:deep(.repository-tree-section-header .q-icon),
:deep(.repository-tree-nested-header .q-icon),
:deep(.repository-tree-item .q-icon) {
  font-size: 16px;
}
:deep(.repository-tree-section-header .q-item__label),
:deep(.repository-tree-nested-header .q-item__label) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.repository-tree-section-header .q-item__label--caption),
:deep(.repository-tree-nested-header .q-item__label--caption) {
  font-size: 10px;
}
:deep(.repository-tree-nested-header) {
  min-height: 26px;
  padding: 1px 7px 1px 13px;
  font-size: 12px;
}
:deep(.repository-tree-nested-header .q-item__section--avatar) {
  min-width: 22px;
}
</style>
