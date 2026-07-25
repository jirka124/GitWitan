<template>
  <q-dialog v-model="isPullDialogOpen">
    <q-card class="pull-dialog">
      <q-card-section class="pull-dialog-header">
        <div>
          <h2>Pull</h2>
          <p>Select remote branch to pull into the checked-out branch.</p>
        </div>
        <q-icon name="south" />
      </q-card-section>

      <q-card-section class="pull-dialog-body">
        <q-select
          v-model="selectedPullRemote"
          outlined
          dense
          emit-value
          map-options
          label="Remote"
          :options="pullRemoteOptions"
        />

        <q-select
          v-model="selectedPullRemoteBranch"
          outlined
          dense
          emit-value
          map-options
          label="Remote branch"
          :options="availablePullRemoteBranchOptions"
        />

        <q-input v-model="currentBranch" outlined dense readonly label="Into checked-out branch" />
      </q-card-section>

      <q-card-actions align="right" class="pull-dialog-actions">
        <q-btn flat no-caps label="Cancel" class="pull-dialog-secondary" v-close-popup />
        <q-btn
          unelevated
          no-caps
          icon="south"
          label="Pull"
          class="pull-dialog-primary"
          @click="runPull"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { watch } from 'vue';
import {
  type PullDialogPayload,
  useRepositoryCommandDialogsStore,
} from '../../../stores/repositoryCommandDialogs';

const emit = defineEmits<{
  pull: [payload: PullDialogPayload];
}>();

const dialogsStore = useRepositoryCommandDialogsStore();
const {
  availablePullRemoteBranchOptions,
  currentBranch,
  isPullDialogOpen,
  pullRemoteOptions,
  selectedPullRemote,
  selectedPullRemoteBranch,
} = storeToRefs(dialogsStore);

watch(selectedPullRemote, () => {
  dialogsStore.ensureSelectedPullRemoteBranch();
});

const runPull = () => {
  emit('pull', {
    remote: selectedPullRemote.value,
    remoteBranch: selectedPullRemoteBranch.value,
    intoBranch: currentBranch.value,
  });
  dialogsStore.closePullDialog();
};
</script>

<style scoped>
.pull-dialog {
  width: min(420px, calc(100vw - 32px));
  color: var(--app-text);
  background: var(--app-surface);
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius);
  box-shadow: var(--app-shadow);
}

.pull-dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 18px 12px;
  border-bottom: 1px solid var(--app-border);
}

.pull-dialog-header h2 {
  margin: 0;
  color: var(--app-text);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.pull-dialog-header p {
  margin: 5px 0 0;
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.35;
}

.pull-dialog-header :deep(.q-icon) {
  flex: 0 0 auto;
  color: var(--app-accent);
  font-size: 24px;
}

.pull-dialog-body {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.pull-dialog-body :deep(.q-field__control) {
  color: var(--app-text);
  background: var(--app-surface-subtle);
  border-radius: 4px;
}

.pull-dialog-body :deep(.q-field__native),
.pull-dialog-body :deep(.q-field__label) {
  color: var(--app-text);
}

.pull-dialog-body :deep(.q-field--readonly .q-field__control) {
  opacity: 0.78;
}

.pull-dialog-actions {
  gap: 8px;
  padding: 0 14px 14px;
}

.pull-dialog-secondary,
.pull-dialog-primary {
  min-height: 34px;
  padding: 5px 13px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 750;
}

.pull-dialog-secondary {
  color: var(--app-text-muted);
}

.pull-dialog-primary {
  color: var(--app-bg);
  background: var(--app-accent);
}
</style>
