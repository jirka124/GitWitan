<template>
  <section class="repository-management-band repository-maintenance-band">
    <div>
      <h2>Repository tracking</h2>
      <p>This removes the repository from GitWitan only. Files stay on disk.</p>
    </div>
    <q-btn
      flat
      dense
      no-caps
      icon="link_off"
      label="Remove from list"
      class="repository-remove-button"
    />
  </section>
</template>

<style scoped>
.repository-management-band {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--app-border);
}

.repository-maintenance-band {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.repository-maintenance-band h2,
.repository-maintenance-band p {
  margin: 0;
}

.repository-maintenance-band h2 {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.repository-maintenance-band p {
  color: var(--app-caption);
  font-size: 11px;
}

.repository-remove-button {
  flex: 0 0 auto;
  min-height: 30px;
  padding: 3px 8px;
  color: var(--app-danger);
  border-radius: 4px;
}

.repository-remove-button :deep(.q-btn__content) {
  gap: 4px;
  font-size: 11px;
  font-weight: 750;
}

.repository-remove-button :deep(.q-icon) {
  font-size: 17px;
}

.repository-remove-button:hover {
  background: color-mix(in srgb, var(--app-danger) 10%, transparent);
}

@media (max-width: 640px) {
  .repository-maintenance-band {
    align-items: stretch;
    grid-template-columns: 1fr;
    flex-direction: column;
  }
}
</style>
