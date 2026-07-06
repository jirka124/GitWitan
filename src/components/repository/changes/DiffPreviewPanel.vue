<template>
  <section class="diff-preview-panel" aria-label="Selected file preview">
    <div class="diff-preview-header">
      <div>
        <div class="diff-preview-title">Diff Preview</div>
        <div class="diff-preview-subtitle">Select a changed file</div>
      </div>
    </div>
    <div class="diff-preview-empty">
      <q-icon name="difference" size="30px" />
      <h1>No file selected</h1>
      <p>File diffs and hunk staging controls will appear here.</p>
    </div>
  </section>
</template>

<style scoped>
.diff-preview-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--app-surface-deep);
}

.diff-preview-header {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 48px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--app-border);
}

.diff-preview-title {
  margin-bottom: 2px;
  color: var(--app-text);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.diff-preview-subtitle {
  overflow: hidden;
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.diff-preview-empty {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 28px;
  color: var(--app-text-muted);
  text-align: center;
}

.diff-preview-empty h1 {
  margin: 10px 0 4px;
  color: var(--app-text);
  font-size: 16px;
  font-weight: 650;
}

.diff-preview-empty p {
  margin: 0;
  color: var(--app-text-muted);
}
</style>
