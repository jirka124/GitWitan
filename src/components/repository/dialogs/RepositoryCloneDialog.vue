<template>
  <q-dialog v-model="isCloneDialogOpen">
    <q-card class="clone-dialog">
      <q-card-section class="clone-dialog-header">
        <div>
          <h2>Clone Repository</h2>
          <p>Choose the source URL and local destination folder.</p>
        </div>
        <q-icon name="download" />
      </q-card-section>

      <q-card-section class="clone-dialog-body">
        <q-input
          v-model="cloneRepositoryUrl"
          outlined
          dense
          label="Repository URL"
          placeholder="https://github.com/org/repository.git"
        />

        <q-input
          v-model="cloneParentFolder"
          outlined
          dense
          label="Parent folder"
          placeholder="C:\\workspace"
        >
          <template #append>
            <q-btn
              flat
              dense
              icon="folder_open"
              aria-label="Choose parent folder"
              class="clone-dialog-folder-button"
              :disable="!canSelectFolder"
              @click="selectParentFolder"
            >
              <q-tooltip>Choose parent folder</q-tooltip>
            </q-btn>
          </template>
        </q-input>

        <q-input
          v-model="cloneFolderName"
          outlined
          dense
          label="Folder name"
          placeholder="repository"
        >
          <template #append>
            <q-icon name="drive_file_rename_outline" />
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right" class="clone-dialog-actions">
        <q-btn flat no-caps label="Cancel" class="clone-dialog-secondary" v-close-popup />
        <q-btn
          unelevated
          no-caps
          icon="download"
          label="Clone"
          class="clone-dialog-primary"
          :disable="!canClone"
          @click="runClone"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import {
  type CloneDialogPayload,
  useRepositoryCommandDialogsStore,
} from '../../../stores/repositoryCommandDialogs';

const emit = defineEmits<{
  clone: [payload: CloneDialogPayload];
}>();

const dialogsStore = useRepositoryCommandDialogsStore();
const { cloneFolderName, cloneParentFolder, cloneRepositoryUrl, isCloneDialogOpen } =
  storeToRefs(dialogsStore);

const canSelectFolder = computed(() => typeof window.gitwitanShell?.selectFolder === 'function');

const canClone = computed(
  () =>
    Boolean(cloneRepositoryUrl.value.trim()) &&
    Boolean(cloneParentFolder.value.trim()) &&
    Boolean(cloneFolderName.value.trim()),
);

const selectParentFolder = async () => {
  const selectedPath = await window.gitwitanShell?.selectFolder?.(cloneParentFolder.value.trim());

  if (selectedPath) {
    cloneParentFolder.value = selectedPath;
  }
};

const runClone = () => {
  if (!canClone.value) {
    return;
  }

  emit('clone', {
    repositoryUrl: cloneRepositoryUrl.value.trim(),
    parentFolder: cloneParentFolder.value.trim(),
    folderName: cloneFolderName.value.trim(),
  });
  dialogsStore.closeCloneDialog();
};
</script>

<style scoped>
.clone-dialog {
  width: min(460px, calc(100vw - 32px));
  color: var(--app-text);
  background: var(--app-surface);
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius);
  box-shadow: var(--app-shadow);
}

.clone-dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 18px 12px;
  border-bottom: 1px solid var(--app-border);
}

.clone-dialog-header h2 {
  margin: 0;
  color: var(--app-text);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.clone-dialog-header p {
  margin: 5px 0 0;
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.35;
}

.clone-dialog-header :deep(.q-icon) {
  flex: 0 0 auto;
  color: var(--app-accent);
  font-size: 24px;
}

.clone-dialog-body {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.clone-dialog-body :deep(.q-field__control) {
  color: var(--app-text);
  background: var(--app-surface-subtle);
  border-radius: 4px;
}

.clone-dialog-body :deep(.q-field__native),
.clone-dialog-body :deep(.q-field__label) {
  color: var(--app-text);
}

.clone-dialog-folder-button {
  width: 30px;
  height: 30px;
  min-height: 30px;
  color: var(--app-icon-muted);
  border-radius: 4px;
}

.clone-dialog-folder-button:hover {
  color: var(--app-text);
  background: var(--app-hover-soft);
}

.clone-dialog-folder-button :deep(.q-icon),
.clone-dialog-body :deep(.q-field__append .q-icon) {
  font-size: 18px;
}

.clone-dialog-actions {
  gap: 8px;
  padding: 0 14px 14px;
}

.clone-dialog-secondary,
.clone-dialog-primary {
  min-height: 34px;
  padding: 5px 13px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 750;
}

.clone-dialog-secondary {
  color: var(--app-text-muted);
}

.clone-dialog-primary {
  color: var(--app-bg);
  background: var(--app-accent);
}
</style>
