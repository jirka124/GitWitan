<template>
  <section class="repository-switcher" aria-label="Open repositories">
    <button class="repository-switcher-item repository-switcher-item-active" type="button">
      <span>No repository</span>
    </button>
    <button class="repository-switcher-item" type="button">
      <span>GitWitan</span>
    </button>
    <button class="repository-switcher-add" type="button" aria-label="Open repository">
      <q-icon name="add" />
    </button>
  </section>
</template>

<style scoped>
.repository-switcher {
  display: flex;
  flex: 0 0 var(--repo-switcher-height);
  align-items: stretch;
  gap: 1px;
  min-height: 0;
  padding: 0 8px;
  overflow-x: auto;
  overflow-y: hidden;
  background: var(--app-surface-deep);
  border-bottom: 1px solid var(--app-border);
  -webkit-app-region: no-drag;
  app-region: no-drag;
}

.repository-switcher-item,
.repository-switcher-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  height: 100%;
  color: var(--app-text-muted);
  font: inherit;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  cursor: default;
}

.repository-switcher-item {
  max-width: 180px;
  padding: 0 12px;
}

.repository-switcher-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.repository-switcher-item-active {
  color: var(--app-text);
  background: var(--app-surface);
  border-bottom-color: var(--app-accent);
}

.repository-switcher-add {
  flex: 0 0 32px;
  color: var(--app-text-muted);
}

.repository-switcher-item:hover,
.repository-switcher-add:hover {
  color: var(--app-text);
  background: var(--app-surface-raised);
}
</style>
