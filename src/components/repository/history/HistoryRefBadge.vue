<template>
  <span class="history-ref" :class="`history-ref-${commitRef.type}`">
    <q-icon :name="commitRef.icon" />
    {{ commitRef.label }}
  </span>
</template>

<script setup lang="ts">
import type { CommitRef } from './history.types';

defineProps<{
  commitRef: CommitRef;
}>();
</script>

<style scoped>
.history-ref {
  display: inline-flex;
  flex: 0 1 auto;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  height: 20px;
  padding: 0 7px;
  overflow: hidden;
  color: var(--app-text);
  font-size: 10px;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: 1px solid var(--app-border-strong);
  border-radius: 999px;
}

.history-ref :deep(.q-icon) {
  flex: 0 0 auto;
  font-size: 12px;
}

.history-ref-head {
  color: var(--app-accent);
  border-color: color-mix(in srgb, var(--app-accent) 40%, transparent);
}

.history-ref-local {
  color: #7aa2f7;
  border-color: color-mix(in srgb, #7aa2f7 38%, transparent);
}

.history-ref-origin {
  color: #d8b45f;
  border-color: color-mix(in srgb, #d8b45f 42%, transparent);
}

.history-ref-tag {
  color: #c678dd;
  border-color: color-mix(in srgb, #c678dd 42%, transparent);
}
</style>
