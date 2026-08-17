<template>
  <q-dialog v-model="isMergeDialogOpen">
    <q-card class="merge-dialog">
      <q-card-section class="merge-dialog-header">
        <div>
          <h2>Merge</h2>
          <p>Select source branch, target branch, and merge strategy.</p>
        </div>
        <q-icon name="call_merge" />
      </q-card-section>

      <q-card-section class="merge-dialog-body">
        <q-select
          v-model="selectedMergeSourceBranch"
          outlined
          dense
          emit-value
          map-options
          label="Merge source"
          :options="mergeSourceBranchOptions"
        />

        <q-select
          v-model="selectedMergeTargetBranch"
          outlined
          dense
          emit-value
          map-options
          label="Merge into"
          :options="mergeTargetBranchOptions"
        />

        <q-select
          v-model="selectedMergeOption"
          outlined
          dense
          emit-value
          map-options
          label="Merge options"
          :options="mergeOptionOptions"
        />

        <div class="merge-dialog-status" :class="mergeStatusClass">
          <q-icon :name="mergeStatusIcon" />
          <span>{{ mergeStatusText }}</span>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="merge-dialog-actions">
        <q-btn flat no-caps label="Cancel" class="merge-dialog-secondary" v-close-popup />
        <q-btn
          unelevated
          no-caps
          icon="call_merge"
          label="Merge"
          class="merge-dialog-primary"
          @click="runMerge"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import {
  type MergeDialogPayload,
  useRepositoryCommandDialogsStore,
} from '../../../stores/repositoryCommandDialogs';

const emit = defineEmits<{
  merge: [payload: MergeDialogPayload];
}>();

const dialogsStore = useRepositoryCommandDialogsStore();
const {
  canMergeWithoutConflicts,
  isMergeDialogOpen,
  mergeOptionOptions,
  mergeSourceBranchOptions,
  mergeTargetBranchOptions,
  selectedMergeOption,
  selectedMergeSourceBranch,
  selectedMergeTargetBranch,
} = storeToRefs(dialogsStore);

const mergeStatusClass = computed(() =>
  canMergeWithoutConflicts.value ? 'merge-dialog-status-clean' : 'merge-dialog-status-conflict',
);
const mergeStatusIcon = computed(() =>
  canMergeWithoutConflicts.value ? 'check_circle' : 'warning',
);
const mergeStatusText = computed(() =>
  canMergeWithoutConflicts.value
    ? 'Merge can be performed without conflicts'
    : 'Merge has conflicts',
);

const runMerge = () => {
  emit('merge', {
    sourceBranch: selectedMergeSourceBranch.value,
    targetBranch: selectedMergeTargetBranch.value,
    mergeOption: selectedMergeOption.value,
    canMergeWithoutConflicts: canMergeWithoutConflicts.value,
  });
  dialogsStore.closeMergeDialog();
};
</script>

<style scoped>
.merge-dialog {
  width: min(440px, calc(100vw - 32px));
  color: var(--app-text);
  background: var(--app-surface);
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius);
  box-shadow: var(--app-shadow);
}

.merge-dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 18px 12px;
  border-bottom: 1px solid var(--app-border);
}

.merge-dialog-header h2 {
  margin: 0;
  color: var(--app-text);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.merge-dialog-header p {
  margin: 5px 0 0;
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.35;
}

.merge-dialog-header :deep(.q-icon) {
  flex: 0 0 auto;
  color: var(--app-accent);
  font-size: 24px;
}

.merge-dialog-body {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.merge-dialog-body :deep(.q-field__control) {
  color: var(--app-text);
  background: var(--app-surface-subtle);
  border-radius: 4px;
}

.merge-dialog-body :deep(.q-field__native),
.merge-dialog-body :deep(.q-field__label) {
  color: var(--app-text);
}

.merge-dialog-status {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.25;
}

.merge-dialog-status :deep(.q-icon) {
  flex: 0 0 auto;
  font-size: 18px;
}

.merge-dialog-status-clean {
  color: var(--app-accent);
  background: color-mix(in srgb, var(--app-accent) 12%, transparent);
  border-color: color-mix(in srgb, var(--app-accent) 28%, transparent);
}

.merge-dialog-status-conflict {
  color: var(--app-status-warning);
  background: color-mix(in srgb, var(--app-status-warning) 12%, transparent);
  border-color: color-mix(in srgb, var(--app-status-warning) 28%, transparent);
}

.merge-dialog-actions {
  gap: 8px;
  padding: 0 14px 14px;
}

.merge-dialog-secondary,
.merge-dialog-primary {
  min-height: 34px;
  padding: 5px 13px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 750;
}

.merge-dialog-secondary {
  color: var(--app-text-muted);
}

.merge-dialog-primary {
  color: var(--app-bg);
  background: var(--app-accent);
}
</style>
