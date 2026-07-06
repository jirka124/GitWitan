<template>
  <section class="current-repo-status" aria-label="Current repository status">
    <div class="current-repo-status-copy">
      <div class="current-repo-status-name">No repository</div>
      <div class="current-repo-status-state">Up to date</div>
    </div>
    <div class="current-repo-status-progress" aria-hidden="true">
      <div class="current-repo-status-progress-bar" />
    </div>
  </section>
</template>

<style scoped>
.current-repo-status {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: center;
  max-width: none;
  min-width: 220px;
  min-height: 46px;
  padding: 7px 12px 8px;
  overflow: hidden;
  background: var(--app-surface-subtle);
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius);
  box-shadow: inset 0 1px 0 var(--app-inset-highlight);
  -webkit-app-region: no-drag;
  app-region: no-drag;
}

.current-repo-status-copy {
  min-width: 0;
}

.current-repo-status-name {
  overflow: hidden;
  color: var(--app-text);
  font-size: 14px;
  font-weight: 750;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.current-repo-status-state {
  overflow: hidden;
  margin-top: 2px;
  color: var(--app-accent);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.current-repo-status-progress {
  position: absolute;
  right: 10px;
  bottom: 5px;
  left: 10px;
  height: 2px;
  overflow: hidden;
  background: var(--app-progress-track);
  border-radius: 999px;
}

.current-repo-status-progress-bar {
  width: 38%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--app-accent), transparent);
  border-radius: inherit;
  opacity: 0.75;
}

@media (max-width: 760px) {
  .current-repo-status {
    min-width: 140px;
    padding-right: 10px;
    padding-left: 10px;
  }
}
</style>
