<template>
  <aside class="repository-management-list" aria-label="Repositories">
    <label class="repository-search">
      <q-icon name="search" />
      <input
        :value="searchQuery"
        type="search"
        autocomplete="off"
        spellcheck="false"
        placeholder="Filter repositories"
        @input="updateSearchQuery"
      />
    </label>

    <button
      v-for="repository in repositories"
      :key="repository.key"
      type="button"
      class="repository-row"
      :class="{ 'repository-row-active': repository.key === activeRepositoryKey }"
      @click="$emit('select', repository.key)"
      @dblclick="$emit('open', repository.key)"
    >
      <q-icon :name="repository.icon" />
      <span class="repository-row-copy">
        <strong>{{ repository.name }}</strong>
        <span>{{ repository.path }}</span>
      </span>
      <span v-if="repository.dirtyCount" class="repository-row-count">{{
        repository.dirtyCount
      }}</span>
    </button>

    <div v-if="repositories.length === 0" class="repository-empty-state">No repositories found</div>
  </aside>
</template>

<script setup lang="ts">
import type { ManagedRepository } from './repository-management.types';

const props = defineProps<{
  repositories: ManagedRepository[];
  activeRepositoryKey: string;
  searchQuery: string;
}>();

const emit = defineEmits<{
  'update:searchQuery': [value: string];
  select: [repositoryKey: string];
  open: [repositoryKey: string];
}>();

const updateSearchQuery = (event: Event) => {
  emit('update:searchQuery', (event.target as HTMLInputElement).value);
};

void props;
</script>

<style scoped>
.repository-management-list {
  min-width: 0;
  min-height: 0;
  height: 100%;
  padding: 10px 8px;
  overflow: auto;
  background: var(--app-surface);
}

.repository-search {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  margin-bottom: 8px;
  padding: 0 8px;
  color: var(--app-caption);
  font-size: 11px;
  background: var(--app-control-bg);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius);
}

.repository-search:focus-within {
  border-color: color-mix(in srgb, var(--app-accent) 42%, transparent);
}

.repository-search :deep(.q-icon) {
  flex: 0 0 auto;
  color: var(--app-icon-muted);
  font-size: 15px;
}

.repository-search input {
  flex: 1 1 auto;
  min-width: 0;
  color: var(--app-text);
  font: inherit;
  background: transparent;
  border: 0;
  outline: 0;
}

.repository-search input::placeholder {
  color: var(--app-caption);
}

.repository-row {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: 7px;
  width: 100%;
  min-height: 42px;
  margin-bottom: 2px;
  padding: 5px 7px;
  color: var(--app-text-muted);
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
}

.repository-row:hover,
.repository-row-active {
  color: var(--app-text);
  background: var(--app-hover-soft);
}

.repository-row-active {
  border-color: color-mix(in srgb, var(--app-accent) 32%, transparent);
  box-shadow: inset 2px 0 0 var(--app-accent);
}

.repository-row :deep(.q-icon) {
  color: var(--app-icon-muted);
  font-size: 16px;
}

.repository-row-active :deep(.q-icon) {
  color: var(--app-accent);
}

.repository-row-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.repository-row-copy strong,
.repository-row-copy span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.repository-row-copy strong {
  font-size: 12px;
  font-weight: 750;
}

.repository-row-copy span {
  color: var(--app-caption);
  font-size: 10px;
}

.repository-row-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  color: var(--app-bg);
  font-size: 10px;
  font-weight: 800;
  background: var(--app-status-warning);
  border-radius: 999px;
}

.repository-empty-state {
  padding: 14px 8px;
  color: var(--app-caption);
  font-size: 11px;
  text-align: center;
}
</style>
