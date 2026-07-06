<template>
  <section class="commit-panel" aria-label="Commit changes">
    <div class="commit-message-fields">
      <q-input
        v-model="commitSubject"
        dense
        outlined
        placeholder="Commit subject"
        class="commit-input"
      />
      <q-input
        v-model="commitDescription"
        dense
        outlined
        type="textarea"
        autogrow
        placeholder="Description"
        class="commit-input commit-description"
      />
    </div>

    <div class="commit-actions">
      <div class="commit-summary">{{ stagedFileCount }} staged files</div>
      <q-checkbox v-model="amendCommit" dense label="Amend" class="commit-amend" />
      <q-btn unelevated no-caps icon="check" label="Commit" class="commit-button" />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  stagedFileCount: number;
}>();

const commitSubject = defineModel<string>('subject', { required: true });
const commitDescription = defineModel<string>('description', { required: true });
const amendCommit = defineModel<boolean>('amend', { required: true });
</script>

<style scoped>
.commit-panel {
  flex: 0 0 auto;
  display: grid;
  min-width: 0;
  min-height: 0;
  padding: var(--app-panel-padding);
  overflow: auto;
  background: var(--app-surface);
  border-top: 1px solid var(--app-border);
  grid-template-rows: auto auto auto;
  gap: 6px;
}

.commit-message-fields {
  display: grid;
  grid-template-rows: auto auto;
  gap: 6px;
  min-width: 0;
}

.commit-input :deep(.q-field__control) {
  min-height: 30px;
  color: var(--app-text);
  background: var(--app-surface-deep);
}

.commit-input :deep(.q-field__native),
.commit-input :deep(.q-field__input) {
  color: var(--app-text-muted);
  font-size: 12px;
}

.commit-input :deep(.q-field__native::placeholder),
.commit-input :deep(.q-field__input::placeholder) {
  color: var(--app-icon-muted);
  opacity: 1;
}

.commit-input.q-field--focused :deep(.q-field__control::before),
.commit-input.q-field--focused :deep(.q-field__control::after) {
  border-color: var(--app-accent);
}

.commit-input :deep(.q-field__control-container) {
  padding-top: 0;
}

.commit-description :deep(.q-field__control) {
  min-height: 30px;
  max-height: 206px;
}

.commit-description :deep(.q-field__native) {
  min-height: 18px;
  max-height: 184px;
  overflow-y: auto !important;
  resize: none;
}

.commit-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  min-width: 0;
}

.commit-summary {
  margin-right: auto;
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 650;
}

.commit-amend :deep(.q-checkbox__inner--truthy) {
  color: var(--app-accent);
}

.commit-amend {
  flex: 0 0 auto;
  color: var(--app-text-muted);
  font-size: 12px;
}

.commit-button {
  min-height: 32px;
  padding: 4px 12px;
  color: var(--app-bg);
  font-weight: 750;
  background: var(--app-accent);
  border-radius: var(--app-radius);
}

.commit-button :deep(.q-icon) {
  font-size: 17px;
}
</style>
