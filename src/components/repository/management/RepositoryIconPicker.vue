<template>
  <q-btn
    flat
    dense
    round
    :icon="activeIcon"
    class="repository-icon-picker-button"
    aria-label="Change repository icon"
  >
    <q-tooltip>Change icon</q-tooltip>
    <q-menu anchor="bottom left" self="top left" class="repository-icon-menu">
      <div class="repository-icon-menu-header">Repository icon</div>
      <div class="repository-icon-grid">
        <button
          v-for="iconOption in iconOptions"
          :key="iconOption.name"
          type="button"
          class="repository-icon-option"
          :class="{ 'repository-icon-option-active': iconOption.name === activeIcon }"
          :aria-label="iconOption.label"
        >
          <q-icon :name="iconOption.name" />
          <q-tooltip>{{ iconOption.label }}</q-tooltip>
        </button>
      </div>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import type { RepositoryIconOption } from './repository-management.types';

defineProps<{
  activeIcon: string;
  iconOptions: RepositoryIconOption[];
}>();
</script>

<style scoped>
.repository-icon-picker-button {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  min-height: 30px;
  color: var(--app-accent);
  border-radius: 4px;
}

.repository-icon-picker-button:hover {
  background: color-mix(in srgb, var(--app-accent) 12%, transparent);
}

.repository-icon-picker-button :deep(.q-icon) {
  font-size: 22px;
}

:global(.repository-icon-menu) {
  color: var(--app-text);
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius);
  box-shadow: var(--app-shadow-lg);
}

:global(.repository-icon-menu-header) {
  padding: 8px 9px 6px;
  color: var(--app-caption);
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

:global(.repository-icon-grid) {
  display: grid;
  grid-template-columns: repeat(4, 30px);
  gap: 4px;
  padding: 0 8px 8px;
}

:global(.repository-icon-option) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: var(--app-text-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
}

:global(.repository-icon-option:hover),
:global(.repository-icon-option-active) {
  color: var(--app-text);
  background: var(--app-hover-soft);
  border-color: var(--app-border-strong);
}

:global(.repository-icon-option-active) {
  color: var(--app-accent);
  border-color: color-mix(in srgb, var(--app-accent) 38%, transparent);
}

:global(.repository-icon-option .q-icon) {
  font-size: 18px;
}
</style>
