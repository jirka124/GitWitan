<template>
  <q-dialog v-model="isPushDialogOpen">
    <q-card class="push-dialog">
      <q-card-section class="push-dialog-header">
        <div>
          <h2>Push</h2>
          <p>Select source branch and destination remote branch.</p>
        </div>
        <q-icon name="north" />
      </q-card-section>

      <q-card-section class="push-dialog-body">
        <q-select
          v-model="selectedPushSourceBranch"
          outlined
          dense
          emit-value
          map-options
          label="Source branch"
          :options="pushSourceBranchOptions"
        />

        <q-select
          v-model="selectedPushDestinationRemote"
          outlined
          dense
          emit-value
          map-options
          label="Destination remote"
          :options="pushDestinationRemoteOptions"
        />

        <q-select
          v-model="selectedPushDestinationBranch"
          outlined
          dense
          emit-value
          map-options
          label="Destination branch"
          :options="availablePushDestinationBranchOptions"
        />

        <q-checkbox
          v-model="forcePush"
          dense
          label="Force push"
          class="push-dialog-checkbox"
          :class="{ 'push-dialog-checkbox-danger': forcePush }"
        />
      </q-card-section>

      <q-card-actions align="right" class="push-dialog-actions">
        <q-btn flat no-caps label="Cancel" class="push-dialog-secondary" v-close-popup />
        <q-btn
          unelevated
          no-caps
          icon="north"
          label="Push"
          class="push-dialog-primary"
          @click="runPush"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { watch } from 'vue';
import {
  type PushDialogPayload,
  useRepositoryCommandDialogsStore,
} from '../../../stores/repositoryCommandDialogs';

const emit = defineEmits<{
  push: [payload: PushDialogPayload];
}>();

const dialogsStore = useRepositoryCommandDialogsStore();
const {
  availablePushDestinationBranchOptions,
  forcePush,
  isPushDialogOpen,
  pushDestinationRemoteOptions,
  pushSourceBranchOptions,
  selectedPushDestinationBranch,
  selectedPushDestinationRemote,
  selectedPushSourceBranch,
} = storeToRefs(dialogsStore);

watch(selectedPushDestinationRemote, () => {
  dialogsStore.ensureSelectedPushDestinationBranch();
});

const runPush = () => {
  emit('push', {
    sourceBranch: selectedPushSourceBranch.value,
    destinationRemote: selectedPushDestinationRemote.value,
    destinationBranch: selectedPushDestinationBranch.value,
    forcePush: forcePush.value,
  });
  dialogsStore.closePushDialog();
};
</script>

<style scoped>
.push-dialog {
  width: min(420px, calc(100vw - 32px));
  color: var(--app-text);
  background: var(--app-surface);
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius);
  box-shadow: var(--app-shadow);
}

.push-dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 18px 12px;
  border-bottom: 1px solid var(--app-border);
}

.push-dialog-header h2 {
  margin: 0;
  color: var(--app-text);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.push-dialog-header p {
  margin: 5px 0 0;
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.35;
}

.push-dialog-header :deep(.q-icon) {
  flex: 0 0 auto;
  color: var(--app-accent);
  font-size: 24px;
}

.push-dialog-body {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.push-dialog-body :deep(.q-field__control) {
  color: var(--app-text);
  background: var(--app-surface-subtle);
  border-radius: 4px;
}

.push-dialog-body :deep(.q-field__native),
.push-dialog-body :deep(.q-field__label) {
  color: var(--app-text);
}

.push-dialog-checkbox {
  color: var(--app-text);
}

.push-dialog-checkbox :deep(.q-checkbox__label) {
  font-size: 13px;
  font-weight: 650;
}

.push-dialog-checkbox-danger {
  color: var(--app-status-danger);
}

.push-dialog-actions {
  gap: 8px;
  padding: 0 14px 14px;
}

.push-dialog-secondary,
.push-dialog-primary {
  min-height: 34px;
  padding: 5px 13px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 750;
}

.push-dialog-secondary {
  color: var(--app-text-muted);
}

.push-dialog-primary {
  color: var(--app-bg);
  background: var(--app-accent);
}
</style>
