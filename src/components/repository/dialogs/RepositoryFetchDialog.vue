<template>
  <q-dialog v-model="isFetchDialogOpen">
    <q-card class="fetch-dialog">
      <q-card-section class="fetch-dialog-header">
        <div>
          <h2>Fetch</h2>
          <p>Select remote source for the active repository.</p>
        </div>
        <q-icon name="sync" />
      </q-card-section>

      <q-card-section class="fetch-dialog-body">
        <q-select
          v-model="selectedFetchRemote"
          outlined
          dense
          emit-value
          map-options
          label="Remote"
          :disable="fetchAllRemotes"
          :options="fetchRemoteOptions"
        />

        <q-checkbox
          v-model="fetchAllRemotes"
          dense
          label="Fetch all remotes"
          class="fetch-dialog-checkbox"
        />
      </q-card-section>

      <q-card-actions align="right" class="fetch-dialog-actions">
        <q-btn flat no-caps label="Cancel" class="fetch-dialog-secondary" v-close-popup />
        <q-btn
          unelevated
          no-caps
          icon="sync"
          label="Fetch"
          class="fetch-dialog-primary"
          @click="runFetch"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { watch } from 'vue';
import {
  type FetchDialogPayload,
  useRepositoryCommandDialogsStore,
} from '../../../stores/repositoryCommandDialogs';

const emit = defineEmits<{
  fetch: [payload: FetchDialogPayload];
}>();

const dialogsStore = useRepositoryCommandDialogsStore();
const { fetchAllRemotes, fetchRemoteOptions, isFetchDialogOpen, selectedFetchRemote } =
  storeToRefs(dialogsStore);

watch(fetchAllRemotes, () => {
  dialogsStore.ensureSelectedFetchRemote();
});

const runFetch = () => {
  emit('fetch', {
    remote: fetchAllRemotes.value ? 'all' : selectedFetchRemote.value,
    fetchAllRemotes: fetchAllRemotes.value,
  });
  dialogsStore.closeFetchDialog();
};
</script>

<style scoped>
.fetch-dialog {
  width: min(420px, calc(100vw - 32px));
  color: var(--app-text);
  background: var(--app-surface);
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius);
  box-shadow: var(--app-shadow);
}

.fetch-dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 18px 12px;
  border-bottom: 1px solid var(--app-border);
}

.fetch-dialog-header h2 {
  margin: 0;
  color: var(--app-text);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.fetch-dialog-header p {
  margin: 5px 0 0;
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.35;
}

.fetch-dialog-header :deep(.q-icon) {
  flex: 0 0 auto;
  color: var(--app-accent);
  font-size: 24px;
}

.fetch-dialog-body {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.fetch-dialog-body :deep(.q-field__control) {
  color: var(--app-text);
  background: var(--app-surface-subtle);
  border-radius: 4px;
}

.fetch-dialog-body :deep(.q-field__native),
.fetch-dialog-body :deep(.q-field__label) {
  color: var(--app-text);
}

.fetch-dialog-body :deep(.q-field--disabled .q-field__control) {
  opacity: 0.65;
}

.fetch-dialog-checkbox {
  color: var(--app-text);
}

.fetch-dialog-checkbox :deep(.q-checkbox__label) {
  font-size: 13px;
  font-weight: 650;
}

.fetch-dialog-actions {
  gap: 8px;
  padding: 0 14px 14px;
}

.fetch-dialog-secondary,
.fetch-dialog-primary {
  min-height: 34px;
  padding: 5px 13px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 750;
}

.fetch-dialog-secondary {
  color: var(--app-text-muted);
}

.fetch-dialog-primary {
  color: var(--app-bg);
  background: var(--app-accent);
}
</style>
