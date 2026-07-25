<template>
  <q-dialog v-model="isStashDialogOpen">
    <q-card class="stash-dialog">
      <q-card-section class="stash-dialog-header">
        <div>
          <h2>Stash</h2>
          <p>Save current worktree changes for later.</p>
        </div>
        <q-icon name="inventory_2" />
      </q-card-section>

      <q-card-section class="stash-dialog-body">
        <q-input
          v-model="stashMessage"
          outlined
          dense
          label="Stash message"
          placeholder="Optional"
        />

        <q-checkbox
          v-model="stageNewFiles"
          dense
          label="Stage new files"
          class="stash-dialog-checkbox"
        />
      </q-card-section>

      <q-card-actions align="right" class="stash-dialog-actions">
        <q-btn flat no-caps label="Cancel" class="stash-dialog-secondary" v-close-popup />
        <q-btn
          unelevated
          no-caps
          icon="inventory_2"
          label="Stash"
          class="stash-dialog-primary"
          @click="runStash"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import {
  type StashDialogPayload,
  useRepositoryCommandDialogsStore,
} from '../../../stores/repositoryCommandDialogs';

const emit = defineEmits<{
  stash: [payload: StashDialogPayload];
}>();

const dialogsStore = useRepositoryCommandDialogsStore();
const { isStashDialogOpen, stageNewFiles, stashMessage } = storeToRefs(dialogsStore);

const runStash = () => {
  emit('stash', {
    message: stashMessage.value.trim(),
    stageNewFiles: stageNewFiles.value,
  });
  dialogsStore.closeStashDialog();
};
</script>

<style scoped>
.stash-dialog {
  width: min(420px, calc(100vw - 32px));
  color: var(--app-text);
  background: var(--app-surface);
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius);
  box-shadow: var(--app-shadow);
}

.stash-dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 18px 12px;
  border-bottom: 1px solid var(--app-border);
}

.stash-dialog-header h2 {
  margin: 0;
  color: var(--app-text);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.stash-dialog-header p {
  margin: 5px 0 0;
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.35;
}

.stash-dialog-header :deep(.q-icon) {
  flex: 0 0 auto;
  color: var(--app-accent);
  font-size: 24px;
}

.stash-dialog-body {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.stash-dialog-body :deep(.q-field__control) {
  color: var(--app-text);
  background: var(--app-surface-subtle);
  border-radius: 4px;
}

.stash-dialog-body :deep(.q-field__native),
.stash-dialog-body :deep(.q-field__label) {
  color: var(--app-text);
}

.stash-dialog-checkbox {
  color: var(--app-text);
}

.stash-dialog-checkbox :deep(.q-checkbox__label) {
  font-size: 13px;
  font-weight: 650;
}

.stash-dialog-actions {
  gap: 8px;
  padding: 0 14px 14px;
}

.stash-dialog-secondary,
.stash-dialog-primary {
  min-height: 34px;
  padding: 5px 13px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 750;
}

.stash-dialog-secondary {
  color: var(--app-text-muted);
}

.stash-dialog-primary {
  color: var(--app-bg);
  background: var(--app-accent);
}
</style>
